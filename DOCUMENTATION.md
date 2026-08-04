# Счетный двор - Документация проекта

## 📋 Оглавление
1. [Обзор проекта](#обзор-проекта)
2. [Архитектура](#архитектура)
3. [Технологии](#технологии)
4. [Структура базы данных](#структура-базы-данных)
5. [Как добавить новые задания](#как-добавить-новые-задания)
6. [Как добавить новые достижения](#как-добавить-новые-достижения)
7. [Проблемные места](#проблемные-места)
8. [Точки развития](#точки-развития)

---

## Обзор проекта

**Счетный двор** - образовательное веб-приложение для обучения математике и русскому языку учеников начальных классов с игровой механикой фермы.

### Основные возможности:
- 🧮 **16 математических тем** (сложение, вычитание, умножение, деление, сложные уравнения)
- 📝 **4 темы по русскому языку** (безударные гласные, парные согласные, непроизносимые согласные, словарные слова)
- 🪙 **Система монет** - зарабатывай монеты за правильные ответы
- 🚜 **3D Ферма** - покупай и ухаживай за животными из "Скотного двора"
- 🐷 **10 животных** - свинья, лошадь, корова, курица, овца и другие
- 🏠 **18 предметов** - постройки, декорации, аксессуары для фермы
- 🎨 **Процедурная 3D графика** - животные и постройки построены из примитивов, разные размеры и детали
- 🌄 **Разнообразный фон** - солнце, облака, птицы, деревья, горы, река, мельница
- 🏆 **20 достижений** с системой прогресса
- 📊 **Система уровней и опыта (XP)**
- 🎯 **Таблица лидеров**
- 📱 **Адаптивный дизайн** для мобильных, планшетов и десктопов
- ⌨️ **Кастомная клавиатура** для мобильных устройств

---

## Архитектура

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── Navbar.jsx       # Навигационная панель
│   │   ├── NumberKeyboard.jsx  # Кастомная клавиатура для мобильных
│   │   ├── ProtectedRoute.jsx  # Защита маршрутов
│   │   └── Farm3D/          # 3D компоненты фермы
│   │       ├── FarmScene.jsx    # Основная 3D сцена
│   │       ├── FarmBuilding.jsx # Постройки, декорации, аксессуары
│   │       ├── ProceduralAnimal.jsx # Процедурные животные
│   │       ├── Background.jsx   # Фон: горы, деревья, солнце, облака
│   │       ├── Ground.jsx       # Процедурная земля
│   │       ├── LandPlot.jsx     # Участки земли
│   │       └── Draggable.jsx    # Drag & drop
│   ├── pages/               # Страницы приложения
│   │   ├── Home.jsx         # Главная страница с темами
│   │   ├── Lesson.jsx       # Страница урока
│   │   ├── Profile.jsx      # Профиль пользователя
│   │   ├── Farm.jsx         # Страница фермы (2D/3D)
│   │   ├── Leaderboard.jsx  # Таблица лидеров
│   │   ├── Login.jsx        # Вход
│   │   └── Register.jsx     # Регистрация
│   ├── context/
│   │   └── AuthContext.jsx  # Контекст авторизации
│   ├── services/
│   │   └── api.js           # API клиент (Axios + Farm API)
│   └── index.css            # Глобальные стили (TailwindCSS)
```

### Backend (Node.js + Express)
```
backend/
├── src/
│   ├── controllers/         # Бизнес-логика
│   │   ├── authController.js    # Регистрация/вход
│   │   ├── userController.js    # Профиль пользователя
│   │   ├── lessonController.js  # Генерация и проверка заданий
│   │   ├── topicController.js   # Управление темами
│   │   └── farmController.js    # Логика фермы (покупка, кормление)
│   ├── middleware/
│   │   └── auth.js          # JWT авторизация
│   ├── models/
│   │   └── database.js      # Работа с SQLite (sql.js)
│   ├── routes/
│   │   ├── auth.js          # Маршруты авторизации
│   │   ├── user.js          # Маршруты пользователя
│   │   ├── topics.js        # Маршруты тем
│   │   ├── lessons.js       # Маршруты уроков
│   │   └── farm.js          # Маршруты фермы
│   └── server.js            # Точка входа
└── mathkids.db              # SQLite база данных
```

---

## Технологии

### Frontend
- **React 19** - UI библиотека
- **React Router** - Маршрутизация
- **Axios** - HTTP клиент
- **TailwindCSS** - CSS фреймворк
- **Lucide React** - Иконки
- **Three.js** - 3D графика
- **@react-three/fiber** - React рендерер для Three.js
- **@react-three/drei** - Хелперы для R3F
- **Vite** - Сборщик

### Backend
- **Node.js** - Runtime
- **Express** - Web фреймворк
- **sql.js** - SQLite в памяти
- **bcryptjs** - Хеширование паролей
- **jsonwebtoken** - JWT токены
- **cors** - CORS middleware

---

## Структура базы данных

### Таблица `users`
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,           -- bcrypt hash
  display_name TEXT NOT NULL,
  avatar TEXT DEFAULT '😊',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,          -- Монеты для фермы
  total_problems_solved INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица `topics`
```sql
CREATE TABLE topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  difficulty INTEGER NOT NULL,      -- 1-7
  category TEXT NOT NULL,            -- addition, subtraction, russian, etc.
  min_value INTEGER,
  max_value INTEGER,
  operations TEXT NOT NULL,          -- add, subtract, vowels, etc.
  order_index INTEGER
);
```

### Таблица `lessons`
```sql
CREATE TABLE lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  topic_id INTEGER NOT NULL,
  score INTEGER NOT NULL,            -- Количество правильных ответов
  total_questions INTEGER NOT NULL,  -- Всего вопросов (обычно 10)
  time_spent INTEGER,                -- Время в секундах
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (topic_id) REFERENCES topics(id)
);
```

### Таблица `achievements`
```sql
CREATE TABLE achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  condition_type TEXT NOT NULL,      -- lessons_completed, perfect_score, etc.
  condition_value INTEGER
);
```

### Таблица `user_achievements`
```sql
CREATE TABLE user_achievements (
  user_id INTEGER,
  achievement_id INTEGER,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id)
);
```

### Таблица `daily_stats`
```sql
CREATE TABLE daily_stats (
  user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  problems_solved INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);
```

### Таблица `farm_animals`
```sql
CREATE TABLE farm_animals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,        -- Название животного
  type TEXT NOT NULL,                -- pig, horse, cow, etc.
  price INTEGER NOT NULL,            -- Цена в монетах
  description TEXT,
  model_data TEXT                    -- JSON с параметрами 3D модели
);
```

### Таблица `farm_items`
```sql
CREATE TABLE farm_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,        -- Название предмета
  category TEXT NOT NULL,            -- building, decoration, accessory
  price INTEGER NOT NULL,            -- Цена в монетах
  description TEXT,
  model_data TEXT                    -- JSON с параметрами 3D модели
);
```

### Таблица `user_animals`
```sql
CREATE TABLE user_animals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  animal_id INTEGER NOT NULL,
  name TEXT,                         -- Кличка животного
  hunger INTEGER DEFAULT 100,        -- 0-100
  happiness INTEGER DEFAULT 100,     -- 0-100
  last_fed DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_petted DATETIME DEFAULT CURRENT_TIMESTAMP,
  purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (animal_id) REFERENCES farm_animals(id)
);
```

### Таблица `user_inventory`
```sql
CREATE TABLE user_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  equipped_on_animal_id INTEGER,     -- NULL если не надето
  purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (item_id) REFERENCES farm_items(id),
  FOREIGN KEY (equipped_on_animal_id) REFERENCES user_animals(id)
);
```

---

## Как добавить новые задания

### 1. Добавить тему в базу данных

Открой `backend/src/models/database.js` и добавь новую тему в массив `topics`:

```javascript
const topics = [
  // ... существующие темы
  { 
    name: 'Дроби простые',                    // Название темы
    description: 'Сложение простых дробей',   // Описание
    difficulty: 5,                             // Сложность 1-7
    category: 'fractions',                     // Категория
    operations: 'add_fractions',               // Тип операции
    min_value: 1,                              // Минимальное значение
    max_value: 10,                             // Максимальное значение
    order_index: 20                            // Порядок отображения
  }
];
```

### 2. Добавить генератор примеров

В `backend/src/controllers/lessonController.js` добавь логику генерации в функцию `generateProblem`:

```javascript
const generateProblem = (topic) => {
  const { operations, min_value, max_value } = topic;
  
  // ... существующие операции
  
  if (operations === 'add_fractions') {
    const numerator1 = Math.floor(Math.random() * max_value) + 1;
    const numerator2 = Math.floor(Math.random() * max_value) + 1;
    const denominator = Math.floor(Math.random() * 10) + 2;
    
    return {
      question: `${numerator1}/${denominator} + ${numerator2}/${denominator}`,
      answer: numerator1 + numerator2,
      type: 'fraction'  // Если нужна особая обработка
    };
  }
  
  return { question: '1 + 1', answer: 2 };
};
```

### 3. Добавить иконку категории (опционально)

В `frontend/src/pages/Home.jsx` добавь иконку для новой категории:

```javascript
const getCategoryIcon = (category) => {
  const icons = {
    // ... существующие
    fractions: '🔢'  // Новая категория
  };
  return icons[category] || '📚';
};
```

### 4. Перезапустить backend

```bash
# Удалить старую БД (если нужно)
rm backend/mathkids.db

