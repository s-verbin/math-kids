import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = process.env.DB_PATH || join(__dirname, '../../mathkids.db');

const SQL = await initSqlJs();
let db;

if (fs.existsSync(dbPath)) {
  const buffer = fs.readFileSync(dbPath);
  db = new SQL.Database(buffer);
} else {
  db = new SQL.Database();
}

const saveDatabase = () => {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
};

const run = (sql, params = []) => {
  db.run(sql, params);
  saveDatabase();
  return { lastInsertRowid: db.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0] || 0 };
};

const prepare = (sql) => {
  return {
    run: (...params) => {
      db.run(sql, params);
      const idResult = db.exec('SELECT last_insert_rowid() as id');
      const lastId = idResult[0]?.values[0]?.[0];
      saveDatabase();
      return { lastInsertRowid: lastId !== undefined ? lastId : null };
    },
    get: (...params) => {
      const result = db.exec(sql, params);
      if (!result[0]) return null;
      const columns = result[0].columns;
      const values = result[0].values[0];
      if (!values) return null;
      const obj = {};
      columns.forEach((col, idx) => obj[col] = values[idx]);
      return obj;
    },
    all: (...params) => {
      const result = db.exec(sql, params);
      if (!result[0]) return [];
      const columns = result[0].columns;
      return result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, idx) => obj[col] = row[idx]);
        return obj;
      });
    }
  };
};

const dbWrapper = {
  exec: (sql) => {
    db.exec(sql);
    saveDatabase();
  },
  prepare,
  run
};

try {
  db.exec('ALTER TABLE users ADD COLUMN accepted_terms_at DATETIME;');
} catch {
  // Колонка уже существует
}

dbWrapper.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar TEXT DEFAULT '😊',
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    total_problems_solved INTEGER DEFAULT 0,
    accepted_terms_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    difficulty INTEGER NOT NULL,
    category TEXT NOT NULL,
    min_value INTEGER,
    max_value INTEGER,
    operations TEXT,
    order_index INTEGER NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_topics_name ON topics(name);

  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    time_spent INTEGER,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id)
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    condition_type TEXT NOT NULL,
    condition_value INTEGER
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_achievements_name ON achievements(name);

  CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id),
    UNIQUE(user_id, achievement_id)
  );

  CREATE TABLE IF NOT EXISTS daily_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    problems_solved INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, date)
  );

  CREATE TABLE IF NOT EXISTS daily_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    streak INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, date)
  );

  CREATE TABLE IF NOT EXISTS farm_animals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    model_data TEXT
  );

  CREATE TABLE IF NOT EXISTS farm_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    model_data TEXT
  );

  CREATE TABLE IF NOT EXISTS user_animals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    animal_id INTEGER NOT NULL,
    name TEXT,
    hunger INTEGER DEFAULT 100,
    happiness INTEGER DEFAULT 100,
    last_fed DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_petted DATETIME DEFAULT CURRENT_TIMESTAMP,
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (animal_id) REFERENCES farm_animals(id)
  );

  CREATE TABLE IF NOT EXISTS user_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    equipped_on_animal_id INTEGER,
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES farm_items(id),
    FOREIGN KEY (equipped_on_animal_id) REFERENCES user_animals(id)
  );
