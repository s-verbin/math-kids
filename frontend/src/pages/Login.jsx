import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа');
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
            Счетный двор
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Учи математику с удовольствием!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Логин
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field text-base sm:text-xl"
              placeholder="Введи свой логин"
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
              placeholder="Введи пароль"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base sm:text-lg"
          >
            <LogIn size={18} className="sm:w-5 sm:h-5" />
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-purple-600 font-semibold active:text-purple-700 touch-manipulation">
              Зарегистрируйся
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
