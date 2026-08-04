import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const Background = () => {
  const { scene } = useThree();
  const windmillBlades = useRef();
  const clouds = useRef([]);

  useMemo(() => {
    scene.fog = new THREE.FogExp2('#E0F2FE', 0.018);
  }, [scene]);

  useFrame((state, delta) => {
    if (windmillBlades.current) {
      windmillBlades.current.rotation.z -= delta * 0.5;
    }
    clouds.current.forEach((cloud, i) => {
      if (!cloud) return;
      cloud.position.x += delta * (0.2 + i * 0.05);
      if (cloud.position.x > 70) {
        cloud.position.x = -70;
      }
    });
  });

  const makeCloud = (pos, scale, seed) => (
    <group position={pos} scale={scale} ref={(el) => (clouds.current[seed] = el)}>
      <mesh position={[-0.8, 0, 0]}>
        <sphereGeometry args={[0.7, 10, 10]} />
        <meshStandardMaterial color='#FFFFFF' transparent opacity={0.82} roughness={0.9} />
      </mesh>
      <mesh position={[0.6, 0.1, 0]}>
        <sphereGeometry args={[0.55, 10, 10]} />
        <meshStandardMaterial color='#FFFFFF' transparent opacity={0.82} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.8, 10, 10]} />
        <meshStandardMaterial color='#FFFFFF' transparent opacity={0.82} roughness={0.9} />
      </mesh>
    </group>
  );

  const makeCloudTree = (pos, scale) => (
    <group position={pos} scale={scale}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 1, 6]} />
        <meshStandardMaterial color='#6D4C41' roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.7, 10, 10]} />
        <meshStandardMaterial color='#66BB6A' roughness={0.9} />
      </mesh>
      <mesh position={[-0.35, 1.35, 0.1]}>
        <sphereGeometry args={[0.45, 10, 10]} />
        <meshStandardMaterial color='#4CAF50' roughness={0.9} />
      </mesh>
      <mesh position={[0.4, 1.3, -0.1]}>
        <sphereGeometry args={[0.5, 10, 10]} />
        <meshStandardMaterial color='#43A047' roughness={0.9} />
      </mesh>
    </group>
  );

  const makeHill = (pos, color, scale) => (
    <mesh position={pos} scale={scale}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );

  return (
    <group>
      {/* Основная зелёная равнина */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <circleGeometry args={[60, 32]} />
        <meshStandardMaterial color='#C5E1A5' roughness={1} />
      </mesh>

      {/* Солнце с мягким свечением */}
      <mesh position={[-45, 45, -70]}>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial color='#FFD54F' />
      </mesh>
      <mesh position={[-45, 45, -70]} scale={[1.8, 1.8, 1.8]}>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial color='#FFECB3' transparent opacity={0.18} />
      </mesh>

      {/* Облака */}
      {makeCloud([-45, 38, -40], [4, 3, 3], 0)}
      {makeCloud([-10, 44, -55], [5, 4, 4], 1)}
      {makeCloud([30, 40, -35], [4.2, 3.2, 3.2], 2)}
      {makeCloud([65, 46, -50], [4.5, 3.5, 3.5], 3)}

      {/* Дальние лавандовые холмы */}
      <group position={[0, -4, -55]}>
        {makeHill([-25, 0, 0], '#E6E6FA', [12, 4, 8])}
        {makeHill([0, -1, -5], '#D8BFD8', [14, 4.5, 9])}
        {makeHill([28, 0, -2], '#E6E6FA', [11, 3.8, 8])}
        {makeHill([50, -0.5, -4], '#D8BFD8', [10, 3.5, 7])}
        {makeHill([-48, -0.5, -3], '#E6E6FA', [9, 3.2, 6])}
      </group>

      {/* Средние зелёные холмы */}
      <group position={[0, -1.5, -30]}>
        {makeHill([-40, 0, 0], '#A5D6A7', [14, 3.2, 8])}
        {makeHill([-10, 0.5, -4], '#81C784', [16, 3.6, 10])}
        {makeHill([20, 0, -2], '#A5D6A7', [13, 3, 8])}
        {makeHill([48, -0.2, -5], '#C8E6C9', [12, 2.8, 7])}
      </group>

      {/* Ветряная мельница */}
      <group position={[-45, 0, -18]}>
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[0.5, 0.7, 4, 8]} />
          <meshStandardMaterial color='#F4A460' roughness={0.9} />
        </mesh>
        <mesh position={[0, 4.2, 0]}>
          <coneGeometry args={[1.3, 1.4, 4]} />
          <meshStandardMaterial color='#8B4513' roughness={0.9} />
        </mesh>
        <group ref={windmillBlades} position={[0, 4.3, 0.35]}>
          {[0, 90, 180, 270].map((rot, i) => (
            <mesh key={i} rotation={[0, 0, rot * Math.PI / 180]}>
              <boxGeometry args={[4, 0.18, 0.06]} />
              <meshStandardMaterial color='#FFF8DC' />
            </mesh>
          ))}
        </group>
      </group>

      {/* Лесные массивы */}
      <group position={[-30, 0, -5]} scale={[0.9, 0.9, 0.9]}>
        {makeCloudTree([-2, 0, 0], 1)}
        {makeCloudTree([1.5, 0, 1.2], 0.8)}
        {makeCloudTree([0.2, 0, -1.5], 1.1)}
      </group>
      <group position={[35, 0, -10]} scale={[1.1, 1.1, 1.1]}>
        {makeCloudTree([-1.5, 0, 0], 1)}
        {makeCloudTree([2, 0, 0.5], 0.85)}
        {makeCloudTree([0, 0, -1.2], 0.95)}
        {makeCloudTree([3.5, 0, -0.8], 0.75)}
      </group>
      <group position={[15, 0, -28]} scale={[0.8, 0.8, 0.8]}>
        {makeCloudTree([0, 0, 0], 1)}
        {makeCloudTree([-2, 0, 1], 0.7)}
      </group>
      <group position={[-48, 0, -28]} scale={[0.8, 0.8, 0.8]}>
        {makeCloudTree([0, 0, 0], 1)}
        {makeCloudTree([1.5, 0, -1], 0.75)}
        {makeCloudTree([-1.5, 0, 0.5], 0.85)}
      </group>

      {/* Цветы на переднем плане */}
      {[
        [18, 0.02, 18, '#F48FB1'], [-18, 0.02, 20, '#FFF176'],
        [22, 0.02, 25, '#FFAB91'], [-28, 0.02, 18, '#CE93D8'],
        [35, 0.02, 30, '#F48FB1'], [-12, 0.02, 32, '#FFAB91'],
        [8, 0.02, 22, '#FFF176'], [-45, 0.02, 15, '#F48FB1'],
        [45, 0.02, 20, '#CE93D8'], [-35, 0.02, 8, '#FFF176']
      ].map(([x, y, z, color], i) => (
        <mesh key={`flower-${i}`} position={[x, y, z]}>
          <sphereGeometry args={[0.14, 6, 6]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

export default Background;
