import { useState, useEffect } from 'react';
import { lessonsAPI } from '../services/api';
import { Trophy, Medal, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await lessonsAPI.getLeaderboard();
      setLeaders(response.data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (position) => {
    if (position === 0) return <Trophy className="text-yellow-500" size={32} />;
    if (position === 1) return <Medal className="text-gray-400" size={28} />;
    if (position === 2) return <Award className="text-orange-600" size={28} />;
    return null;
  };

  const getPositionBg = (position) => {
    if (position === 0) return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400';
    if (position === 1) return 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400';
    if (position === 2) return 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400';
    return 'bg-white';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
            <div className="text-xl text-gray-600">Загрузка рейтинга...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 sm:pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🏆</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">Доска лидеров</h1>
            <p className="text-sm sm:text-base text-gray-600">Топ-10 лучших математиков!</p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {leaders.map((leader, index) => {
              const isCurrentUser = user && leader.id === user.id;
              
              return (
                <div
                  key={leader.id}
                  className={`card ${getPositionBg(index)} ${
                    isCurrentUser ? 'ring-2 sm:ring-4 ring-purple-500' : ''
                  } transition-all`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                    <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0">
                      {getMedalIcon(index) || (
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-400">#{index + 1}</div>
                      )}
                    </div>

                    <div className="text-4xl sm:text-5xl md:text-6xl flex-shrink-0">{leader.avatar}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 truncate">
                          {leader.display_name}
                        </h3>
                        {isCurrentUser && (
                          <span className="bg-purple-500 text-white text-xs px-2 py-0.5 sm:py-1 rounded-full font-semibold flex-shrink-0">
                            ТЫ
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-gray-600">Уровень</span>
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm font-bold">
                            {leader.level}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          <span className="font-semibold">{leader.total_problems_solved}</span> примеров
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {leader.xp}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">XP</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {leaders.length === 0 && (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🤔</div>
              <p className="text-xl text-gray-600">Пока никого нет в рейтинге</p>
              <p className="text-gray-500 mt-2">Стань первым!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
