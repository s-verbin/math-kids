import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import TermsModal from '../components/TermsModal';

const AVATARS = [
  '😊', '😎', '🤓', '🥳', '🤩', '😺', '🦊', '🐻', '🐼', '🦁', '🐯', '🦄',
  '🐸', '🐵', '🐶', '🐰', '🐨', '🐷', '🦝', '🦉', '🐙', '🦀', '🐢', '🦖',
  '🚀', '⚡', '🌟', '🔥', '💎', '🎯', '🎨', '🎭', '🎪', '🎸', '🎮', '⚽'
];

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('😊');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!acceptedTerms) {
      setError('Необходимо принять пользовательское соглашение');
      return;
    }

    setLoading(true);

    try {
      await register(username, password, displayName, selectedAvatar, acceptedTerms);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🧮</div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Регистрация
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Присоединяйся к Счетному двору!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Твоё имя
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field text-base sm:text-xl"
              placeholder="Как тебя зовут?"
              required
              autoComplete="name"
            />
          </div>

          <div>
            <label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Логин
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field text-base sm:text-xl"
              placeholder="Придумай логин"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field text-base sm:text-xl"
              placeholder="Придумай пароль"
              required
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Выбери аватар
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`text-2xl sm:text-3xl p-2 rounded-lg transition-all touch-manipulation ${
                    selectedAvatar === avatar
                      ? 'bg-purple-100 ring-2 ring-purple-500 scale-110'
                      : 'bg-gray-100 active:bg-gray-200 hover:scale-110'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 accent-purple-600"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
              Я принимаю{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-purple-600 underline hover:text-purple-800"
              >
                пользовательское соглашение
              </button>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <UserPlus size={18} className="sm:w-5 sm:h-5" />
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-purple-600 font-semibold active:text-purple-700 touch-manipulation">
              Войди
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
