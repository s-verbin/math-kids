import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Html } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import Ground from './Ground';
import Background from './Background';
import ProceduralAnimal from './ProceduralAnimal';
import FarmBuilding from './FarmBuilding';
import Draggable from './Draggable';

const Fence = ({ bounds }) => {
  const half = bounds + 0.3;
  const rails = [
    [-half, -half, half, -half],
    [half, -half, half, half],
    [-half, half, half, half],
    [-half, -half, -half, half]
  ];
  return (
    <group>
      {rails.map((r, i) => (
        <mesh key={i} castShadow position={[(r[0] + r[2]) / 2, 0.45, (r[1] + r[3]) / 2]}>
          <boxGeometry args={[Math.max(0.1, Math.abs(r[2] - r[0])), 0.06, Math.max(0.1, Math.abs(r[3] - r[1]))]} />
          <meshStandardMaterial color='#A0522D' roughness={0.9} />
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

const FarmScene = ({ animals = [], inventory = [], onPetAnimal }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPositions, setDraggedPositions] = useState({});
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

  const plantPositions = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const x = (Math.random() - 0.5) * 16;
      const z = (Math.random() - 0.5) * 16;
      const isFlower = Math.random() > 0.7;
      const colors = ['#FF69B4', '#FFD700', '#9370DB', '#FFA500'];
      return { x, z, isFlower, color: isFlower ? colors[Math.floor(Math.random() * colors.length)] : null };
    });
  }, []);

  const eatenRef = useRef(new Set());

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
          <Fence bounds={animalBounds} />
          <Path bounds={animalBounds} />

          {/* Растения */}
          <Plants positions={plantPositions} eatenRef={eatenRef} />

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
                onClick={onPetAnimal ? (data) => onPetAnimal(data.id) : undefined}
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

          {/* Окружение */}
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default FarmScene;
