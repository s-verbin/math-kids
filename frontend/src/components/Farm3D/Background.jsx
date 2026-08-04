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

      {/* Солнце */}
      <mesh position={[-40, 45, -50]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      <mesh position={[-40, 45, -50]}>
        <sphereGeometry args={[6.5, 32, 32]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.2} />
      </mesh>

      {/* Облака */}
      {[[-25, 42, -20], [15, 46, -35], [35, 40, 10], [-45, 44, 0], [5, 48, -50]].map((pos, i) => (
        <group key={`cloud-${i}`} position={pos}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[2 + (i % 2), 12, 12]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} transparent opacity={0.85} />
          </mesh>
          <mesh position={[-1.5, -0.2, 0]}>
            <sphereGeometry args={[1.8, 12, 12]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} transparent opacity={0.85} />
          </mesh>
          <mesh position={[1.5, -0.3, 0]}>
            <sphereGeometry args={[1.8, 12, 12]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} transparent opacity={0.85} />
          </mesh>
        </group>
      ))}

      {/* Птицы */}
      {[[-10, 38, -25], [20, 41, -15], [-30, 39, 5]].map((pos, i) => (
        <group key={`bird-${i}`} position={pos} rotation={[0, i * 0.7, 0]}>
          <mesh position={[-0.3, 0, 0]} rotation={[0, 0, 0.5]}>
            <coneGeometry args={[0.1, 0.4, 4]} />
            <meshBasicMaterial color="#333" />
          </mesh>
          <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.5]}>
            <coneGeometry args={[0.1, 0.4, 4]} />
            <meshBasicMaterial color="#333" />
          </mesh>
        </group>
      ))}

      {/* Горы на заднем плане */}
      <group position={[0, 0, -40]}>
        <mesh position={[-25, 5, 0]}>
          <coneGeometry args={[9, 12, 4]} />
          <meshStandardMaterial color="#5c6bc0" roughness={0.8} />
        </mesh>
        <mesh position={[-8, 4, -6]}>
          <coneGeometry args={[7, 10, 4]} />
          <meshStandardMaterial color="#7986cb" roughness={0.8} />
        </mesh>
        <mesh position={[15, 5.5, -3]}>
          <coneGeometry args={[10, 13, 4]} />
          <meshStandardMaterial color="#3f51b5" roughness={0.8} />
        </mesh>
        <mesh position={[35, 4, -5]}>
          <coneGeometry args={[8, 10, 4]} />
          <meshStandardMaterial color="#5c6bc0" roughness={0.8} />
        </mesh>
        <mesh position={[0, 6, -10]}>
          <coneGeometry args={[14, 16, 4]} />
          <meshStandardMaterial color="#9575cd" roughness={0.8} />
        </mesh>
      </group>

      {/* Холмы по бокам */}
      {[[-48, 1.2, 8, 14, 5], [48, 1.4, 12, 16, 6], [-40, 1, 25, 12, 4], [42, 1, 32, 13, 4], [0, 1, 40, 20, 5]].map(([x, y, z, r, h], i) => (
        <mesh key={`hill-${i}`} position={[x, y, z]} rotation={[0, 0, 0]}>
          <coneGeometry args={[r, h, 8]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#8bc34a' : '#7cb342'} roughness={0.9} />
        </mesh>
      ))}

      {/* Река */}
      <mesh position={[30, -0.04, 15]} rotation={[-Math.PI / 2, 0, 0.5]}>
        <planeGeometry args={[14, 70]} />
        <meshStandardMaterial color="#4fc3f7" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Мост через реку */}
      <group position={[32, 0.2, 5]}>
        <mesh position={[0, 0.1, 0]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[3, 0.2, 6]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
        <mesh position={[-1.2, 0.4, -2.2]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
        <mesh position={[1.2, 0.4, 2.2]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      </group>

      {/* Водопад и каньон */}
      <group position={[-25, 0, -25]}>
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[9, 5, 3]} />
          <meshStandardMaterial color="#795548" roughness={0.9} />
        </mesh>
        <mesh position={[0, 3.2, 1.6]}>
          <boxGeometry args={[3.5, 4.5, 0.2]} />
          <meshStandardMaterial color="#4fc3f7" transparent opacity={0.8} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.2, 3]}>
          <boxGeometry args={[7, 0.4, 7]} />
          <meshStandardMaterial color="#4fc3f7" transparent opacity={0.7} roughness={0.1} />
        </mesh>
        <mesh position={[-4.5, 2.5, -2]}>
          <boxGeometry args={[1, 4, 4]} />
          <meshStandardMaterial color="#795548" />
        </mesh>
      </group>

      {/* Ветряная мельница на дальнем холме */}
      <group position={[-55, 0, -15]}>
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[1.2, 5, 1.2]} />
          <meshStandardMaterial color='#F4A460' />
        </mesh>
        <mesh position={[0, 5.2, 0]}>
          <coneGeometry args={[1.1, 1.2, 4]} />
          <meshStandardMaterial color='#8B4513' />
        </mesh>
        {[[0, 5.5], [90, 5.5], [180, 5.5], [270, 5.5]].map(([rot, y], i) => (
          <mesh key={i} position={[0, y, 0.2]} rotation={[0, 0, rot * Math.PI / 180]}>
            <boxGeometry args={[3.2, 0.15, 0.05]} />
            <meshStandardMaterial color='#FFF8DC' />
          </mesh>
        ))}
      </group>

      {/* Деревья разных размеров */}
      {[
        [-20, 0, -18, 1.1], [24, 0, -22, 0.8], [35, 0, -15, 1.2], [-32, 0, 12, 0.9],
        [42, 0, 5, 1.0], [-42, 0, -8, 0.85], [17, 0, -32, 1.15], [-50, 0, -25, 1.3],
        [50, 0, -20, 0.75], [-15, 0, 35, 0.7], [10, 0, 38, 0.9], [45, 0, 28, 0.8],
        [-5, 0, -42, 1.0], [25, 0, 40, 0.7]
      ].map(([x, y, z, scale], i) => {
        const c = i % 3 === 0 ? '#2e7d32' : i % 3 === 1 ? '#388e3c' : '#43a047';
        return (
          <group key={`tree-${i}`} position={[x, y, z]} scale={[scale, scale, scale]}>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
              <meshStandardMaterial color="#6d4c41" roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.8, 0]}>
              <coneGeometry args={[1, 2.5, 8]} />
              <meshStandardMaterial color={c} roughness={0.8} />
            </mesh>
            <mesh position={[0, 2.8, 0]}>
              <coneGeometry args={[0.8, 2, 8]} />
              <meshStandardMaterial color={c} roughness={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* Цветы на полях */}
      {[
        [18, -0.02, 18, '#FF69B4'], [-18, -0.02, 20, '#FFD700'], [22, -0.02, 25, '#FF4500'],
        [-28, -0.02, 18, '#9370DB'], [35, -0.02, 30, '#FF69B4'], [-12, -0.02, 32, '#FF4500'],
        [8, -0.02, 22, '#FFD700'], [-45, -0.02, 15, '#FF69B4'], [45, -0.02, 20, '#9370DB']
      ].map(([x, y, z, color], i) => (
        <mesh key={`flower-${i}`} position={[x, y, z]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}

      {/* Кусты */}
      {[[-22, 0, 28], [30, 0, 22], [40, 0, 30], [-8, 0, 36]].map((pos, i) => (
        <group key={`bush-${i}`} position={pos}>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color="#4CAF50" />
          </mesh>
          <mesh position={[0.3, 0.35, 0.1]}>
            <sphereGeometry args={[0.35, 8, 8]} />
            <meshStandardMaterial color="#43A047" />
          </mesh>
        </group>
      ))}

      {/* Камни */}
      {[[-25, 0, 15, 0.6], [28, 0, 12, 0.8], [12, 0, 30, 0.5], [-35, 0, 5, 0.7], [5, 0, -20, 0.9]].map(([x, y, z, s], i) => (
        <mesh key={`rock-${i}`} castShadow position={[x, y + s * 0.3, z]}>
          <dodecahedronGeometry args={[s, 0]} />
          <meshStandardMaterial color="#757575" roughness={0.9} />
        </mesh>
      ))}

      {/* Забор по периметру фермы */}
      {[
        [-22, 0.45, -22], [-22, 0.45, -15], [-22, 0.45, -8], [-22, 0.45, 0], [-22, 0.45, 8], [-22, 0.45, 15], [-22, 0.45, 22],
        [22, 0.45, -22], [22, 0.45, -15], [22, 0.45, -8], [22, 0.45, 0], [22, 0.45, 8], [22, 0.45, 15], [22, 0.45, 22],
        [-15, 0.45, -22], [-8, 0.45, -22], [0, 0.45, -22], [8, 0.45, -22], [15, 0.45, -22]
      ].map((pos, i) => (
        <mesh key={`fence-${i}`} position={pos}>
          <boxGeometry args={[0.12, 0.9, 0.08]} />
          <meshStandardMaterial color="#A0522D" roughness={0.9} />
        </mesh>
      ))}

      {/* Дома в деревне на заднем плане */}
      {[[-15, 0, -50], [8, 0, -55], [28, 0, -48], [-32, 0, -45], [50, 0, -52], [-55, 0, -48]].map((pos, i) => (
        <group key={`house-${i}`} position={pos}>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[2.5, 1.8, 2]} />
            <meshStandardMaterial color={['#ffcc80', '#c5e1a5', '#ffab91', '#81d4fa', '#ce93d8', '#fff59d'][i]} roughness={0.8} />
          </mesh>
          <mesh position={[0, 2.0, 0]}>
            <coneGeometry args={[2, 1.4, 4]} />
            <meshStandardMaterial color="#8d6e63" roughness={0.8} />
          </mesh>
          <mesh position={[0.4, 0.9, 1.05]}>
            <boxGeometry args={[0.5, 0.7, 0.1]} />
            <meshStandardMaterial color="#4fc3f7" roughness={0.3} />
          </mesh>
          <mesh position={[-0.4, 0.9, 1.05]}>
            <boxGeometry args={[0.5, 0.7, 0.1]} />
            <meshStandardMaterial color="#4fc3f7" roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default Background;
