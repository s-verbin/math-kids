import db from '../models/database.js';

export const getTopics = (req, res) => {
  const topics = db.prepare('SELECT * FROM topics ORDER BY order_index').all();

  const userProgress = db.prepare(`
    SELECT 
      topic_id,
      COUNT(*) as attempts,
      MAX(CASE WHEN completed = 1 THEN score END) as best_score,
      AVG(CAST(score AS FLOAT) / total_questions * 100) as avg_accuracy
    FROM lessons
    WHERE user_id = ?
    GROUP BY topic_id
  `).all(req.userId);

  const progressMap = {};
  userProgress.forEach(p => {
    progressMap[p.topic_id] = {
      attempts: p.attempts,
      bestScore: p.best_score,
      avgAccuracy: p.avg_accuracy
    };
  });

  const topicsWithProgress = topics.map(topic => ({
    ...topic,
    progress: progressMap[topic.id] || null
  }));

  res.json(topicsWithProgress);
};

export const getTopic = (req, res) => {
  const { id } = req.params;

  const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(id);

  if (!topic) {
    return res.status(404).json({ error: 'Тема не найдена' });
  }

  const userLessons = db.prepare(`
    SELECT * FROM lessons
    WHERE user_id = ? AND topic_id = ?
    ORDER BY completed_at DESC
  `).all(req.userId, id);

  res.json({
    topic,
    lessons: userLessons
  });
};
