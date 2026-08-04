import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import FarmBuilding from './FarmBuilding';

const FARM_BOUNDS = 9; // Животные не выходят за пределы 20x20 земли

// Конфигурации для каждого животного
const ANIMAL_CONFIGS = {
  pig: {
    color: '#ffb6c1',
    bodyColor: '#ffb6c1',
    darkColor: '#e8a5a5',
    snoutColor: '#ff9999',
    size: 0.62,
    bodyScale: [1.05, 0.85, 1.25],
    headSize: 0.38,
    ears: 'pointed',
    tail: 'curly',
    legs: 4,
    neck: 0.1
  },
  chicken: {
    color: '#fff8dc',
    bodyColor: '#fff8dc',
    darkColor: '#f0e68c',
    snoutColor: '#ff6b35',
    size: 0.28,
    bodyScale: [0.65, 0.85, 0.85],
    headSize: 0.18,
    ears: 'comb',
    tail: 'feathers',
    legs: 2,
    neck: 0.22,
    wings: true
  },
  cow: {
    color: '#f5f5f5',
    bodyColor: '#f5f5f5',
    darkColor: '#333333',
    snoutColor: '#ff9999',
    size: 1.0,
    bodyScale: [1.4, 1.1, 1.8],
    headSize: 0.55,
    ears: 'flat',
    tail: 'thin',
    legs: 4,
    neck: 0.2,
    spots: true,
    udder: true
  },
  horse: {
    color: '#8b4513',
    bodyColor: '#8b4513',
    darkColor: '#5c2e0c',
    snoutColor: '#3d3d3d',
    size: 0.95,
    bodyScale: [1.15, 1.2, 1.7],
    headSize: 0.5,
    ears: 'long',
    tail: 'hair',
    legs: 4,
    neck: 0.4
  },
  sheep: {
    color: '#fffaf0',
    bodyColor: '#fffaf0',
    darkColor: '#e6e0d4',
    snoutColor: '#333333',
    size: 0.58,
    bodyScale: [1.25, 1.0, 1.25],
    headSize: 0.32,
    ears: 'flat',
    tail: 'small',
    legs: 4,
    neck: 0.15,
    fluffy: true,
    wool: true
  },
  duck: {
    color: '#fff8dc',
    bodyColor: '#fff8dc',
    darkColor: '#90ee90',
    snoutColor: '#ff6b35',
    size: 0.25,
    bodyScale: [0.6, 0.7, 0.9],
    headSize: 0.16,
    ears: 'none',
    tail: 'feathers',
    legs: 2,
    neck: 0.18,
    wings: true
  },
  dog: {
    color: '#d2691e',
    bodyColor: '#d2691e',
    darkColor: '#8b4513',
    snoutColor: '#333333',
    size: 0.55,
    bodyScale: [1.0, 0.9, 1.3],
    headSize: 0.35,
    ears: 'floppy',
    tail: 'curly',
    legs: 4,
    neck: 0.22
  },
  cat: {
    color: '#ff8c00',
    bodyColor: '#ff8c00',
    darkColor: '#cc7000',
    snoutColor: '#ff9999',
    size: 0.38,
    bodyScale: [0.85, 0.75, 1.15],
    headSize: 0.28,
    ears: 'pointed',
    tail: 'long',
    legs: 4,
    neck: 0.2
  },
  goat: {
    color: '#f5deb3',
    bodyColor: '#f5deb3',
    darkColor: '#d2b48c',
    snoutColor: '#ff9999',
    size: 0.58,
    bodyScale: [1.0, 1.0, 1.25],
    headSize: 0.34,
    ears: 'flat',
    tail: 'short',
    legs: 4,
    neck: 0.25,
    horns: true,
    beard: true
  },
  donkey: {
    color: '#a9a9a9',
    bodyColor: '#a9a9a9',
    darkColor: '#696969',
    snoutColor: '#4a4a4a',
    size: 0.72,
    bodyScale: [1.05, 1.1, 1.45],
    headSize: 0.4,
    ears: 'long',
    tail: 'hair',
    legs: 4,
    neck: 0.3
  }
};

