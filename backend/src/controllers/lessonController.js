import db from '../models/database.js';

const pluralize = (number, forms) => {
  // forms = [one, few, many]
  const n = Math.abs(number) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
};

const generateProblem = (topic) => {
  const { operations, min_value, max_value, category } = topic;

  if (operations === 'add') {
    const a = Math.floor(Math.random() * max_value) + 1;
    const b = Math.floor(Math.random() * (max_value - a)) + 1;
    return {
      question: `${a} + ${b}`,
      answer: a + b
    };
  }

  if (operations === 'subtract') {
    const a = Math.floor(Math.random() * max_value) + 1;
    const b = Math.floor(Math.random() * a);
    return {
      question: `${a} - ${b}`,
      answer: a - b
    };
  }

  if (operations === 'add_unknown') {
    const a = Math.floor(Math.random() * max_value) + 1;
    const b = Math.floor(Math.random() * max_value) + 1;
    const sum = a + b;
    const position = Math.random() > 0.5 ? 'first' : 'second';
    
    if (position === 'first') {
      return {
        question: `? + ${b} = ${sum}`,
        answer: a
      };
    } else {
      return {
        question: `${a} + ? = ${sum}`,
        answer: b
      };
    }
  }

  if (operations === 'subtract_unknown') {
    const a = Math.floor(Math.random() * max_value) + 1;
    const b = Math.floor(Math.random() * a);
    const result = a - b;
    const position = Math.random() > 0.5 ? 'first' : 'second';
    
    if (position === 'first') {
      return {
        question: `? - ${b} = ${result}`,
        answer: a
      };
    } else {
      return {
        question: `${a} - ? = ${result}`,
        answer: b
      };
    }
  }

  if (operations === 'multiply') {
    const a = Math.floor(Math.random() * (max_value - min_value + 1)) + min_value;
    const b = Math.floor(Math.random() * 9) + 2;
    return {
      question: `${a} × ${b}`,
      answer: a * b
    };
  }

  if (operations === 'divide') {
    const divisor = Math.floor(Math.random() * (max_value - min_value + 1)) + min_value;
    const quotient = Math.floor(Math.random() * 10) + 1;
    const dividend = divisor * quotient;
    return {
      question: `${dividend} ÷ ${divisor}`,
      answer: quotient
    };
  }

  if (operations === 'mixed') {
    const ops = ['add', 'subtract', 'multiply'];
    const randomOp = ops[Math.floor(Math.random() * ops.length)];
    
    if (randomOp === 'add') {
      const a = Math.floor(Math.random() * max_value) + 1;
      const b = Math.floor(Math.random() * max_value) + 1;
      return { question: `${a} + ${b}`, answer: a + b };
    } else if (randomOp === 'subtract') {
      const a = Math.floor(Math.random() * max_value) + 1;
      const b = Math.floor(Math.random() * a);
      return { question: `${a} - ${b}`, answer: a - b };
    } else {
      const a = Math.floor(Math.random() * 10) + 2;
      const b = Math.floor(Math.random() * 10) + 2;
      return { question: `${a} × ${b}`, answer: a * b };
    }
  }

  if (operations === 'add_three') {
    const a = Math.floor(Math.random() * max_value) + 1;
    const b = Math.floor(Math.random() * max_value) + 1;
    const c = Math.floor(Math.random() * max_value) + 1;
    return {
      question: `${a} + ${b} + ${c}`,
      answer: a + b + c
    };
  }

  if (operations === 'subtract_three') {
    const total = Math.floor(Math.random() * max_value) + 10;
    const a = Math.floor(Math.random() * (total / 2));
    const b = Math.floor(Math.random() * (total - a));
    return {
      question: `${total} - ${a} - ${b}`,
      answer: total - a - b
    };
  }

  if (operations === 'four_numbers') {
    const ops = ['+', '-'];
    const a = Math.floor(Math.random() * max_value) + 1;
    const b = Math.floor(Math.random() * max_value) + 1;
    const c = Math.floor(Math.random() * max_value) + 1;
    const d = Math.floor(Math.random() * max_value) + 1;
    const op1 = ops[Math.floor(Math.random() * ops.length)];
    const op2 = ops[Math.floor(Math.random() * ops.length)];
    const op3 = ops[Math.floor(Math.random() * ops.length)];
    
    let result = a;
    result = op1 === '+' ? result + b : result - b;
    result = op2 === '+' ? result + c : result - c;
    result = op3 === '+' ? result + d : result - d;
    
    if (result < 0) return generateProblem(topic);
    
    return {
      question: `${a} ${op1} ${b} ${op2} ${c} ${op3} ${d}`,
      answer: result
    };
  }

  if (operations === 'complex_unknown') {
    const type = Math.floor(Math.random() * 3);
    
    if (type === 0) {
      const a = Math.floor(Math.random() * max_value) + 1;
      const b = Math.floor(Math.random() * max_value) + 1;
      const c = Math.floor(Math.random() * max_value) + 1;
      const sum = a + b + c;
      return {
        question: `? + ${b} + ${c} = ${sum}`,
        answer: a
      };
    } else if (type === 1) {
      const a = Math.floor(Math.random() * max_value) + 10;
      const b = Math.floor(Math.random() * a);
      const c = Math.floor(Math.random() * (a - b));
      const result = a - b - c;
      return {
        question: `${a} - ? - ${c} = ${result}`,
        answer: b
      };
    } else {
      const a = Math.floor(Math.random() * max_value) + 1;
      const b = Math.floor(Math.random() * max_value) + 1;
      const c = Math.floor(Math.random() * max_value) + 1;
      const result = a + b - c;
      if (result < 0) return generateProblem(topic);
      return {
        question: `${a} + ${b} - ? = ${result}`,
        answer: c
      };
    }
  }

  if (operations === 'vowels') {
    const words = [
      { word: 'в_да', answer: 'о', options: ['о', 'а', 'е'] },
      { word: 'тр_ва', answer: 'а', options: ['а', 'о', 'е'] },
      { word: 'з_ма', answer: 'и', options: ['и', 'е', 'я'] },
      { word: 'л_са', answer: 'и', options: ['и', 'е', 'я'] },
      { word: 'р_ка', answer: 'е', options: ['е', 'и', 'я'] },
      { word: 'гр_за', answer: 'о', options: ['о', 'а', 'е'] },
      { word: 'с_ды', answer: 'а', options: ['а', 'о', 'е'] },
      { word: 'цв_ты', answer: 'е', options: ['е', 'и', 'я'] },
      { word: 'зв_зда', answer: 'е', options: ['е', 'и', 'я'] },
      { word: 'м_ря', answer: 'о', options: ['о', 'а', 'е'] }
    ];
    const word = words[Math.floor(Math.random() * words.length)];
    return {
      question: word.word,
      answer: word.answer,
      options: word.options,
      type: 'russian'
    };
  }

  if (operations === 'consonants') {
    const words = [
      { word: 'ду_', answer: 'б', options: ['б', 'п', 'т'] },
      { word: 'са_', answer: 'д', options: ['д', 'т', 'к'] },
      { word: 'сне_', answer: 'г', options: ['г', 'к', 'х'] },
      { word: 'моро_', answer: 'з', options: ['з', 'с', 'ц'] },
      { word: 'гла_', answer: 'з', options: ['з', 'с', 'ц'] },
      { word: 'зу_', answer: 'б', options: ['б', 'п', 'ф'] },
      { word: 'хле_', answer: 'б', options: ['б', 'п', 'ф'] },
      { word: 'медве_ь', answer: 'д', options: ['д', 'т', 'дь'] },
      { word: 'тетра_ь', answer: 'д', options: ['д', 'т', 'дь'] },
      { word: 'лоша_ь', answer: 'д', options: ['д', 'т', 'дь'] }
    ];
    const word = words[Math.floor(Math.random() * words.length)];
    return {
      question: word.word,
      answer: word.answer,
      options: word.options,
      type: 'russian'
    };
  }

  if (operations === 'silent_consonants') {
    const words = [
      { word: 'со_нце', answer: 'л', options: ['л', '-', 'н'] },
      { word: 'сер_це', answer: 'д', options: ['д', '-', 'т'] },
      { word: 'праз_ник', answer: 'д', options: ['д', '-', 'т'] },
      { word: 'лес_ница', answer: 'т', options: ['т', '-', 'д'] },
      { word: 'чу_ство', answer: 'в', options: ['в', '-', 'ф'] },
      { word: 'здра_ствуй', answer: 'в', options: ['в', '-', 'ф'] },
      { word: 'мес_ность', answer: 'т', options: ['т', '-', 'д'] },
      { word: 'радос_ный', answer: 'т', options: ['т', '-', 'д'] },
      { word: 'звёз_ный', answer: 'д', options: ['д', '-', 'т'] },
      { word: 'поз_ний', answer: 'д', options: ['д', '-', 'т'] }
    ];
    const word = words[Math.floor(Math.random() * words.length)];
    return {
      question: word.word,
      answer: word.answer,
      options: word.options,
      type: 'russian'
    };
  }

  if (operations === 'dictionary_words') {
    const words = [
      { word: 'с_лнце', answer: 'о', options: ['о', 'а', 'и'] },
      { word: 'д_ждь', answer: 'о', options: ['о', 'а', 'и'] },
      { word: 'к_рова', answer: 'о', options: ['о', 'а', 'и'] },
      { word: 'г_риб', answer: 'р', options: ['р', 'л', 'н'] },
      { word: 'з_мля', answer: 'е', options: ['е', 'и', 'я'] },
      { word: 'м_ре', answer: 'о', options: ['о', 'а', 'е'] },
      { word: 'ц_веток', answer: 'в', options: ['в', 'ф', 'п'] },
      { word: 'п_года', answer: 'о', options: ['о', 'а', 'и'] },
      { word: 'в_дро', answer: 'е', options: ['е', 'и', 'я'] },
      { word: 'м_шина', answer: 'а', options: ['а', 'о', 'и'] },
      { word: 'д_рево', answer: 'е', options: ['е', 'и', 'я'] },
      { word: 'т_традь', answer: 'е', options: ['е', 'и', 'я'] },
      { word: 'б_реза', answer: 'е', options: ['е', 'и', 'я'] },
      { word: 'х_лод', answer: 'о', options: ['о', 'а', 'и'] },
      { word: 'в_сна', answer: 'е', options: ['е', 'и', 'я'] },
      { word: 'о_ень', answer: 'с', options: ['с', 'з', 'в'] },
      { word: 'н_чь', answer: 'о', options: ['о', 'а', 'и'] },
      { word: 'д_нь', answer: 'е', options: ['е', 'и', 'я'] },
      { word: 'с_г', answer: 'н', options: ['н', 'м', 'л'] },
      { word: 'д_рога', answer: 'о', options: ['о', 'а', 'и'] },
      { word: 'к_мень', answer: 'а', options: ['а', 'о', 'и'] },
      { word: 'п_мидор', answer: 'о', options: ['о', 'а', 'и'] },
      { word: 'м_рковь', answer: 'о', options: ['о', 'а', 'и'] },
      { word: 'к_пуста', answer: 'а', options: ['а', 'о', 'и'] },
      { word: 'б_нан', answer: 'а', options: ['а', 'о', 'и'] },
      { word: 'м_лина', answer: 'а', options: ['а', 'о', 'и'] },
      { word: 'в_шня', answer: 'и', options: ['и', 'е', 'ы'] },
      { word: 'в_локно', answer: 'о', options: ['о', 'а', 'и'] },
      { word: 'с_бака', answer: 'о', options: ['о', 'а', 'и'] },
      { word: 'к_нфета', answer: 'о', options: ['о', 'а', 'и'] },
      { word: 'б_льница', answer: 'о', options: ['о', 'а', 'и'] },
      { word: 'с_молёт', answer: 'а', options: ['а', 'о', 'и'] },
      { word: 'т_левизор', answer: 'е', options: ['е', 'и', 'я'] },
      { word: 'х_олодильник', answer: 'о', options: ['о', 'а', 'и'] },
      { word: 'ц_ирк', answer: 'и', options: ['и', 'е', 'ы'] },
      { word: 'ш_колад', answer: 'о', options: ['о', 'а', 'и'] },
      { word: 'т_кси', answer: 'а', options: ['а', 'о', 'и'] },
      { word: 'б_терброд', answer: 'у', options: ['у', 'о', 'а'] },
      { word: 'к_рандаш', answer: 'а', options: ['а', 'о', 'и'] },
      { word: 'ч_снок', answer: 'е', options: ['е', 'и', 'я'] }
    ];
    const word = words[Math.floor(Math.random() * words.length)];
    return {
      question: word.word,
      answer: word.answer,
      options: word.options,
      type: 'russian'
    };
  }

  if (operations === 'fruits_add') {
    const fruits = [
      { emoji: '🍎', forms: ['яблоко', 'яблока', 'яблок'] },
      { emoji: '🍐', forms: ['груша', 'груши', 'груш'] },
      { emoji: '🍊', forms: ['апельсин', 'апельсина', 'апельсинов'] },
      { emoji: '🍇', forms: ['виноградина', 'виноградины', 'виноградин'] },
      { emoji: '🍌', forms: ['банан', 'банана', 'бананов'] }
    ];
    const fruit1 = fruits[Math.floor(Math.random() * fruits.length)];
    const fruit2 = fruits[Math.floor(Math.random() * fruits.length)];
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    return {
      question: `На столе ${a} ${fruit1.emoji} ${pluralize(a, fruit1.forms)} и ${b} ${fruit2.emoji} ${pluralize(b, fruit2.forms)}. Сколько всего фруктов?`,
      answer: a + b
    };
  }

  if (operations === 'farm_legs') {
    const animals = [
      { forms: ['курица', 'курицы', 'куриц'], emoji: '🐔', legs: 2 },
      { forms: ['корова', 'коровы', 'коров'], emoji: '🐄', legs: 4 },
      { forms: ['свинья', 'свиньи', 'свиней'], emoji: '🐷', legs: 4 },
      { forms: ['собака', 'собаки', 'собак'], emoji: '🐕', legs: 4 },
      { forms: ['утка', 'утки', 'уток'], emoji: '🦆', legs: 2 }
    ];
    const animal1 = animals[Math.floor(Math.random() * animals.length)];
    const animal2 = animals[Math.floor(Math.random() * animals.length)];
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 4) + 1;
    return {
      question: `В загоне ${a} ${animal1.emoji} ${pluralize(a, animal1.forms)} и ${b} ${animal2.emoji} ${pluralize(b, animal2.forms)}. Сколько всего лап?`,
      answer: a * animal1.legs + b * animal2.legs
    };
  }

  if (operations === 'compare_more') {
    const items = [
      { forms: ['конфета', 'конфеты', 'конфет'] },
      { forms: ['машинка', 'машинки', 'машинок'] },
      { forms: ['игрушка', 'игрушки', 'игрушек'] },
      { forms: ['карандаш', 'карандаша', 'карандашей'] },
      { forms: ['мяч', 'мяча', 'мячей'] }
    ];
    const item = items[Math.floor(Math.random() * items.length)];
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const [more, less] = a > b ? [a, b] : [b, a];
    return {
      question: `У Маши ${more} ${pluralize(more, item.forms)}, у Коли ${less} ${pluralize(less, item.forms)}. На сколько больше у Маши?`,
      answer: more - less
    };
  }

  if (operations === 'share_equal') {
    const items = [
      { forms: ['печенье', 'печенья', 'печений'] },
      { forms: ['конфета', 'конфеты', 'конфет'] },
      { forms: ['яблоко', 'яблока', 'яблок'] },
      { forms: ['игрушка', 'игрушки', 'игрушек'] },
      { forms: ['мяч', 'мяча', 'мячей'] }
    ];
    const friends = Math.floor(Math.random() * 4) + 2;
    const portion = Math.floor(Math.random() * 5) + 1;
    const total = friends * portion;
    const item = items[Math.floor(Math.random() * items.length)];
    return {
      question: `${total} ${pluralize(total, item.forms)} разделили поровну между ${friends} друзьями. Сколько досталось каждому?`,
      answer: portion
    };
  }

  if (operations === 'coin_change') {
    const price = Math.floor(Math.random() * 20) + 1;
    const money = Math.floor(Math.random() * 20) + price + 1;
    const change = money - price;
    return {
      question: `Мороженое стоит ${price}₽. У тебя ${money}₽. Сколько сдачи?`,
      answer: change
    };
  }

  if (operations === 'number_missing') {
    const start = Math.floor(Math.random() * 10) + 1;
    const step = Math.floor(Math.random() * 2) + 1;
    const missingIndex = Math.floor(Math.random() * 4) + 1;
    const sequence = [];
    for (let i = 0; i < 5; i++) {
      sequence.push(start + i * step);
    }
    const answer = sequence[missingIndex];
    sequence[missingIndex] = '?';
    return {
      question: `Найди пропущенное число: ${sequence.join(', ')}`,
      answer: answer
    };
  }

  return { question: '1 + 1', answer: 2 };
};

