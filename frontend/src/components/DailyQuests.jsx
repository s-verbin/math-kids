import { useState, useEffect } from 'react';
import { questsAPI } from '../services/api';
import { CheckCircle, Clock } from 'lucide-react';

const DailyQuests = () => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      const response = await questsAPI.getDailyQuests();
      setQuests(response.data.quests || []);
    } catch (error) {
      console.error('Error loading quests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-4">Загрузка заданий...</div>
      </div>
    );
  }

  const completedCount = quests.filter(q => q.completed).length;
  const totalCount = quests.length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">📋 Ежедневные задания</h3>
          <p className="text-sm text-gray-600">
            Выполнено: {completedCount}/{totalCount}
          </p>
        </div>
        <div className="text-3xl">
          {completedCount === totalCount ? '🎉' : '⏳'}
        </div>
      </div>

      <div className="space-y-3">
        {quests.map(quest => (
          <div
            key={quest.id}
            className={`p-4 rounded-lg border-2 ${
              quest.completed
                ? 'bg-green-50 border-green-300'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{quest.icon}</span>
              <div className="flex-1">
                <div className="font-semibold">{quest.description}</div>
                <div className="text-sm text-gray-600">
                  Прогресс: {quest.current_value}/{quest.target_value}
                </div>
              </div>
              {quest.completed ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <Clock className="w-6 h-6 text-gray-400" />
              )}
            </div>

            {/* Прогресс-бар */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  quest.completed ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${quest.progress}%` }}
              />
            </div>

            {/* Награда */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Награда:</span>
              <span className="font-bold text-yellow-600">
                {quest.reward_coins} 💰
              </span>
            </div>
          </div>
        ))}

        {quests.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Нет заданий на сегодня
          </div>
        )}
      </div>

      {completedCount === totalCount && totalCount > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg text-center font-bold">
          🎉 Все задания выполнены! Возвращайся завтра за новыми!
        </div>
      )}
    </div>
  );
};

export default DailyQuests;
