import { useState, useEffect } from 'react';
import { userAPI, lessonsAPI } from '../services/api';
import { Trophy, Target, TrendingUp, Award, Coins } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const AVATARS = [
  '😊', '😎', '🤓', '🥳', '🤩', '😺', '🦊', '🐻', '🐼', '🦁', '🐯', '🦄',
  '🐸', '🐵', '🐶', '🐰', '🐨', '🐷', '🦝', '🦉', '🐙', '🦀', '🐢', '🦖',
  '🚀', '⚡', '🌟', '🔥', '💎', '🎯', '🎨', '🎭', '🎪', '🎸', '🎮', '⚽'
];

const Profile = () => {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    loadProfile();
    loadAchievements();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAchievements = async () => {
    try {
      const response = await lessonsAPI.getAchievements();
      setAchievements(response.data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const handleAvatarChange = async (avatar) => {
    try {
      await userAPI.updateAvatar(avatar);
      const updatedUser = { ...profile.user, avatar };
      setProfile({ ...profile, user: updatedUser });
      setUser(updatedUser);
      setShowAvatarPicker(false);
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  if (loading || !profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🎓</div>
            <div className="text-xl text-gray-600">Загрузка профиля...</div>
          </div>
        </div>
      </>
    );
  }

  const { user, stats, recentLessons, dailyStats } = profile;
  const xpToNextLevel = (user.level * 100) - user.xp;
  const xpProgress = (user.xp % 100);

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 sm:pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="card mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="relative">
                <div
                  className="text-6xl sm:text-7xl md:text-8xl cursor-pointer active:scale-95 transition-transform touch-manipulation"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                >
                  {user.avatar}
                </div>
                {showAvatarPicker && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 bg-white rounded-xl shadow-xl p-3 sm:p-4 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 z-10 max-h-96 overflow-y-auto">
                    {AVATARS.map((avatar) => (
                      <button
                        key={avatar}
                        onClick={() => handleAvatarChange(avatar)}
                        className="text-2xl sm:text-3xl p-2 rounded-lg active:bg-gray-100 transition touch-manipulation hover:scale-110"
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left w-full">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">{user.displayName}</h1>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">@{user.username}</p>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-bold text-sm sm:text-base whitespace-nowrap">
                    Уровень {user.level}
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm sm:text-base whitespace-nowrap flex items-center gap-2">
                    <Coins size={20} />
                    {user.coins || 0} монет
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                      <span>{xpProgress} XP</span>
                      <span className="text-right">До {user.level + 1}: {xpToNextLevel} XP</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 sm:h-3 rounded-full transition-all"
                        style={{ width: `${xpProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="text-purple-600" size={18} />
                <span className="text-xs sm:text-sm text-gray-600 font-semibold">Уроков</span>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600">{stats.totalLessons}</div>
            </div>

            <div className="card bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-green-600" size={18} />
                <span className="text-xs sm:text-sm text-gray-600 font-semibold">Примеров</span>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">{user.totalProblemsSolved}</div>
            </div>

            <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-blue-600" size={18} />
                <span className="text-xs sm:text-sm text-gray-600 font-semibold">Точность</span>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">{stats.avgAccuracy.toFixed(0)}%</div>
            </div>

            <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
              <div className="flex items-center gap-2 mb-2">
                <Award className="text-yellow-600" size={18} />
                <span className="text-xs sm:text-sm text-gray-600 font-semibold">Ачивок</span>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-600">{unlockedAchievements.length}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="card">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">🏆 Достижения</h2>
              
              {unlockedAchievements.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 sm:mb-3">Получены</h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {unlockedAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 sm:p-4 rounded-xl border-2 border-yellow-300"
                      >
                        <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{achievement.icon}</div>
                        <div className="text-sm sm:text-base font-bold text-gray-800">{achievement.name}</div>
                        <div className="text-xs text-gray-600 line-clamp-2">{achievement.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lockedAchievements.length > 0 && (
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 sm:mb-3">
                    Заблокированы ({lockedAchievements.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {lockedAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="bg-gray-100 p-3 sm:p-4 rounded-xl opacity-60"
                      >
                        <div className="text-2xl sm:text-3xl mb-1 sm:mb-2 grayscale">{achievement.icon}</div>
                        <div className="text-sm sm:text-base font-bold text-gray-600">{achievement.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-2">{achievement.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">📊 Последние уроки</h2>
              <div className="space-y-2 sm:space-y-3">
                {recentLessons.slice(0, 5).map((lesson) => (
                  <div key={lesson.id} className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-1">{lesson.topic_name}</div>
                      <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                        {new Date(lesson.completed_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600 whitespace-nowrap">
                        {lesson.score}/{lesson.total_questions}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${(lesson.score / lesson.total_questions) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                        {((lesson.score / lesson.total_questions) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
