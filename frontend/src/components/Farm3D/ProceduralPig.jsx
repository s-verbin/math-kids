import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ProceduralPig = ({ position = [0, 0, 0], animalData = null }) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Анимация idle (покачивание)
  useFrame((state) => {
    if (groupRef.current && !clicked) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  // Обработка клика - анимация сжатия
  const handleClick = () => {
    setClicked(true);
    
    // Анимация сжатия
    const startScale = 1;
    const squishScale = 0.8;
    const duration = 200;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (groupRef.current) {
        if (progress < 0.5) {
          // Сжатие
          const scale = startScale - (startScale - squishScale) * (progress * 2);
          groupRef.current.scale.set(scale, scale, scale);
        } else {
          // Возврат
          const scale = squishScale + (startScale - squishScale) * ((progress - 0.5) * 2);
          groupRef.current.scale.set(scale, scale, scale);
        }
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setClicked(false);
      }
    };
    
    animate();
  };

  // Цвет свинки в зависимости от настроения
  const getPigColor = () => {
    if (!animalData) return '#ffb6c1'; // Розовый по умолчанию
    
    if (animalData.isHungry || animalData.needsPetting) {
      return '#d4a5a5'; // Грустный серо-розовый
    }
    if (animalData.happiness > 80) {
      return '#ffc0cb'; // Счастливый ярко-розовый
    }
    return '#ffb6c1'; // Обычный розовый
  };

  const pigColor = getPigColor();

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Тело (основной овал) */}
      <mesh castShadow position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial
          color={pigColor}
          roughness={0.7}
          metalness={0.1}
          emissive={hovered ? '#ff69b4' : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>

      {/* Голова */}
      <mesh castShadow position={[0, 1, 0.6]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial
          color={pigColor}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Пятачок */}
      <mesh castShadow position={[0, 0.95, 0.95]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial
          color="#ff9999"
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      {/* Ноздри */}
      <mesh castShadow position={[-0.05, 0.98, 1]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh castShadow position={[0.05, 0.98, 1]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Глаза */}
      <mesh castShadow position={[-0.15, 1.15, 0.85]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh castShadow position={[0.15, 1.15, 0.85]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Уши */}
      <mesh castShadow position={[-0.25, 1.3, 0.5]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial
          color={pigColor}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      <mesh castShadow position={[0.25, 1.3, 0.5]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial
          color={pigColor}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Ноги */}
      {[
        [-0.3, 0, 0.3],
        [0.3, 0, 0.3],
        [-0.3, 0, -0.3],
        [0.3, 0, -0.3]
      ].map((pos, i) => (
        <group key={i} position={pos}>
          <mesh castShadow position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.1, 0.08, 0.5, 8]} />
            <meshStandardMaterial
              color={pigColor}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          {/* Копытце */}
          <mesh castShadow position={[0, 0.02, 0]}>
            <boxGeometry args={[0.12, 0.04, 0.15]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        </group>
      ))}

      {/* Хвостик (спираль) */}
      <mesh castShadow position={[0, 1, -0.6]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.1, 0.03, 8, 16, Math.PI * 1.5]} />
        <meshStandardMaterial
          color={pigColor}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Индикатор состояния (если есть данные) */}
      {animalData && (
        <>
          {/* Иконка голода */}
          {animalData.isHungry && (
            <mesh position={[0, 2, 0]}>
              <planeGeometry args={[0.4, 0.4]} />
              <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
            </mesh>
          )}
          
          {/* Иконка грусти */}
          {animalData.needsPetting && !animalData.isHungry && (
            <mesh position={[0, 2, 0]}>
              <planeGeometry args={[0.4, 0.4]} />
              <meshBasicMaterial color="#888888" transparent opacity={0.8} />
            </mesh>
          )}
        </>
      )}

      {/* Имя животного */}
      {animalData?.name && (
        <mesh position={[0, 2.2, 0]}>
          <planeGeometry args={[1.5, 0.3]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
};

export default ProceduralPig;
