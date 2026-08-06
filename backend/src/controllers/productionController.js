import db from '../models/database.js';

// Конфигурация производства
const PRODUCTION_CONFIG = {
  chicken: { resourceType: 'egg', productionTime: 7200, value: 5 },
  duck: { resourceType: 'egg', productionTime: 10800, value: 7 },
  cow: { resourceType: 'milk', productionTime: 14400, value: 15 },
  goat: { resourceType: 'milk', productionTime: 10800, value: 10 },
  sheep: { resourceType: 'wool', productionTime: 86400, value: 25 }
};

export const getProductionStatus = (req, res) => {
  try {
    const animals = db.prepare(`
      SELECT ua.id, ua.user_id, fa.type, ua.happiness, ua.hunger,
             ap.resource_type, ap.ready_at, ap.collected
      FROM user_animals ua
      JOIN farm_animals fa ON ua.animal_id = fa.id
      LEFT JOIN animal_production ap ON ua.id = ap.user_animal_id
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

      if (animal.ready_at) {
        const readyTime = new Date(animal.ready_at);
        isReady = now >= readyTime && !animal.collected;
        timeRemaining = Math.max(0, Math.floor((readyTime - now) / 1000));
      } else {
        // Первое производство - начинаем таймер
        const happinessBonus = animal.happiness >= 80 ? 0.2 : 0;
        const hungerBonus = animal.hunger >= 80 ? 0.1 : 0;
        const totalBonus = 1 + happinessBonus + hungerBonus;
        const adjustedTime = config.productionTime / totalBonus;
        
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

    // Проверяем, что животное принадлежит пользователю
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

    // Проверяем готовность ресурса
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

    // Собираем ресурс
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
    `).run(config.value, req.userId);

    // Обновляем статистику ресурсов
    const existingResource = db.prepare(`
      SELECT * FROM user_resources
      WHERE user_id = ? AND resource_type = ?
    `).get(req.userId, config.resourceType);

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
      `).run(req.userId, config.resourceType, new Date().toISOString());
    }

    // Запускаем новый цикл производства
    const happinessBonus = animal.happiness >= 80 ? 0.2 : 0;
    const hungerBonus = animal.hunger >= 80 ? 0.1 : 0;
    const totalBonus = 1 + happinessBonus + hungerBonus;
    const adjustedTime = config.productionTime / totalBonus;
    const nextReadyAt = new Date(now.getTime() + adjustedTime * 1000);

    db.prepare(`
      INSERT INTO animal_production (user_animal_id, resource_type, ready_at, collected)
      VALUES (?, ?, ?, 0)
    `).run(userAnimalId, config.resourceType, nextReadyAt.toISOString());

    // Получаем обновлённые данные пользователя
    const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.userId);

    res.json({
      success: true,
      resourceType: config.resourceType,
      value: config.value,
      newCoins: user.coins,
      nextReadyAt: nextReadyAt.toISOString()
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