export const startLesson = (req, res) => {
  const { topicId } = req.body;

  const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(topicId);

  if (!topic) {
    return res.status(404).json({ error: 'Тема не найдена' });
  }

  const problems = [];
  for (let i = 0; i < 10; i++) {
    const problem = generateProblem(topic);
    problems.push({
      id: i + 1,
      question: problem.question,
      answer: problem.answer,
      type: problem.type,
      options: problem.options
    });
  }

  res.json({
    topicId: topic.id,
    topicName: topic.name,
    problems: problems.map(p => ({ id: p.id, question: p.question, type: p.type, options: p.options })),
    answers: problems.map(p => ({ id: p.id, answer: p.answer }))
  });
};

export const submitLesson = (req, res) => {
  const { topicId, answers, timeSpent } = req.body;

  if (!topicId || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Неверные данные' });
  }

  const correctCount = answers.filter(a => a.isCorrect).length;
  const totalQuestions = answers.length;

  const result = db.prepare(`
    INSERT INTO lessons (user_id, topic_id, score, total_questions, time_spent)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.userId, topicId, correctCount, totalQuestions, timeSpent || null);

  const xpGained = correctCount * 5;
  const coinsGained = correctCount * 10;
  const user = db.prepare('SELECT xp, level, coins, total_problems_solved FROM users WHERE id = ?').get(req.userId);
  const newXp = user.xp + xpGained;
  const chestCoins = correctCount > 0 ? Math.floor(Math.random() * 15) + 1 : 0;
  const newCoins = user.coins + coinsGained + chestCoins;
  const newLevel = Math.floor(newXp / 100) + 1;
  const newTotalProblems = user.total_problems_solved + totalQuestions;

  db.prepare(`
    UPDATE users 
    SET xp = ?, level = ?, coins = ?, total_problems_solved = ?
    WHERE id = ?
  `).run(newXp, newLevel, newCoins, newTotalProblems, req.userId);

  const today = new Date().toISOString().split('T')[0];
  db.prepare(`
    INSERT INTO daily_stats (user_id, date, problems_solved, correct_answers)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET
      problems_solved = problems_solved + ?,
      correct_answers = correct_answers + ?
  `).run(req.userId, today, totalQuestions, correctCount, totalQuestions, correctCount);

  checkAndUnlockAchievements(req.userId, {
    lessonsCompleted: 1,
    perfectScore: correctCount === totalQuestions,
    timeSpent: timeSpent,
    topicId: topicId
  });

  const leveledUp = newLevel > user.level;

  res.json({
    lessonId: result.lastInsertRowid,
    score: correctCount,
    total: totalQuestions,
    xpGained,
    coinsGained,
    chest: {
      coins: chestCoins,
      message: 'Случайный сундук с монетами!'
    },
    newXp,
    newCoins,
    newLevel,
    leveledUp,
    accuracy: (correctCount / totalQuestions * 100).toFixed(1)
  });
};

const checkAndUnlockAchievements = (userId, data) => {
  const user = db.prepare('SELECT total_problems_solved FROM users WHERE id = ?').get(userId);
  const totalLessons = db.prepare('SELECT COUNT(*) as count FROM lessons WHERE user_id = ?').get(userId).count;

  const achievements = db.prepare('SELECT * FROM achievements').all();

  achievements.forEach(achievement => {
    const alreadyUnlocked = db.prepare(`
      SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?
    `).get(userId, achievement.id);

    if (alreadyUnlocked) return;

    let shouldUnlock = false;

    if (achievement.condition_type === 'lessons_completed' && totalLessons >= achievement.condition_value) {
      shouldUnlock = true;
    }

    if (achievement.condition_type === 'perfect_score' && data.perfectScore) {
      shouldUnlock = true;
    }

    if (achievement.condition_type === 'fast_lesson' && data.timeSpent && data.timeSpent <= achievement.condition_value) {
      shouldUnlock = true;
    }

    if (achievement.condition_type === 'problems_solved' && user.total_problems_solved >= achievement.condition_value) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      db.prepare(`
        INSERT INTO user_achievements (user_id, achievement_id)
        VALUES (?, ?)
      `).run(userId, achievement.id);
    }
  });
};

export const getLeaderboard = (req, res) => {
  const leaderboard = db.prepare(`
    SELECT 
      id,
      display_name,
      avatar,
      level,
      xp,
      total_problems_solved
    FROM users
    WHERE show_in_leaderboard = 1
    ORDER BY xp DESC
    LIMIT 10
  `).all();

  res.json(leaderboard);
};

export const getAchievements = (req, res) => {
  const allAchievements = db.prepare('SELECT * FROM achievements').all();

  const unlockedIds = db.prepare(`
    SELECT achievement_id, unlocked_at
    FROM user_achievements
    WHERE user_id = ?
  `).all(req.userId);

  const unlockedMap = {};
  unlockedIds.forEach(ua => {
    unlockedMap[ua.achievement_id] = ua.unlocked_at;
  });

  const achievementsWithStatus = allAchievements.map(ach => ({
    ...ach,
    unlocked: !!unlockedMap[ach.id],
    unlockedAt: unlockedMap[ach.id] || null
  }));

  res.json(achievementsWithStatus);
};
