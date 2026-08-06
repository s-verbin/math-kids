import db from '../models/database.js';
import { updateDailyQuestProgress, incrementFarmStat, checkAndUnlockFarmAchievements } from '../utils/farmProgress.js';

// Базовые цены ресурсов
const BASE_PRICES = {
  egg: 5,
  milk: 15,
  wool: 25
};

// Deterministic pseudo-random in [0, 1)
const hashSeed = (input) => {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000000) / 1000000;
};

// Генерация дневных цен с колебаниями
const getDailyPrices = () => {
  const today = new Date().toISOString().split('T')[0];

  const getPrice = (resource) => {
    const r = hashSeed(`${today}-${resource}`);
    // r in [0, 1) -> multiplier in [0.8, 1.2]
    const multiplier = 0.8 + r * 0.4;
    return Math.round(BASE_PRICES[resource] * multiplier);
  };

  return {
    egg: getPrice('egg'),
    milk: getPrice('milk'),
    wool: getPrice('wool'),
    date: today
  };
};

export const getMarketPrices = (req, res) => {
  try {
    const prices = getDailyPrices();
    const changes = {
      egg: Math.round(((prices.egg - BASE_PRICES.egg) / BASE_PRICES.egg) * 100),
      milk: Math.round(((prices.milk - BASE_PRICES.milk) / BASE_PRICES.milk) * 100),
      wool: Math.round(((prices.wool - BASE_PRICES.wool) / BASE_PRICES.wool) * 100)
    };
    
    res.json({ prices, basePrices: BASE_PRICES, changes });
  } catch (error) {
    console.error('Error getting market prices:', error);
    res.status(500).json({ error: 'Ошибка получения цен' });
  }
};

export const sellResource = (req, res) => {
  try {
    const { resourceType, quantity } = req.body;
    
    if (!resourceType || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Неверные параметры' });
    }
    
    // Проверяем наличие ресурса
    const userResource = db.prepare(`
      SELECT * FROM user_resources
      WHERE user_id = ? AND resource_type = ?
    `).get(req.userId, resourceType);
    
    if (!userResource || userResource.quantity < quantity) {
      return res.status(400).json({ error: 'Недостаточно ресурсов' });
    }
    
    // Получаем текущую цену
    const prices = getDailyPrices();
    const price = prices[resourceType];
    
    if (!price) {
      return res.status(400).json({ error: 'Неизвестный ресурс' });
    }
    
    const totalValue = price * quantity;
    
    // Уменьшаем количество ресурсов
    db.prepare(`
      UPDATE user_resources
      SET quantity = quantity - ?
      WHERE user_id = ? AND resource_type = ?
    `).run(quantity, req.userId, resourceType);
    
    // Начисляем монеты
    db.prepare(`
      UPDATE users
      SET coins = coins + ?
      WHERE id = ?
    `).run(totalValue, req.userId);

    // Прогресс в фермерской статистике, квестах и достижениях
    incrementFarmStat(req.userId, 'resources_sold_value', totalValue);
    incrementFarmStat(req.userId, 'farm_coins_earned', totalValue);
    updateDailyQuestProgress(req.userId, 'sell_resources', totalValue);

    const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.userId);
    const unlocked = checkAndUnlockFarmAchievements(req.userId);

    res.json({
      success: true,
      sold: quantity,
      resourceType,
      pricePerUnit: price,
      totalEarned: totalValue,
      newCoins: user.coins,
      unlockedAchievements: unlocked
    });
  } catch (error) {
    console.error('Error selling resource:', error);
    res.status(500).json({ error: 'Ошибка продажи ресурса' });
  }
};
