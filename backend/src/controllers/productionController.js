import db from '../models/database.js';
import { incrementFarmStat, updateDailyQuestProgress, checkAndUnlockFarmAchievements } from '../utils/farmProgress.js';

// Конфигурация производства
const PRODUCTION_CONFIG = {
  chicken: { resourceType: 'egg', productionTime: 7200, value: 5 },
  duck: { resourceType: 'egg', productionTime: 10800, value: 7 },
  cow: { resourceType: 'milk', productionTime: 14400, value: 15 },
  goat: { resourceType: 'milk', productionTime: 10800, value: 10 },
  sheep: { resourceType: 'wool', productionTime: 86400, value: 25 }
};

const UPGRADES = {
  'Автосборщик ресурсов': { autoCollect: true },
  'Инкубатор': { speed: 0.30, resourceType: 'egg' },
  'Доильный аппарат': { speed: 0.40, resourceType: 'milk' },
  'Стригальная машина': { speed: 0.50, resourceType: 'wool' }
};

const getUserUpgrades = (userId) => {
  const items = db.prepare(`
    SELECT fi.name
    FROM user_inventory ui
    JOIN farm_items fi ON ui.item_id = fi.id
    WHERE ui.user_id = ? AND fi.category = 'upgrade'
  `).all(userId);

  const upgrades = { autoCollect: false, speedByResource: {} };

  items.forEach(item => {
    const upgrade = UPGRADES[item.name];
    if (!upgrade) return;
    if (upgrade.autoCollect) {
      upgrades.autoCollect = true;
    }
    if (upgrade.speed && upgrade.resourceType) {
      upgrades.speedByResource[upgrade.resourceType] = 1 + upgrade.speed;
    }
  });

  return upgrades;
};

const calculateProductionTime = (animalType, baseTime, happiness, hunger, upgrades) => {
  const config = PRODUCTION_CONFIG[animalType];
  if (!config) return baseTime;

  const happinessBonus = happiness >= 80 ? 0.2 : 0;
  const hungerBonus = hunger >= 80 ? 0.1 : 0;
  const speedMultiplier = upgrades.speedByResource[config.resourceType] || 1;

  const adjusted = baseTime / ((1 + happinessBonus + hungerBonus) * speedMultiplier);
  return Math.max(1, Math.floor(adjusted));
};

const collectAndRestart = (userId, userAnimalId, animal, production, auto = false) => {
  const config = PRODUCTION_CONFIG[animal.type];
  if (!config) return null;

  const now = new Date();

  // Помечаем текущий ресурс собранным
  db.prepare(`
    UPDATE animal_production
    SET collected = 1
    WHERE id = ?
  `).run(production.id);

  // Начисляем монеты
  db.prepare(`
    UPDATE users
    SET coins = coins + ?
    WHERE id = ?
  `).run(config.value, userId);

  // Обновляем инвентарь ресурсов
  const existingResource = db.prepare(`
    SELECT * FROM user_resources
    WHERE user_id = ? AND resource_type = ?
  `).get(userId, config.resourceType);

  if (existingResource) {
    db.prepare(`
      UPDATE user_resources
      SET quantity = quantity + 1, last_collected = ?
      WHERE id = ?
    `).run(new Date().toISOString(), existingResource.id);
  } else {
    db.prepare(`
      INSERT INTO user_resources (user_id, resource_type, quantity, last_collected)
      VALUES (?, ?, 1, ?)
    `).run(userId, config.resourceType, new Date().toISOString());
  }

  // Статистика
  const resourceStatMap = { egg: 'eggs_collected', milk: 'milk_collected', wool: 'wool_collected' };
  incrementFarmStat(userId, resourceStatMap[config.resourceType], 1);
  incrementFarmStat(userId, 'total_resources_collected', 1);
  incrementFarmStat(userId, 'farm_coins_earned', config.value);

  // Квесты
  updateDailyQuestProgress(userId, `collect_${config.resourceType}`, 1);

  // Запускаем новый цикл
  const upgrades = getUserUpgrades(userId);
  const adjustedTime = calculateProductionTime(animal.type, config.productionTime, animal.happiness, animal.hunger, upgrades);
  const nextReadyAt = new Date(now.getTime() + adjustedTime * 1000);

  db.prepare(`
    INSERT INTO animal_production (user_animal_id, resource_type, ready_at, collected)
    VALUES (?, ?, ?, 0)
  `).run(userAnimalId, config.resourceType, nextReadyAt.toISOString());

  return { nextReadyAt: nextReadyAt.toISOString(), value: config.value };
};

