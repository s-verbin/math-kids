import db from '../models/database.js';

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

  const xpGained = correctCount * 10;
  const coinsGained = correctCount * 10;
  const user = db.prepare('SELECT xp, level, coins, total_problems_solved FROM users WHERE id = ?').get(req.userId);
  const newXp = user.xp + xpGained;
  const newCoins = user.coins + coinsGained;
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
