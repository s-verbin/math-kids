import { useState, useEffect } from 'react';
import { craftingAPI } from '../services/api';
import { Hammer, CheckCircle, XCircle } from 'lucide-react';

const Crafting = ({ onUpdate }) => {
  const [recipes, setRecipes] = useState([]);
  const [userResources, setUserResources] = useState({});
  const [loading, setLoading] = useState(true);
  const [crafting, setCrafting] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await craftingAPI.getRecipes();
      setRecipes(response.data.recipes || []);
      setUserResources(response.data.userResources || {});
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCraft = async (recipeId) => {
    setCrafting(recipeId);
    try {
      const response = await craftingAPI.craftItem(recipeId);
      alert(`✨ Создано: ${response.data.crafted}! +${response.data.value} 💰`);
      await loadData();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error crafting:', error);
      alert('Ошибка крафтинга');
    } finally {
      setCrafting(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка рецептов...</div>;
  }

  const resourceIcons = {
    egg: '🥚',
    milk: '🥛',
    wool: '🧶'
  };

  const resourceNames = {
    egg: 'Яйца',
    milk: 'Молоко',
    wool: 'Шерсть'
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-2">🔨 Крафтинг</h2>
        <p className="text-gray-600">Создавай ценные предметы из ресурсов!</p>
      </div>

      {/* Инвентарь ресурсов */}
      <div className="card bg-gray-50">
        <h3 className="font-bold mb-3">📦 Твои ресурсы</h3>
        <div className="flex gap-4">
          {Object.entries(userResources).map(([type, quantity]) => (
            <div key={type} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
              <span className="text-2xl">{resourceIcons[type]}</span>
              <div>
                <div className="text-xs text-gray-500">{resourceNames[type]}</div>
                <div className="font-bold">{quantity} шт.</div>
              </div>
            </div>
          ))}
          {Object.keys(userResources).length === 0 && (
            <div className="text-gray-400">Нет ресурсов</div>
          )}
        </div>
      </div>

      {/* Рецепты */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map(recipe => (
          <div
            key={recipe.id}
            className={`card ${recipe.canCraft ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
          >
            {/* Иконка и название */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">{recipe.icon}</span>
              <div>
                <h3 className="font-bold text-lg">{recipe.name}</h3>
                <div className="text-yellow-600 font-bold">
                  {recipe.value} 💰
                </div>
              </div>
            </div>

            {/* Ингредиенты */}
            <div className="space-y-2 mb-4">
              <div className="text-sm font-semibold text-gray-700">Требуется:</div>
              {Object.entries(recipe.ingredients).map(([ingredient, required]) => {
                const available = userResources[ingredient] || 0;
                const hasEnough = available >= required;

                return (
                  <div
                    key={ingredient}
                    className={`flex items-center justify-between p-2 rounded ${
                      hasEnough ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{resourceIcons[ingredient]}</span>
                      <span className="text-sm">{resourceNames[ingredient]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${hasEnough ? 'text-green-700' : 'text-red-700'}`}>
                        {available}/{required}
                      </span>
                      {hasEnough ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Кнопка крафта */}
            <button
              onClick={() => handleCraft(recipe.id)}
              disabled={!recipe.canCraft || crafting === recipe.id}
              className={`btn w-full ${recipe.canCraft ? 'btn-primary' : 'btn-disabled'}`}
            >
              {crafting === recipe.id ? (
                'Создаём...'
              ) : recipe.canCraft ? (
                <>
                  <Hammer className="w-4 h-4" />
                  Создать
                </>
              ) : (
                'Недостаточно ресурсов'
              )}
            </button>

            {/* Недостающие ресурсы */}
            {!recipe.canCraft && recipe.missing && (
              <div className="mt-2 text-xs text-red-600">
                Не хватает:{' '}
                {Object.entries(recipe.missing).map(([ing, amount]) => (
                  <span key={ing}>
                    {resourceIcons[ing]} {amount}{' '}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Подсказки */}
      <div className="card bg-purple-50 border-purple-200">
        <h3 className="font-bold mb-2">💡 Советы по крафтингу</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• 🎂 Торт — самый прибыльный (+71% прибыли)</li>
          <li>• 🍳 Омлет — быстрая прибыль (+11%)</li>
          <li>• 🧥 Свитер и 🛏️ Одеяло — невыгодны, лучше продать шерсть</li>
          <li>• Крафтинг даёт больше монет, чем продажа ресурсов по отдельности</li>
        </ul>
      </div>
    </div>
  );
};

export default Crafting;
