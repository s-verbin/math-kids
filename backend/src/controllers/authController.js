import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/database.js';

export const register = (req, res) => {
  const { username, password, displayName, avatar } = req.body;

  if (!username || !password || !displayName) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existingUser) {
    return res.status(400).json({ error: 'Пользователь уже существует' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const result = db.prepare(`
    INSERT INTO users (username, password, display_name, avatar)
    VALUES (?, ?, ?, ?)
  `).run(username, hashedPassword, displayName, avatar || '😊');

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

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      avatar: user.avatar,
      level: user.level,
      xp: user.xp
    }
  });
};
