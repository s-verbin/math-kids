import { test } from 'node:test';
import assert from 'node:assert';

test('GET /api/analytics/stats отдаёт корректную сводку', async () => {
  process.env.DB_PATH = ':memory:';
  const { default: db } = await import('../src/models/database.js');
  const { startSession, endSession, getStats } = await import('../src/controllers/analyticsController.js');

  const user = db.prepare(
    'INSERT INTO users (username, password, display_name) VALUES (?, ?, ?)'
  ).run('analyticsuser', 'pass', 'Analytics');
  const userId = user.lastInsertRowid;

  const resStart = { json: (data) => Object.assign(resStart, data) };
  startSession({
    userId,
    body: {
      userAgent: 'Mozilla/5.0 Chrome/115.0',
      screen: '1512x982',
      deviceType: 'desktop',
      browser: 'Chrome',
      os: 'macOS'
    }
  }, resStart);
  assert.ok(resStart.sessionId, 'Сессия создана');

  await new Promise((resolve) => setTimeout(resolve, 50));

  const resEnd = { json: (data) => Object.assign(resEnd, data) };
  endSession({ userId, body: { sessionId: resStart.sessionId } }, resEnd);
  assert.ok(resEnd.success, 'Сессия завершена');

  const resStats = { json: (data) => { resStats._data = data; } };
  getStats({}, resStats);
  console.log('STATS:', JSON.stringify(resStats._data, null, 2));

  assert.ok(resStats._data, 'Есть ответ');
  assert.strictEqual(resStats._data.total.total_sessions, 1);
  assert.ok(resStats._data.total.avg_duration_seconds > 0);
  assert.strictEqual(resStats._data.byDeviceAndBrowser.length, 1);
  assert.strictEqual(resStats._data.byDeviceAndBrowser[0].device_type, 'desktop');
  assert.strictEqual(resStats._data.byDeviceAndBrowser[0].browser, 'Chrome');
});
