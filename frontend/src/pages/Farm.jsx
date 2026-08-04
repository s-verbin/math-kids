import { useState, useEffect } from 'react';
import { farmAPI } from '../services/api';
import { Coins, Heart, Utensils, ShoppingCart, Package, Box } from 'lucide-react';
import Navbar from '../components/Navbar';
import FarmScene from '../components/Farm3D/FarmScene';

const Farm = () => {
  const [myFarm, setMyFarm] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('farm');
  const [shopCategory, setShopCategory] = useState('animals');
  const [view3D, setView3D] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [farmResponse, shopResponse] = await Promise.all([
        farmAPI.getMyFarm(),
        farmAPI.getShop()
      ]);
      setMyFarm(farmResponse.data);
      setShop(shopResponse.data);
    } catch (error) {
      console.error('Error loading farm data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyAnimal = async (animalId) => {
    const animalName = prompt('Как назовёшь животное?');
    if (!animalName) return;

    try {
      await farmAPI.buyAnimal(animalId, animalName);
      await loadData();
      alert('Животное куплено! 🎉');
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка покупки');
    }
  };

  const handleBuyItem = async (itemId) => {
    try {
      await farmAPI.buyItem(itemId, 1);
      await loadData();
      alert('Предмет куплен! 🎉');
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка покупки');
    }
  };

  const handleFeedAnimal = async (userAnimalId) => {
    try {
      await farmAPI.feedAnimal(userAnimalId);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка кормления');
    }
  };

  const handlePetAnimal = async (userAnimalId) => {
    try {
      await farmAPI.petAnimal(userAnimalId);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🚜</div>
            <div className="text-xl text-gray-600">Загрузка фермы...</div>
          </div>
        </div>
      </>
    );
  }

  const getAnimalEmoji = (type) => {
    const emojis = {
      pig: '🐷',
      horse: '🐴',
      dog: '🐕',
      chicken: '🐔',
      sheep: '🐑',
      cow: '🐄',
      goat: '🐐',
      donkey: '🫏',
      cat: '🐈',
      duck: '🦆'
    };
    return emojis[type] || '🐾';
  };

  const getItemEmoji = (itemName, category) => {
    // Уникальные эмодзи для каждого предмета
    const itemEmojis = {
      // Постройки
      'Сарай': '🏚️',
      'Забор деревянный': '🪵',
      'Участок земли': '🟫',
      'Кормушка': '🍽️',
      'Поилка': '💧',
      'Мельница': '🏭',
      'Колодец': '🪣',
      
      // Декорации
      'Стог сена': '🌾',
      'Фонарь': '🏮',
      'Скамейка': '🪑',
      'Цветочная клумба': '🌺',
      'Пугало': '🧑‍🌾',
      
      // Аксессуары
      'Шляпа соломенная': '👒',
      'Бантик красный': '🎀',
      'Колокольчик': '🔔',
      'Седло': '🏇',
      'Ошейник': '🦴',
      'Цветочный венок': '💐'
    };
    
    return itemEmojis[itemName] || getCategoryEmojiDefault(category);
  };

  const getCategoryEmojiDefault = (category) => {
    const emojis = {
      building: '🏠',
      land: '🌾',
      decoration: '🌻',
      accessory: '🎀'
    };
    return emojis[category] || '📦';
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="card mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">🚜 Моя Ферма</h1>
                <p className="text-gray-600">Добро пожаловать на Скотный двор!</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold text-xl flex items-center gap-2">
                <Coins size={24} />
                {myFarm.coins}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('farm')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                activeTab === 'farm'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              🐄 Моя Ферма
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                activeTab === 'shop'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              🛒 Магазин
            </button>
          </div>

          {/* My Farm Tab */}
          {activeTab === 'farm' && (
            <div>
              {/* 3D Scene */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold text-gray-800">🎨 Вид фермы</h2>
                  <button
                    onClick={() => setView3D(!view3D)}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition"
                  >
                    <Box size={18} />
                    {view3D ? '2D Список' : '3D Вид'}
                  </button>
                </div>
                
                {view3D && (
                  <FarmScene animals={myFarm.animals} inventory={myFarm.inventory} />
                )}
              </div>

              {myFarm.animals.length === 0 ? (
                <div className="card text-center py-12">
                  <div className="text-6xl mb-4">🌾</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">Ферма пуста</h3>
                  <p className="text-gray-600 mb-6">Купи своё первое животное в магазине!</p>
                  <button
                    onClick={() => setActiveTab('shop')}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    Перейти в магазин
                  </button>
                </div>
              ) : !view3D ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myFarm.animals.map((animal) => (
                    <div key={animal.id} className="card bg-gradient-to-br from-green-50 to-green-100">
                      <div className="text-center mb-4">
                        <div className="text-6xl mb-2">{getAnimalEmoji(animal.type)}</div>
                        <h3 className="text-xl font-bold text-gray-800">{animal.name}</h3>
                        <p className="text-sm text-gray-600">{animal.animal_name}</p>
                      </div>

                      {/* Status Bars */}
                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1">
                              <Utensils size={14} />
                              Сытость
                            </span>
                            <span>{animal.hunger}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                animal.hunger > 70 ? 'bg-green-500' : animal.hunger > 30 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${animal.hunger}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1">
                              <Heart size={14} />
                              Настроение
                            </span>
                            <span>{animal.happiness}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                animal.happiness > 70 ? 'bg-pink-500' : animal.happiness > 30 ? 'bg-yellow-500' : 'bg-gray-500'
                              }`}
                              style={{ width: `${animal.happiness}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFeedAnimal(animal.id)}
                          disabled={animal.hunger >= 100}
                          className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-1 text-sm"
                        >
                          <Utensils size={16} />
                          Покормить
                        </button>
                        <button
                          onClick={() => handlePetAnimal(animal.id)}
                          disabled={animal.happiness >= 100}
                          className="flex-1 py-2 px-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-1 text-sm"
                        >
                          <Heart size={16} />
                          Погладить
                        </button>
                      </div>

                      {(animal.isHungry || animal.needsPetting) && (
                        <div className="mt-3 text-center text-sm">
                          {animal.isHungry && <span className="text-red-600">😢 Голодное</span>}
                          {animal.isHungry && animal.needsPetting && <span className="mx-2">•</span>}
                          {animal.needsPetting && <span className="text-gray-600">😔 Грустное</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Land & Buildings */}
              {myFarm.inventory.filter(item => item.category === 'land' || item.category === 'building').length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    🏗️ Постройки и участки
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {myFarm.inventory
                      .filter(item => item.category === 'land' || item.category === 'building')
                      .map((item) => (
                        <div key={item.id} className="card bg-gradient-to-br from-amber-50 to-amber-100 p-4">
                          <div className="text-center">
                            <div className="text-5xl mb-2">{getItemEmoji(item.item_name, item.category)}</div>
                            <div className="text-sm font-bold text-gray-800">{item.item_name}</div>
                            {item.quantity > 1 && (
                              <div className="text-xs text-gray-600 mt-1">Количество: {item.quantity}</div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Decorations & Accessories Inventory */}
              {myFarm.inventory.filter(item => item.category === 'decoration' || item.category === 'accessory').length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Package size={24} />
                    Декорации и аксессуары
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {myFarm.inventory
                      .filter(item => item.category === 'decoration' || item.category === 'accessory')
                      .map((item) => (
                        <div key={item.id} className="card text-center p-3">
                          <div className="text-3xl mb-1">{getItemEmoji(item.item_name, item.category)}</div>
                          <div className="text-xs font-semibold text-gray-700">{item.item_name}</div>
                          {item.quantity > 1 && (
                            <div className="text-xs text-gray-500 mt-1">x{item.quantity}</div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shop Tab */}
          {activeTab === 'shop' && (
            <div>
              {/* Shop Categories */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                <button
                  onClick={() => setShopCategory('animals')}
                  className={`py-2 px-4 rounded-lg font-semibold whitespace-nowrap transition ${
                    shopCategory === 'animals'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🐄 Животные
                </button>
                <button
                  onClick={() => setShopCategory('land')}
                  className={`py-2 px-4 rounded-lg font-semibold whitespace-nowrap transition ${
                    shopCategory === 'land'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🟫 Земля
                </button>
                <button
                  onClick={() => setShopCategory('building')}
                  className={`py-2 px-4 rounded-lg font-semibold whitespace-nowrap transition ${
                    shopCategory === 'building'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🏠 Постройки
                </button>
                <button
                  onClick={() => setShopCategory('decoration')}
                  className={`py-2 px-4 rounded-lg font-semibold whitespace-nowrap transition ${
                    shopCategory === 'decoration'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🌻 Декор
                </button>
                <button
                  onClick={() => setShopCategory('accessory')}
                  className={`py-2 px-4 rounded-lg font-semibold whitespace-nowrap transition ${
                    shopCategory === 'accessory'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  🎀 Аксессуары
                </button>
              </div>

              {/* Animals */}
              {shopCategory === 'animals' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shop.animals.map((animal) => (
                    <div key={animal.id} className="card hover:shadow-lg transition">
                      <div className="text-center mb-4">
                        <div className="text-6xl mb-2">{getAnimalEmoji(animal.type)}</div>
                        <h3 className="text-xl font-bold text-gray-800">{animal.name}</h3>
                        <p className="text-sm text-gray-600">{animal.description}</p>
                      </div>
                      <button
                        onClick={() => handleBuyAnimal(animal.id)}
                        disabled={myFarm.coins < animal.price}
                        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Coins size={20} />
                        Купить за {animal.price}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Items */}
              {shopCategory !== 'animals' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {shop.items
                    .filter((item) => item.category === shopCategory)
                    .map((item) => (
                      <div key={item.id} className="card hover:shadow-lg transition">
                        <div className="text-center mb-3">
                          <div className="text-4xl mb-2">{getItemEmoji(item.name, item.category)}</div>
                          <h3 className="text-sm font-bold text-gray-800">{item.name}</h3>
                          <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                        </div>
                        <button
                          onClick={() => handleBuyItem(item.id)}
                          disabled={myFarm.coins < item.price}
                          className="w-full py-2 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-1 text-sm"
                        >
                          <Coins size={16} />
                          {item.price}
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Farm;
