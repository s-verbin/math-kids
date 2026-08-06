import { useState, useEffect } from 'react';
import eventBus, { EVENTS } from '../../../services/EventBus';
import Resource from '../Resource';

const ResourcesManager = ({ animals }) => {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    // Слушаем события появления ресурсов
    const unsubscribeReady = eventBus.on(EVENTS.RESOURCE_READY, (data) => {
      const animal = animals.find(a => a.id === data.animalId);
      if (!animal) return;

      // Добавляем ресурс рядом с животным
      setResources(prev => [...prev, {
        id: `${data.animalId}-${Date.now()}`,
        type: data.resourceType,
        animalId: data.animalId,
        position: [animal.position[0] + 0.5, 0.1, animal.position[2] + 0.5],
        value: data.value
      }]);
    });

    // Слушаем события сбора ресурсов
    const unsubscribeCollected = eventBus.on(EVENTS.RESOURCE_COLLECTED, (data) => {
      // Удаляем собранный ресурс
      setResources(prev => prev.filter(r => r.animalId !== data.animalId));
    });

    return () => {
      unsubscribeReady();
      unsubscribeCollected();
    };
  }, [animals]);

  return (
    <group>
      {resources.map(resource => (
        <Resource
          key={resource.id}
          type={resource.type}
          position={resource.position}
          value={resource.value}
        />
      ))}
    </group>
  );
};

export default ResourcesManager;
