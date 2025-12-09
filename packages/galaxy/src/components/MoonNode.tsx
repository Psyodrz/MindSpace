import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { type ThemeConfig, THEMES } from '../themes';
import { type MoonOrbit } from '../solarSystem';

interface MoonNodeProps {
  id: string;
  title: string;
  color?: string;
  moonOrbit: MoonOrbit;
  theme?: ThemeConfig;
  selected?: boolean;
  onClick?: () => void;
}

export const MoonNode: React.FC<MoonNodeProps> = ({
  id,
  title,
  color,
  moonOrbit,
  theme,
  selected,
  onClick
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const themeConfig = theme || THEMES['deep-space'];
  const angleRef = useRef(moonOrbit.angle);
  const texture = useTexture('/moon.jpg');

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Orbit around parent planet
    angleRef.current += delta * moonOrbit.speed * 0.3;
    
    const x = moonOrbit.radius * Math.cos(angleRef.current);
    const z = moonOrbit.radius * Math.sin(angleRef.current);
    
    meshRef.current.position.set(x, 0, z);
    
    // Self rotation
    meshRef.current.rotation.y += delta * 0.5;
  });

  const accentColor = themeConfig.accentColor;

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.6, 16, 16]} />
      <meshStandardMaterial 
        map={texture}
        roughness={0.9}
        metalness={0.1}
        emissive={selected ? accentColor : '#000000'}
        emissiveIntensity={selected ? 0.3 : 0}
      />
      
      {/* Label */}
      {(hovered || selected) && (
        <Html
          distanceFactor={10}
          position={[0, 1, 0]}
          style={{ pointerEvents: 'none' }}
          center
          zIndexRange={[0, 0]}
        >
          <div style={{
            color: '#fff',
            background: selected ? `${accentColor}dd` : 'rgba(0,0,0,0.75)',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
            border: `1px solid ${accentColor}66`,
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {title || 'Untitled'}
          </div>
        </Html>
      )}
    </mesh>
  );
};
