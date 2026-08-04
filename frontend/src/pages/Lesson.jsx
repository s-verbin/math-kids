import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topicsAPI, lessonsAPI } from '../services/api';
import { ArrowLeft, CheckCircle, XCircle, Trophy, Home, Coins, Check, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import NumberKeyboard from '../components/NumberKeyboard';

const Lesson = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [problems, setProblems] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startLesson();
  }, [topicId]);

  const startLesson = async () => {
    try {
      const [topicRes, lessonRes] = await Promise.all([
        topicsAPI.getById(topicId),
        lessonsAPI.start(parseInt(topicId))
      ]);
      
      setTopic(topicRes.data.topic);
      setProblems(lessonRes.data.problems);
      setAnswers(lessonRes.data.answers);
      setLoading(false);
    } catch (error) {
      console.error('Error starting lesson:', error);
      navigate('/');
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (feedback || !problems[currentIndex]) return;
    
    const currentProblem = problems[currentIndex];
    const isRussian = currentProblem?.type === 'russian';
    const correctAnswer = answers[currentIndex].answer;
    
    const isCorrect = isRussian 
      ? String(userAnswer).trim() === String(correctAnswer).trim()
      : parseInt(userAnswer) === correctAnswer;

    const answerData = {
      problemId: problems[currentIndex].id,
      userAnswer: isRussian ? userAnswer : parseInt(userAnswer),
      correctAnswer: correctAnswer,
      isCorrect: isCorrect
    };

    setUserAnswers([...userAnswers, answerData]);

    setFeedback({
      isCorrect,
      correctAnswer
    });

    setTimeout(() => {
      if (currentIndex < problems.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setUserAnswer('');
        setFeedback(null);
      } else {
        finishLesson([...userAnswers, answerData]);
      }
    }, 1500);
  };

  const handleNumberClick = (num) => {
    if (feedback) return;
    setUserAnswer(userAnswer + num);
  };

  const handleDelete = () => {
    if (feedback) return;
    setUserAnswer(userAnswer.slice(0, -1));
  };

  const handleLetterClick = (letter) => {
    if (feedback) return;
    setUserAnswer(letter);
    setTimeout(() => handleSubmit(), 300);
  };

  const finishLesson = async (allUserAnswers) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await lessonsAPI.submit({
        topicId: parseInt(topicId),
        answers: allUserAnswers,
        timeSpent
      });
      
      setResult(response.data);
      setCompleted(true);
    } catch (error) {
      console.error('Error submitting lesson:', error);
    }
  };

  const getResultMessage = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage === 100) return { text: 'Отлично! 🎉', emoji: '⭐⭐⭐', color: 'text-green-600' };
    if (percentage >= 80) return { text: 'Хорошо! 👍', emoji: '⭐⭐', color: 'text-blue-600' };
    if (percentage >= 60) return { text: 'Неплохо 😊', emoji: '⭐', color: 'text-yellow-600' };
    return { text: 'Попробуй еще раз 💪', emoji: '', color: 'text-orange-600' };
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🎓</div>
            <div className="text-xl text-gray-600">Подготовка урока...</div>
          </div>
        </div>
      </>
    );
  }

  if (loading || !topic || !problems.length) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">📚</div>
            <div className="text-xl text-gray-600">Загрузка урока...</div>
          </div>
        </div>
      </>
    );
  }

  if (completed && result) {
    const resultMsg = getResultMessage(result.score, result.total);
    
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="card max-w-2xl w-full text-center">
            <div className="text-8xl mb-6 animate-bounce">{resultMsg.emoji || '🎓'}</div>
            
            <h2 className={`text-4xl font-bold mb-4 ${resultMsg.color}`}>
              {resultMsg.text}
            </h2>

            <div className="grid grid-cols-2 gap-4 my-8">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                <div className="text-4xl font-bold text-purple-600">{result.score}/{result.total}</div>
                <div className="text-gray-600 mt-2">Правильных ответов</div>
              </div>
              
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl">
                <div className="text-4xl font-bold text-pink-600">{result.accuracy}%</div>
                <div className="text-gray-600 mt-2">Точность</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <div className="text-4xl font-bold text-blue-600">+{result.xpGained}</div>
                <div className="text-gray-600 mt-2">Опыта получено</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
                <div className="text-4xl font-bold text-yellow-600 flex items-center justify-center gap-2">
                  <Coins size={32} />
                  +{result.coinsGained || 0}
                </div>
                <div className="text-gray-600 mt-2">Монет заработано</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <div className="text-4xl font-bold text-green-600">{result.newLevel}</div>
                <div className="text-gray-600 mt-2">Твой уровень</div>
              </div>
            </div>

            {result.leveledUp && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6 animate-pulse">
                <div className="text-2xl font-bold text-yellow-700">🎊 Новый уровень! 🎊</div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <Trophy size={20} />
                Пройти снова
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Home size={20} />
                На главную
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const currentProblem = problems[currentIndex];
  const isRussian = currentProblem?.type === 'russian';
  const progress = ((currentIndex + 1) / problems.length) * 100;

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
        <div className="card max-w-2xl w-full">
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-700 truncate pr-2">{topic.name}</h2>
              <span className="text-sm sm:text-base text-gray-600 font-semibold whitespace-nowrap">
                {currentIndex + 1} / {problems.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 sm:h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="text-center my-8 sm:my-12 pb-32 md:pb-0">
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-6 sm:mb-8 px-2">
              {currentProblem.question}
            </div>

            {isRussian && currentProblem.options ? (
              <div className="max-w-2xl mx-auto px-2">
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                  {currentProblem.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleLetterClick(option)}
                      disabled={feedback !== null}
                      className={`text-3xl sm:text-4xl md:text-5xl font-bold py-6 sm:py-8 rounded-2xl transition-all touch-manipulation ${
                        userAnswer === option
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-105'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 active:scale-95'
                      } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {feedback && (
                  <div className={`mt-4 sm:mt-6 p-4 sm:p-6 rounded-xl ${feedback.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center justify-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold">
                      {feedback.isCorrect ? (
                        <>
                          <Check size={24} className="text-green-600 sm:w-8 sm:h-8" />
                          <span className="text-green-600">Правильно!</span>
                        </>
                      ) : (
                        <>
                          <X size={24} className="text-red-600 sm:w-8 sm:h-8" />
                          <span className="text-red-600">Неправильно</span>
                        </>
                      )}
                    </div>
                    {!feedback.isCorrect && (
                      <div className="mt-2 text-sm sm:text-base text-gray-600">
                        Правильный ответ: <span className="font-bold text-2xl sm:text-3xl">{feedback.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto px-2">
                <input
                  type="text"
                  inputMode="none"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="input-field text-3xl sm:text-4xl md:hidden"
                  placeholder="?"
                  readOnly
                  disabled={feedback !== null}
                />
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="input-field text-3xl sm:text-4xl hidden md:block"
                  placeholder="?"
                  autoFocus
                  required
                  disabled={feedback !== null}
                />

                {feedback && (
                  <div className={`mt-4 sm:mt-6 p-4 sm:p-6 rounded-xl ${feedback.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center justify-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold">
                      {feedback.isCorrect ? (
                        <>
                          <Check size={24} className="text-green-600 sm:w-8 sm:h-8" />
                          <span className="text-green-600">Правильно!</span>
                        </>
                      ) : (
                        <>
                          <X size={24} className="text-red-600 sm:w-8 sm:h-8" />
                          <span className="text-red-600">Неправильно</span>
                        </>
                      )}
                    </div>
                    {!feedback.isCorrect && (
                      <div className="mt-2 text-sm sm:text-base text-gray-600">
                        Правильный ответ: <span className="font-bold text-lg sm:text-xl">{feedback.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                )}

                {!feedback && (
                  <button type="submit" className="btn-primary w-full mt-4 sm:mt-6 text-base sm:text-lg py-3 sm:py-4 hidden md:block">
                    Ответить
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
      
      {!isRussian && !feedback && (
        <NumberKeyboard
          onNumberClick={handleNumberClick}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          disabled={feedback !== null}
        />
      )}
    </>
  );
};

export default Lesson;