`);

const topics = [
  { name: 'Сложение до 10', description: 'Простые примеры на сложение', difficulty: 1, category: 'addition', operations: 'add', min_value: 1, max_value: 10, order_index: 1 },
  { name: 'Вычитание до 10', description: 'Простые примеры на вычитание', difficulty: 1, category: 'subtraction', operations: 'subtract', min_value: 1, max_value: 10, order_index: 2 },
  { name: 'Сложение до 20', description: 'Сложение чисел до 20', difficulty: 2, category: 'addition', operations: 'add', min_value: 1, max_value: 20, order_index: 3 },
  { name: 'Вычитание до 20', description: 'Вычитание чисел до 20', difficulty: 2, category: 'subtraction', operations: 'subtract', min_value: 1, max_value: 20, order_index: 4 },
  { name: 'Найди слагаемое', description: 'Примеры с неизвестным слагаемым', difficulty: 3, category: 'unknown', operations: 'add_unknown', min_value: 1, max_value: 20, order_index: 5 },
  { name: 'Найди вычитаемое', description: 'Примеры с неизвестным числом', difficulty: 3, category: 'unknown', operations: 'subtract_unknown', min_value: 1, max_value: 20, order_index: 6 },
  { name: 'Таблица умножения 2-5', description: 'Умножение на 2, 3, 4, 5', difficulty: 4, category: 'multiplication', operations: 'multiply', min_value: 2, max_value: 5, order_index: 7 },
  { name: 'Таблица умножения 6-9', description: 'Умножение на 6, 7, 8, 9', difficulty: 5, category: 'multiplication', operations: 'multiply', min_value: 6, max_value: 9, order_index: 8 },
  { name: 'Деление на 2-5', description: 'Деление на 2, 3, 4, 5', difficulty: 4, category: 'division', operations: 'divide', min_value: 2, max_value: 5, order_index: 9 },
  { name: 'Деление на 6-9', description: 'Деление на 6, 7, 8, 9', difficulty: 5, category: 'division', operations: 'divide', min_value: 6, max_value: 9, order_index: 10 },
  { name: 'Сложение до 100', description: 'Сложение двузначных чисел', difficulty: 6, category: 'addition', operations: 'add', min_value: 10, max_value: 100, order_index: 11 },
  { name: 'Смешанные операции', description: 'Сложение, вычитание и умножение', difficulty: 7, category: 'mixed', operations: 'mixed', min_value: 1, max_value: 20, order_index: 12 },
  { name: 'Три числа: сложение', description: 'Сложение трёх чисел', difficulty: 5, category: 'addition', operations: 'add_three', min_value: 1, max_value: 20, order_index: 13 },
  { name: 'Три числа: вычитание', description: 'Вычитание с тремя числами', difficulty: 5, category: 'subtraction', operations: 'subtract_three', min_value: 1, max_value: 30, order_index: 14 },
  { name: 'Четыре числа', description: 'Примеры с четырьмя числами', difficulty: 6, category: 'mixed', operations: 'four_numbers', min_value: 1, max_value: 20, order_index: 15 },
  { name: 'Сложные уравнения', description: 'Найди неизвестное в сложных примерах', difficulty: 7, category: 'unknown', operations: 'complex_unknown', min_value: 1, max_value: 30, order_index: 16 },
  { name: 'Безударные гласные', description: 'Вставь пропущенную букву', difficulty: 2, category: 'russian', operations: 'vowels', min_value: 0, max_value: 0, order_index: 17 },
  { name: 'Парные согласные', description: 'Выбери правильную согласную', difficulty: 3, category: 'russian', operations: 'consonants', min_value: 0, max_value: 0, order_index: 18 },
  { name: 'Непроизносимые согласные', description: 'Найди пропущенную букву', difficulty: 4, category: 'russian', operations: 'silent_consonants', min_value: 0, max_value: 0, order_index: 19 },
  { name: 'Словарные слова', description: 'Правильно напиши словарные слова русского языка', difficulty: 4, category: 'russian', operations: 'dictionary_words', min_value: 0, max_value: 0, order_index: 20 },
  { name: 'Считаем фрукты', description: 'Складывай яблоки, груши и другие фрукты', difficulty: 1, category: 'basics', operations: 'fruits_add', min_value: 0, max_value: 0, order_index: 21 },
  { name: 'Лапы на ферме', description: 'Посчитай лапы у животных', difficulty: 1, category: 'basics', operations: 'farm_legs', min_value: 0, max_value: 0, order_index: 22 },
  { name: 'Больше или меньше', description: 'Сравни количество и найди разницу', difficulty: 1, category: 'basics', operations: 'compare_more', min_value: 0, max_value: 0, order_index: 23 },
  { name: 'Делим поровну', description: 'Раздели предметы между друзьями', difficulty: 1, category: 'basics', operations: 'share_equal', min_value: 0, max_value: 0, order_index: 24 },
  { name: 'Монетки', description: 'Считай рубли и копейки', difficulty: 1, category: 'basics', operations: 'coin_change', min_value: 0, max_value: 0, order_index: 25 },
  { name: 'Пропущенное число', description: 'Найди пропущенное число в ряду', difficulty: 1, category: 'basics', operations: 'number_missing', min_value: 0, max_value: 0, order_index: 26 }
];

const insertTopic = dbWrapper.prepare(`
  INSERT OR IGNORE INTO topics (name, description, difficulty, category, min_value, max_value, operations, order_index)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