const ProceduralAnimal = ({ position = [0, 0, 0], animalData = null, accessoryData = null, onClick, bounds = FARM_BOUNDS }) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  const posRef = useRef(new THREE.Vector3(position[0], position[1], position[2]));
  const targetRef = useRef(new THREE.Vector3(position[0], position[1], position[2]));
  const waitTimeRef = useRef(0);
  const isMovingRef = useRef(false);
  const legRefs = useRef([]);

  const type = animalData?.type || 'pig';
  const config = ANIMAL_CONFIGS[type] || ANIMAL_CONFIGS.pig;
  const headY = config.size * (1.3 + config.neck);
  const labelFontSize = Math.max(10, Math.round(12 + config.size * 4));

  const getNewTarget = () => {
    const x = (Math.random() - 0.5) * 2 * bounds;
    const z = (Math.random() - 0.5) * 2 * bounds;
    return new THREE.Vector3(x, position[1], z);
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Обновляем позицию
    groupRef.current.position.x = posRef.current.x;
    groupRef.current.position.z = posRef.current.z;
    
    if (clicked) return;
    
    // Случайное движение
    const speed = 0.4; // медленно
    const dist = posRef.current.distanceTo(targetRef.current);
    
    if (isMovingRef.current) {
      // Двигаемся к цели
      const direction = new THREE.Vector3().subVectors(targetRef.current, posRef.current).normalize();
      const step = speed * delta;
      const walkTime = state.clock.elapsedTime * 6;
      
      if (dist < step) {
        posRef.current.copy(targetRef.current);
        isMovingRef.current = false;
        waitTimeRef.current = Math.random() * 2 + 1; // ждём 1-3 секунды
        // Сбрасываем поворот ног
        legRefs.current.forEach(leg => {
          if (leg) leg.rotation.x = 0;
        });
      } else {
        posRef.current.add(direction.multiplyScalar(step));
        // Поворачиваемся в направлении движения
        const angle = Math.atan2(direction.x, direction.z);
        groupRef.current.rotation.y = angle;
      }
      
      // Анимация ходьбы
      groupRef.current.position.y = posRef.current.y + Math.abs(Math.sin(walkTime)) * 0.08;
      groupRef.current.rotation.x = Math.sin(walkTime) * 0.05;
      
      // Анимация ног - попеременный шаг
      const legCount = config.legs === 2 ? 2 : 4;
      for (let i = 0; i < legCount; i++) {
        const leg = legRefs.current[i];
        if (leg) {
          const phase = (i % 2 === 0 ? 0 : Math.PI) + (Math.floor(i / 2) * 0.5);
          leg.rotation.x = Math.sin(walkTime + phase) * 0.25;
        }
      }
    } else {
      // Ждём перед новым движением
      waitTimeRef.current -= delta;
      if (waitTimeRef.current <= 0) {
        targetRef.current = getNewTarget();
        isMovingRef.current = true;
      }
      // Сбрасываем ноги и лёгкое покачивание
      legRefs.current.forEach(leg => {
        if (leg) leg.rotation.x = 0;
      });
      groupRef.current.position.y = posRef.current.y + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      groupRef.current.rotation.x = 0;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setClicked(true);
    if (onClick) onClick(animalData);
    
    const startTime = Date.now();
    const duration = 200;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (groupRef.current) {
        const scale = progress < 0.5 
          ? 1 - (0.2 * (progress * 2))
          : 0.8 + (0.2 * ((progress - 0.5) * 2));
        groupRef.current.scale.set(scale, scale, scale);
      }
      
      if (progress < 1) requestAnimationFrame(animate);
      else setClicked(false);
    };
    
    animate();
  };

  const color = useMemo(() => {
    if (!animalData) return config.bodyColor;
    if (animalData.isHungry || animalData.needsPetting) return config.darkColor;
    if (animalData.happiness > 80) return config.bodyColor;
    return config.bodyColor;
  }, [config, animalData]);

  const spots = config.spots && (
    <>
      {[[0.15, 0.1, 0.2], [-0.15, -0.1, -0.15], [0.1, 0.05, -0.25], [-0.1, 0.15, 0.25]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <circleGeometry args={[0.1, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}
    </>
  );

  const fluffy = config.fluffy && (
    <mesh position={[0, config.size, 0]}>
      <sphereGeometry args={[config.size * 1.05, 16, 16]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );

  // Геометрия ушей в зависимости от типа
  const renderEars = () => {
    const earColor = color;
    switch (config.ears) {
      case 'pointed':
        return (
          <>
            <mesh castShadow position={[-0.22, config.headSize * 1.5, 0]} rotation={[0, 0, -0.5]}>
              <coneGeometry args={[0.1, 0.25, 8]} />
              <meshStandardMaterial color={earColor} />
            </mesh>
            <mesh castShadow position={[0.22, config.headSize * 1.5, 0]} rotation={[0, 0, 0.5]}>
              <coneGeometry args={[0.1, 0.25, 8]} />
              <meshStandardMaterial color={earColor} />
            </mesh>
          </>
        );
      case 'floppy':
        return (
          <>
            <mesh castShadow position={[-0.25, config.headSize * 1.2, -0.05]} rotation={[0, 0, -0.8]}>
              <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
              <meshStandardMaterial color={earColor} />
            </mesh>
            <mesh castShadow position={[0.25, config.headSize * 1.2, -0.05]} rotation={[0, 0, 0.8]}>
              <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
              <meshStandardMaterial color={earColor} />
            </mesh>
          </>
        );
      case 'long':
        return (
          <>
            <mesh castShadow position={[-0.18, config.headSize * 1.4, 0]} rotation={[0, 0, -0.2]}>
              <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
              <meshStandardMaterial color={earColor} />
            </mesh>
            <mesh castShadow position={[0.18, config.headSize * 1.4, 0]} rotation={[0, 0, 0.2]}>
              <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
              <meshStandardMaterial color={earColor} />
            </mesh>
          </>
        );
      case 'flat':
        return (
          <>
            <mesh castShadow position={[-0.28, config.headSize * 1.1, 0]} rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.1, 0.05, 8]} rotation={[0, 0, Math.PI / 2]} />
              <meshStandardMaterial color={earColor} />
            </mesh>
            <mesh castShadow position={[0.28, config.headSize * 1.1, 0]} rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.1, 0.05, 8]} rotation={[0, 0, Math.PI / 2]} />
              <meshStandardMaterial color={earColor} />
            </mesh>
          </>
        );
      case 'comb':
        return (
          <mesh castShadow position={[0, config.headSize * 1.5, -0.05]}>
            <boxGeometry args={[0.1, 0.2, 0.05]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
        );
      default:
        return null;
    }
  };

  // Рога
  const horns = config.horns && (
    <>
      <mesh castShadow position={[-0.12, config.headSize * 1.6, -0.05]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.04, 0.2, 8]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      <mesh castShadow position={[0.12, config.headSize * 1.6, -0.05]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.04, 0.2, 8]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
    </>
  );

  // Дополнительные детали
  const wings = config.wings && (
    <>
      <mesh castShadow position={[-config.size * 0.65, config.size * 1.15, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[config.size * 0.22, config.size * 0.08, config.size * 0.5]} />
        <meshStandardMaterial color={config.darkColor} />
      </mesh>
      <mesh castShadow position={[config.size * 0.65, config.size * 1.15, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[config.size * 0.22, config.size * 0.08, config.size * 0.5]} />
        <meshStandardMaterial color={config.darkColor} />
      </mesh>
    </>
  );

  const udder = config.udder && (
    <mesh castShadow position={[0, config.size * 0.75, -config.size * 0.25]}>
      <sphereGeometry args={[config.size * 0.28, 12, 12]} />
      <meshStandardMaterial color='#ffacc7' />
    </mesh>
  );

  const beard = config.beard && (
    <mesh castShadow position={[0, config.size * (1.05 + config.neck), config.size * (0.65 + config.headSize * 0.45)]}>
      <coneGeometry args={[0.05, 0.12, 8]} rotation={[Math.PI / 2, 0, 0]} />
      <meshStandardMaterial color='#d2b48c' />
    </mesh>
  );

  // Хвост
  const renderTail = () => {
    switch (config.tail) {
      case 'curly':
        return (
          <mesh castShadow position={[0, config.size * 0.9, -config.size * 1]} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.1, 0.03, 6, 12, Math.PI * 1.5]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      case 'long':
        return (
          <mesh castShadow position={[0, config.size * 0.8, -config.size * 0.9]} rotation={[0.5, 0, 0]}>
            <capsuleGeometry args={[0.05, 0.4, 4, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      case 'hair':
        return (
          <mesh castShadow position={[0, config.size * 0.6, -config.size * 1.05]}>
            <boxGeometry args={[0.15, 0.35, 0.05]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>
        );
      case 'feathers':
        return (
          <mesh castShadow position={[0, config.size * 0.6, -config.size * 0.8]}>
            <coneGeometry args={[0.15, 0.3, 8]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color={config.darkColor} />
          </mesh>
        );
      default:
        return null;
    }
  };

  // Ноги
  const legs = [];
  const legPositions = config.legs === 2 
    ? [[-0.15, 0, 0.15], [0.15, 0, 0.15]]
    : [[-0.25, 0, 0.25], [0.25, 0, 0.25], [-0.25, 0, -0.25], [0.25, 0, -0.25]];
    
  for (let i = 0; i < legPositions.length; i++) {
    const pos = legPositions[i];
    legs.push(
      <group
        key={i}
        position={pos}
        ref={(el) => { legRefs.current[i] = el; }}
      >
        <mesh castShadow position={[0, config.size * 0.25, 0]}>
          <cylinderGeometry args={[0.08, 0.06, config.size * 0.5, 8]} />
          <meshStandardMaterial color={config.darkColor} />
        </mesh>
        {config.legs === 2 ? (
          <mesh castShadow position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.12, 0.1, 0.05, 8]} />
            <meshStandardMaterial color={config.snoutColor} />
          </mesh>
        ) : (
          <mesh castShadow position={[0, 0.02, 0]}>
            <boxGeometry args={[0.1, 0.04, 0.12]} />
            <meshStandardMaterial color="#3d3d3d" />
          </mesh>
        )}
      </group>
    );
  }

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Тело */}
      <mesh castShadow position={[0, config.size * 1.1, 0]}>
        <sphereGeometry args={[config.size, 16, 16]} scale={config.bodyScale} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.1}
          emissive={hovered ? '#ff69b4' : '#000000'}
          emissiveIntensity={hovered ? 0.15 : 0}
        />
      </mesh>

      {fluffy}
      {spots}

      {/* Голова */}
      <mesh castShadow position={[0, config.size * (1.3 + config.neck), config.size * 0.65]}>
        <sphereGeometry args={[config.headSize, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Шея для птиц/лошадей */}
      {config.neck > 0.2 && (
        <mesh castShadow position={[0, config.size * (1.1 + config.neck / 2), config.size * 0.4]}>
          <cylinderGeometry args={[config.headSize * 0.6, config.headSize * 0.6, config.size * 0.4, 8]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      )}

      {/* Пятачок/клюв */}
      <mesh castShadow position={[0, config.size * (1.25 + config.neck), config.size * (0.65 + config.headSize * 0.6)]}>
        {['chicken', 'duck'].includes(type) ? (
          <coneGeometry args={[0.08, 0.15, 8]} rotation={[Math.PI / 2, 0, 0]} />
        ) : (
          <cylinderGeometry args={[config.headSize * 0.3, config.headSize * 0.3, 0.08, 16]} />
        )}
        <meshStandardMaterial color={config.snoutColor} />
      </mesh>

      {/* Глаза */}
      <mesh castShadow position={[-config.headSize * 0.3, config.size * (1.45 + config.neck), config.size * 0.55]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh castShadow position={[config.headSize * 0.3, config.size * (1.45 + config.neck), config.size * 0.55]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {renderEars()}
      {horns}
      {renderTail()}
      {legs}
      {wings}
      {udder}
      {beard}

      {/* Имя животного */}
      {animalData?.name && (
        <Html position={[0, headY + 0.5, 0]} center distanceFactor={10}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: `${labelFontSize}px`,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none'
          }}>
            {animalData.name}
          </div>
        </Html>
      )}

      {/* Индикатор состояния */}
      {(animalData?.isHungry || animalData?.needsPetting) && (
        <Html position={[0, headY + 0.9, 0]} center distanceFactor={10}>
          <div style={{ fontSize: `${Math.max(16, Math.round(24 * config.size))}px` }}>
            {animalData.isHungry ? '😢' : ''}
            {animalData.needsPetting ? '😔' : ''}
          </div>
        </Html>
      )}

      {/* Аксессуар */}
      {accessoryData && (
        <group position={[0, headY + 0.35, 0]} scale={0.7}>
          <FarmBuilding itemName={accessoryData.item_name} />
        </group>
      )}
    </group>
  );
};

export default ProceduralAnimal;
