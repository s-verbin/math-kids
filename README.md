# Счетный двор - Обучающий математический сервис

Веб-приложение для обучения математике и русскому языку учеников начальных классов с прогрессивной системой сложности, геймификацией и 3D фермой.

## 🎯 Возможности

### Обучение
- **20 тем**: 16 математических + 4 темы по русскому языку (безударные гласные, парные согласные, непроизносимые согласные, словарные слова)
- **10 заданий** на каждый урок
- Мгновенная проверка ответов
- Система оценок (⭐⭐⭐ за идеальный результат)

### Русский язык
- Уроки с пропущенными буквами
- Показ правильного слова целиком после выбора буквы
- Словарные слова русского языка

### Геймификация
- **Система уровней** (1-50+) с опытом (XP) и монетами
- **20 достижений** за различные успехи
- **Доска лидеров** топ-10 игроков
- Персонализация с выбором аватара

### 3D Ферма
- **10+ животных** с уникальными 3D моделями и размерами
- **18 предметов** (постройки, декорации, аксессуары)
- Процедурная генерация моделей из примитивов
- Разнообразный фон: солнце, облака, деревья, горы, река, мельница
- Drag & drop для размещения предметов

## 🚀 Быстрый старт

### Требования
- Node.js 20+
- Docker + Docker Compose (для production-like запуска)
- npm или yarn

### Установка

1. **Клонируйте репозиторий**
```bash
git clone https://github.com/s-verbin/math-kids.git
cd math-kids
```

2. **Установите зависимости для backend**
```bash
cd backend
npm install
```

3. **Установите зависимости для frontend**
```bash
cd ../frontend
npm install
```

### Запуск локально

```bash
# Backend
cd backend
npm start          # http://localhost:3001

# Frontend (в другом терминале)
cd frontend
npm run dev        # http://localhost:5173
```

### Запуск в Docker

```bash
docker compose up -d --build
```

## 📁 Структура проекта

```
math-kids/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Контроллеры API
│   │   ├── middleware/      # Middleware (авторизация)
│   │   ├── models/          # База данных SQLite (sql.js)
│   │   ├── routes/          # Маршруты API
│   │   └── server.js        # Главный файл сервера
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   │   ├── Farm3D/      # 3D компоненты фермы
│   │   │   │   ├── FarmScene.jsx
│   │   │   │   ├── ProceduralAnimal.jsx
│   │   │   │   ├── FarmBuilding.jsx
│   │   │   │   └── Background.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NumberKeyboard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/         # Context API (авторизация)
│   │   ├── pages/           # Страницы приложения
│   │   ├── services/        # API клиент
│   │   └── App.jsx
│   ├── package.json
│   └── .env
│
└── README.md                # Этот файл
```

## 🛠 Технологии

### Backend
- **Node.js** + **Express** - сервер
- **SQLite (sql.js)** - база данных
- **JWT** - авторизация
- **bcryptjs** - хеширование паролей

### Frontend
- **React 19** - UI библиотека
- **Vite** - сборщик
- **React Router** - роутинг
- **TailwindCSS** - стилизация
- **Lucide React** - иконки
- **Axios** - HTTP клиент
- **Three.js** + **@react-three/fiber** + **@react-three/drei** - 3D графика

## 📊 API Endpoints

### Авторизация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход

### Пользователь
- `GET /api/user/profile` - Профиль пользователя
- `PUT /api/user/avatar` - Обновить аватар

### Темы
- `GET /api/topics` - Список всех тем
- `GET /api/topics/:id` - Информация о теме

### Уроки
- `POST /api/lessons/start` - Начать урок
- `POST /api/lessons/submit` - Отправить результаты
- `GET /api/lessons/leaderboard` - Доска лидеров
- `GET /api/lessons/achievements` - Достижения

### Ферма
- `GET /api/farm/shop` - Магазин
- `GET /api/farm/my-farm` - Моя ферма
- `POST /api/farm/buy-animal` - Купить животное
- `POST /api/farm/buy-item` - Купить предмет

### Аналитика пользователей
- `POST /api/analytics/start` - Начать сессию
- `POST /api/analytics/end` - Завершить сессию
- `GET /api/analytics/stats` - Сводная статистика по устройствам, браузерам и времени

#### Пример использования статистики

Старт сессии (автоматически вызывается на фронте после входа):
```bash
curl -X POST http://localhost:3001/api/analytics/start \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "userAgent": "Mozilla/5.0 ...",
    "screen": "1512x982",
    "deviceType": "desktop",
    "browser": "Chrome",
    "os": "macOS"
  }'
```

Ответ:
```json
{
  "sessionId": 1
}
```

Завершение сессии (при закрытии вкладки):
```bash
curl -X POST http://localhost:3001/api/analytics/end \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": 1}'
```

Получение сводки:
```bash
curl http://localhost:3001/api/analytics/stats \
  -H "Authorization: Bearer <TOKEN>"
```

Ответ:
```json
{
  "total": {
    "total_sessions": 1,
    "avg_duration_seconds": 120.5
  },
  "byDeviceAndBrowser": [
    {
      "device_type": "desktop",
      "browser": "Chrome",
      "sessions": 1,
      "avg_duration_seconds": 120.5
    }
  ]
}
```

## 🎮 Как играть

1. **Регистрация** - Создай аккаунт, выбери аватар
2. **Выбери тему** - Начни с простого сложения или русского языка
3. **Реши примеры** - 10 заданий на урок
4. **Получи награды** - XP, уровни, монеты, достижения
5. **Развивай ферму** - Покупай животных, стройки и декорации
6. **Соревнуйся** - Попади в топ-10 лидеров!

## 🏆 Система достижений

- 👶 **Первые шаги** - Решить первый урок
- ⭐ **Отличник** - Получить 10/10
- 🔥 **Упорный** - 7 дней подряд
- ⚡ **Скорострел** - Урок за 2 минуты
- ➕ **Мастер сложения** - Все темы сложения
- ➖ **Мастер вычитания** - Все темы вычитания
- ✖️ **Мастер умножения** - Таблица умножения
- 🎓 **Математик** - Все темы
- 💯 **Сотня** - 100 примеров
- 🏆 **Тысяча** - 1000 примеров
- 🌱 **Новичок** - Пройти 5 уроков
- 📚 **Ученик** - Пройти 10 уроков
- 🎯 **Знаток** - Пройти 25 уроков
- 🧠 **Эксперт** - Пройти 50 уроков
- 👨‍🏫 **Профессор** - Пройти 100 уроков
- 💨 **Молниеносный** - Урок за 1 минуту
- 💎 **Перфекционист** - 10/10 в 5 уроках
- 🌟 **Пятитысячник** - 5000 примеров
- 👑 **Легенда** - 20 уровень
- 🏃 **Марафонец** - 30 дней подряд

## 🔧 Разработка

### Backend
```bash
cd backend
npm run dev  # Запуск с nodemon (автоперезагрузка)
```

### Frontend
```bash
cd frontend
npm run dev   # Режим разработки
npm run build # Сборка для продакшена
```

## 📝 Лицензия

MIT

## 👨‍💻 Автор

Создано для обучения математике младших школьников
