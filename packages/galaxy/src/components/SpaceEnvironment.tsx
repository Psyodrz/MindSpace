import React from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Sun } from './Sun';

export const SpaceEnvironment: React.FC = () => {
  const map = useTexture('/milky-way.jpg');

  return (
    <>
      <ambientLight intensity={0.6} color="#cccccc" />
      <Sun />
      
      {/* Secondary Fill Light (Blueish for space shadow) */}
      <pointLight position={[-30, -10, 20]} intensity={0.5} color="#4444ff" />
      
      {/* Background Sphere */}
      <mesh>
        <sphereGeometry args={[500, 64, 64]} />
        <meshBasicMaterial 
          map={map} 
          side={THREE.BackSide} 
          fog={false} 
          toneMapped={false}
        />
      </mesh>
      
      {/* Soft Fog for depth of nearby objects only */}
      <fog attach="fog" args={['#000000', 10, 150]} />
    </>
  );
};
