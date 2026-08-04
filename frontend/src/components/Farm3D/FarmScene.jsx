import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Html } from '@react-three/drei';
import { Suspense } from 'react';
import Ground from './Ground';
import ProceduralAnimal from './ProceduralAnimal';
import LandPlot from './LandPlot';
import FarmBuilding from './FarmBuilding';

const FarmScene = ({ animals = [], inventory = [] }) => {
  const landItems = inventory.filter(item => item.category === 'land');
  const buildingItems = inventory.filter(item => item.category === 'building');
  const decorationItems = inventory.filter(item => item.category === 'decoration');

  return (
    <div className="w-full h-[500px] bg-gradient-to-b from-sky-200 to-sky-100 rounded-xl overflow-hidden shadow-lg">
      <Canvas shadows>
        <Suspense fallback={null}>
          {/* Camera */}
          <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />
          
          {/* Controls - ограниченные для изометрического вида */}
          <OrbitControls
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

          {/* Земля */}
          <Ground />

          {/* Участки земли */}
          {landItems.map((item, index) => {
            const positions = [
              [-5, 0, -5],
              [-5, 0, 5],
              [5, 0, -5],
              [5, 0, 5],
              [-3, 0, -7],
              [3, 0, -7],
              [-7, 0, 0],
              [7, 0, 0]
            ];
            const pos = positions[index % positions.length];
            return (
              <LandPlot
                key={`${item.id}-${index}`}
                position={pos}
                itemName={item.item_name}
              />
            );
          })}

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
            const pos = positions[index % positions.length];
            return (
              <FarmBuilding
                key={`${item.id}-${index}`}
                position={pos}
                itemName={item.item_name}
              />
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
            const pos = positions[index % positions.length];
            return (
              <FarmBuilding
                key={`${item.id}-${index}`}
                position={pos}
                itemName={item.item_name}
                isDecoration={true}
              />
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
