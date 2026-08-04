import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Trophy, Home, Sprout } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1 sm:gap-2">
            <span className="text-2xl sm:text-3xl">🧮</span>
            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Счетный двор
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg active:bg-gray-100 transition touch-manipulation">
              <Home size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden md:inline text-sm">Главная</span>
            </Link>
            
            <Link to="/farm" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg active:bg-green-50 transition touch-manipulation text-green-700">
              <Sprout size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden md:inline text-sm">Ферма</span>
            </Link>
            
            <Link to="/leaderboard" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg active:bg-gray-100 transition touch-manipulation">
              <Trophy size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden md:inline text-sm">Лидеры</span>
            </Link>

            <Link to="/profile" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg active:bg-gray-100 transition touch-manipulation">
              <span className="text-xl sm:text-2xl">{user.avatar}</span>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-semibold">{user.displayName}</div>
                <div className="text-xs text-gray-500">Уровень {user.level}</div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg active:bg-red-50 text-red-600 transition touch-manipulation"
            >
              <LogOut size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden md:inline text-sm">Выход</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
