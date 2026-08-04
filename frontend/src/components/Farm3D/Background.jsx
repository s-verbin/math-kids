import { useMemo } from 'react';
import * as THREE from 'three';

const Background = () => {
  // Процедурная текстура для полей
  const fieldTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#7cb342';
    ctx.fillRect(0, 0, 256, 256);
    
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      ctx.fillStyle = Math.random() > 0.5 ? '#8bc34a' : '#689f38';
      ctx.fillRect(x, y, 2, 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20);
    return texture;
  }, []);

  return (
    <group>
      {/* Большое поле под фермой */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial map={fieldTexture} roughness={1} metalness={0} />
      </mesh>

      {/* Горы на заднем плане */}
      <group position={[0, 0, -35]}>
        <mesh position={[-20, 4, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[8, 10, 4]} />
          <meshStandardMaterial color="#5c6bc0" roughness={0.8} />
        </mesh>
        <mesh position={[-5, 3, -5]} rotation={[0, 0, 0]}>
          <coneGeometry args={[6, 8, 4]} />
          <meshStandardMaterial color="#7986cb" roughness={0.8} />
        </mesh>
        <mesh position={[12, 4.5, -2]} rotation={[0, 0, 0]}>
          <coneGeometry args={[9, 11, 4]} />
          <meshStandardMaterial color="#3f51b5" roughness={0.8} />
        </mesh>
        <mesh position={[28, 3, -3]} rotation={[0, 0, 0]}>
          <coneGeometry args={[7, 8, 4]} />
          <meshStandardMaterial color="#5c6bc0" roughness={0.8} />
        </mesh>
      </group>

      {/* Холмы по бокам */}
      <mesh position={[-45, 1, 5]} rotation={[0, 0, 0]}>
        <coneGeometry args={[12, 4, 8]} />
        <meshStandardMaterial color="#8bc34a" roughness={0.9} />
      </mesh>
      <mesh position={[45, 1, 8]} rotation={[0, 0, 0]}>
        <coneGeometry args={[14, 5, 8]} />
        <meshStandardMaterial color="#8bc34a" roughness={0.9} />
      </mesh>
      <mesh position={[-35, 0.8, 20]} rotation={[0, 0, 0]}>
        <coneGeometry args={[10, 3, 8]} />
        <meshStandardMaterial color="#7cb342" roughness={0.9} />
      </mesh>
      <mesh position={[38, 0.8, 25]} rotation={[0, 0, 0]}>
        <coneGeometry args={[11, 3, 8]} />
        <meshStandardMaterial color="#7cb342" roughness={0.9} />
      </mesh>
    </group>
  );
};

export default Background;
