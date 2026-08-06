import db from '../models/database.js';

const QUEST_TYPES = [
  'collect_eggs', 'collect_milk', 'collect_wool',
  'feed_animals', 'pet_animals', 'craft_items', 'sell_resources'
];

const STAT_COLUMNS = {
  eggs_collected: 'eggs_collected',
  milk_collected: 'milk_collected',
  wool_collected: 'wool_collected',
  total_resources_collected: 'total_resources_collected',
  items_crafted: 'items_crafted',
  resources_sold_value: 'resources_sold_value',
  farm_coins_earned: 'farm_coins_earned'
};

const ensureFarmStats = (userId) => {
  const existing = db.prepare('SELECT user_id FROM user_farm_stats WHERE user_id = ?').get(userId);
  if (!existing) {
    db.prepare(`
      INSERT INTO user_farm_stats (user_id) VALUES (?)
    `).run(userId);
  }
};

export const incrementFarmStat = (userId, stat, value = 1) => {
  ensureFarmStats(userId);
  const column = STAT_COLUMNS[stat];
  if (!column) return;

  db.prepare(`
    UPDATE user_farm_stats
    SET ${column} = ${column} + ?
    WHERE user_id = ?
  `).run(value, userId);
};

export const updateDailyQuestProgress = (userId, questType, increment = 1) => {
  if (!QUEST_TYPES.includes(questType)) return;

  const today = new Date().toISOString().split('T')[0];
  const quest = db.prepare(`
    SELECT * FROM daily_quests
    WHERE user_id = ? AND quest_type = ? AND date = ? AND completed = 0
  `).get(userId, questType, today);

  if (!quest) return;

  const newValue = Math.min(quest.current_value + increment, quest.target_value);
  const completed = newValue >= quest.target_value ? 1 : 0;

  db.prepare(`
    UPDATE daily_quests
    SET current_value = ?, completed = ?
    WHERE id = ?
  `).run(newValue, completed, quest.id);

  if (completed) {
    db.prepare(`
      UPDATE users
      SET coins = coins + ?
      WHERE id = ?
    `).run(quest.reward_coins, userId);
  }

  return { completed, reward: completed ? quest.reward_coins : 0 };
};

const conditionTypeToStat = {
  eggs_collected: 'eggs_collected',
  milk_collected: 'milk_collected',
  wool_collected: 'wool_collected',
  resource_collected: 'total_resources_collected',
  items_crafted: 'items_crafted',
  resources_sold_value: 'resources_sold_value',
  farm_coins_earned: 'farm_coins_earned'
};

const achievementNameToStat = {
  'Птицевод': 'eggs_collected',
  'Молочник': 'milk_collected',
  'Ткач': 'wool_collected'
};

export const checkAndUnlockFarmAchievements = (userId) => {
  const unlocked = [];
  const achievements = db.prepare(`
    SELECT * FROM achievements
    WHERE condition_type LIKE '%_collected'
       OR condition_type = 'animals_purchased'
       OR condition_type = 'items_crafted'
       OR condition_type = 'resources_sold_value'
       OR condition_type = 'farm_coins_earned'
  `).all();

  const stats = db.prepare('SELECT * FROM user_farm_stats WHERE user_id = ?').get(userId);
  const userFarmStats = stats || {};

  achievements.forEach(achievement => {
    const alreadyUnlocked = db.prepare(`
      SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?
    `).get(userId, achievement.id);

    if (alreadyUnlocked) return;

    let shouldUnlock = false;

    if (conditionTypeToStat[achievement.condition_type]) {
      const column = conditionTypeToStat[achievement.condition_type];
      shouldUnlock = (userFarmStats[column] || 0) >= achievement.condition_value;
    } else if (achievementNameToStat[achievement.name]) {
      const column = achievementNameToStat[achievement.name];
      shouldUnlock = (userFarmStats[column] || 0) >= achievement.condition_value;
    } else if (achievement.condition_type === 'animals_purchased') {
      const count = db.prepare(`
        SELECT COUNT(*) as count FROM user_animals WHERE user_id = ?
      `).get(userId).count;
      shouldUnlock = count >= achievement.condition_value;
    }

    if (shouldUnlock) {
      db.prepare(`
        INSERT INTO user_achievements (user_id, achievement_id)
        VALUES (?, ?)
      `).run(userId, achievement.id);
      unlocked.push(achievement);
    }
  });

  return unlocked;
};
