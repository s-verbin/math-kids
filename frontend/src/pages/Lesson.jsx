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

  const handleSubmit = (e, answerOverride = null) => {
    if (e && e.preventDefault) e.preventDefault();
    if (feedback || !problems[currentIndex]) return;
    
    const currentAnswer = answerOverride !== null ? answerOverride : userAnswer;
    const currentProblem = problems[currentIndex];
    const isRussian = currentProblem?.type === 'russian';
    const correctAnswer = answers[currentIndex].answer;
    
    const isCorrect = isRussian 
      ? String(currentAnswer).trim() === String(correctAnswer).trim()
      : parseInt(currentAnswer) === correctAnswer;

    const answerData = {
      problemId: problems[currentIndex].id,
      userAnswer: isRussian ? currentAnswer : parseInt(currentAnswer),
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
    setTimeout(() => handleSubmit(null, letter), 300);
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
            <div className="text-6xl mb-4 animate-bounce">{resultMsg.emoji || '🎓'}</div>
            
            <h2 className={`text-2xl sm:text-3xl font-bold mb-4 ${resultMsg.color}`}>
              {resultMsg.text}
            </h2>

            <div className="grid grid-cols-2 gap-3 my-6">
              <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/40">
                <div className="text-3xl font-bold text-purple-600">{result.score}/{result.total}</div>
                <div className="text-gray-600 mt-1 text-sm">Правильных</div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/40">
                <div className="text-3xl font-bold text-pink-600">{result.accuracy}%</div>
                <div className="text-gray-600 mt-1 text-sm">Точность</div>
              </div>

              <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/40">
                <div className="text-3xl font-bold text-blue-600">+{result.xpGained}</div>
                <div className="text-gray-600 mt-1 text-sm">Опыт</div>
              </div>

              <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/40">
                <div className="text-3xl font-bold text-yellow-600 flex items-center justify-center gap-2">
                  <Coins size={24} />
                  +{result.coinsGained || 0}
                </div>
                <div className="text-gray-600 mt-1 text-sm">Монет</div>
              </div>

              <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/40 col-span-2">
                <div className="text-3xl font-bold text-green-600">{result.newLevel}</div>
                <div className="text-gray-600 mt-1 text-sm">Уровень</div>
              </div>
            </div>

            {result.leveledUp && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6 animate-pulse">
                <div className="text-2xl font-bold text-yellow-700">🎊 Новый уровень! 🎊</div>
              </div>
            )}

            {result.chest && result.chest.coins > 0 && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-2xl shadow-lg mb-6 animate-pulse">
                <div className="text-4xl mb-2">🎁</div>
                <div className="text-2xl font-bold mb-1">Сундук с монетами!</div>
                <div className="text-lg">+{result.chest.coins} монет бонусом</div>
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
      <div className="min-h-screen flex flex-col items-center justify-start pt-2 sm:pt-4 p-3 sm:p-4">
        <div className="card max-w-2xl w-full flex flex-col max-h-[calc(100svh-4rem)] overflow-hidden">
          <div className="mb-2 sm:mb-3">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-sm sm:text-base font-bold text-gray-700 truncate pr-2">{topic.name}</h2>
              <span className="text-xs sm:text-sm text-gray-600 font-semibold whitespace-nowrap">
                {currentIndex + 1} / {problems.length}
              </span>
            </div>
            <div className="w-full bg-gray-200/70 rounded-full h-2 sm:h-2.5">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 sm:h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="text-center flex-1 flex flex-col justify-center min-h-0 my-2 sm:my-4 pb-40 xl:pb-0">
            <div className="text-[clamp(1.25rem,5.5vw,2.25rem)] sm:text-[clamp(1.5rem,4.5vw,2.75rem)] md:text-[clamp(1.75rem,3.5vw,3.25rem)] leading-tight font-bold text-gray-800 mb-3 sm:mb-4 px-2 break-words whitespace-normal">
              {currentProblem.question}
            </div>

            {isRussian && currentProblem.options ? (
              <div className="max-w-2xl mx-auto px-2 w-full">
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                  {currentProblem.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleLetterClick(option)}
                      disabled={feedback !== null}
                      className={`text-2xl sm:text-3xl font-bold min-h-[52px] sm:min-h-[60px] rounded-2xl transition-all touch-manipulation ${
                        userAnswer === option
                          ? 'bg-gradient-to-br from-purple-500/90 to-pink-500/90 text-white scale-105 shadow-lg'
                          : 'bg-white/60 backdrop-blur-md text-gray-800 active:scale-95 border border-white/60 shadow-md'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {feedback && (
                  <div className={`mt-3 p-3 rounded-2xl ${feedback.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center justify-center gap-2 text-lg sm:text-xl font-bold">
                      {feedback.isCorrect ? (
                        <>
                          <Check size={22} className="text-green-600" />
                          <span className="text-green-600">Правильно!</span>
                        </>
                      ) : (
                        <>
                          <X size={22} className="text-red-600" />
                          <span className="text-red-600">Неправильно</span>
                        </>
                      )}
                    </div>
                    {feedback && currentProblem && (
                      <div className="mt-2 text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-wider break-words whitespace-normal">
                          {(() => {
                            const replacement = feedback.correctAnswer === '-' ? '' : feedback.correctAnswer;
                            return currentProblem.question.replace('_', replacement);
                          })()}
                        </div>
                      </div>
                    )}
                    {!feedback.isCorrect && (
                      <div className="mt-2 text-sm text-gray-600">
                        Правильный ответ: <span className="font-bold text-xl sm:text-2xl">{feedback.correctAnswer}</span>
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
                  className="input-field text-2xl sm:text-3xl xl:hidden"
                  placeholder="?"
                  readOnly
                  disabled={feedback !== null}
                />
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="input-field text-2xl sm:text-3xl hidden xl:block"
                  placeholder="?"
                  autoFocus
                  required
                  disabled={feedback !== null}
                />

                {feedback && (
                  <div className={`mt-3 p-3 rounded-2xl ${feedback.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center justify-center gap-2 text-lg sm:text-xl font-bold">
                      {feedback.isCorrect ? (
                        <>
                          <Check size={22} className="text-green-600" />
                          <span className="text-green-600">Правильно!</span>
                        </>
                      ) : (
                        <>
                          <X size={22} className="text-red-600" />
                          <span className="text-red-600">Неправильно</span>
                        </>
                      )}
                    </div>
                    {/* Показываем слово с подставленной буквой */}
                    {isRussian && feedback.isCorrect && currentProblem && (
                      <div className="mt-2 text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-wider break-words whitespace-normal">
                          {(() => {
                            const parts = currentProblem.question.split('_');
                            return (
                              <>
                                <span>{parts[0]}</span>
                                <span className="text-green-600 text-2xl sm:text-3xl inline-block mx-0.5 animate-pulse">
                                  {feedback.correctAnswer}
                                </span>
                                <span>{parts[1] || ''}</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {!feedback.isCorrect && (
                      <div className="mt-2 text-sm text-gray-600">
                        Правильный ответ: <span className="font-bold text-xl sm:text-2xl">{feedback.correctAnswer}</span>
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