# Перезапустить
cd backend && npm start
```

---

## Как добавить новые достижения

### 1. Добавить достижение в базу

В `backend/src/models/database.js` добавь в массив `achievements`:

```javascript
const achievements = [
  // ... существующие
  { 
    name: 'Мастер дробей',                    // Название
    description: 'Решил 50 примеров с дробями', // Описание
    icon: '🔢',                                // Эмодзи иконка
    condition_type: 'category_problems',       // Тип условия
    condition_value: 50                        // Значение
  }
];
```

### 2. Добавить логику проверки (если нужна новая)

В `backend/src/controllers/lessonController.js` в функции `checkAndUnlockAchievements`:

```javascript
const checkAndUnlockAchievements = (userId, data) => {
  // ... существующая логика
  
  // Новое условие
  if (achievement.condition_type === 'category_problems') {
    const categoryProblems = db.prepare(`
      SELECT SUM(total_questions) as count 
      FROM lessons l
      JOIN topics t ON l.topic_id = t.id
      WHERE l.user_id = ? AND t.category = ?
    `).get(userId, 'fractions');
    
    if (categoryProblems.count >= achievement.condition_value) {
      unlockAchievement(userId, achievement.id);
    }
  }
};
```

### 3. Существующие типы условий

- `lessons_completed` - Количество пройденных уроков
- `perfect_score` - Количество идеальных результатов (10/10)
- `streak_days` - Дни подряд (не реализовано полностью)
- `fast_lesson` - Время прохождения урока (в секундах)
- `problems_solved` - Всего решено примеров
- `level_reached` - Достигнутый уровень
- `category_master` - Пройдены все темы категории (не реализовано)
- `all_topics` - Пройдены все темы

---

## Как работает ферма

### Система монет
- **10 монет** за каждый правильный ответ в любом уроке
- Монеты отображаются в профиле и после урока
- Используются для покупки животных и предметов

### Животные (10 шт)
| Животное | Цена | Тип |
|----------|------|-----|
| Курица | 50 | chicken |
| Утка | 80 | duck |
| Свинья | 100 | pig |
| Кот | 120 | cat |
| Собака | 150 | dog |
| Коза | 180 | goat |
| Овца | 200 | sheep |
| Осёл | 250 | donkey |
| Лошадь | 300 | horse |
| Корова | 500 | cow |

### Предметы магазина (18 шт)
**Постройки:** Поилка (80), Кормушка (100), Забор (150), Колодец (200), Сарай (300), Мельница (600)

**Декор:** Скамейка (70), Фонарь (90), Клумба (100), Пугало (110), Стог сена (120)

**Аксессуары:** Бантик (30), Колокольчик (40), Венок (45), Шляпа (50), Ошейник (60), Седло (150)

### Геймплей
1. **Покупка:** Выбери животное в магазине → введи кличку → потрать монеты
2. **Кормление:** Раз в сутки животное голодает → кнопка "Покормить"
3. **Глажка:** Раз в сутки животное грустнеет → кнопка "Погладить"
4. **Индикаторы:** Голод и настроение уменьшаются на 4% в час

### 3D Визуализация
- **Процедурная графика:** Животные построены из примитивов (сферы, цилиндры, конусы)
- **Без текстур:** Только процедурные материалы и цвета
- **Анимации:** Idle (покачивание), клик (сжатие), hover (подсветка)
- **Переключение:** Кнопка "2D Список" / "3D Вид"
- **Производительность:** ~60 FPS на современных устройствах

### API Endpoints
```
GET  /api/farm/shop       - Список животных и предметов
GET  /api/farm/my-farm    - Моя ферма (животные + инвентарь + монеты)
POST /api/farm/buy-animal - Купить животное
POST /api/farm/buy-item   - Купить предмет
POST /api/farm/feed       - Покормить животное
POST /api/farm/pet        - Погладить животное
POST /api/farm/equip      - Надеть аксессуар
```

---

## Проблемные места

### 1. ⚠️ localStorage и токены

**Проблема:** При удалении базы данных старые токены в localStorage становятся невалидными.

**Решение:** 
- Очистить localStorage: `localStorage.clear()`
- Или использовать режим инкогнито для тестирования

**Код:** `frontend/src/context/AuthContext.jsx:19-32`

### 2. ⚠️ sql.js и lastInsertRowid

**Проблема:** `lastInsertRowid` в sql.js работает не так как в better-sqlite3.

**Решение:** Выполнять `SELECT last_insert_rowid()` сразу после INSERT.

**Код:** `backend/src/models/database.js:34-39`

```javascript
run: (...params) => {
  db.run(sql, params);
  const idResult = db.exec('SELECT last_insert_rowid() as id');
  const lastId = idResult[0]?.values[0]?.[0];
  saveDatabase();
  return { lastInsertRowid: lastId !== undefined ? lastId : null };
}
```

### 3. ⚠️ Сравнение ответов в русском языке

**Проблема:** Типы данных могут не совпадать (string vs number).

**Решение:** Приведение к строке с trim().

**Код:** `frontend/src/pages/Lesson.jsx:51-52`

```javascript
const isCorrect = isRussian 
  ? String(userAnswer).trim() === String(correctAnswer).trim()
  : parseInt(userAnswer) === correctAnswer;
