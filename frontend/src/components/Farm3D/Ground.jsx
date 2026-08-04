import { useMemo } from 'react';
import * as THREE from 'three';

const Ground = ({ landCount = 0 }) => {
  const mainSize = 20;
  const plotSize = 10;

  // Дополнительные участки вокруг главного
  const extraPlots = [
    [15, 0],      // право
    [0, 15],      // верх
    [-15, 0],     // лево
    [0, -15],     // низ
    [15, 15],     // право-верх
    [-15, 15],    // лево-верх
    [15, -15],    // право-низ
    [-15, -15],   // лево-низ
    [25, 0],
    [0, 25],
    [-25, 0],
    [0, -25]
  ];
  const visiblePlots = extraPlots.slice(0, landCount);

  // Процедурная текстура травы
  const grassTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Базовый зеленый цвет
    ctx.fillStyle = '#5a8f3a';
    ctx.fillRect(0, 0, 512, 512);
    
    // Добавляем шум для реалистичности
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const brightness = Math.random() * 40 - 20;
      const green = 143 + brightness;
      ctx.fillStyle = `rgb(90, ${green}, 58)`;
      ctx.fillRect(x, y, 2, 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    
    return texture;
  }, []);

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[mainSize, mainSize]} />
        <meshStandardMaterial
          map={grassTexture}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      {visiblePlots.map((pos, i) => (
        <mesh
          key={i}
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[pos[0], -0.02, pos[1]]}
        >
          <planeGeometry args={[plotSize, plotSize]} />
          <meshStandardMaterial
            map={grassTexture}
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};

export default Ground;
