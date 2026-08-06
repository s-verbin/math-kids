import { useState, useEffect, useRef, useCallback } from 'react';
import { productionAPI } from '../services/api';

// Конфигурация производства — используем в основном для иконок/fallback
const PRODUCTION_CONFIG = {
  chicken: {
    resourceType: 'egg',
    productionTime: 7200,
    value: 5,
    icon: '🥚'
  },
  duck: {
    resourceType: 'egg',
    productionTime: 10800,
    value: 7,
    icon: '🥚'
  },
  cow: {
    resourceType: 'milk',
    productionTime: 14400,
    value: 15,
    icon: '🥛'
  },
  goat: {
    resourceType: 'milk',
    productionTime: 10800,
    value: 10,
    icon: '🥛'
  },
  sheep: {
    resourceType: 'wool',
    productionTime: 86400,
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
    icon: null,
    canProduce: false,
    isLoading: true
  });

  const tickRef = useRef(null);
  const syncRef = useRef(null);
  const config = PRODUCTION_CONFIG[animalType];

  const fetchStatus = useCallback(async () => {
    if (!config || !animalId) return;
    try {
      const response = await productionAPI.getStatus();
      const animal = response.data.production.find(a => a.animalId === animalId);

      if (animal && animal.canProduce) {
        setProductionState({
          isReady: animal.isReady,
          timeRemaining: animal.timeRemaining || 0,
          resourceType: animal.resourceType,
          resourceValue: animal.value,
          icon: config.icon,
          canProduce: true,
          isLoading: false
        });
      } else {
        setProductionState(prev => ({ ...prev, canProduce: false, isLoading: false }));
      }
    } catch (error) {
      console.error('Error fetching production status:', error);
      setProductionState(prev => ({ ...prev, isLoading: false }));
    }
  }, [config, animalId]);

  useEffect(() => {
    setProductionState(prev => ({ ...prev, isLoading: true }));
    fetchStatus();

    // Синхронизация с бэкендом каждые 5 секунд (важно для авто-сбора)
    syncRef.current = setInterval(fetchStatus, 5000);

    // Локальный тик раз в секунду для плавного отсчёта
    tickRef.current = setInterval(() => {
      setProductionState(prev => {
        if (prev.isReady || prev.timeRemaining <= 0) return prev;
        return { ...prev, timeRemaining: Math.max(0, prev.timeRemaining - 1) };
      });
    }, 1000);

    return () => {
      clearInterval(tickRef.current);
      clearInterval(syncRef.current);
    };
  }, [fetchStatus]);

  const collectResource = () => {
    if (!productionState.isReady) return null;

    const resource = {
      type: productionState.resourceType,
      value: productionState.resourceValue,
      animalId,
      animalType
    };

    // Запрещаем повторный клик до следующего синка
    setProductionState(prev => ({ ...prev, isReady: false, timeRemaining: 0 }));

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
    collectResource,
    refresh: fetchStatus,
    formattedTime: formatTime(productionState.timeRemaining)
  };
};
