import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbitRingProps {
  center: [number, number, number];
  radius?: number;
  color?: string;
}

export const OrbitRing: React.FC<OrbitRingProps> = ({ 
  center, 
  radius = 8, 
  color = '#8a2be2' 
}) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  // Slow rotation animation
  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.1;
    }
  });

  return (
    <mesh ref={ringRef} position={center} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.02, radius + 0.02, 64]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
