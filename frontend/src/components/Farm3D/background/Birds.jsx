import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const Birds = ({ count = 7 }) => {
  const birdsRef = useRef([]);

  useFrame((state, delta) => {
    birdsRef.current.forEach((bird, i) => {
      if (!bird) return;
      
      const time = state.clock.elapsedTime;
      const speed = 0.3 + i * 0.1;
      
      // Круговое движение
      const radius = 35 + i * 5;
      const angle = time * speed + i * Math.PI / 3;
      bird.position.x = Math.cos(angle) * radius;
      bird.position.z = -40 + Math.sin(angle) * radius;
      bird.position.y = 25 + Math.sin(time * 2 + i) * 3;
      
      // Поворот в сторону движения
      bird.rotation.y = angle + Math.PI / 2;
      
      // Взмахи крыльев
      const wingFlap = Math.sin(time * 10 + i * 2) * 0.3;
      if (bird.children[0]) bird.children[0].rotation.z = -wingFlap;
      if (bird.children[1]) bird.children[1].rotation.z = wingFlap;
    });
  });

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <group key={i} ref={el => birdsRef.current[i] = el}>
          {/* Тело птицы */}
          <mesh>
            <sphereGeometry args={[0.15, 6, 6]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          
          {/* Левое крыло */}
          <mesh position={[-0.1, 0, 0]}>
            <boxGeometry args={[0.25, 0.02, 0.15]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
          
          {/* Правое крыло */}
          <mesh position={[0.1, 0, 0]}>
            <boxGeometry args={[0.25, 0.02, 0.15]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default Birds;
