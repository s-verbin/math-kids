import { test } from 'node:test';
import assert from 'node:assert';

test('урок: 7 правильных ответов из 10 дают 35 XP и 70 монет', async () => {
  process.env.DB_PATH = ':memory:';
  const { default: db } = await import('../src/models/database.js');
  const { startLesson, submitLesson } = await import('../src/controllers/lessonController.js');

  const user = db.prepare(
    'INSERT INTO users (username, password, display_name) VALUES (?, ?, ?)'
  ).run('testuser', 'pass', 'Test');
  const userId = user.lastInsertRowid;

  const topic = db.prepare('SELECT id FROM topics WHERE operations = ?').get('add');
  assert.ok(topic, 'Тема "add" должна быть в базе');
  const topicId = topic.id;

  const resStart = { status: () => resStart, json: (data) => Object.assign(resStart, data) };
  startLesson({ body: { topicId } }, resStart);
  assert.strictEqual(resStart.problems.length, 10, 'В уроке 10 заданий');

  const answers = resStart.problems.map((p, i) => ({ id: p.id, isCorrect: i < 7 }));

  const resSubmit = { status: () => resSubmit, json: (data) => Object.assign(resSubmit, data) };
  submitLesson({ userId, body: { topicId, answers, timeSpent: 60 } }, resSubmit);

  assert.strictEqual(resSubmit.score, 7, '7 правильных');
  assert.strictEqual(resSubmit.total, 10, 'всего 10');
  assert.strictEqual(resSubmit.xpGained, 35, 'XP: 7 * 5');
  assert.strictEqual(resSubmit.coinsGained, 70, 'монеты: 7 * 10');
  assert.ok(resSubmit.newLevel >= 1, 'уровень сохранён');
});

test('урок: все ответы неверные — 0 XP, 0 монет, не падает', async () => {
  process.env.DB_PATH = ':memory:';
  const { default: db } = await import('../src/models/database.js');
  const { startLesson, submitLesson } = await import('../src/controllers/lessonController.js');

  const user = db.prepare(
    'INSERT INTO users (username, password, display_name) VALUES (?, ?, ?)'
  ).run('testuser2', 'pass', 'Test 2');
  const userId = user.lastInsertRowid;

  const topic = db.prepare('SELECT id FROM topics WHERE operations = ?').get('subtract');
  assert.ok(topic);
  const topicId = topic.id;

  const resStart = { status: () => resStart, json: (data) => Object.assign(resStart, data) };
  startLesson({ body: { topicId } }, resStart);

  const answers = resStart.problems.map((p) => ({ id: p.id, isCorrect: false }));

  const resSubmit = { status: () => resSubmit, json: (data) => Object.assign(resSubmit, data) };
  submitLesson({ userId, body: { topicId, answers, timeSpent: 30 } }, resSubmit);

  assert.strictEqual(resSubmit.score, 0);
  assert.strictEqual(resSubmit.xpGained, 0);
  assert.strictEqual(resSubmit.coinsGained, 0);
  assert.strictEqual(resSubmit.newLevel, 1);
});
