import db from '../models/database.js';

// Рецепты крафтинга
const RECIPES = {
  omelet: {
    name: 'Омлет',
    ingredients: { egg: 3, milk: 2 },
    value: 50,
    icon: '🍳'
  },
  sweater: {
    name: 'Свитер',
    ingredients: { wool: 5 },
    value: 100,
    icon: '🧥'
  },
  cheese: {
    name: 'Сыр',
    ingredients: { milk: 4 },
    value: 60,
    icon: '🧀'
  },
  cake: {
    name: 'Торт',
    ingredients: { egg: 5, milk: 3 },
    value: 120,
    icon: '🎂'
  },
  blanket: {
    name: 'Одеяло',
    ingredients: { wool: 8 },
    value: 180,
    icon: '🛏️'
  }
};

export const getRecipes = (req, res) => {
  try {
    // Получаем ресурсы пользователя
    const resources = db.prepare(`
      SELECT resource_type, quantity
      FROM user_resources
      WHERE user_id = ?
    `).all(req.userId);
    
    const userResources = {};
    resources.forEach(r => {
      userResources[r.resource_type] = r.quantity;
    });
    
    // Проверяем доступность каждого рецепта
    const recipesWithAvailability = Object.entries(RECIPES).map(([id, recipe]) => {
      let canCraft = true;
      const missing = {};
      
      for (const [ingredient, required] of Object.entries(recipe.ingredients)) {
        const available = userResources[ingredient] || 0;
        if (available < required) {
          canCraft = false;
          missing[ingredient] = required - available;
        }
      }
      
      return {
        id,
        ...recipe,
        canCraft,
        missing: canCraft ? null : missing
      };
    });
    
    res.json({ recipes: recipesWithAvailability, userResources });
  } catch (error) {
    console.error('Error getting recipes:', error);
    res.status(500).json({ error: 'Ошибка получения рецептов' });
  }
};

export const craftItem = (req, res) => {
  try {
    const { recipeId } = req.body;
    
    const recipe = RECIPES[recipeId];
    if (!recipe) {
      return res.status(400).json({ error: 'Неизвестный рецепт' });
    }
    
    // Проверяем наличие ингредиентов
    for (const [ingredient, required] of Object.entries(recipe.ingredients)) {
      const userResource = db.prepare(`
        SELECT quantity FROM user_resources
        WHERE user_id = ? AND resource_type = ?
      `).get(req.userId, ingredient);
      
      if (!userResource || userResource.quantity < required) {
        return res.status(400).json({ error: `Недостаточно ${ingredient}` });
      }
    }
    
    // Списываем ингредиенты
    for (const [ingredient, required] of Object.entries(recipe.ingredients)) {
      db.prepare(`
        UPDATE user_resources
        SET quantity = quantity - ?
        WHERE user_id = ? AND resource_type = ?
      `).run(required, req.userId, ingredient);
    }
    
    // Начисляем монеты
    db.prepare(`
      UPDATE users
      SET coins = coins + ?
      WHERE id = ?
    `).run(recipe.value, req.userId);
    
    const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.userId);
    
    res.json({
      success: true,
      crafted: recipe.name,
      value: recipe.value,
      newCoins: user.coins
    });
  } catch (error) {
    console.error('Error crafting item:', error);
    res.status(500).json({ error: 'Ошибка крафтинга' });
  }
};
