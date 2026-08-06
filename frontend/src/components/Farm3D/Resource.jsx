import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const Resource = ({ type, position, value }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Легкое покачивание
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
  });

  const renderModel = () => {
    switch (type) {
      case 'egg':
        return (
          <group ref={meshRef} position={position}>
            {/* Яйцо */}
            <mesh castShadow>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color="#FFF8DC" roughness={0.3} />
            </mesh>
            {/* Блик */}
            <mesh position={[0.03, 0.05, 0.03]}>
              <sphereGeometry args={[0.03, 6, 6]} />
              <meshStandardMaterial color="#FFFFFF" transparent opacity={0.6} />
            </mesh>
            {/* Иконка над ресурсом */}
            <Html position={[0, 0.4, 0]} center distanceFactor={8}>
              <div style={{
                fontSize: '20px',
                pointerEvents: 'none',
                userSelect: 'none'
              }}>
                🥚
              </div>
            </Html>
          </group>
        );

      case 'milk':
        return (
          <group ref={meshRef} position={position}>
            {/* Ведро */}
            <mesh castShadow position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.12, 0.1, 0.16, 8]} />
              <meshStandardMaterial color="#C0C0C0" roughness={0.4} metalness={0.6} />
            </mesh>
            {/* Молоко в ведре */}
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.11, 0.09, 0.08, 8]} />
              <meshStandardMaterial color="#FFFAF0" roughness={0.2} />
            </mesh>
            {/* Ручка */}
            <mesh position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.1, 0.015, 6, 8, Math.PI]} />
              <meshStandardMaterial color="#C0C0C0" roughness={0.4} metalness={0.6} />
            </mesh>
            <Html position={[0, 0.5, 0]} center distanceFactor={8}>
              <div style={{
                fontSize: '20px',
                pointerEvents: 'none',
                userSelect: 'none'
              }}>
                🥛
              </div>
            </Html>
          </group>
        );

      case 'wool':
        return (
          <group ref={meshRef} position={position}>
            {/* Клубок шерсти */}
            <mesh castShadow>
              <sphereGeometry args={[0.15, 10, 10]} />
              <meshStandardMaterial color="#F5F5DC" roughness={1} />
            </mesh>
            {/* Текстура клубка */}
            {[0, 1, 2, 3].map(i => (
              <mesh key={i} rotation={[0, (Math.PI / 2) * i, 0]}>
                <torusGeometry args={[0.15, 0.02, 4, 8]} />
                <meshStandardMaterial color="#E8E8D0" roughness={1} />
              </mesh>
            ))}
            <Html position={[0, 0.5, 0]} center distanceFactor={8}>
              <div style={{
                fontSize: '20px',
                pointerEvents: 'none',
                userSelect: 'none'
              }}>
                🧶
              </div>
            </Html>
          </group>
        );

      default:
        return null;
    }
  };

  return renderModel();
};

export default Resource;
