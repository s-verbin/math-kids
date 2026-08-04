import { useMemo } from 'react';
import * as THREE from 'three';

const Ground = ({ landCount = 0 }) => {
  // Базовый размер + расширение за каждый купленный участок земли
  const baseSize = 20;
  const expansionPerLand = 4;
  const size = baseSize + (landCount * expansionPerLand);

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
    const repeat = Math.max(2, Math.floor(size / 5));
    texture.repeat.set(repeat, repeat);
    
    return texture;
  }, [size]);

  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial
        map={grassTexture}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
};

export default Ground;
