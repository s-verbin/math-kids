import { useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const Draggable = ({ children, position, onDragStart, onDragEnd }) => {
  const groupRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const { camera } = useThree();
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const posRef = useRef(new THREE.Vector3(position[0], position[1], position[2]));
  const dragOffset = useRef(new THREE.Vector3());

  useEffect(() => {
    if (isDragging) return; // Не сбрасываем позицию во время перетаскивания
    posRef.current.set(position[0], position[1], position[2]);
    if (groupRef.current) {
      groupRef.current.position.copy(posRef.current);
    }
  }, [position, isDragging]);

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging) return;
      
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.current.setFromCamera(mouse.current, camera);
      const target = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(plane.current, target);
      
      if (target) {
        // Ограничиваем перемещение в пределах фермы
        const bounds = 30;
        target.x = Math.max(-bounds, Math.min(bounds, target.x));
        target.z = Math.max(-bounds, Math.min(bounds, target.z));
        target.y = position[1]; // Сохраняем исходную высоту
        target.add(dragOffset.current);
        
        posRef.current.copy(target);
        if (groupRef.current) {
          groupRef.current.position.copy(target);
        }
      }
    };

    const handleUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (onDragEnd) onDragEnd([posRef.current.x, posRef.current.y, posRef.current.z]);
      }
    };

    if (isDragging) {
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    }

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [isDragging, camera, position, onDragEnd]);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    
    // Инициализируем мышь и offset, чтобы не было прыжка
    mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.current.setFromCamera(mouse.current, camera);
    const target = new THREE.Vector3();
    raycaster.current.ray.intersectPlane(plane.current, target);
    
    if (target) {
      dragOffset.current.subVectors(posRef.current, target);
    } else {
      dragOffset.current.set(0, 0, 0);
    }
    
    setIsDragging(true);
    if (onDragStart) onDragStart();
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={handlePointerDown}
    >
      {children}
    </group>
  );
};

export default Draggable;
