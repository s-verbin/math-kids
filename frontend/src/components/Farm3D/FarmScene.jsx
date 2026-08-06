import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import Ground from './Ground';
import Background from './Background';
import ProceduralAnimal from './ProceduralAnimal';
import FarmBuilding from './FarmBuilding';
import Draggable from './Draggable';
import ResourcesManager from './containers/ResourcesManager';
import { productionAPI } from '../../services/api';
import eventBus, { EVENTS } from '../../services/EventBus';

const Fence = ({ landCount }) => {
  // Базовая земля 20x20, каждый участок добавляет ~7.5 в радиус
  const baseSize = 10; // половина от 20x20
  const extraSize = Math.ceil(Math.sqrt(landCount)) * 5; // расширение в зависимости от участков
  const half = baseSize + extraSize + 0.5; // небольшой отступ за границу
  
  const segmentCount = Math.max(12, Math.floor(half / 1.5));
  const step = (half * 2) / segmentCount;
  const posts = [];
  for (let i = 0; i <= segmentCount; i++) {
    const p = -half + i * step;
    posts.push([-half, p], [half, p], [p, -half], [p, half]);
  }
  const rails = [
    [-half, -half, half, -half],
    [half, -half, half, half],
    [-half, half, half, half],
    [-half, -half, -half, half]
  ];
  return (
    <group>
      {rails.map((r, i) => (
        <mesh key={`rail-${i}`} castShadow position={[(r[0] + r[2]) / 2, 0.45, (r[1] + r[3]) / 2]}>
          <boxGeometry args={[Math.max(0.1, Math.abs(r[2] - r[0])), 0.04, Math.max(0.1, Math.abs(r[3] - r[1]))]} />
          <meshStandardMaterial color='#A0522D' roughness={0.9} />
        </mesh>
      ))}
      {posts.map((p, i) => (
        <mesh key={`post-${i}`} castShadow position={[p[0], 0.35, p[1]]}>
          <boxGeometry args={[0.12, 0.7, 0.12]} />
          <meshStandardMaterial color='#8B4513' roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

const Path = ({ bounds }) => {
  return (
    <mesh position={[0, 0.01, bounds * 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.2, bounds]} />
      <meshStandardMaterial color='#D2B48C' roughness={1} />
    </mesh>
  );
};

const Critters = ({ count = 12 }) => {
  const refs = useRef([]);
  const wingRefs = useRef([]);
  const data = useMemo(() => Array.from({ length: count }, (_, i) => {
    const type = i % 3 === 0 ? 'bird' : i % 3 === 1 ? 'bee' : 'fly';
    const center = {
      x: (Math.random() - 0.5) * 10,
      y: 2 + Math.random() * 3,
      z: (Math.random() - 0.5) * 10
    };
    const speed = 0.4 + Math.random() * 0.6;
    const radius = 0.6 + Math.random() * 1.5;
    const phase = Math.random() * Math.PI * 2;
    return { type, center, speed, radius, phase };
  }), [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((ref, i) => {
      if (!ref) return;
      const d = data[i];
      const x = d.center.x + Math.cos(t * d.speed + d.phase) * d.radius;
      const z = d.center.z + Math.sin(t * d.speed + d.phase) * d.radius;
      const y = d.center.y + Math.sin(t * d.speed * 1.5 + d.phase) * 0.3;
      const dx = -Math.sin(t * d.speed + d.phase) * d.radius * d.speed;
      const dz = Math.cos(t * d.speed + d.phase) * d.radius * d.speed;
      ref.position.set(x, y, z);
      ref.rotation.y = Math.atan2(dx, dz);
      if (d.type === 'bird' && wingRefs.current[i]) {
        wingRefs.current[i].rotation.z = Math.sin(t * 12) * 0.5;
      }
    });
  });

  return (
    <group>
      {data.map((d, i) => (
        <group key={i} ref={el => refs.current[i] = el}>
          {d.type === 'bird' ? (
            <>
              <mesh castShadow position={[0, 0, 0]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color='#ffffff' />
              </mesh>
              <mesh castShadow position={[0.1, 0.02, 0]}>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshStandardMaterial color='#ffffff' />
              </mesh>
              <mesh castShadow position={[0.14, 0.02, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <coneGeometry args={[0.018, 0.07, 8]} />
                <meshStandardMaterial color='#FF9900' />
              </mesh>
              <mesh position={[0.07, 0.03, 0.04]}>
                <sphereGeometry args={[0.01, 4, 4]} />
                <meshStandardMaterial color='#000000' />
              </mesh>
              <mesh position={[0.07, 0.03, -0.04]}>
                <sphereGeometry args={[0.01, 4, 4]} />
                <meshStandardMaterial color='#000000' />
              </mesh>
              <group ref={el => wingRefs.current[i] = el} position={[0, 0.04, 0]}>
                <mesh position={[-0.08, 0, 0]}>
                  <boxGeometry args={[0.14, 0.01, 0.06]} />
                  <meshStandardMaterial color='#ffffff' transparent opacity={0.9} />
                </mesh>
                <mesh position={[0.08, 0, 0]}>
                  <boxGeometry args={[0.14, 0.01, 0.06]} />
                  <meshStandardMaterial color='#ffffff' transparent opacity={0.9} />
                </mesh>
              </group>
            </>
          ) : d.type === 'bee' ? (
            <>
              <mesh>
                <sphereGeometry args={[0.04, 6, 6]} />
                <meshStandardMaterial color='#FFD700' />
              </mesh>
              <mesh position={[-0.05, 0.02, 0]}>
                <boxGeometry args={[0.07, 0.01, 0.03]} />
                <meshStandardMaterial color='white' transparent opacity={0.6} />
              </mesh>
              <mesh position={[0.05, 0.02, 0]}>
                <boxGeometry args={[0.07, 0.01, 0.03]} />
                <meshStandardMaterial color='white' transparent opacity={0.6} />
              </mesh>
            </>
          ) : (
            <mesh>
              <sphereGeometry args={[0.02, 4, 4]} />
              <meshStandardMaterial color='#888888' />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

const Poop = ({ data, onClean }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    onClean();
  };

  return (
    <group position={[data.x, 0, data.z]}>
      <mesh
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerDown={handleClick}
        position={[0, data.size * 0.3, 0]}
        scale={[1.2, 0.6, 1.2]}
      >
        <sphereGeometry args={[data.size * 0.4, 10, 10]} />
        <meshStandardMaterial color='#3E2723' roughness={0.9} metalness={0.05} />
      </mesh>
      <Html position={[0, 0.85, 0]} center distanceFactor={10}>
        <div
          style={{
            background: '#FFF8E7',
            color: '#5D4037',
            border: 'none',
            borderRadius: '12px',
            padding: '1px 5px',
            fontSize: '10px',
            fontFamily: '"Comic Sans MS", cursive, sans-serif',
            pointerEvents: 'none',
            userSelect: 'none',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
          }}
        >
          🧹 +1
        </div>
      </Html>
    </group>
  );
};

const Plants = ({ positions, eatenRef }) => {
  const refs = useRef([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    refs.current.forEach((ref, i) => {
      if (!ref) return;
      if (eatenRef.current.has(i)) {
        const s = Math.max(0, ref.scale.x - 0.05);
        ref.scale.set(s, s, s);
        return;
      }
      const growth = 0.7 + 0.3 * (0.5 + 0.5 * Math.sin(time * 0.5 + i));
      ref.scale.set(growth, growth, growth);
    });
  });

  return (
    <group>
      {positions.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh ref={el => refs.current[i] = el} position={[0, p.isFlower ? 0.12 : 0.08, 0]} castShadow>
            {p.isFlower ? (
              <cylinderGeometry args={[0.02, 0.02, 0.24, 6]} />
            ) : (
              <coneGeometry args={[0.05, 0.2, 5]} />
            )}
            <meshStandardMaterial color={p.isFlower ? '#228B22' : '#32CD32'} />
          </mesh>
          {p.isFlower && (
            <mesh position={[0, 0.3, 0]} castShadow>
              <sphereGeometry args={[0.07, 6, 6]} />
              <meshStandardMaterial color={p.color} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

const FarmScene = ({ animals = [], inventory = [], onPetAnimal, onCleanPoop, onDataUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPositions, setDraggedPositions] = useState({});
  const [poops, setPoops] = useState([]);
  const landCount = inventory.filter(item => item.category === 'land').reduce((sum, item) => sum + (item.quantity || 1), 0);
  const animalBounds = 9 + landCount * 3;
  const buildingItems = inventory.filter(item => item.category === 'building');
  const decorationItems = inventory.filter(item => item.category === 'decoration');
  const accessoryItems = inventory.filter(item => item.category === 'accessory');

  const obstacles = useMemo(() => {
    const positions = [
      [-3, 0, -4],
      [3, 0, -4],
      [-3, 0, 4],
      [3, 0, 4],
      [-4, 0, 0],
      [4, 0, 0]
    ];
    const list = [];
    buildingItems.forEach((item, i) => {
      const basePos = positions[i % positions.length];
      const finalPos = draggedPositions[item.id] || basePos;
      list.push(new THREE.Vector3(finalPos[0], finalPos[1], finalPos[2]));
    });
    decorationItems.forEach((item, i) => {
      const basePos = positions[(i + buildingItems.length) % positions.length];
      const finalPos = draggedPositions[item.id] || [basePos[0] + i * 0.3, 0, basePos[2] + i * 0.3];
      list.push(new THREE.Vector3(finalPos[0], finalPos[1], finalPos[2]));
    });
    return list;
  }, [buildingItems, decorationItems, draggedPositions]);

  const addPoop = (poop) => {
    setPoops(prev => [...prev, { id: Date.now() + Math.random(), ...poop }]);
  };

  const removePoop = async (id) => {
    if (onCleanPoop) {
      await onCleanPoop(id);
    }
    setPoops(prev => prev.filter(p => p.id !== id));
  };

  const plantPositions = useMemo(() => {
    const plantCount = 60 + landCount * 20;
    const spread = animalBounds * 1.6;
    return Array.from({ length: plantCount }, (_, i) => {
      const x = (Math.random() - 0.5) * spread;
      const z = (Math.random() - 0.5) * spread;
      const isFlower = Math.random() > 0.7;
      const colors = ['#FF69B4', '#FFD700', '#9370DB', '#FFA500'];
      return { x, z, isFlower, color: isFlower ? colors[Math.floor(Math.random() * colors.length)] : null };
    });
  }, [landCount, animalBounds]);

  const eatenRef = useRef(new Set());

  const handleResourceCollect = async (resource) => {
    if (!resource) return;
    
    try {
      const response = await productionAPI.collectResource(resource.animalId);
      
      // Эмитим событие для обновления UI
      eventBus.emit(EVENTS.COINS_EARNED, { amount: resource.value });
      
      // Обновляем данные фермы
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      console.error('Error collecting resource:', error);
    }
  };

  return (
    <div className="w-full h-[500px] bg-gradient-to-b from-sky-200 to-sky-100 rounded-xl overflow-hidden shadow-lg">
      <Canvas shadows>
        <Suspense fallback={null}>
          {/* Camera */}
          <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />
          
          {/* Controls - отключаем при перетаскивании */}
          <OrbitControls
            enabled={!isDragging}
            enablePan={false}
            enableZoom={true}
            minDistance={8}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            target={[0, 0, 0]}
          />

          {/* Освещение */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <hemisphereLight
            skyColor="#87CEEB"
            groundColor="#8B7355"
            intensity={0.3}
          />

          {/* Фон - поля и горы */}
          <Background />

          {/* Земля - расширяется с покупкой участков */}
          <Ground landCount={landCount} />

          {/* Забор и тропинки */}
          <Fence landCount={landCount} />
          <Path bounds={animalBounds} />

          {/* Растения */}
          <Plants positions={plantPositions} eatenRef={eatenRef} />

          {/* Птицы, пчёлы и мухи */}
          <Critters count={15} />

          {/* Какашки */}
          {poops.map(p => (
            <Poop key={p.id} data={p} onClean={() => removePoop(p.id)} />
          ))}

          {/* Постройки */}
          {buildingItems.map((item, index) => {
            const positions = [
              [-3, 0, -4],
              [3, 0, -4],
              [-3, 0, 4],
              [3, 0, 4],
              [-6, 0, -2],
              [6, 0, -2]
            ];
            const pos = draggedPositions[item.id] || positions[index % positions.length];
            return (
              <Draggable
                key={`building-${item.id}-${index}`}
                position={pos}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(newPos) => {
                  setIsDragging(false);
                  setDraggedPositions(prev => ({ ...prev, [item.id]: newPos }));
                }}
              >
                <FarmBuilding
                  position={[0, 0, 0]}
                  itemName={item.item_name}
                />
              </Draggable>
            );
          })}

          {/* Декорации */}
          {decorationItems.map((item, index) => {
            const positions = [
              [-1, 0, -6],
              [1, 0, -6],
              [-4, 0, 1],
              [4, 0, 1],
              [-2, 0, 6],
              [2, 0, 6]
            ];
            const pos = draggedPositions[item.id] || positions[index % positions.length];
            return (
              <Draggable
                key={`decor-${item.id}-${index}`}
                position={pos}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(newPos) => {
                  setIsDragging(false);
                  setDraggedPositions(prev => ({ ...prev, [item.id]: newPos }));
                }}
              >
                <FarmBuilding
                  position={[0, 0, 0]}
                  itemName={item.item_name}
                  isDecoration={true}
                />
              </Draggable>
            );
          })}

          {/* Животные */}
          {animals.map((animal, index) => {
            const count = animals.length;
            const angle = (index / (count || 1)) * Math.PI * 2;
            const radius = 3.5;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const accessoryData = accessoryItems[index % Math.max(accessoryItems.length, 1)] || null;
            
            return (
              <ProceduralAnimal
                key={animal.id}
                position={[x, 0, z]}
                animalData={animal}
                accessoryData={accessoryData}
                plantPositions={plantPositions}
                eatenRef={eatenRef}
                obstacles={obstacles}
                onPoop={addPoop}
                onClick={onPetAnimal ? (data) => onPetAnimal(data.id) : undefined}
                onResourceCollect={handleResourceCollect}
                bounds={animalBounds}
              />
            );
          })}

          {/* Подсказка если нет животных */}
          {animals.length === 0 && (
            <Html position={[0, 2, 0]} center>
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#333',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}>
                🛒 Купи животное в магазине!
              </div>
            </Html>
          )}

          {/* Менеджер ресурсов */}
          <ResourcesManager animals={animals} />

          {/* Дополнительное освещение для объёма */}
          <pointLight position={[-5, 5, -5]} intensity={0.3} color="#ffd4a3" />
          <pointLight position={[5, 5, 5]} intensity={0.3} color="#a3c9ff" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default FarmScene;
