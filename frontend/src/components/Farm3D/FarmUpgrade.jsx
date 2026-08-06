import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const FarmUpgrade = ({ itemName, position = [0, 0, 0] }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    groupRef.current.position.y = position[1] + Math.sin(time * 2) * 0.02;
  });

  const getUpgradeModel = () => {
    switch (itemName) {
      case 'Автосборщик ресурсов':
        return <AutoCollector />;
      case 'Инкубатор':
        return <Incubator />;
      case 'Доильный аппарат':
        return <MilkingMachine />;
      case 'Стригальная машина':
        return <ShearingMachine />;
      default:
        return null;
    }
  };

  const getGlowColor = () => {
    switch (itemName) {
      case 'Автосборщик ресурсов':
        return '#4CAF50';
      case 'Инкубатор':
        return '#FFD54F';
      case 'Доильный аппарат':
        return '#C0C0C0';
      case 'Стригальная машина':
        return '#FF8C00';
      default:
        return '#FFFFFF';
    }
  };

  const getShortName = () => {
    switch (itemName) {
      case 'Автосборщик ресурсов':
        return 'Автосбор';
      case 'Инкубатор':
        return 'Инкубатор';
      case 'Доильный аппарат':
        return 'Доилка';
      case 'Стригальная машина':
        return 'Стригалка';
      default:
        return itemName;
    }
  };

  return (
    <group ref={groupRef} position={position} scale={0.8}>
      {/* Свечение под улучшением */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.6, 32]} />
        <meshBasicMaterial color={getGlowColor()} transparent opacity={0.3} />
      </mesh>

      {getUpgradeModel()}

      {/* Метка */}
      <Html position={[0, 1.2, 0]} center distanceFactor={10}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#333',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: `0 0 10px ${getGlowColor()}80`,
          whiteSpace: 'nowrap',
          border: `2px solid ${getGlowColor()}`,
          pointerEvents: 'none'
        }}>
          ⚡ {getShortName()}
        </div>
      </Html>
    </group>
  );
};

// Автосборщик — робот с корзиной
const AutoCollector = () => {
  return (
    <group>
      {/* Колёса */}
      {[[-0.3, 0.1, -0.2], [0.3, 0.1, -0.2], [-0.3, 0.1, 0.2], [0.3, 0.1, 0.2]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 12]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}

      {/* Корпус */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.5, 0.35, 0.4]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>

      {/* Корзина для ресурсов */}
      <mesh position={[0.25, 0.45, 0]} castShadow>
        <boxGeometry args={[0.25, 0.2, 0.3]} />
        <meshStandardMaterial color="#8B4513" transparent opacity={0.6} />
      </mesh>

      {/* Глаз-сенсор */}
      <mesh position={[0.12, 0.4, 0.18]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={0.3} />
      </mesh>

      {/* Рука-манипулятор */}
      <mesh position={[-0.25, 0.4, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.35, 0.05, 0.05]} />
        <meshStandardMaterial color="#C0C0C0" />
      </mesh>

      {/* Антенна */}
      <mesh position={[-0.15, 0.55, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.25, 6]} />
        <meshStandardMaterial color="#C0C0C0" />
      </mesh>
      <mesh position={[-0.15, 0.68, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.3} />
      </mesh>

      {/* Лейбл */}
      <mesh position={[0, 0.52, 0.21]}>
        <planeGeometry args={[0.3, 0.1]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
};

// Инкубатор — яйца в стеклянной камере
const Incubator = () => {
  return (
    <group>
      {/* Основание */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.45, 0.1, 0.45]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* Стеклянная камера */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.4]} />
        <meshStandardMaterial color="#E0F7FA" transparent opacity={0.3} />
      </mesh>

      {/* Яйца внутри */}
      {[[-0.1, 0.15, -0.1], [0.1, 0.15, 0.1], [0, 0.15, 0]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color="#FFF8DC" />
        </mesh>
      ))}

      {/* Контрольная панель */}
      <mesh position={[0.22, 0.3, 0]}>
        <boxGeometry args={[0.02, 0.2, 0.3]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Индикаторы */}
      {[[0.23, 0.35, -0.08], [0.23, 0.35, 0], [0.23, 0.35, 0.08]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial
            color={i === 0 ? '#FF0000' : i === 1 ? '#00FF00' : '#0000FF'}
            emissive={i === 0 ? '#FF0000' : i === 1 ? '#00FF00' : '#0000FF'}
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
};

// Доильный аппарат — бак с трубками
const MilkingMachine = () => {
  return (
    <group>
      {/* Металлический бак */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Крышка бака */}
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.05, 16]} />
        <meshStandardMaterial color="#A9A9A9" metalness={0.6} />
      </mesh>

      {/* Датчик уровня */}
      <mesh position={[0.15, 0.35, 0.05]}>
        <boxGeometry args={[0.02, 0.4, 0.02]} />
        <meshBasicMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>

      {/* Трубки */}
      {[[-0.25, 0.4, 0], [0.25, 0.4, 0]].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, 0, i === 0 ? -0.5 : 0.5]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      ))}

      {/* Ножки */}
      {[[-0.15, 0.05, -0.15], [0.15, 0.05, -0.15], [-0.15, 0.05, 0.15], [0.15, 0.05, 0.15]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.02, 0.02, 0.1, 6]} />
          <meshStandardMaterial color="#696969" />
        </mesh>
      ))}
    </group>
  );
};

// Стригальная машина — станция с катушками
const ShearingMachine = () => {
  return (
    <group>
      {/* Основание */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.45, 0.1, 0.35]} />
        <meshStandardMaterial color="#FF8C00" />
      </mesh>

      {/* Главный корпус */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.3]} />
        <meshStandardMaterial color="#FF8C00" />
      </mesh>

      {/* Бобина шерсти */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.2, 16]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>

      {/* Нитки на бобине */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, 0.55, 0]} rotation={[0, (i * Math.PI) / 4, 0]}>
          <torusGeometry args={[0.15, 0.01, 4, 12]} />
          <meshStandardMaterial color="#E8E8D0" />
        </mesh>
      ))}

      {/* Ножницы/лезвия */}
      <mesh position={[0.22, 0.3, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.2, 0.05, 0.02]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.7} />
      </mesh>
      <mesh position={[0.22, 0.28, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.2, 0.05, 0.02]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.7} />
      </mesh>
    </group>
  );
};

export default FarmUpgrade;
