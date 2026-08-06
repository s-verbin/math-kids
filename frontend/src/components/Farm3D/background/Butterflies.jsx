import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const Butterflies = ({ count = 5 }) => {
  const butterfliesRef = useRef([]);

  useFrame((state) => {
    butterfliesRef.current.forEach((butterfly, i) => {
      if (!butterfly) return;
      
      const time = state.clock.elapsedTime;
      const offset = i * 2;
      
      // Случайное движение восьмёркой
      butterfly.position.x = Math.sin(time * 0.5 + offset) * 8;
      butterfly.position.z = Math.cos(time * 0.3 + offset) * 8;
      butterfly.position.y = 0.5 + Math.sin(time * 2 + offset) * 0.3;
      
      // Взмахи крыльев
      const wingFlap = Math.sin(time * 15 + offset) * 0.5;
      if (butterfly.children[0]) butterfly.children[0].rotation.y = Math.PI / 4 + wingFlap;
      if (butterfly.children[1]) butterfly.children[1].rotation.y = -Math.PI / 4 - wingFlap;
    });
  });

  const colors = ['#FF69B4', '#FFD700', '#9370DB', '#FFA500', '#FF1493'];

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <group key={i} ref={el => butterfliesRef.current[i] = el}>
          {/* Тело */}
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.15, 6]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          
          {/* Левое крыло */}
          <mesh position={[-0.08, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
            <circleGeometry args={[0.1, 8]} />
            <meshStandardMaterial color={colors[i % colors.length]} side={2} />
          </mesh>
          
          {/* Правое крыло */}
          <mesh position={[0.08, 0, 0]} rotation={[0, -Math.PI / 4, 0]}>
            <circleGeometry args={[0.1, 8]} />
            <meshStandardMaterial color={colors[i % colors.length]} side={2} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default Butterflies;