topics.forEach(topic => {
  insertTopic.run(
    topic.name,
    topic.description,
    topic.difficulty,
    topic.category,
    topic.min_value,
    topic.max_value,
    topic.operations,
    topic.order_index
  );
});

const achievements = [
  { name: 'Первые шаги', description: 'Решил первый урок', icon: '👶', condition_type: 'lessons_completed', condition_value: 1 },
  { name: 'Отличник', description: 'Получил 10/10 в уроке', icon: '⭐', condition_type: 'perfect_score', condition_value: 1 },
  { name: 'Упорный', description: 'Занимался 7 дней подряд', icon: '🔥', condition_type: 'streak_days', condition_value: 7 },
  { name: 'Скорострел', description: 'Решил урок за 2 минуты', icon: '⚡', condition_type: 'fast_lesson', condition_value: 120 },
  { name: 'Мастер сложения', description: 'Прошел все темы сложения', icon: '➕', condition_type: 'category_master', condition_value: 0 },
  { name: 'Мастер вычитания', description: 'Прошел все темы вычитания', icon: '➖', condition_type: 'category_master', condition_value: 1 },
  { name: 'Мастер умножения', description: 'Прошел таблицу умножения', icon: '✖️', condition_type: 'category_master', condition_value: 2 },
  { name: 'Математик', description: 'Прошел все темы', icon: '🎓', condition_type: 'all_topics', condition_value: 12 },
  { name: 'Сотня', description: 'Решил 100 примеров', icon: '💯', condition_type: 'problems_solved', condition_value: 100 },
  { name: 'Тысяча', description: 'Решил 1000 примеров', icon: '🏆', condition_type: 'problems_solved', condition_value: 1000 },
  { name: 'Новичок', description: 'Прошел 5 уроков', icon: '🌱', condition_type: 'lessons_completed', condition_value: 5 },
  { name: 'Ученик', description: 'Прошел 10 уроков', icon: '📚', condition_type: 'lessons_completed', condition_value: 10 },
  { name: 'Знаток', description: 'Прошел 25 уроков', icon: '🎯', condition_type: 'lessons_completed', condition_value: 25 },
  { name: 'Эксперт', description: 'Прошел 50 уроков', icon: '🧠', condition_type: 'lessons_completed', condition_value: 50 },
  { name: 'Профессор', description: 'Прошел 100 уроков', icon: '👨‍🏫', condition_type: 'lessons_completed', condition_value: 100 },
  { name: 'Молниеносный', description: 'Решил урок за 1 минуту', icon: '💨', condition_type: 'fast_lesson', condition_value: 60 },
  { name: 'Перфекционист', description: 'Получил 10/10 в 5 уроках', icon: '💎', condition_type: 'perfect_score', condition_value: 5 },
  { name: 'Пятитысячник', description: 'Решил 5000 примеров', icon: '🌟', condition_type: 'problems_solved', condition_value: 5000 },
  { name: 'Легенда', description: 'Достиг 20 уровня', icon: '👑', condition_type: 'level_reached', condition_value: 20 },
  { name: 'Марафонец', description: 'Занимался 30 дней подряд', icon: '🏃', condition_type: 'streak_days', condition_value: 30 }
];

