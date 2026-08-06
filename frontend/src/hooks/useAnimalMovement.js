import { useRef } from 'react';
import * as THREE from 'three';

const MIN_OBSTACLE_DIST = 1.8;

export const useAnimalMovement = (bounds, obstacles = []) => {
  const posRef = useRef(new THREE.Vector3(0, 0, 0));
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));
  const waitTimeRef = useRef(0);
  const isMovingRef = useRef(false);
  const stuckTimerRef = useRef(0);
  const lastPosRef = useRef(new THREE.Vector3(0, 0, 0));

  const getNewTarget = () => {
    let attempts = 0;
    while (attempts < 20) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * bounds * 0.8;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      let tooClose = false;
      for (const o of obstacles) {
        const dx = x - o.x;
        const dz = z - o.z;
        if (dx * dx + dz * dz < MIN_OBSTACLE_DIST * MIN_OBSTACLE_DIST) {
          tooClose = true;
          break;
        }
      }
      
      if (!tooClose) {
        return new THREE.Vector3(x, 0, z);
      }
      attempts++;
    }
    return new THREE.Vector3(0, 0, 0);
  };

  const initPosition = (position) => {
    posRef.current.set(position[0], position[1], position[2]);
    targetRef.current.set(position[0], position[1], position[2]);
    lastPosRef.current.set(position[0], position[1], position[2]);
  };

  const updateMovement = (delta) => {
    // Проверка на застревание
    const movedDist = posRef.current.distanceTo(lastPosRef.current);
    if (movedDist < 0.01) {
      stuckTimerRef.current += delta;
      if (stuckTimerRef.current > 3) {
        targetRef.current = getNewTarget();
        isMovingRef.current = true;
        stuckTimerRef.current = 0;
      }
    } else {
      stuckTimerRef.current = 0;
      lastPosRef.current.copy(posRef.current);
    }

    const speed = 0.4;
    const dist = posRef.current.distanceTo(targetRef.current);

    if (isMovingRef.current) {
      const direction = new THREE.Vector3().subVectors(targetRef.current, posRef.current).normalize();
      const step = speed * delta;

      if (dist < step) {
        posRef.current.copy(targetRef.current);
        isMovingRef.current = false;
        waitTimeRef.current = Math.random() * 2 + 1;
        return { moving: false, direction: null };
      } else {
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
          targetRef.current = getNewTarget();
          waitTimeRef.current = 0.1;
          return { moving: false, direction: null };
        } else {
          posRef.current.copy(nextPos);
          return { moving: true, direction };
        }
      }
    } else {
      waitTimeRef.current -= delta;
      if (waitTimeRef.current <= 0) {
        if (Math.random() < 0.0005) {
          return { moving: false, lying: true };
        } else {
          targetRef.current = getNewTarget();
          isMovingRef.current = true;
        }
      }
      return { moving: false, direction: null };
    }
  };

  return {
    posRef,
    targetRef,
    isMovingRef,
    initPosition,
    updateMovement,
    getNewTarget
  };
};
