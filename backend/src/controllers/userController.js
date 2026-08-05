import db from '../models/database.js';

export const getProfile = (req, res) => {
  const user = db.prepare(`
    SELECT id, username, display_name, avatar, level, xp, coins, total_problems_solved, show_in_leaderboard, created_at
    FROM users WHERE id = ?
  `).get(req.userId);

  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  const completedTopics = db.prepare(`
    SELECT DISTINCT topic_id FROM lessons WHERE user_id = ?
  `).all(req.userId);

  const achievements = db.prepare(`
    SELECT a.* FROM achievements a
    JOIN user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = ?
  `).all(req.userId);

  const recentLessons = db.prepare(`
    SELECT l.*, t.name as topic_name
    FROM lessons l
    JOIN topics t ON l.topic_id = t.id
    WHERE l.user_id = ?
    ORDER BY l.completed_at DESC
    LIMIT 10
  `).all(req.userId);

  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_lessons,
      SUM(score) as total_correct,
      SUM(total_questions) as total_questions,
      AVG(CAST(score AS FLOAT) / total_questions * 100) as avg_accuracy
    FROM lessons
    WHERE user_id = ?
  `).get(req.userId);

  const dailyStats = db.prepare(`
    SELECT date, problems_solved, correct_answers
    FROM daily_stats
    WHERE user_id = ?
    ORDER BY date DESC
    LIMIT 7
  `).all(req.userId);

  const allDailyStats = db.prepare(`
    SELECT date
    FROM daily_stats
    WHERE user_id = ?
    ORDER BY date DESC
  `).all(req.userId);

  const streak = (() => {
    const dateSet = new Set(allDailyStats.map(d => d.date));
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    now.setUTCDate(now.getUTCDate() - 1);
    const yesterday = now.toISOString().split('T')[0];

    let startDate = null;
    if (dateSet.has(today)) startDate = today;
    else if (dateSet.has(yesterday)) startDate = yesterday;

    if (!startDate) return 0;

    let count = 0;
    const [y, m, d] = startDate.split('-').map(Number);
    let current = new Date(Date.UTC(y, m - 1, d));
    while (true) {
      const ds = current.toISOString().split('T')[0];
      if (dateSet.has(ds)) {
        count++;
        current.setUTCDate(current.getUTCDate() - 1);
      } else {
        break;
      }
    }
    return count;
  })();

  const records = db.prepare(`
    SELECT 
      COALESCE(MAX(score), 0) as best_score,
      COALESCE(SUM(CASE WHEN score = total_questions THEN 1 ELSE 0 END), 0) as perfect_lessons,
      COALESCE(MIN(CASE WHEN score = total_questions THEN time_spent END), 0) as fastest_time
    FROM lessons
    WHERE user_id = ?
  `).get(req.userId);

  res.json({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      avatar: user.avatar,
      level: user.level,
      xp: user.xp,
      coins: user.coins,
      totalProblemsSolved: user.total_problems_solved,
      showInLeaderboard: user.show_in_leaderboard === 1,
      createdAt: user.created_at
    },
    completedTopics: completedTopics.map(t => t.topic_id),
    achievements,
    recentLessons,
    stats: {
      totalLessons: stats.total_lessons || 0,
      totalCorrect: stats.total_correct || 0,
      totalQuestions: stats.total_questions || 0,
      avgAccuracy: stats.avg_accuracy || 0
    },
    records: {
      bestScore: records.best_score || 0,
      perfectLessons: records.perfect_lessons || 0,
      fastestTime: records.fastest_time || 0,
      streak
    },
    dailyStats
  });
};

export const updateAvatar = (req, res) => {
  const { avatar } = req.body;

  db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatar, req.userId);

  res.json({ success: true, avatar });
};

export const updateLeaderboardVisibility = (req, res) => {
  const { showInLeaderboard } = req.body;
  const show = showInLeaderboard ? 1 : 0;

  db.prepare('UPDATE users SET show_in_leaderboard = ? WHERE id = ?').run(show, req.userId);

  res.json({ success: true, showInLeaderboard: show === 1 });
};
