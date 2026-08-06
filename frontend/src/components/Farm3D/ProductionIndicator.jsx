import { useState } from 'react';
import { Html } from '@react-three/drei';

const formatTime = (seconds) => {
  if (typeof seconds !== 'number' || seconds <= 0) return '0с';
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

const ProductionIndicator = ({
  animalType,
  animalId,
  production,
  position,
  onCollect
}) => {
  const [isCollecting, setIsCollecting] = useState(false);

  if (!production || !production.canProduce) return null;

  const handleClick = async (e) => {
    e.stopPropagation();
    if (isCollecting || !production.isReady || !onCollect) return;

    const resource = {
      type: production.resourceType,
      value: production.value,
      animalId,
      animalType
    };

    setIsCollecting(true);
    try {
      await onCollect(resource);
    } catch (error) {
      console.error('Error collecting resource:', error);
    } finally {
      setIsCollecting(false);
    }
  };

  const getLabel = () => {
    if (isCollecting) return '...';
    if (production.isReady) return 'Готово!';
    return formatTime(production.timeRemaining);
  };

  return (
    <Html position={position} center distanceFactor={10}>
      <div
        onClick={handleClick}
        style={{
          background: production.isReady && !isCollecting ? '#4CAF50' : '#FFF8E7',
          color: production.isReady && !isCollecting ? '#FFFFFF' : '#5D4037',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 'bold',
          fontFamily: '"Comic Sans MS", "Fredoka", cursive, sans-serif',
          whiteSpace: 'nowrap',
          cursor: production.isReady && !isCollecting ? 'pointer' : 'default',
          userSelect: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          border: production.isReady && !isCollecting ? '2px solid #45a049' : '1px solid rgba(255,255,255,0.6)',
          transition: 'all 0.3s ease',
          transform: production.isReady && !isCollecting ? 'scale(1.1)' : 'scale(1)',
          animation: production.isReady && !isCollecting ? 'pulse 1.5s infinite' : 'none'
        }}
      >
        {getLabel()}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </Html>
  );
};

export default ProductionIndicator;
