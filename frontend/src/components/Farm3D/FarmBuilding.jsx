import * as THREE from 'three';

const FarmBuilding = ({ position = [0, 0, 0], itemName = 'Постройка', isDecoration = false }) => {
  const getBuildingConfig = () => {
    const configs = {
      'Сарай': { color: '#8B4513', roofColor: '#A0522D', width: 2.5, height: 2, depth: 1.8, roof: 'triangular' },
      'Забор деревянный': { color: '#A0522D', roofColor: null, width: 2.2, height: 0.8, depth: 0.15, roof: 'none' },
      'Кормушка': { color: '#DEB887', roofColor: '#8B4513', width: 1.2, height: 0.8, depth: 0.8, roof: 'flat' },
      'Поилка': { color: '#4682B4', roofColor: null, width: 0.8, height: 0.6, depth: 0.8, roof: 'none' },
      'Мельница': { color: '#F4A460', roofColor: '#8B4513', width: 1.2, height: 2.5, depth: 1.2, roof: 'cone' },
      'Колодец': { color: '#696969', roofColor: '#8B4513', width: 1, height: 1.2, depth: 1, roof: 'flat' },
      'Стог сена': { color: '#DAA520', roofColor: '#B8860B', width: 1.2, height: 0.9, depth: 1.2, roof: 'round' },
      'Фонарь': { color: '#2F4F4F', roofColor: '#FFD700', width: 0.25, height: 1.2, depth: 0.25, roof: 'flat' },
      'Скамейка': { color: '#8B4513', roofColor: null, width: 1.2, height: 0.5, depth: 0.4, roof: 'none' },
      'Цветочная клумба': { color: '#8B4513', roofColor: '#FF69B4', width: 1, height: 0.4, depth: 1, roof: 'round' },
      'Пугало': { color: '#F0E68C', roofColor: '#8B4513', width: 0.5, height: 1.5, depth: 0.3, roof: 'flat' }
    };
    return configs[itemName] || { color: '#DEB887', roofColor: '#8B4513', width: 1.2, height: 1, depth: 1.2, roof: 'flat' };
  };

  const config = getBuildingConfig();

  return (
    <group position={position}>
      {/* Основа */}
      <mesh castShadow position={[0, config.height / 2, 0]}>
        <boxGeometry args={[config.width, config.height, config.depth]} />
        <meshStandardMaterial color={config.color} roughness={0.8} />
      </mesh>

      {/* Крыша */}
      {config.roof === 'triangular' && (
        <mesh castShadow position={[0, config.height + 0.3, 0]}>
          <coneGeometry args={[config.width * 0.8, 0.6, 4]} />
          <meshStandardMaterial color={config.roofColor} roughness={0.7} />
        </mesh>
      )}
      {config.roof === 'flat' && (
        <mesh castShadow position={[0, config.height + 0.1, 0]}>
          <boxGeometry args={[config.width * 1.1, 0.2, config.depth * 1.1]} />
          <meshStandardMaterial color={config.roofColor} roughness={0.7} />
        </mesh>
      )}
      {config.roof === 'cone' && (
        <mesh castShadow position={[0, config.height + 0.5, 0]}>
          <coneGeometry args={[config.width * 0.9, 0.8, 8]} />
          <meshStandardMaterial color={config.roofColor} roughness={0.7} />
        </mesh>
      )}
      {config.roof === 'round' && (
        <mesh castShadow position={[0, config.height + 0.2, 0]}>
          <sphereGeometry args={[config.width * 0.45, 12, 12]} />
          <meshStandardMaterial color={config.roofColor} roughness={0.7} />
        </mesh>
      )}

      {/* Специфичные детали */}
      {itemName === 'Поилка' && (
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
          <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
        </mesh>
      )}

      {itemName === 'Фонарь' && (
        <mesh position={[0, config.height * 0.7, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
      )}

      {itemName === 'Цветочная клумба' && (
        <>
          {[[-0.2, 0.6, -0.2], [0.2, 0.6, 0.2], [0.2, 0.6, -0.2], [-0.2, 0.6, 0.2]].map((pos, i) => (
            <mesh key={i} position={pos}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color={`hsl(${i * 90}, 80%, 60%)`} />
            </mesh>
          ))}
        </>
      )}

      {itemName === 'Пугало' && (
        <>
          <mesh position={[-0.3, 1, 0]} rotation={[0, 0, 0.7]}>
            <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0.3, 1, 0]} rotation={[0, 0, -0.7]}>
            <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        </>
      )}

    </group>
  );
};

export default FarmBuilding;
