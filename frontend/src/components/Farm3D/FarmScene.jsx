import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Html } from '@react-three/drei';
import { Suspense } from 'react';
import Ground from './Ground';
import Background from './Background';
import ProceduralAnimal from './ProceduralAnimal';
import FarmBuilding from './FarmBuilding';
import Draggable from './Draggable';

const FarmScene = ({ animals = [], inventory = [] }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPositions, setDraggedPositions] = useState({});
  const landCount = inventory.filter(item => item.category === 'land').reduce((sum, item) => sum + (item.quantity || 1), 0);
  const buildingItems = inventory.filter(item => item.category === 'building');
  const decorationItems = inventory.filter(item => item.category === 'decoration');

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
            const radius = 2.5;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            return (
              <ProceduralAnimal
                key={animal.id}
                position={[x, 0, z]}
                animalData={animal}
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
