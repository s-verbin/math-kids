import db from '../models/database.js';

export const startSession = (req, res) => {
  const { userAgent, screen, deviceType, browser, os } = req.body;
  const session = db.prepare(`
    INSERT INTO analytics_sessions (user_id, user_agent, screen, device_type, browser, os)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.userId || null, userAgent, screen, deviceType, browser, os);

  res.json({ sessionId: session.lastInsertRowid });
};

export const endSession = (req, res) => {
  const { sessionId } = req.body;
  const session = db.prepare('SELECT id, start_at FROM analytics_sessions WHERE id = ?').get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Сессия не найдена' });
  }

  const start = new Date(session.start_at);
  const end = new Date();
  const duration = Math.floor((end - start) / 1000);

  db.prepare('UPDATE analytics_sessions SET end_at = ?, duration_seconds = ? WHERE id = ?')
    .run(end.toISOString(), duration, sessionId);

  res.json({ success: true, duration });
};

export const getStats = (req, res) => {
  const summary = db.prepare(`
    SELECT
      device_type,
      browser,
      COUNT(*) as sessions,
      COALESCE(AVG(duration_seconds), 0) as avg_duration_seconds
    FROM analytics_sessions
    WHERE end_at IS NOT NULL
    GROUP BY device_type, browser
  `).all();

  const total = db.prepare(`
    SELECT
      COUNT(*) as total_sessions,
      COALESCE(AVG(duration_seconds), 0) as avg_duration_seconds
    FROM analytics_sessions
    WHERE end_at IS NOT NULL
  `).get();

  res.json({ total, byDeviceAndBrowser: summary });
};
