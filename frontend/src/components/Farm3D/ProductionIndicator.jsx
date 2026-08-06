import { Html } from '@react-three/drei';
import { useAnimalProduction } from '../../hooks/useAnimalProduction';

const ProductionIndicator = ({ animalType, animalId, happiness, hunger, position, onCollect }) => {
  const production = useAnimalProduction(animalType, animalId, happiness, hunger);

  if (!production.canProduce) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    if (production.isReady && onCollect) {
      const resource = production.collectResource();
      onCollect(resource);
    }
  };

  return (
    <Html position={position} center distanceFactor={10}>
      <div
        onClick={handleClick}
        style={{
          background: production.isReady ? '#4CAF50' : '#FFF8E7',
          color: production.isReady ? '#FFFFFF' : '#5D4037',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 'bold',
          fontFamily: '"Comic Sans MS", "Fredoka", cursive, sans-serif',
          whiteSpace: 'nowrap',
          cursor: production.isReady ? 'pointer' : 'default',
          userSelect: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          border: production.isReady ? '2px solid #45a049' : '1px solid rgba(255,255,255,0.6)',
          transition: 'all 0.3s ease',
          transform: production.isReady ? 'scale(1.1)' : 'scale(1)',
          animation: production.isReady ? 'pulse 1.5s infinite' : 'none'
        }}
      >
        {production.icon} {production.isReady ? 'Готово!' : production.formattedTime}
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
