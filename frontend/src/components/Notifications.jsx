import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import eventBus, { EVENTS } from '../services/EventBus';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Подписываемся на события
    const unsubscribers = [];

    unsubscribers.push(
      eventBus.on(EVENTS.RESOURCE_READY, (data) => {
        addNotification({
          id: Date.now(),
          type: 'success',
          icon: data.resourceType === 'egg' ? '🥚' : data.resourceType === 'milk' ? '🥛' : '🧶',
          message: `Ресурс готов! ${data.animalType} произвёл ресурс`,
          duration: 5000
        });
      })
    );

    unsubscribers.push(
      eventBus.on(EVENTS.RESOURCE_COLLECTED, (data) => {
        addNotification({
          id: Date.now(),
          type: 'success',
          icon: '💰',
          message: `+${data.value} монет за ${data.type === 'egg' ? 'яйцо' : data.type === 'milk' ? 'молоко' : 'шерсть'}!`,
          duration: 3000
        });
      })
    );

    unsubscribers.push(
      eventBus.on(EVENTS.ACHIEVEMENT_UNLOCKED, (data) => {
        addNotification({
          id: Date.now(),
          type: 'achievement',
          icon: data.icon || '🏆',
          message: `Достижение разблокировано: ${data.name}!`,
          duration: 7000
        });
      })
    );

    unsubscribers.push(
      eventBus.on(EVENTS.COINS_EARNED, (data) => {
        if (data.amount > 0) {
          addNotification({
            id: Date.now(),
            type: 'info',
            icon: '💰',
            message: `+${data.amount} монет`,
            duration: 2000
          });
        }
      })
    );

    unsubscribers.push(
      eventBus.on(EVENTS.NOTIFICATION_SHOW, (data) => {
        addNotification({
          id: Date.now(),
          type: data.type || 'info',
          icon: data.icon || 'ℹ️',
          message: data.message,
          duration: data.duration || 4000
        });
      })
    );

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  const addNotification = (notification) => {
    setNotifications(prev => [...prev, notification]);

    // Автоматически удаляем через duration
    setTimeout(() => {
      removeNotification(notification.id);
    }, notification.duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'achievement':
        return 'bg-purple-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`${getTypeStyles(notification.type)} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in`}
        >
          <span className="text-2xl">{notification.icon}</span>
          <span className="flex-1 font-semibold">{notification.message}</span>
          <button
            onClick={() => removeNotification(notification.id)}
            className="hover:bg-white/20 rounded p-1 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Notifications;