```

### 4. ⚠️ React StrictMode и двойной рендер

**Проблема:** В dev режиме React вызывает useEffect дважды, что может вызвать двойные запросы.

**Решение:** Нормальное поведение в dev, в production будет один вызов.

### 5. ⚠️ Кастомная клавиатура на мобильных

**Проблема:** Стандартная клавиатура может открываться вместе с кастомной.

**Решение:** `inputMode="none"` и `readOnly` для input на мобильных.

**Код:** `frontend/src/pages/Lesson.jsx:272-280`

---

## Точки развития

### 🚀 Краткосрочные улучшения (1-2 недели)

#### 1. Система стриков (дни подряд)
**Что:** Отслеживание ежедневной активности пользователя.

**Как реализовать:**
1. Добавить поле `last_active_date` в таблицу `users`
2. При каждом завершении урока проверять:
   - Если вчера был активен → увеличить стрик
   - Если не вчера → сбросить стрик
3. Добавить достижения за стрики (7, 14, 30 дней)

**Файлы:**
- `backend/src/controllers/lessonController.js` - логика стриков
- `frontend/src/pages/Profile.jsx` - отображение стрика

#### 2. Звуковые эффекты
**Что:** Звуки при правильном/неправильном ответе, получении достижения.

**Как реализовать:**
1. Добавить аудио файлы в `frontend/public/sounds/`
2. Использовать `new Audio('/sounds/correct.mp3').play()`
3. Добавить настройку включения/выключения звука

**Файлы:**
- `frontend/src/pages/Lesson.jsx` - звуки при ответах
- `frontend/src/context/SettingsContext.jsx` - настройки звука (создать)

#### 3. Анимации и визуальные эффекты
**Что:** Конфетти при получении достижения, плавные переходы.

**Библиотеки:**
- `react-confetti` - конфетти
- `framer-motion` - анимации

#### 4. Больше слов для русского языка
**Статус:** ✅ Реализовано  
**Что:** Словарь для русского языка расширен: добавлены словарные слова (39+ слов).

**Файлы:**
- `backend/src/controllers/lessonController.js`

#### 5. Больше 3D животных
**Статус:** ✅ Реализовано  
**Что:** Все животные отображаются через `ProceduralAnimal.jsx` с разными размерами и деталями (крылья, вымя, бородка и др.).

**Файлы:**
- `frontend/src/components/Farm3D/ProceduralAnimal.jsx`

#### 6. Fur Shader (по ТЗ)
**Что:** Shell-rendering для реалистичной шерсти животных.

**Технологии:**
- Custom ShaderMaterial
- Noise-based alpha cutting
- Multiple shell layers

**Файлы:**
- `frontend/src/components/Farm3D/shaders/FurMaterial.js` (создать)

#### 7. Взаимодействие с фермой в 3D
**Что:** Кормление и глажка прямо в 3D сцене.

**Функции:**
- Клик по животному → меню действий
- Анимация кормления (частицы еды)
- Анимация глажки (сердечки)
- Звуки животных

### 🎯 Среднесрочные улучшения (1-2 месяца)

#### 1. Режим тренировки
**Что:** Бесконечный режим без сохранения результатов для практики.

**Функции:**
- Выбор конкретной темы
- Настройка сложности
- Таймер или без таймера
- Не влияет на статистику

#### 2. Родительский контроль
**Что:** Отдельный аккаунт родителя для просмотра прогресса детей.

**Таблицы:**
```sql
CREATE TABLE parent_child (
  parent_id INTEGER,
  child_id INTEGER,
  PRIMARY KEY (parent_id, child_id)
);
```

**Функции:**
- Просмотр статистики ребенка
- Установка целей
- Ограничение времени игры

#### 3. Мультиплеер / Соревнования
**Что:** Соревнование с другими учениками в реальном времени.

**Технологии:**
- WebSocket (socket.io)
- Комнаты для игр
- Рейтинг ELO

#### 4. Адаптивная сложность
**Что:** Автоматическая подстройка сложности под уровень ученика.

**Логика:**
- Если 3 урока подряд 10/10 → предложить более сложную тему
- Если 3 урока подряд <5/10 → предложить более простую тему

### 🌟 Долгосрочные улучшения (3-6 месяцев)

#### 1. Мобильное приложение
**Технологии:**
- React Native
- Expo
- Общий backend

#### 2. Геймификация
**Что:**
- Виртуальная валюта (монеты)
- Магазин аватаров и тем
- Питомцы, которые растут с прогрессом
- Квесты и челленджи

#### 3. AI помощник
**Что:** Персональный AI учитель, который:
- Объясняет ошибки
- Дает подсказки
- Адаптирует задания

**Технологии:**
- OpenAI API
- Локальные LLM (llama.cpp)

#### 4. Расширение предметов
**Новые разделы:**
- Английский язык (слова, грамматика)
- Окружающий мир (викторины)
- Логика и головоломки
- Программирование для детей

#### 5. Социальные функции
**Что:**
- Друзья и подписки
- Обмен достижениями
- Совместное решение задач
- Чат (с модерацией)

---

## Развертывание (Production)

### Frontend (Netlify / Vercel)
```bash
cd frontend
npm run build
# Деплой dist/ папки
```

### Backend (Railway / Render / Heroku)
```bash
cd backend
# Настроить переменные окружения:
# - JWT_SECRET
# - PORT
npm start
```

### База данных
**Текущее решение:** SQLite файл (mathkids.db)

**Для production:**
- PostgreSQL (Supabase, Neon)
- MySQL
- MongoDB

**Миграция:**
Переписать `backend/src/models/database.js` для работы с выбранной БД.

---

## Команды для разработки

### Frontend
```bash
cd frontend
npm install          # Установка зависимостей
npm run dev          # Запуск dev сервера (http://localhost:5173)
npm run build        # Сборка для production
npm run preview      # Просмотр production сборки
```

### Backend
```bash
cd backend
npm install          # Установка зависимостей
npm start            # Запуск сервера (http://localhost:3001)
npm run dev          # Запуск с nodemon (автоперезагрузка)
```

### Очистка и перезапуск
```bash
# Удалить БД и начать заново
rm backend/mathkids.db
cd backend && npm start

# Очистить localStorage в браузере
# В консоли браузера:
localStorage.clear()
```

---

## Контакты и поддержка

**Автор:** Sergey Verbin  
**Проект:** Счетный двор  
**Версия:** 1.0.0  
**Дата:** Август 2026

---

## Лицензия

MIT License - свободное использование и модификация.
