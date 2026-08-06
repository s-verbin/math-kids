# 🔧 Рефакторинг кодовой базы

## Цель

Подготовка архитектуры к масштабированию функционала без превращения кода в спагетти.

---

## ✅ Выполнено

### 1. Система событий (EventBus)

**Файл:** `frontend/src/services/EventBus.js`

**Что даёт:**
- Слабая связанность модулей
- Легко добавлять побочные эффекты
- Централизованное управление событиями

**Пример:**
```javascript
// Эмит события
eventBus.emit(EVENTS.RESOURCE_COLLECTED, { type: 'egg', value: 5 });

// Подписка на событие
eventBus.on(EVENTS.RESOURCE_COLLECTED, (data) => {
  updateAchievements(data);
  showNotification(data);
  updateStatistics(data);
});
```

**События:**
- Animal: `fed`, `petted`, `purchased`, `sold`
- Resource: `produced`, `collected`, `ready`
- Farm: `item_purchased`, `poop_created`, `poop_cleaned`
- Achievement: `unlocked`, `coins_earned`, `level_up`

---

### 2. Вынесены хуки из ProceduralAnimal

#### `useAnimalMovement.js`
**Ответственность:** Логика движения животного

**API:**
```javascript
const {
  posRef,           // Текущая позиция
  targetRef,        // Целевая позиция
  isMovingRef,      // Флаг движения
  initPosition,     // Инициализация
  updateMovement,   // Обновление каждый кадр
  getNewTarget      // Генерация новой цели
} = useAnimalMovement(bounds, obstacles);
```

**Фичи:**
- Избегание препятствий
- Детектор застревания (3 сек)
- Автоматический выбор новой цели

#### `useAnimalProduction.js`
**Ответственность:** Логика производства ресурсов

**API:**
```javascript
const {
  isReady,          // Ресурс готов?
  timeRemaining,    // Секунд до готовности
  resourceType,     // Тип ресурса
  resourceValue,    // Ценность
  icon,             // Иконка
  canProduce,       // Может производить?
  collectResource,  // Собрать ресурс
  formattedTime     // "2ч 30м"
} = useAnimalProduction(animalType, animalId, happiness, hunger);
```

**Фичи:**
- Автоматический таймер
- Бонусы от счастья/сытости
- Эмит событий через EventBus

---

### 3. Контейнеры для FarmScene

#### `ResourcesManager.jsx`
**Ответственность:** Управление 3D ресурсами на ферме

**Что делает:**
- Слушает события `RESOURCE_READY`
- Создаёт 3D модели ресурсов
- Удаляет ресурсы при сборе

**Использование:**
```jsx
<ResourcesManager animals={animals} />
```

---

### 4. Новые компоненты

#### `Resource.jsx`
**3D модели ресурсов:**
- 🥚 Яйцо — белая сфера с бликом
- 🥛 Молоко — ведро с молоком
- 🧶 Шерсть — клубок с текстурой

**Анимация:**
- Покачивание вверх-вниз
- Вращение вокруг оси Y

#### `ProductionIndicator.jsx`
**Индикатор над животным:**
- Таймер до готовности
- Зелёная кнопка "Готово!"
- Пульсация при готовности
- Клик для сбора

---

## 📁 Новая структура

### Backend
```
backend/src/
├── controllers/
│   ├── authController.js
│   ├── farmController.js
│   ├── lessonController.js
│   ├── productionController.js  ← НОВЫЙ
│   ├── topicController.js
│   └── userController.js
├── routes/
│   ├── auth.js
│   ├── farm.js
│   ├── lessons.js
│   ├── production.js            ← НОВЫЙ
│   ├── topics.js
│   └── user.js
└── models/
    └── database.js              ← +2 таблицы
```

### Frontend
```
frontend/src/
├── components/
│   └── Farm3D/
│       ├── Background.jsx
│       ├── FarmScene.jsx
│       ├── ProceduralAnimal.jsx
│       ├── Resource.jsx                    ← НОВЫЙ
│       ├── ProductionIndicator.jsx         ← НОВЫЙ
│       └── containers/
│           └── ResourcesManager.jsx        ← НОВЫЙ
├── hooks/
│   ├── useAnimalMovement.js                ← НОВЫЙ
│   └── useAnimalProduction.js              ← НОВЫЙ
└── services/
    ├── api.js                               ← +productionAPI
    └── EventBus.js                          ← НОВЫЙ
```

---

## 📊 Метрики

### До рефакторинга:
- `ProceduralAnimal.jsx`: **808 строк** 🔴
- `FarmScene.jsx`: **467 строк** 🟡
- Хуки: **0** 🔴
- Система событий: **Нет** 🔴

### После рефакторинга:
- `ProceduralAnimal.jsx`: **~600 строк** 🟢 (-25%)
- `FarmScene.jsx`: **~400 строк** 🟢 (-15%)
- Хуки: **2** 🟢
- Система событий: **EventBus** 🟢
- Контейнеры: **1** 🟢

---

## 🎯 Следующие шаги

### Краткосрочные (1-2 дня):
1. ✅ EventBus
2. ✅ Хуки для животных
3. ✅ Контейнер ResourcesManager
4. ⏳ Разбить ProceduralAnimal на части:
   - `AnimalBody.jsx`
   - `AnimalFur.jsx`
   - `AnimalWings.jsx`
5. ⏳ Создать контейнеры для FarmScene:
   - `AnimalsManager.jsx`
   - `BuildingsManager.jsx`
   - `PlantsManager.jsx`

### Среднесрочные (3-5 дней):
6. Разбить Background.jsx:
   - `Sky.jsx`
   - `Hills.jsx`
   - `Trees.jsx`
   - `Clouds.jsx`
7. Добавить эффекты:
   - `DayNightCycle.js`
   - `Weather.js`
   - `Birds.js`

---

## 💡 Принципы рефакторинга

### 1. Single Responsibility
Каждый компонент/хук отвечает за одну вещь:
- `useAnimalMovement` — только движение
- `useAnimalProduction` — только производство
- `ResourcesManager` — только ресурсы

### 2. Composition over Inheritance
Используем композицию компонентов:
```jsx
<ProceduralAnimal>
  <AnimalBody />
  <AnimalFur />
  <AnimalWings />
  <ProductionIndicator />
</ProceduralAnimal>
```

### 3. Event-Driven Architecture
Модули общаются через события:
```javascript
// Модуль A
eventBus.emit('resource:collected', data);

// Модуль B
eventBus.on('resource:collected', handleCollection);
```

### 4. Don't Repeat Yourself (DRY)
Общая логика в хуках:
- Движение → `useAnimalMovement`
- Производство → `useAnimalProduction`
- Анимация → `useAnimalAnimation` (TODO)

---

## 🚀 Преимущества

### Для разработки:
- ✅ Легко добавлять новые фичи
- ✅ Код читаемый и понятный
- ✅ Легко тестировать модули
- ✅ Меньше багов

### Для производительности:
- ✅ Переиспользование хуков
- ✅ Мемоизация компонентов
- ✅ Ленивая загрузка модулей

### Для масштабирования:
- ✅ Модульная архитектура
- ✅ Слабая связанность
- ✅ Легко добавлять разработчиков

---

## 📚 Дополнительно

- [PRODUCTION_SYSTEM.md](./PRODUCTION_SYSTEM.md) — документация системы производства
- [DOCUMENTATION.md](./DOCUMENTATION.md) — общая документация проекта
