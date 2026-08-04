import * as THREE from 'three';

const FarmBuilding = ({ position = [0, 0, 0], itemName = 'Постройка', isDecoration = false }) => {
  const getBuildingConfig = () => {
    const configs = {
      'Сарай': { color: '#8B4513', roofColor: '#A0522D', width: 2.6, height: 2.2, depth: 2.0, roof: 'triangular', shape: 'box' },
      'Забор деревянный': { color: '#A0522D', roofColor: null, width: 2.4, height: 0.9, depth: 0.15, roof: 'none', shape: 'fence' },
      'Кормушка': { color: '#DEB887', roofColor: '#8B4513', width: 1.4, height: 0.65, depth: 0.9, roof: 'flat', shape: 'trough' },
      'Поилка': { color: '#4682B4', roofColor: null, width: 0.9, height: 0.65, depth: 0.9, roof: 'none', shape: 'bowl' },
      'Мельница': { color: '#F4A460', roofColor: '#8B4513', width: 1.4, height: 2.8, depth: 1.4, roof: 'cone', shape: 'tower' },
      'Колодец': { color: '#696969', roofColor: '#8B4513', width: 1.2, height: 1.4, depth: 1.2, roof: 'flat', shape: 'well' },
      'Стог сена': { color: '#DAA520', roofColor: '#B8860B', width: 1.4, height: 1.1, depth: 1.4, roof: 'round', shape: 'hay' },
      'Фонарь': { color: '#2F4F4F', roofColor: '#FFD700', width: 0.25, height: 1.4, depth: 0.25, roof: 'none', shape: 'lamp' },
      'Скамейка': { color: '#8B4513', roofColor: null, width: 1.4, height: 0.55, depth: 0.45, roof: 'none', shape: 'bench' },
      'Цветочная клумба': { color: '#8B4513', roofColor: '#FF69B4', width: 1.1, height: 0.45, depth: 1.1, roof: 'round', shape: 'flowerbed' },
      'Пугало': { color: '#F0E68C', roofColor: '#8B4513', width: 0.55, height: 1.7, depth: 0.35, roof: 'none', shape: 'scarecrow' },
      'Шляпа соломенная': { color: '#F4A460', roofColor: null, width: 0.4, height: 0.15, depth: 0.4, roof: 'none', shape: 'accessory', acc: 'hat' },
      'Бантик красный': { color: '#FF0000', roofColor: null, width: 0.35, height: 0.15, depth: 0.2, roof: 'none', shape: 'accessory', acc: 'bow' },
      'Колокольчик': { color: '#FFD700', roofColor: null, width: 0.25, height: 0.35, depth: 0.25, roof: 'none', shape: 'accessory', acc: 'bell' },
      'Седло': { color: '#8B4513', roofColor: null, width: 0.5, height: 0.3, depth: 0.35, roof: 'none', shape: 'accessory', acc: 'saddle' },
      'Ошейник': { color: '#FF6347', roofColor: null, width: 0.35, height: 0.12, depth: 0.35, roof: 'none', shape: 'accessory', acc: 'collar' },
      'Цветочный венок': { color: '#FF69B4', roofColor: null, width: 0.45, height: 0.15, depth: 0.45, roof: 'none', shape: 'accessory', acc: 'wreath' }
    };
    return configs[itemName] || { color: '#DEB887', roofColor: '#8B4513', width: 1.2, height: 1, depth: 1.2, roof: 'flat', shape: 'box' };
  };

  const config = getBuildingConfig();
  const s = isDecoration ? 0.9 : 1;
  const w = config.width * s;
  const h = config.height * s;
  const d = config.depth * s;

  const Base = () => {
    switch (config.shape) {
      case 'fence':
        return (
          <group>
            {[-1, 0, 1].map((x, i) => (
              <mesh key={i} castShadow position={[x * w * 0.4, h / 2, 0]}>
                <boxGeometry args={[0.12, h, 0.12]} />
                <meshStandardMaterial color='#5D4037' roughness={0.9} />
              </mesh>
            ))}
            {[0.3, 0.7].map((y, i) => (
              <mesh key={i} castShadow position={[0, y * h, 0]}>
                <boxGeometry args={[w * 0.95, 0.08, 0.08]} />
                <meshStandardMaterial color={config.color} roughness={0.9} />
              </mesh>
            ))}
          </group>
        );
      case 'trough':
        return (
          <group>
            <mesh castShadow position={[0, h / 2, 0]}>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial color={config.color} roughness={0.8} />
            </mesh>
            <mesh position={[0, h * 0.9, 0]}>
              <boxGeometry args={[w * 0.85, 0.05, d * 0.85]} />
              <meshStandardMaterial color='#8B4513' />
            </mesh>
          </group>
        );
      case 'bowl':
        return (
          <group>
            <mesh castShadow position={[0, h / 2, 0]}>
              <cylinderGeometry args={[w * 0.6, w * 0.5, h, 16]} />
              <meshStandardMaterial color={config.color} roughness={0.8} />
            </mesh>
            <mesh position={[0, h * 0.85, 0]}>
              <cylinderGeometry args={[w * 0.45, w * 0.45, 0.08, 16]} />
              <meshStandardMaterial color='#87CEEB' transparent opacity={0.7} />
            </mesh>
          </group>
        );
      case 'tower':
        return (
          <mesh castShadow position={[0, h / 2, 0]}>
            <cylinderGeometry args={[w * 0.55, w * 0.7, h, 16]} />
            <meshStandardMaterial color={config.color} roughness={0.8} />
          </mesh>
        );
      case 'well':
        return (
          <group>
            <mesh castShadow position={[0, h / 2, 0]}>
              <cylinderGeometry args={[w * 0.55, w * 0.55, h, 16]} />
              <meshStandardMaterial color={config.color} roughness={0.8} />
            </mesh>
            <mesh position={[0, h + 0.15, 0]}>
              <torusGeometry args={[w * 0.5, 0.08, 8, 24]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color='#8B4513' />
            </mesh>
          </group>
        );
      case 'hay':
        return (
          <mesh castShadow position={[0, h / 2, 0]}>
            <coneGeometry args={[w * 0.65, h, 12]} />
            <meshStandardMaterial color={config.color} roughness={0.9} />
          </mesh>
        );
      case 'lamp':
        return (
          <group>
            <mesh castShadow position={[0, h * 0.75, 0]}>
              <cylinderGeometry args={[w * 0.15, w * 0.15, h * 1.5, 8]} />
              <meshStandardMaterial color={config.color} roughness={0.7} />
            </mesh>
            <mesh position={[0, h * 0.15, 0]}>
              <cylinderGeometry args={[w * 0.35, w * 0.35, 0.08, 16]} />
              <meshStandardMaterial color='#3d3d3d' />
            </mesh>
          </group>
        );
      case 'bench':
        return (
          <group>
            <mesh castShadow position={[0, h * 0.4, d * 0.25]}>
              <boxGeometry args={[w, h * 0.1, d * 0.15]} />
              <meshStandardMaterial color={config.color} roughness={0.8} />
            </mesh>
            <mesh castShadow position={[0, h * 0.85, -d * 0.05]}>
              <boxGeometry args={[w, h * 0.25, d * 0.1]} />
              <meshStandardMaterial color={config.color} roughness={0.8} />
            </mesh>
            {[-1, 1].map((x, i) => (
              <mesh key={i} castShadow position={[x * w * 0.4, h / 2, 0]}>
                <boxGeometry args={[0.08, h, d * 0.8]} />
                <meshStandardMaterial color='#5D4037' />
              </mesh>
            ))}
          </group>
        );
      case 'flowerbed':
        return (
          <group>
            <mesh castShadow position={[0, h / 2, 0]}>
              <cylinderGeometry args={[w * 0.5, w * 0.5, h, 16]} />
              <meshStandardMaterial color={config.color} roughness={0.8} />
            </mesh>
          </group>
        );
      case 'scarecrow':
        return (
          <group>
            <mesh castShadow position={[0, h / 2, 0]}>
              <cylinderGeometry args={[w * 0.12, w * 0.12, h, 8]} />
              <meshStandardMaterial color='#8B4513' />
            </mesh>
          </group>
        );
      case 'accessory':
        return (
          <group>
            {config.acc === 'hat' && (
              <>
                <mesh castShadow position={[0, h * 0.35, 0]}>
                  <cylinderGeometry args={[w * 0.7, w * 0.7, 0.05, 16]} />
                  <meshStandardMaterial color={config.color} />
                </mesh>
                <mesh castShadow position={[0, h * 0.7, 0]}>
                  <cylinderGeometry args={[w * 0.4, w * 0.35, h * 0.7, 16]} />
                  <meshStandardMaterial color='#D2691E' />
                </mesh>
              </>
            )}
            {config.acc === 'bow' && (
              <>
                <mesh castShadow position={[-w * 0.3, h * 0.5, 0]} rotation={[0, 0, 0.5]}>
                  <coneGeometry args={[w * 0.25, h * 0.8, 8]} />
                  <meshStandardMaterial color={config.color} />
                </mesh>
                <mesh castShadow position={[w * 0.3, h * 0.5, 0]} rotation={[0, 0, -0.5]}>
                  <coneGeometry args={[w * 0.25, h * 0.8, 8]} />
                  <meshStandardMaterial color={config.color} />
                </mesh>
              </>
            )}
            {config.acc === 'bell' && (
              <mesh castShadow position={[0, h * 0.5, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[w * 0.4, h * 0.8, 16]} />
                <meshStandardMaterial color={config.color} metalness={0.6} />
              </mesh>
            )}
            {config.acc === 'saddle' && (
              <group>
                <mesh castShadow position={[0, h * 0.5, 0]}>
                  <boxGeometry args={[w, h, d]} />
                  <meshStandardMaterial color={config.color} />
                </mesh>
                <mesh castShadow position={[0, h * 1.1, -d * 0.25]}>
                  <boxGeometry args={[w, h * 0.5, 0.05]} />
                  <meshStandardMaterial color='#5D4037' />
                </mesh>
              </group>
            )}
            {config.acc === 'collar' && (
              <mesh castShadow position={[0, h * 0.5, 0]}>
                <torusGeometry args={[w * 0.45, 0.04, 8, 24]} rotation={[Math.PI / 2, 0, 0]} />
                <meshStandardMaterial color={config.color} />
              </mesh>
            )}
            {config.acc === 'wreath' && (
              <group>
                <mesh castShadow position={[0, h * 0.5, 0]}>
                  <torusGeometry args={[w * 0.45, 0.06, 8, 24]} rotation={[Math.PI / 2, 0, 0]} />
                  <meshStandardMaterial color='#4CAF50' />
                </mesh>
                {[[-w * 0.45, h * 0.5, 0], [w * 0.45, h * 0.5, 0], [0, h * 0.5, w * 0.45], [0, h * 0.5, -w * 0.45]].map((p, i) => (
                  <mesh key={i} position={p}>
                    <sphereGeometry args={[0.06, 6, 6]} />
                    <meshStandardMaterial color={['#FF69B4', '#FFD700', '#FF4500', '#9370DB'][i]} />
                  </mesh>
                ))}
              </group>
            )}
          </group>
        );
      case 'box':
      default:
        return (
          <mesh castShadow position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={config.color} roughness={0.8} />
          </mesh>
        );
    }
  };

  const Roof = () => {
    if (!config.roofColor || config.roof === 'none') return null;
    switch (config.roof) {
      case 'triangular':
        return (
          <mesh castShadow position={[0, h + 0.35, 0]}>
            <coneGeometry args={[w * 0.8, 0.7, 4]} />
            <meshStandardMaterial color={config.roofColor} roughness={0.7} />
          </mesh>
        );
      case 'flat':
        return (
          <group>
            <mesh castShadow position={[0, h + 0.12, 0]}>
              <boxGeometry args={[w * 1.1, 0.15, d * 1.1]} />
              <meshStandardMaterial color={config.roofColor} roughness={0.7} />
            </mesh>
            <mesh castShadow position={[0, h + 0.5, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
              <meshStandardMaterial color='#8B4513' />
            </mesh>
          </group>
        );
      case 'cone':
        return (
          <mesh castShadow position={[0, h + 0.6, 0]}>
            <coneGeometry args={[w * 0.8, 0.9, 8]} />
            <meshStandardMaterial color={config.roofColor} roughness={0.7} />
          </mesh>
        );
      case 'round':
        return (
          <mesh castShadow position={[0, h + 0.25, 0]}>
            <sphereGeometry args={[w * 0.45, 12, 12]} />
            <meshStandardMaterial color={config.roofColor} roughness={0.7} />
          </mesh>
        );
      default:
        return null;
    }
  };

  return (
    <group position={position}>
      <Base />
      <Roof />

      {/* Детали Сарая */}
      {itemName === 'Сарай' && (
        <>
          <mesh castShadow position={[0, h * 0.45, d * 0.51]}>
            <boxGeometry args={[w * 0.5, h * 0.8, 0.05]} />
            <meshStandardMaterial color='#4E342E' />
          </mesh>
          <mesh castShadow position={[w * 0.35, h * 0.7, d * 0.51]}>
            <boxGeometry args={[w * 0.2, h * 0.2, 0.05]} />
            <meshStandardMaterial color='#4fc3f7' roughness={0.3} />
          </mesh>
        </>
      )}

      {/* Мельница - лопасти */}
      {itemName === 'Мельница' && (
        <group position={[0, h + 0.5, 0]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0, 0, 0]} rotation={[0, 0, i * Math.PI / 2]}>
              <boxGeometry args={[w * 2.4, 0.12, 0.05]} />
              <meshStandardMaterial color='#FFF8DC' />
            </mesh>
          ))}
          <mesh position={[0, 0, 0.05]}>
            <cylinderGeometry args={[0.08, 0.08, 0.15, 8]} />
            <meshStandardMaterial color='#5D4037' />
          </mesh>
        </group>
      )}

      {/* Колодец - ведро и ручка */}
      {itemName === 'Колодец' && (
        <>
          <mesh position={[-w * 0.1, h + 0.4, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.18, 12]} />
            <meshStandardMaterial color='#5D4037' />
          </mesh>
          <mesh position={[w * 0.45, h + 0.05, 0]} rotation={[0, 0, 0.1]}>
            <cylinderGeometry args={[0.04, 0.04, h * 0.6, 8]} />
            <meshStandardMaterial color='#8B4513' />
          </mesh>
        </>
      )}

      {/* Стог сена - соломинки */}
      {itemName === 'Стог сена' && (
        <>
          {[...Array(6)].map((_, i) => (
            <mesh key={i} position={[(Math.random() - 0.5) * w * 0.6, h * 0.8 + Math.random() * 0.2, (Math.random() - 0.5) * d * 0.6]} rotation={[Math.random(), 0, Math.random()]}>
              <cylinderGeometry args={[0.02, 0.02, 0.35, 4]} />
              <meshStandardMaterial color='#F0E68C' />
            </mesh>
          ))}
        </>
      )}

      {/* Фонарь - свечение */}
      {itemName === 'Фонарь' && (
        <mesh position={[0, h * 0.8, 0]}>
          <sphereGeometry args={[w * 0.55, 16, 16]} />
          <meshStandardMaterial color='#FFD700' emissive='#FFD700' emissiveIntensity={0.6} />
        </mesh>
      )}

      {/* Цветочная клумба */}
      {itemName === 'Цветочная клумба' && (
        <>
          {[...Array(7)].map((_, i) => {
            const a = (i / 7) * Math.PI * 2;
            const r = w * (0.15 + Math.random() * 0.25);
            return (
              <mesh key={i} position={[Math.cos(a) * r, h * 0.7, Math.sin(a) * r]}>
                <sphereGeometry args={[w * (0.06 + Math.random() * 0.05), 6, 6]} />
                <meshStandardMaterial color={`hsl(${i * 50}, 85%, 60%)`} />
              </mesh>
            );
          })}
        </>
      )}

      {/* Пугало */}
      {itemName === 'Пугало' && (
        <>
          <mesh castShadow position={[0, h + 0.1, 0]}>
            <sphereGeometry args={[w * 0.25, 12, 12]} />
            <meshStandardMaterial color='#F0E68C' />
          </mesh>
          <mesh position={[-w * 0.45, h * 0.6, 0]} rotation={[0, 0, 0.8]}>
            <cylinderGeometry args={[0.05, 0.05, w * 0.9, 8]} />
            <meshStandardMaterial color='#8B4513' />
          </mesh>
          <mesh position={[w * 0.45, h * 0.6, 0]} rotation={[0, 0, -0.8]}>
            <cylinderGeometry args={[0.05, 0.05, w * 0.9, 8]} />
            <meshStandardMaterial color='#8B4513' />
          </mesh>
        </>
      )}
    </group>
  );
};

export default FarmBuilding;
