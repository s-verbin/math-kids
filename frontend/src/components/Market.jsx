import { useState, useEffect } from 'react';
import { marketAPI, productionAPI } from '../services/api';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const Market = ({ onUpdate }) => {
  const [prices, setPrices] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selling, setSelling] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pricesRes, resourcesRes] = await Promise.all([
        marketAPI.getPrices(),
        productionAPI.getResources()
      ]);
      setPrices(pricesRes.data);
      setResources(resourcesRes.data.resources || []);
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async (resourceType, quantity) => {
    if (quantity <= 0) return;
    
    setSelling(resourceType);
    try {
      await marketAPI.sellResource(resourceType, quantity);
      await loadData();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error selling resource:', error);
      alert('Ошибка продажи');
    } finally {
      setSelling(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка рынка...</div>;
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

  const getTrendIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-2">🏪 Рынок</h2>
        <p className="text-gray-600">Продавай ресурсы по текущим ценам. Цены меняются каждый день!</p>
        <div className="mt-2 text-sm text-gray-500">
          Дата: {prices?.date}
        </div>
      </div>

      {/* Список ресурсов */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(prices?.prices || {}).map(([type, price]) => {
          const resource = resources.find(r => r.resource_type === type);
          const quantity = resource?.quantity || 0;
          const change = prices?.changes?.[type] || 0;
          const basePrice = prices?.basePrices?.[type] || price;

          return (
            <div key={type} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-4xl">{resourceIcons[type]}</span>
                  <div>
                    <h3 className="font-bold text-lg">{resourceNames[type]}</h3>
                    <div className="text-sm text-gray-500">
                      У вас: {quantity} шт.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Цена */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Цена сегодня</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {price} 💰
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${getTrendColor(change)}`}>
                    {getTrendIcon(change)}
                    <span className="font-bold">{change > 0 ? '+' : ''}{change}%</span>
                  </div>
                </div>

                {/* Базовая цена */}
                <div className="text-xs text-gray-500 text-center">
                  Базовая цена: {basePrice} 💰
                </div>

                {/* Кнопки продажи */}
                <div className="grid grid-cols-3 gap-2">
                  {[1, 5, 10].map(amount => (
                    <button
                      key={amount}
                      onClick={() => handleSell(type, Math.min(amount, quantity))}
                      disabled={quantity < amount || selling === type}
                      className="btn btn-sm"
                    >
                      {selling === type ? '...' : `×${amount}`}
                    </button>
                  ))}
                </div>

                {/* Кнопка "Продать всё" */}
                {quantity > 0 && (
                  <button
                    onClick={() => handleSell(type, quantity)}
                    disabled={selling === type}
                    className="btn btn-primary w-full"
                  >
                    {selling === type ? 'Продаём...' : `Продать всё (${quantity * price} 💰)`}
                  </button>
                )}

                {quantity === 0 && (
                  <div className="text-center text-gray-400 text-sm py-2">
                    Нет в наличии
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Подсказки */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-bold mb-2">💡 Советы по торговле</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• Продавайте когда цена выше базовой (+10% и больше)</li>
          <li>• Следите за трендами — цены меняются каждый день</li>
          <li>• Зелёная стрелка ↗ — хорошее время для продажи</li>
          <li>• Красная стрелка ↘ — лучше подождать</li>
        </ul>
      </div>
    </div>
  );
};

export default Market;
