import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import Ground from './Ground';
import ProceduralPig from './ProceduralPig';

const FarmScene = ({ animals = [] }) => {
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

          {/* Животные */}
          {animals.map((animal, index) => {
            const angle = (index / animals.length) * Math.PI * 2;
            const radius = 3;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            return (
              <ProceduralPig
                key={animal.id}
                position={[x, 0, z]}
                animalData={animal}
              />
            );
          })}

          {/* Если нет животных - показываем одну свинью для примера */}
          {animals.length === 0 && (
            <ProceduralPig position={[0, 0, 0]} />
          )}

          {/* Окружение */}
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default FarmScene;
