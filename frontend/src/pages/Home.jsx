import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { topicsAPI } from '../services/api';
import { Play, Star, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showDaily, setShowDaily] = useState(user?.dailyReward > 0);
  const [showGuestBanner, setShowGuestBanner] = useState(!user);
  const navigate = useNavigate();

  useEffect(() => {
    if (showDaily) {
      const timer = setTimeout(() => setShowDaily(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showDaily]);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const response = await topicsAPI.getAll();
      setTopics(response.data);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      addition: '➕',
      subtraction: '➖',
      multiplication: '✖️',
      division: '➗',
      unknown: '❓',
      mixed: '🎯',
      russian: '📝',
      basics: '🍎'
    };
    return icons[category] || '📚';
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty <= 2) return 'bg-green-100 text-green-700';
    if (difficulty <= 4) return 'bg-yellow-100 text-yellow-700';
    if (difficulty <= 6) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const getStars = (bestScore) => {
    if (!bestScore) return 0;
    if (bestScore === 10) return 3;
    if (bestScore >= 8) return 2;
    if (bestScore >= 6) return 1;
    return 0;
  };

  const weakTopics = topics.filter((t) => t.progress?.attempts > 0 && (t.progress?.bestScore || 0) < 7);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🎓</div>
            <div className="text-xl text-gray-600">Загрузка тем...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 sm:pb-8">
        {!user && showGuestBanner && (
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 sm:p-6 rounded-2xl shadow-lg relative">
            <button
              onClick={() => setShowGuestBanner(false)}
              className="absolute top-2 right-2 text-white/80 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
            <div className="text-3xl sm:text-4xl mb-2">👋</div>
            <div className="text-lg sm:text-xl font-bold mb-2">Привет! Ты решаешь без аккаунта</div>
            <div className="text-sm sm:text-base mb-4 opacity-90">
              Чтобы сохранить прогресс, получать монеты и открыть ферму — войди или зарегистрируйся
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => navigate('/login')}
                className="bg-white text-purple-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:bg-gray-100 transition flex items-center gap-2"
              >
                Войти
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:bg-purple-800 transition flex items-center gap-2"
              >
                Регистрация
              </button>
            </div>
          </div>
        )}

        {user && showDaily && (
          <div className="mb-4 sm:mb-6 bg-yellow-400/80 backdrop-blur-md text-white p-4 rounded-2xl shadow-lg text-center animate-pulse border border-white/40">
            <div className="text-3xl mb-1">🎁</div>
            <div className="text-lg font-bold">Ежедневная награда!</div>
            <div className="text-sm">
              +{user.dailyReward} монет, серия {user.streak} дней 🔥
            </div>
          </div>
        )}

        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">Выбери тему</h1>
          <p className="text-sm sm:text-base text-gray-600">Начни с простого и двигайся к сложному!</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-6 sm:mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              filter === 'all'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('math')}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              filter === 'math'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            🧮 Математика
          </button>
          <button
            onClick={() => setFilter('russian')}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              filter === 'russian'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            📝 Русский
          </button>
          <button
            onClick={() => setFilter('basics')}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              filter === 'basics'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            🍎 Задачи
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {topics
            .filter((topic) => {
              if (filter === 'math') return topic.category !== 'russian' && topic.category !== 'basics';
              if (filter === 'russian') return topic.category === 'russian';
              if (filter === 'basics') return topic.category === 'basics';
              return true;
            })
            .map((topic) => {
            const stars = getStars(topic.progress?.bestScore);
            const isCompleted = topic.progress?.attempts > 0;

            return (
              <div
                key={topic.id}
                className="card active:scale-95 transition-transform cursor-pointer touch-manipulation"
                onClick={() => navigate(`/lesson/${topic.id}`)}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="text-4xl sm:text-5xl">{getCategoryIcon(topic.category)}</div>
                  <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(topic.difficulty)}`}>
                    Ур. {topic.difficulty}
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-1">{topic.name}</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{topic.description}</p>

                {isCompleted && (
                  <div className="flex items-center gap-1 mb-3 sm:mb-4">
                    {[1, 2, 3].map((i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`sm:w-5 sm:h-5 ${i <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-2 text-xs sm:text-sm text-gray-600">
                      Лучший: {topic.progress.bestScore}/10
                    </span>
                  </div>
                )}

                <button className="btn-primary w-full flex items-center justify-center gap-2 text-sm sm:text-base">
                  <Play size={16} className="sm:w-5 sm:h-5" />
                  {isCompleted ? 'Пройти снова' : 'Начать'}
                </button>

                {topic.progress?.attempts > 0 && (
                  <div className="mt-2 sm:mt-3 text-xs text-gray-500 text-center">
                    Попыток: {topic.progress.attempts} • Точность: {topic.progress.avgAccuracy.toFixed(0)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {weakTopics.length > 0 && (
          <div className="max-w-6xl mx-auto mt-6 sm:mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">📚 Потренируй, где ошибаешься</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {weakTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="card active:scale-95 transition-transform cursor-pointer touch-manipulation"
                  onClick={() => navigate(`/lesson/${topic.id}`)}
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="text-4xl sm:text-5xl">{getCategoryIcon(topic.category)}</div>
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(topic.difficulty)}`}>
                      Ур. {topic.difficulty}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{topic.name}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">{topic.description}</p>
                  <div className="text-sm text-red-600 font-semibold">
                    Лучший: {topic.progress.bestScore}/10
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
