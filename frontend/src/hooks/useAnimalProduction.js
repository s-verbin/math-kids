import { useState, useEffect, useRef } from 'react';
import eventBus, { EVENTS } from '../services/EventBus';

// Конфигурация производства для каждого типа животного
const PRODUCTION_CONFIG = {
  chicken: {
    resourceType: 'egg',
    productionTime: 7200, // 2 часа в секундах
    value: 5,
    icon: '🥚'
  },
  duck: {
    resourceType: 'egg',
    productionTime: 10800, // 3 часа
    value: 7,
    icon: '🥚'
  },
  cow: {
    resourceType: 'milk',
    productionTime: 14400, // 4 часа
    value: 15,
    icon: '🥛'
  },
  goat: {
    resourceType: 'milk',
    productionTime: 10800, // 3 часа
    value: 10,
    icon: '🥛'
  },
  sheep: {
    resourceType: 'wool',
    productionTime: 86400, // 24 часа
    value: 25,
    icon: '🧶'
  }
};

export const useAnimalProduction = (animalType, animalId, happiness = 100, hunger = 100) => {
  const [productionState, setProductionState] = useState({
    isReady: false,
    timeRemaining: 0,
    resourceType: null,
    resourceValue: 0,
    icon: null
  });

  const timerRef = useRef(null);
  const config = PRODUCTION_CONFIG[animalType];

  useEffect(() => {
    if (!config) return;

    // Рассчитываем бонусы от счастья и сытости
    const happinessBonus = happiness >= 80 ? 0.2 : 0;
    const hungerBonus = hunger >= 80 ? 0.1 : 0;
    const totalBonus = 1 + happinessBonus + hungerBonus;

    const adjustedTime = config.productionTime / totalBonus;

    // Инициализация таймера
    let remainingTime = adjustedTime;

    const updateTimer = () => {
      remainingTime -= 1;

      if (remainingTime <= 0) {
        setProductionState({
          isReady: true,
          timeRemaining: 0,
          resourceType: config.resourceType,
          resourceValue: config.value,
          icon: config.icon
        });

        // Эмитим событие о готовности ресурса
        eventBus.emit(EVENTS.RESOURCE_READY, {
          animalId,
          animalType,
          resourceType: config.resourceType,
          value: config.value
        });

        clearInterval(timerRef.current);
      } else {
        setProductionState(prev => ({
          ...prev,
          timeRemaining: remainingTime,
          resourceType: config.resourceType,
          icon: config.icon
        }));
      }
    };

    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [animalType, animalId, happiness, hunger]);

  const collectResource = () => {
    if (!productionState.isReady) return null;

    const resource = {
      type: productionState.resourceType,
      value: productionState.resourceValue,
      animalId,
      animalType
    };

    // Эмитим событие о сборе ресурса
    eventBus.emit(EVENTS.RESOURCE_COLLECTED, resource);

    // Сбрасываем состояние и запускаем новый цикл
    setProductionState({
      isReady: false,
      timeRemaining: config.productionTime,
      resourceType: config.resourceType,
      resourceValue: config.value,
      icon: config.icon
    });

    return resource;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    } else if (minutes > 0) {
      return `${minutes}м ${secs}с`;
    } else {
      return `${secs}с`;
    }
  };

  return {
    ...productionState,
    canProduce: !!config,
    collectResource,
    formattedTime: formatTime(productionState.timeRemaining)
  };
};