export const getProductionStatus = (req, res) => {
  try {
    const upgrades = getUserUpgrades(req.userId);

    const animals = db.prepare(`
      SELECT ua.id, ua.user_id, fa.type, ua.happiness, ua.hunger,
             ap.id as production_id, ap.resource_type, ap.ready_at, ap.collected
      FROM user_animals ua
      JOIN farm_animals fa ON ua.animal_id = fa.id
      LEFT JOIN animal_production ap ON ua.id = ap.user_animal_id AND ap.collected = 0
        AND ap.id = (SELECT MAX(id) FROM animal_production ap2 WHERE ap2.user_animal_id = ua.id AND ap2.collected = 0)
      WHERE ua.user_id = ?
    `).all(req.userId);

    const now = new Date();
    const productionStatus = animals.map(animal => {
      const config = PRODUCTION_CONFIG[animal.type];
      if (!config) {
        return { animalId: animal.id, canProduce: false };
      }

      let isReady = false;
      let timeRemaining = 0;

      if (animal.production_id) {
        const readyTime = new Date(animal.ready_at);

        if (now >= readyTime) {
          if (upgrades.autoCollect) {
            const collected = collectAndRestart(req.userId, animal.id, animal, { id: animal.production_id, ready_at: animal.ready_at });
            isReady = false;
            timeRemaining = collected ? Math.max(0, Math.floor((new Date(collected.nextReadyAt) - now) / 1000)) : 0;
          } else {
            isReady = true;
            timeRemaining = 0;
          }
        } else {
          timeRemaining = Math.max(0, Math.floor((readyTime - now) / 1000));
        }
      } else {
        // Первое производство - начинаем таймер
        const adjustedTime = calculateProductionTime(animal.type, config.productionTime, animal.happiness, animal.hunger, upgrades);
        const readyAt = new Date(now.getTime() + adjustedTime * 1000);
        
        db.prepare(`
          INSERT INTO animal_production (user_animal_id, resource_type, ready_at, collected)
          VALUES (?, ?, ?, 0)
        `).run(animal.id, config.resourceType, readyAt.toISOString());

        timeRemaining = adjustedTime;
      }

      return {
        animalId: animal.id,
        canProduce: true,
        resourceType: config.resourceType,
        value: config.value,
        isReady,
        timeRemaining
      };
    });

    res.json({ production: productionStatus });
  } catch (error) {
    console.error('Error getting production status:', error);
    res.status(500).json({ error: 'Ошибка получения статуса производства' });
  }
};

export const collectResource = (req, res) => {
  try {
    const { userAnimalId } = req.body;

    const animal = db.prepare(`
      SELECT ua.*, fa.type
      FROM user_animals ua
      JOIN farm_animals fa ON ua.animal_id = fa.id
      WHERE ua.id = ? AND ua.user_id = ?
    `).get(userAnimalId, req.userId);

    if (!animal) {
      return res.status(404).json({ error: 'Животное не найдено' });
    }

    const config = PRODUCTION_CONFIG[animal.type];
    if (!config) {
      return res.status(400).json({ error: 'Это животное не производит ресурсы' });
    }

    const production = db.prepare(`
      SELECT * FROM animal_production
      WHERE user_animal_id = ? AND collected = 0
      ORDER BY ready_at DESC LIMIT 1
    `).get(userAnimalId);

    if (!production) {
      return res.status(400).json({ error: 'Нет готовых ресурсов' });
    }

    const now = new Date();
    const readyTime = new Date(production.ready_at);

    if (now < readyTime) {
      return res.status(400).json({ error: 'Ресурс ещё не готов' });
    }

    const result = collectAndRestart(req.userId, userAnimalId, animal, production);
    if (!result) {
      return res.status(500).json({ error: 'Ошибка сбора ресурса' });
    }

    const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.userId);
    const unlocked = checkAndUnlockFarmAchievements(req.userId);

    res.json({
      success: true,
      resourceType: config.resourceType,
      value: config.value,
      newCoins: user.coins,
      nextReadyAt: result.nextReadyAt,
      unlockedAchievements: unlocked
    });
  } catch (error) {
    console.error('Error collecting resource:', error);
    res.status(500).json({ error: 'Ошибка сбора ресурса' });
  }
};

export const getResources = (req, res) => {
  try {
    const resources = db.prepare(`
      SELECT * FROM user_resources
      WHERE user_id = ?
    `).all(req.userId);

    res.json({ resources });
  } catch (error) {
    console.error('Error getting resources:', error);
    res.status(500).json({ error: 'Ошибка получения ресурсов' });
  }
};
