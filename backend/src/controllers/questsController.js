import db from '../models/database.js';

// Типы заданий
const QUEST_TYPES = [
  { type: 'collect_eggs', description: 'Собери {value} яиц', icon: '🥚', reward: 50 },
  { type: 'collect_milk', description: 'Собери {value} вёдер молока', icon: '🥛', reward: 100 },
  { type: 'collect_wool', description: 'Собери {value} клубков шерсти', icon: '🧶', reward: 150 },
  { type: 'feed_animals', description: 'Покорми {value} животных', icon: '🍎', reward: 30 },
  { type: 'pet_animals', description: 'Погладь {value} животных', icon: '❤️', reward: 20 },
  { type: 'craft_items', description: 'Скрафть {value} предметов', icon: '🔨', reward: 80 },
  { type: 'sell_resources', description: 'Продай ресурсов на {value} монет', icon: '💰', reward: 60 }
];

// Генерация ежедневных заданий
const generateDailyQuests = (userId) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Проверяем, есть ли уже задания на сегодня
  const existing = db.prepare(`
    SELECT COUNT(*) as count FROM daily_quests
    WHERE user_id = ? AND date = ?
  `).get(userId, today);
  
  if (existing.count > 0) {
    return; // Задания уже созданы
  }
  
  // Выбираем 3 случайных типа заданий
  const shuffled = [...QUEST_TYPES].sort(() => Math.random() - 0.5);
  const selectedQuests = shuffled.slice(0, 3);
  
  selectedQuests.forEach(quest => {
    let targetValue;
    switch (quest.type) {
      case 'collect_eggs':
        targetValue = 5;
        break;
      case 'collect_milk':
        targetValue = 3;
        break;
      case 'collect_wool':
        targetValue = 1;
        break;
      case 'feed_animals':
        targetValue = 5;
        break;
      case 'pet_animals':
        targetValue = 5;
        break;
      case 'craft_items':
        targetValue = 2;
        break;
      case 'sell_resources':
        targetValue = 100;
        break;
      default:
        targetValue = 1;
    }
    
    db.prepare(`
      INSERT INTO daily_quests (user_id, quest_type, target_value, reward_coins, date)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, quest.type, targetValue, quest.reward, today);
  });
};

export const getDailyQuests = (req, res) => {
  try {
    generateDailyQuests(req.userId);
    
    const today = new Date().toISOString().split('T')[0];
    const quests = db.prepare(`
      SELECT * FROM daily_quests
      WHERE user_id = ? AND date = ?
    `).all(req.userId, today);
    
    // Добавляем описания и иконки
    const questsWithDetails = quests.map(quest => {
      const questType = QUEST_TYPES.find(q => q.type === quest.quest_type);
      return {
        ...quest,
        description: questType?.description.replace('{value}', quest.target_value) || quest.quest_type,
        icon: questType?.icon || '📋',
        progress: Math.min(100, Math.round((quest.current_value / quest.target_value) * 100))
      };
    });
    
    res.json({ quests: questsWithDetails });
  } catch (error) {
    console.error('Error getting daily quests:', error);
    res.status(500).json({ error: 'Ошибка получения заданий' });
  }
};

export const updateQuestProgress = (req, res) => {
  try {
    const { questType, increment = 1 } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    const quest = db.prepare(`
      SELECT * FROM daily_quests
      WHERE user_id = ? AND quest_type = ? AND date = ? AND completed = 0
    `).get(req.userId, questType, today);
    
    if (!quest) {
      return res.json({ success: false, message: 'Quest not found or already completed' });
    }
    
    const newValue = quest.current_value + increment;
    const isCompleted = newValue >= quest.target_value;
    
    db.prepare(`
      UPDATE daily_quests
      SET current_value = ?, completed = ?
      WHERE id = ?
    `).run(newValue, isCompleted ? 1 : 0, quest.id);
    
    if (isCompleted) {
      // Начисляем награду
      db.prepare(`
        UPDATE users
        SET coins = coins + ?
        WHERE id = ?
      `).run(quest.reward_coins, req.userId);
      
      return res.json({
        success: true,
        completed: true,
        reward: quest.reward_coins,
        message: `Задание выполнено! +${quest.reward_coins} 💰`
      });
    }
    
    res.json({ success: true, completed: false, progress: newValue });
  } catch (error) {
    console.error('Error updating quest progress:', error);
    res.status(500).json({ error: 'Ошибка обновления прогресса' });
  }
};

export const claimQuestReward = (req, res) => {
  try {
    const { questId } = req.body;
    
    const quest = db.prepare(`
      SELECT * FROM daily_quests
      WHERE id = ? AND user_id = ? AND completed = 1
    `).get(questId, req.userId);
    
    if (!quest) {
      return res.status(400).json({ error: 'Задание не найдено или не выполнено' });
    }
    
    // Начисляем награду
    db.prepare(`
      UPDATE users
      SET coins = coins + ?
      WHERE id = ?
    `).run(quest.reward_coins, req.userId);
    
    const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.userId);
    
    res.json({
      success: true,
      reward: quest.reward_coins,
      newCoins: user.coins
    });
  } catch (error) {
    console.error('Error claiming quest reward:', error);
    res.status(500).json({ error: 'Ошибка получения награды' });
  }
};
