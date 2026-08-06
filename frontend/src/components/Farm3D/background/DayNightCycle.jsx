import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const DayNightCycle = ({ cycleDuration = 600 }) => { // 10 минут по умолчанию
  const { scene } = useThree();
  const sunRef = useRef();
  const moonRef = useRef();
  const starsRef = useRef([]);

  // Создаём звёзды
  const stars = useMemo(() => {
    const starPositions = [];
    for (let i = 0; i < 200; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI / 2; // Только верхняя полусфера
      const radius = 70;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      starPositions.push({ x, y, z, size: 0.1 + Math.random() * 0.15 });
    }
    return starPositions;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const dayProgress = (time % cycleDuration) / cycleDuration; // 0 to 1
    
    // Угол солнца/луны (0 = восход, 0.5 = закат)
    const angle = dayProgress * Math.PI * 2;
    
    // Позиция солнца
    if (sunRef.current) {
      const sunX = -45 + Math.cos(angle) * 50;
      const sunY = 45 + Math.sin(angle) * 40;
      const sunZ = -70;
      sunRef.current.position.set(sunX, sunY, sunZ);
      
      // Солнце видно только днём
      sunRef.current.visible = Math.sin(angle) > 0;
    }
    
    // Позиция луны (противоположно солнцу)
    if (moonRef.current) {
      const moonAngle = angle + Math.PI;
      const moonX = -45 + Math.cos(moonAngle) * 50;
      const moonY = 45 + Math.sin(moonAngle) * 40;
      const moonZ = -70;
      moonRef.current.position.set(moonX, moonY, moonZ);
      
      // Луна видна только ночью
      moonRef.current.visible = Math.sin(angle) < 0;
    }
    
    // Видимость звёзд
    const nightIntensity = Math.max(0, -Math.sin(angle));
    starsRef.current.forEach(star => {
      if (star) {
        star.material.opacity = nightIntensity * 0.8;
      }
    });
    
    // Цвет неба
    const isDay = Math.sin(angle) > 0;
    const dayColor = new THREE.Color('#E0F2FE');
    const nightColor = new THREE.Color('#0a1929');
    const sunsetColor = new THREE.Color('#FF6B35');
    
    let skyColor;
    if (isDay) {
      // День
      const dayIntensity = Math.sin(angle);
      if (dayIntensity > 0.8) {
        skyColor = dayColor;
      } else {
        // Закат/рассвет
        skyColor = new THREE.Color().lerpColors(sunsetColor, dayColor, (dayIntensity - 0.5) / 0.3);
      }
    } else {
      // Ночь
      const nightIntensity = -Math.sin(angle);
      if (nightIntensity > 0.8) {
        skyColor = nightColor;
      } else {
        // Сумерки
        skyColor = new THREE.Color().lerpColors(sunsetColor, nightColor, (nightIntensity - 0.5) / 0.3);
      }
    }
    
    // Обновляем цвет неба
    scene.background = skyColor;
    
    // Обновляем туман
    if (scene.fog) {
      scene.fog.color = skyColor;
    }
  });

  return (
    <group>
      {/* Солнце */}
      <group ref={sunRef}>
        <mesh>
          <sphereGeometry args={[6, 32, 32]} />
          <meshBasicMaterial color='#FFD54F' />
        </mesh>
        <mesh scale={[1.8, 1.8, 1.8]}>
          <sphereGeometry args={[6, 32, 32]} />
          <meshBasicMaterial color='#FFECB3' transparent opacity={0.18} />
        </mesh>
      </group>

      {/* Луна */}
      <group ref={moonRef}>
        <mesh>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color='#F0F0F0' />
        </mesh>
        {/* Кратеры */}
        <mesh position={[1.5, 1, 2]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial color='#D0D0D0' />
        </mesh>
        <mesh position={[-1, -1.5, 2]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshBasicMaterial color='#D0D0D0' />
        </mesh>
      </group>

      {/* Звёзды */}
      {stars.map((star, i) => (
        <mesh
          key={i}
          ref={el => starsRef.current[i] = el}
          position={[star.x, star.y, star.z]}
        >
          <sphereGeometry args={[star.size, 6, 6]} />
          <meshBasicMaterial color='#FFFFFF' transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
};

export default DayNightCycle;
