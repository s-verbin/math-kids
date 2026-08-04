import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/database.js';

export const register = (req, res) => {
  const { username, password, displayName, avatar, acceptedTerms } = req.body;

  if (!username || !password || !displayName) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  if (!acceptedTerms) {
    return res.status(400).json({ error: 'Необходимо принять пользовательское соглашение' });
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existingUser) {
    return res.status(400).json({ error: 'Пользователь уже существует' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const result = db.prepare(`
    INSERT INTO users (username, password, display_name, avatar, accepted_terms_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(username, hashedPassword, displayName, avatar || '😊', new Date().toISOString());

  const token = jwt.sign({ userId: result.lastInsertRowid }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  res.json({
    token,
    user: {
      id: result.lastInsertRowid,
      username,
      displayName,
      avatar: avatar || '😊'
    }
  });
};

export const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  const today = new Date().toISOString().split('T')[0];
  const existingReward = db.prepare(`
    SELECT * FROM daily_rewards WHERE user_id = ? AND date = ?
  `).get(user.id, today);

  let dailyReward = 0;
  let streak = 0;

  if (!existingReward) {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yest = yesterday.toISOString().split('T')[0];

    const yestReward = db.prepare(`
      SELECT * FROM daily_rewards WHERE user_id = ? AND date = ?
    `).get(user.id, yest);

    streak = yestReward ? yestReward.streak + 1 : 1;
    dailyReward = 10 + (streak * 2);

    db.prepare(`
      INSERT INTO daily_rewards (user_id, date, streak, coins)
      VALUES (?, ?, ?, ?)
    `).run(user.id, today, streak, dailyReward);

    db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(dailyReward, user.id);
  } else {
    streak = existingReward.streak;
  }

  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);

  res.json({
    token,
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      displayName: updatedUser.display_name,
      avatar: updatedUser.avatar,
      level: updatedUser.level,
      xp: updatedUser.xp,
      coins: updatedUser.coins,
      dailyReward,
      streak
    }
  });
};
