import * as THREE from 'three';

const LandPlot = ({ position = [0, 0, 0], itemName = 'Участок земли' }) => {
  return (
    <group position={position}>
      {/* Участок земли - возвышенность */}
      <mesh receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[2.2, 0.1, 2.2]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>

      {/* Трава сверху */}
      <mesh receiveShadow position={[0, 0.11, 0]}>
        <boxGeometry args={[2, 0.05, 2]} />
        <meshStandardMaterial color="#6b9e4b" roughness={0.8} />
      </mesh>

      {/* Бордюр */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[2.1, 0.08, 0.1]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
      <mesh position={[0, 0.12, 1]}>
        <boxGeometry args={[2.1, 0.08, 0.1]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
      <mesh position={[-1, 0.12, 0.5]}>
        <boxGeometry args={[0.1, 0.08, 1]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
      <mesh position={[1, 0.12, 0.5]}>
        <boxGeometry args={[0.1, 0.08, 1]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
    </group>
  );
};

export default LandPlot;
