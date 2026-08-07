import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import FarmBuilding from './FarmBuilding';
import ProductionIndicator from './ProductionIndicator';

const FARM_BOUNDS = 9; // Животные не выходят за пределы 20x20 земли

// Конфигурации для каждого животного
const ANIMAL_CONFIGS = {
  pig: {
    color: '#ffb6c1',
    bodyColor: '#ffb6c1',
    darkColor: '#e8a5a5',
    snoutColor: '#ff9999',
    size: 0.8,
    bodyScale: [1.05, 0.85, 1.25],
    headSize: 0.38,
    ears: 'pointed',
    tail: 'curly',
    legs: 4,
    neck: 0.1
  },
  chicken: {
    color: '#fff8dc',
    bodyColor: '#fff8dc',
    darkColor: '#f0e68c',
    snoutColor: '#ff6b35',
    size: 0.36,
    bodyScale: [0.65, 0.85, 0.85],
    headSize: 0.18,
    ears: 'comb',
    tail: 'feathers',
    legs: 2,
    neck: 0.22,
    wings: true
  },
  cow: {
    color: '#ffffff',
    bodyColor: '#ffffff',
    darkColor: '#2b2b2b',
    snoutColor: '#ffb7b2',
    size: 1.1,
    bodyScale: [0.95, 0.85, 1.35],
    headSize: 0.45,
    headZ: 1.2,
    ears: 'flat',
    tail: 'thin',
    legs: 4,
    neck: 0.25,
    horns: true,
    spots: true,
    udder: true
  },
  horse: {
    color: '#8b4513',
    bodyColor: '#8b4513',
    darkColor: '#5c2e0c',
    snoutColor: '#3d3d3d',
    size: 1.23,
    bodyScale: [1.15, 1.2, 1.7],
    headSize: 0.5,
    ears: 'long',
    tail: 'hair',
    legs: 4,
    neck: 0.4
  },
  sheep: {
    color: '#fffaf0',
    bodyColor: '#fffaf0',
    darkColor: '#e6e0d4',
    snoutColor: '#333333',
    size: 0.75,
    bodyScale: [1.25, 1.0, 1.25],
    headSize: 0.32,
    ears: 'flat',
    tail: 'small',
    legs: 4,
    neck: 0.15,
    fluffy: true,
    wool: true
  },
  duck: {
    color: '#fff8dc',
    bodyColor: '#fff8dc',
    darkColor: '#90ee90',
    snoutColor: '#ff6b35',
    size: 0.32,
    bodyScale: [0.6, 0.7, 0.9],
    headSize: 0.16,
    ears: 'none',
    tail: 'feathers',
    legs: 2,
    neck: 0.18,
    wings: true
  },
  dog: {
    color: '#d2691e',
    bodyColor: '#d2691e',
    darkColor: '#8b4513',
    snoutColor: '#333333',
    size: 0.71,
    bodyScale: [1.0, 0.9, 1.3],
    headSize: 0.35,
    ears: 'floppy',
    tail: 'curly',
    legs: 4,
    neck: 0.22
  },
  cat: {
    color: '#ff8c00',
    bodyColor: '#ff8c00',
    darkColor: '#cc7000',
    snoutColor: '#ff9999',
    size: 0.49,
    bodyScale: [0.85, 0.75, 1.15],
    headSize: 0.28,
    ears: 'pointed',
    tail: 'long',
    legs: 4,
    neck: 0.2
  },
  goat: {
    color: '#f5deb3',
    bodyColor: '#f5deb3',
    darkColor: '#d2b48c',
    snoutColor: '#ff9999',
    size: 0.58,
    bodyScale: [1.0, 1.0, 1.25],
    headSize: 0.34,
    ears: 'flat',
    tail: 'short',
    legs: 4,
    neck: 0.25,
    horns: true,
    beard: true
  },
  donkey: {
    color: '#a9a9a9',
    bodyColor: '#a9a9a9',
    darkColor: '#696969',
    snoutColor: '#4a4a4a',
    size: 0.94,
    bodyScale: [1.05, 1.1, 1.45],
    headSize: 0.4,
    ears: 'long',
    tail: 'hair',
    legs: 4,
    neck: 0.3
  }
};

