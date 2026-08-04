import db from '../models/database.js';

export const getShop = (req, res) => {
  const animals = db.prepare('SELECT * FROM farm_animals ORDER BY price').all();
  const items = db.prepare('SELECT * FROM farm_items ORDER BY category, price').all();
  
  res.json({ animals, items });
};

export const getUserFarm = (req, res) => {
  const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.userId);
  
  const animals = db.prepare(`
    SELECT ua.*, fa.name as animal_name, fa.type, fa.price
    FROM user_animals ua
    JOIN farm_animals fa ON ua.animal_id = fa.id
    WHERE ua.user_id = ?
  `).all(req.userId);
  
  const inventory = db.prepare(`
    SELECT ui.*, fi.name as item_name, fi.category, fi.price
    FROM user_inventory ui
    JOIN farm_items fi ON ui.item_id = fi.id
    WHERE ui.user_id = ?
  `).all(req.userId);
  
  const now = new Date();
  const animalsWithStatus = animals.map(animal => {
    const lastFed = new Date(animal.last_fed);
    const lastPetted = new Date(animal.last_petted);
    const hoursSinceFed = (now - lastFed) / (1000 * 60 * 60);
    const hoursSincePetted = (now - lastPetted) / (1000 * 60 * 60);
    
    return {
      ...animal,
      isHungry: hoursSinceFed >= 24,
      needsPetting: hoursSincePetted >= 24,
      hunger: Math.max(0, 100 - Math.floor(hoursSinceFed * 4)),
      happiness: Math.max(0, 100 - Math.floor(hoursSincePetted * 4))
    };
  });
  
  res.json({
    coins: user.coins,
    animals: animalsWithStatus,
    inventory
  });
};

export const buyAnimal = (req, res) => {
  const { animalId, name } = req.body;
  
  const animal = db.prepare('SELECT * FROM farm_animals WHERE id = ?').get(animalId);
  if (!animal) {
    return res.status(404).json({ error: 'Животное не найдено' });
  }
  
  const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.userId);
  if (user.coins < animal.price) {
    return res.status(400).json({ error: 'Недостаточно монет' });
  }
  
  db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(animal.price, req.userId);
  
  const result = db.prepare(`
    INSERT INTO user_animals (user_id, animal_id, name)
    VALUES (?, ?, ?)
  `).run(req.userId, animalId, name || animal.name);
  
  res.json({
    success: true,
    userAnimalId: result.lastInsertRowid,
    newCoins: user.coins - animal.price
  });
};

export const buyItem = (req, res) => {
  const { itemId, quantity = 1 } = req.body;
  
  const item = db.prepare('SELECT * FROM farm_items WHERE id = ?').get(itemId);
  if (!item) {
    return res.status(404).json({ error: 'Предмет не найден' });
  }
  
  const totalCost = item.price * quantity;
  const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.userId);
  
  if (user.coins < totalCost) {
    return res.status(400).json({ error: 'Недостаточно монет' });
  }
  
  db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(totalCost, req.userId);
  
  const existing = db.prepare(`
    SELECT * FROM user_inventory 
    WHERE user_id = ? AND item_id = ? AND equipped_on_animal_id IS NULL
  `).get(req.userId, itemId);
  
  if (existing) {
    db.prepare(`
      UPDATE user_inventory 
      SET quantity = quantity + ?
      WHERE id = ?
    `).run(quantity, existing.id);
  } else {
    db.prepare(`
      INSERT INTO user_inventory (user_id, item_id, quantity)
      VALUES (?, ?, ?)
    `).run(req.userId, itemId, quantity);
  }
  
  res.json({
    success: true,
    newCoins: user.coins - totalCost
  });
};

export const feedAnimal = (req, res) => {
  const { userAnimalId } = req.body;
  
  const animal = db.prepare(`
    SELECT * FROM user_animals WHERE id = ? AND user_id = ?
  `).get(userAnimalId, req.userId);
  
  if (!animal) {
    return res.status(404).json({ error: 'Животное не найдено' });
  }
  
  db.prepare(`
    UPDATE user_animals 
    SET hunger = 100, last_fed = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(userAnimalId);
  
  res.json({ success: true, message: 'Животное накормлено!' });
};

export const petAnimal = (req, res) => {
  const { userAnimalId } = req.body;
  
  const animal = db.prepare(`
    SELECT * FROM user_animals WHERE id = ? AND user_id = ?
  `).get(userAnimalId, req.userId);
  
  if (!animal) {
    return res.status(404).json({ error: 'Животное не найдено' });
  }
  
  db.prepare(`
    UPDATE user_animals 
    SET happiness = 100, last_petted = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(userAnimalId);
  
  res.json({ success: true, message: 'Животное довольно!' });
};

export const equipItem = (req, res) => {
  const { inventoryId, userAnimalId } = req.body;
  
  const inventoryItem = db.prepare(`
    SELECT * FROM user_inventory WHERE id = ? AND user_id = ?
  `).get(inventoryId, req.userId);
  
  if (!inventoryItem) {
    return res.status(404).json({ error: 'Предмет не найден в инвентаре' });
  }
  
  if (userAnimalId) {
    const animal = db.prepare(`
      SELECT * FROM user_animals WHERE id = ? AND user_id = ?
    `).get(userAnimalId, req.userId);
    
    if (!animal) {
      return res.status(404).json({ error: 'Животное не найдено' });
    }
  }
  
  db.prepare(`
    UPDATE user_inventory 
    SET equipped_on_animal_id = ?
    WHERE id = ?
  `).run(userAnimalId || null, inventoryId);
  
  res.json({ success: true });
};