const insertAchievement = dbWrapper.prepare(`
  INSERT OR IGNORE INTO achievements (name, description, icon, condition_type, condition_value)
  VALUES (?, ?, ?, ?, ?)
`);

achievements.forEach(ach => {
  insertAchievement.run(ach.name, ach.description, ach.icon, ach.condition_type, ach.condition_value);
});

const farmAnimals = [
  { name: 'Свинья', type: 'pig', price: 100, description: 'Умная и дружелюбная свинья' },
  { name: 'Лошадь', type: 'horse', price: 300, description: 'Благородная и сильная лошадь' },
  { name: 'Собака', type: 'dog', price: 150, description: 'Верный друг и охранник' },
  { name: 'Курица', type: 'chicken', price: 50, description: 'Несёт яйца каждый день' },
  { name: 'Овца', type: 'sheep', price: 200, description: 'Даёт тёплую шерсть' },
  { name: 'Корова', type: 'cow', price: 500, description: 'Даёт молоко' },
  { name: 'Коза', type: 'goat', price: 180, description: 'Даёт молоко и шерсть' },
  { name: 'Осёл', type: 'donkey', price: 250, description: 'Трудолюбивый помощник' },
  { name: 'Кот', type: 'cat', price: 120, description: 'Ловит мышей' },
  { name: 'Утка', type: 'duck', price: 80, description: 'Плавает в пруду' }
];

const farmItems = [
  { name: 'Сарай', category: 'building', price: 300, description: 'Укрытие для животных' },
  { name: 'Забор деревянный', category: 'building', price: 150, description: 'Ограждение участка' },
  { name: 'Участок земли', category: 'land', price: 500, description: 'Расширение фермы' },
  { name: 'Кормушка', category: 'building', price: 100, description: 'Для кормления животных' },
  { name: 'Поилка', category: 'building', price: 80, description: 'Для воды' },
  { name: 'Стог сена', category: 'decoration', price: 120, description: 'Корм для животных' },
  { name: 'Мельница', category: 'building', price: 600, description: 'Производит муку' },
  { name: 'Колодец', category: 'building', price: 200, description: 'Источник воды' },
  { name: 'Шляпа соломенная', category: 'accessory', price: 50, description: 'Для животных' },
  { name: 'Бантик красный', category: 'accessory', price: 30, description: 'Украшение' },
  { name: 'Колокольчик', category: 'accessory', price: 40, description: 'Звенит при движении' },
  { name: 'Седло', category: 'accessory', price: 150, description: 'Для лошади' },
  { name: 'Ошейник', category: 'accessory', price: 60, description: 'Для собаки' },
  { name: 'Цветочный венок', category: 'accessory', price: 45, description: 'Красивое украшение' },
  { name: 'Фонарь', category: 'decoration', price: 90, description: 'Освещение фермы' },
  { name: 'Скамейка', category: 'decoration', price: 70, description: 'Место для отдыха' },
  { name: 'Цветочная клумба', category: 'decoration', price: 100, description: 'Украшает ферму' },
  { name: 'Пугало', category: 'decoration', price: 110, description: 'Отпугивает птиц' }
];

const insertAnimal = dbWrapper.prepare(`
  INSERT OR IGNORE INTO farm_animals (name, type, price, description)
  VALUES (?, ?, ?, ?)
`);

const insertItem = dbWrapper.prepare(`
  INSERT OR IGNORE INTO farm_items (name, category, price, description)
  VALUES (?, ?, ?, ?)
`);

farmAnimals.forEach(animal => {
  insertAnimal.run(animal.name, animal.type, animal.price, animal.description);
});

farmItems.forEach(item => {
  insertItem.run(item.name, item.category, item.price, item.description);
});

export default dbWrapper;