const ProceduralAnimal = ({ position = [0, 0, 0], animalData = null, accessoryData = null, plantPositions = [], eatenRef, obstacles = [], onPoop, onClick, onResourceCollect, production = null, bounds = FARM_BOUNDS }) => {
  const groupRef = useRef();
  const bodyRef = useRef();
  const shadowRef = useRef();
  const furRefs = useRef([]);
  const featherRefs = useRef([]);
  const maneRefs = useRef([]);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isLying, setIsLying] = useState(false);
  
  const posRef = useRef(new THREE.Vector3(position[0], position[1], position[2]));
  const targetRef = useRef(new THREE.Vector3(position[0], position[1], position[2]));
  const waitTimeRef = useRef(0);
  const isMovingRef = useRef(false);
  const legRefs = useRef([]);
  const isLyingRef = useRef(false);
  const lieTimeRef = useRef(0);
  const poopTimerRef = useRef(Math.random() * 60 + 60);
  const stuckTimerRef = useRef(0);
  const lastPosRef = useRef(new THREE.Vector3(position[0], position[1], position[2]));
  const baseY = position[1];
  const MIN_OBSTACLE_DIST = 1.8;

  const type = animalData?.type || 'pig';
  const config = ANIMAL_CONFIGS[type] || ANIMAL_CONFIGS.pig;
  const headY = config.size * (1.3 + config.neck);
  const headZ = config.size * (config.headZ || 0.65);
  const labelFontSize = Math.max(10, Math.round(12 + config.size * 4));

  const lerp = (a, b, t) => a + (b - a) * t;

  const getNewTarget = () => {
    for (let attempt = 0; attempt < 20; attempt++) {
      const x = (Math.random() - 0.5) * 2 * bounds;
      const z = (Math.random() - 0.5) * 2 * bounds;
      const p = new THREE.Vector3(x, position[1], z);
      let safe = true;
      for (const o of obstacles) {
        const dx = p.x - o.x;
        const dz = p.z - o.z;
        if (dx * dx + dz * dz < MIN_OBSTACLE_DIST * MIN_OBSTACLE_DIST) {
          safe = false;
          break;
        }
      }
      if (safe) return p;
    }
    return new THREE.Vector3(position[0], position[1], position[2]);
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Обновляем позицию
    groupRef.current.position.x = posRef.current.x;
    groupRef.current.position.z = posRef.current.z;

    if (clicked) {
      if (shadowRef.current) shadowRef.current.position.y = 0.01 - groupRef.current.position.y;
      return;
    }

    // Синхронизуем индикатор сна
    if (isLying !== isLyingRef.current) {
      setIsLying(isLyingRef.current);
    }

    // Дыхание
    const breath = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03;

    // Какашки (реже)
    if (onPoop) {
      poopTimerRef.current -= delta;
      if (poopTimerRef.current <= 0) {
        onPoop({ x: posRef.current.x, z: posRef.current.z, size: config.size });
        poopTimerRef.current = Math.random() * 60 + 60; // 60-120 секунд
      }
    }

    if (isLyingRef.current) {
      // Животное отдыхает
      lieTimeRef.current -= delta;
      if (lieTimeRef.current <= 0) {
        isLyingRef.current = false;
      }
      if (bodyRef.current) bodyRef.current.scale.set(config.bodyScale[0], config.bodyScale[1], config.bodyScale[2]);
      groupRef.current.position.y = lerp(groupRef.current.position.y, baseY - config.size * 0.35, 0.05);
      groupRef.current.rotation.x = lerp(groupRef.current.rotation.x, -Math.PI / 6, 0.05);
      groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, 0, 0.05);
      legRefs.current.forEach(leg => {
        if (leg) leg.rotation.x = 0;
      });
      if (shadowRef.current) shadowRef.current.position.y = 0.01 - groupRef.current.position.y;
      return;
    }

    // Проверка на застревание
    const movedDist = posRef.current.distanceTo(lastPosRef.current);
    if (movedDist < 0.01) {
      stuckTimerRef.current += delta;
      if (stuckTimerRef.current > 3) {
        // Застряли на 3+ секунды - выбираем новую цель
        targetRef.current = getNewTarget();
        isMovingRef.current = true;
        stuckTimerRef.current = 0;
      }
    } else {
      stuckTimerRef.current = 0;
      lastPosRef.current.copy(posRef.current);
    }

    // Случайное движение
    const speed = 0.4;
    const dist = posRef.current.distanceTo(targetRef.current);

    if (isMovingRef.current) {
      const direction = new THREE.Vector3().subVectors(targetRef.current, posRef.current).normalize();
      const step = speed * delta;
      const walkTime = state.clock.elapsedTime * 6;

      if (dist < step) {
        posRef.current.copy(targetRef.current);
        isMovingRef.current = false;
        waitTimeRef.current = Math.random() * 2 + 1;
        legRefs.current.forEach(leg => {
          if (leg) leg.rotation.x = 0;
        });
      } else {
        // Проверка столкновений со зданиями
        const nextPos = posRef.current.clone().add(direction.clone().multiplyScalar(step));
        let blocked = false;
        for (const o of obstacles) {
          const dx = nextPos.x - o.x;
          const dz = nextPos.z - o.z;
          if (dx * dx + dz * dz < 0.8) {
            blocked = true;
            break;
          }
        }
        if (blocked) {
          // Если заблокированы, сразу выбираем новую цель
          targetRef.current = getNewTarget();
          waitTimeRef.current = 0.1;
        } else {
          posRef.current.copy(nextPos);
          const angle = Math.atan2(direction.x, direction.z);
          groupRef.current.rotation.y = angle;
        }
      }

      // Животное ест растения, если проходит рядом
      if (plantPositions.length && eatenRef) {
        for (let i = 0; i < plantPositions.length; i++) {
          if (!eatenRef.current.has(i)) {
            const p = plantPositions[i];
            const dx = posRef.current.x - p.x;
            const dz = posRef.current.z - p.z;
            if (dx * dx + dz * dz < 0.5) {
              eatenRef.current.add(i);
              isMovingRef.current = false;
              waitTimeRef.current = 0.8;
              break;
            }
          }
        }
      }

      // Анимация ходьбы
      groupRef.current.position.y = posRef.current.y + Math.abs(Math.sin(walkTime)) * 0.08;
      groupRef.current.rotation.x = Math.sin(walkTime) * 0.05;
      if (bodyRef.current) bodyRef.current.scale.set(config.bodyScale[0], config.bodyScale[1], config.bodyScale[2]);

      const legCount = config.legs === 2 ? 2 : 4;
      for (let i = 0; i < legCount; i++) {
        const leg = legRefs.current[i];
        if (leg) {
          const phase = (i % 2 === 0 ? 0 : Math.PI) + (Math.floor(i / 2) * 0.5);
          leg.rotation.x = Math.sin(walkTime + phase) * 0.25;
        }
      }
    } else {
      // Ждём перед новым движением
      waitTimeRef.current -= delta;
      if (waitTimeRef.current <= 0) {
        if (Math.random() < 0.0005) {
          // Решили прилечь
          isLyingRef.current = true;
          lieTimeRef.current = Math.random() * 3 + 2;
        } else {
          targetRef.current = getNewTarget();
          isMovingRef.current = true;
        }
      }
      // Сбрасываем ноги, покачивание и дышим
      legRefs.current.forEach(leg => {
        if (leg) leg.rotation.x = 0;
      });
      groupRef.current.position.y = lerp(groupRef.current.position.y, posRef.current.y + Math.sin(state.clock.elapsedTime * 2) * 0.05, 0.1);
      groupRef.current.rotation.x = lerp(groupRef.current.rotation.x, 0, 0.1);
      groupRef.current.rotation.y = posRef.current.x * 0.02 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      if (bodyRef.current) bodyRef.current.scale.set(config.bodyScale[0] * breath, config.bodyScale[1] * breath, config.bodyScale[2] * breath);
    }

    if (shadowRef.current) shadowRef.current.position.y = 0.01 - groupRef.current.position.y;

    // Анимация шерсти/перьев/гривы
    const windTime = state.clock.elapsedTime * 2;
    furRefs.current.forEach((fur, i) => {
      if (fur) {
        const offset = i * 0.5;
        fur.rotation.z = Math.sin(windTime + offset) * 0.1;
      }
    });
    featherRefs.current.forEach((feather, i) => {
      if (feather) {
        const offset = i * 0.3;
        feather.rotation.y = Math.sin(windTime * 1.5 + offset) * 0.15;
      }
    });
    maneRefs.current.forEach((mane, i) => {
      if (mane) {
        const offset = i * 0.4;
        mane.rotation.x = Math.sin(windTime + offset) * 0.12;
      }
    });
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setClicked(true);
    if (onClick) onClick(animalData);
    
    const startTime = Date.now();
    const duration = 200;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (groupRef.current) {
        const scale = progress < 0.5 
          ? 1 - (0.2 * (progress * 2))
          : 0.8 + (0.2 * ((progress - 0.5) * 2));
        groupRef.current.scale.set(scale, scale, scale);
      }
      
      if (progress < 1) requestAnimationFrame(animate);
      else setClicked(false);
    };
    
    animate();
  };

  const color = useMemo(() => {
    if (!animalData) return config.bodyColor;
    if (animalData.isHungry || animalData.needsPetting) return config.darkColor;
    if (animalData.happiness > 80) return config.bodyColor;
    return config.bodyColor;
  }, [config, animalData]);

  const spots = config.spots && (
    <group position={[0, config.size * 1.1, 0]}>
      {[
        { pos: [config.size * 0.85, 0.2, 0], rot: [0, Math.PI / 2, 0] },
        { pos: [-config.size * 0.85, 0.1, 0.2], rot: [0, -Math.PI / 2, 0] },
        { pos: [0, config.size * 0.8, -0.2], rot: [-Math.PI / 2, 0, 0] },
        { pos: [config.size * 0.5, 0.4, config.size * 0.6], rot: [0, Math.PI / 4, 0] }
      ].map((spot, i) => (
        <mesh key={i} position={spot.pos} rotation={spot.rot}>
          <circleGeometry args={[config.size * 0.35, 12]} />
          <meshStandardMaterial color={config.darkColor} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );

  // Шерсть для овец (оптимизировано)
  const wool = config.wool && useMemo(() => {
    const woolBalls = [];
    for (let i = 0; i < 15; i++) { // уменьшено с 25 до 15
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = config.size * 0.85;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = config.size + r * Math.cos(phi) * 0.6;
      const z = r * Math.sin(phi) * Math.sin(theta);
      const size = 0.1 + Math.random() * 0.08; // крупнее
      woolBalls.push(
        <mesh
          key={`wool-${i}`}
          ref={el => furRefs.current[i] = el}
          position={[x, y, z]}
        >
          <sphereGeometry args={[size, 4, 4]} />
          <meshStandardMaterial color={color} roughness={1} />
        </mesh>
      );
    }
    return <group>{woolBalls}</group>;
  }, [config, color]);

  const fluffy = config.fluffy && (
    <mesh position={[0, config.size, 0]}>
      <sphereGeometry args={[config.size * 1.05, 16, 16]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );

  // Геометрия ушей в зависимости от типа
  const renderEars = () => {
    const earColor = color;
    switch (config.ears) {
      case 'pointed':
        return (
          <>
            <mesh castShadow position={[-config.headSize * 0.6, headY + config.headSize * 0.8, headZ]}>
              <coneGeometry args={[0.1, 0.25, 8]} />
              <meshStandardMaterial color={earColor} />
            </mesh>
            <mesh castShadow position={[config.headSize * 0.6, headY + config.headSize * 0.8, headZ]}>
              <coneGeometry args={[0.1, 0.25, 8]} />
              <meshStandardMaterial color={earColor} />
            </mesh>
          </>
        );
      case 'floppy':
        return (
          <>
            <mesh castShadow position={[-config.headSize * 0.6, headY + config.headSize * 0.4, headZ - 0.05]} rotation={[0, 0, -0.8]}>
              <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
              <meshStandardMaterial color={earColor} />
            </mesh>
            <mesh castShadow position={[config.headSize * 0.6, headY + config.headSize * 0.4, headZ - 0.05]} rotation={[0, 0, 0.8]}>
              <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
              <meshStandardMaterial color={earColor} />
            </mesh>
          </>
        );
      case 'long':
        return (
          <>
            <mesh castShadow position={[-config.headSize * 0.5, headY + config.headSize * 0.9, headZ]} rotation={[0, 0, -0.2]}>
              <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
              <meshStandardMaterial color={earColor} />
            </mesh>
            <mesh castShadow position={[config.headSize * 0.5, headY + config.headSize * 0.9, headZ]} rotation={[0, 0, 0.2]}>
              <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
              <meshStandardMaterial color={earColor} />
            </mesh>
          </>
        );
      case 'flat':
        return (
          <>
            <mesh castShadow position={[-config.headSize * 0.8, headY, headZ]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.3, 0.1, 0.1]} />
              <meshStandardMaterial color={earColor} />
            </mesh>
            <mesh castShadow position={[config.headSize * 0.8, headY, headZ]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.3, 0.1, 0.1]} />
              <meshStandardMaterial color={earColor} />
            </mesh>
          </>
        );
      case 'comb':
        return (
          <mesh castShadow position={[0, headY + config.headSize * 0.9, headZ]}>
            <boxGeometry args={[0.1, 0.2, 0.05]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
        );
      default:
        return null;
    }
  };

  // Рога
  const horns = config.horns && (
    <>
      <mesh castShadow position={[-config.headSize * 0.35, headY + config.headSize * 0.9, headZ - config.headSize * 0.1]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.04, 0.2, 8]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      <mesh castShadow position={[config.headSize * 0.35, headY + config.headSize * 0.9, headZ - config.headSize * 0.1]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.04, 0.2, 8]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
    </>
  );

  // Крылья с перьями для птиц (оптимизировано)
  const wings = config.wings && useMemo(() => {
    const leftFeathers = [];
    const rightFeathers = [];
    for (let i = 0; i < 3; i++) { // уменьшено с 5 до 3
      const offset = i * 0.1;
      leftFeathers.push(
        <mesh
          key={`left-feather-${i}`}
          ref={el => featherRefs.current[i] = el}
          position={[-config.size * 0.65 - offset, config.size * 1.15, offset * 0.5]}
          rotation={[0, 0, -0.3 - i * 0.1]}
        >
          <boxGeometry args={[config.size * 0.18, config.size * 0.04, config.size * 0.3]} />
          <meshStandardMaterial color={config.darkColor} roughness={0.8} />
        </mesh>
      );
      rightFeathers.push(
        <mesh
          key={`right-feather-${i}`}
          ref={el => featherRefs.current[i + 3] = el}
          position={[config.size * 0.65 + offset, config.size * 1.15, offset * 0.5]}
          rotation={[0, 0, 0.3 + i * 0.1]}
        >
          <boxGeometry args={[config.size * 0.18, config.size * 0.04, config.size * 0.3]} />
          <meshStandardMaterial color={config.darkColor} roughness={0.8} />
        </mesh>
      );
    }
    return <group>{leftFeathers}{rightFeathers}</group>;
  }, [config]);

  const udder = config.udder && (
    <mesh castShadow position={[0, config.size * 0.6, -config.size * 0.1]}>
      <sphereGeometry args={[config.size * 0.25, 12, 12]} />
      <meshStandardMaterial color='#ffacc7' />
    </mesh>
  );

  const beard = config.beard && (
    <mesh castShadow position={[0, config.size * (1.05 + config.neck), headZ + config.headSize * 0.45]}>
      <coneGeometry args={[0.05, 0.12, 8]} rotation={[Math.PI / 2, 0, 0]} />
      <meshStandardMaterial color='#d2b48c' />
    </mesh>
  );

  // Грива для лошадей и ослов (оптимизировано)
  const mane = (type === 'horse' || type === 'donkey') && useMemo(() => {
    const maneStrands = [];
    for (let i = 0; i < 6; i++) { // уменьшено с 10 до 6
      const zOffset = (i - 2.5) * 0.1;
      maneStrands.push(
        <mesh
          key={`mane-${i}`}
          ref={el => maneRefs.current[i + 10] = el}
          position={[0, config.size * (1.3 + config.neck) + 0.15, zOffset]}
        >
          <boxGeometry args={[0.04, 0.28, 0.03]} />
          <meshStandardMaterial color={config.darkColor} roughness={0.9} />
        </mesh>
      );
    }
    return <group>{maneStrands}</group>;
  }, [config, type]);

  // Хвост
  const renderTail = () => {
    switch (config.tail) {
      case 'curly':
        return (
          <mesh castShadow position={[0, config.size * 0.9, -config.size * 1]} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.1, 0.03, 6, 12, Math.PI * 1.5]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      case 'long':
        return (
          <mesh castShadow position={[0, config.size * 0.8, -config.size * 0.9]} rotation={[0.5, 0, 0]}>
            <capsuleGeometry args={[0.05, 0.4, 4, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      case 'hair':
        const hairStrands = [];
        for (let i = 0; i < 5; i++) { // уменьшено с 8 до 5
          const xOffset = (i - 2) * 0.04;
          hairStrands.push(
            <mesh
              key={`hair-${i}`}
              ref={el => maneRefs.current[i] = el}
              position={[xOffset, config.size * 0.6, -config.size * 1.05]}
            >
              <boxGeometry args={[0.03, 0.4, 0.03]} />
              <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
            </mesh>
          );
        }
        return <group>{hairStrands}</group>;
      case 'feathers':
        return (
          <mesh castShadow position={[0, config.size * 0.6, -config.size * 0.8]}>
            <coneGeometry args={[0.15, 0.3, 8]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color={config.darkColor} />
          </mesh>
        );
      case 'thin':
        return (
          <mesh castShadow position={[0, config.size * 0.7, -config.size * 0.9]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.05, 0.6, 0.05]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      default:
        return null;
    }
  };

  // Ноги
  const legs = [];
  const legPositions = config.legs === 2 
    ? [[-0.15, 0, 0.15], [0.15, 0, 0.15]]
    : [[-0.25, 0, 0.25], [0.25, 0, 0.25], [-0.25, 0, -0.25], [0.25, 0, -0.25]];
    
  for (let i = 0; i < legPositions.length; i++) {
    const pos = legPositions[i];
    legs.push(
      <group
        key={i}
        position={pos}
        ref={(el) => { legRefs.current[i] = el; }}
      >
        <mesh castShadow position={[0, config.size * 0.25, 0]}>
          <cylinderGeometry args={[0.08, 0.06, config.size * 0.5, 8]} />
          <meshStandardMaterial color={config.darkColor} />
        </mesh>
        {config.legs === 2 ? (
          <mesh castShadow position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.12, 0.1, 0.05, 8]} />
            <meshStandardMaterial color={config.snoutColor} />
          </mesh>
        ) : (
          <mesh castShadow position={[0, 0.02, 0]}>
            <boxGeometry args={[0.1, 0.04, 0.12]} />
            <meshStandardMaterial color="#3d3d3d" />
          </mesh>
        )}
      </group>
    );
  }

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Мягкая тень под ногами */}
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[config.size * 0.7, 16]} />
        <meshBasicMaterial color='#000000' transparent opacity={0.18} />
      </mesh>

      {/* Тело */}
      <mesh ref={bodyRef} castShadow position={[0, config.size * 1.1, 0]} scale={config.bodyScale}>
        {config.bodyGeometry === 'box' ? (
          <boxGeometry args={[config.size * 2, config.size * 2, config.size * 2]} />
        ) : (
          <sphereGeometry args={[config.size, 16, 16]} />
        )}
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.1}
          emissive={hovered ? '#ff69b4' : '#000000'}
          emissiveIntensity={hovered ? 0.15 : 0}
        />
      </mesh>

      {fluffy}
      {wool}
      {spots}

      {/* Голова */}
      <mesh castShadow position={[0, headY, headZ]}>
        <sphereGeometry args={[config.headSize, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Шея для птиц/лошадей */}
      {config.neck > 0.2 && (
        <mesh castShadow position={[0, config.size * (1.1 + config.neck / 2), headZ - config.headSize * 0.6]}>
          <cylinderGeometry args={[config.headSize * 0.6, config.headSize * 0.6, config.size * 0.4, 8]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      )}

      {/* Пятачок/клюв/мордочка */}
      <mesh castShadow position={[
        0, 
        type === 'cow' ? headY - 0.1 : config.size * (1.25 + config.neck), 
        headZ + (type === 'cow' ? config.headSize * 0.7 : config.headSize * 0.6)
      ]}>
        {['chicken', 'duck'].includes(type) ? (
          <coneGeometry args={[0.08, 0.15, 8]} rotation={[Math.PI / 2, 0, 0]} />
        ) : type === 'cow' ? (
          // Для коровы делаем аккуратный розовый параллелепипед мордочки
          <boxGeometry args={[config.headSize * 0.8, config.headSize * 0.5, config.headSize * 0.5]} />
        ) : (
          <cylinderGeometry args={[config.headSize * 0.3, config.headSize * 0.3, 0.08, 16]} />
        )}
        <meshStandardMaterial color={config.snoutColor} />
      </mesh>

      {/* Глаза */}
      <mesh castShadow position={[-config.headSize * 0.3, config.size * (1.45 + config.neck), headZ - config.headSize * 0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh castShadow position={[config.headSize * 0.3, config.size * (1.45 + config.neck), headZ - config.headSize * 0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {renderEars()}
      {horns}
      {mane}
      {renderTail()}
      {legs}
      {wings}
      {udder}
      {beard}

      {/* Имя животного */}
      {animalData?.name && (
        <Html position={[0, headY + 0.5, 0]} center distanceFactor={10}>
          <div style={{
            background: '#FFF8E7',
            color: '#5D4037',
            padding: '3px 10px',
            borderRadius: '14px',
            fontSize: `${labelFontSize}px`,
            fontWeight: 'bold',
            fontFamily: '"Comic Sans MS", "Fredoka", cursive, sans-serif',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            border: '1px solid rgba(255,255,255,0.6)'
          }}>
            ⭐ {animalData.name}
          </div>
        </Html>
      )}

      {/* Индикатор нужд / эмоций */}
      {(animalData?.isHungry || animalData?.needsPetting) && (
        <Html position={[0, headY + 0.9, 0]} center distanceFactor={10}>
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: `${Math.max(14, Math.round(22 * config.size))}px`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
          }}>
            {animalData.isHungry ? '🍎' : ''}
            {animalData.needsPetting ? '❤️' : ''}
          </div>
        </Html>
      )}

      {/* Сон */}
      {isLying && (
        <Html position={[0, headY + 0.9, 0]} center distanceFactor={10}>
          <div style={{ fontSize: `${Math.max(16, Math.round(24 * config.size))}px` }}>💤</div>
        </Html>
      )}

      {/* Индикатор производства */}
      {animalData && (
        <ProductionIndicator
          animalType={type}
          animalId={animalData.id}
          production={production}
          position={[0, headY + 1.2, 0]}
          onCollect={onResourceCollect}
        />
      )}

      {/* Аксессуар */}
      {accessoryData && (
        <group position={[0, headY + 0.35, 0]} scale={0.7}>
          <FarmBuilding itemName={accessoryData.item_name} />
        </group>
      )}
    </group>
  );
};

export default ProceduralAnimal;
