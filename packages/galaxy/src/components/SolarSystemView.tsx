import React, { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { useTexture, Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { AsteroidBelt } from './AsteroidBelt';
import { OrbitPath } from './OrbitPath';
import { type ThemeConfig, THEMES } from '../themes';
import { type PlanetCategory } from '../solarSystem';

// Store for planet positions (shared between planets and camera)
const planetPositions: Record<string, THREE.Vector3> = {};

// Node type with orbital properties
interface OrbitingNode {
  id: string;
  title: string;
  textureUrl?: string;
  orbitRadius?: number;
  orbitSpeed?: number;
  orbitAngle?: number;
  planetSize?: number;
}

interface SolarSystemViewProps {
  nodes: OrbitingNode[];
  selectedNodeId: string | null;
  theme?: ThemeConfig;
  onNodeSelect?: (id: string) => void;
}

// Camera tracker that follows selected planet
const CameraTracker: React.FC<{ selectedNodeId: string | null }> = ({ selectedNodeId }) => {
  const { camera } = useThree();
  const smoothedPos = useRef(new THREE.Vector3(0, 80, 150));
  const smoothedLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isFollowing = useRef(false);
  
  useFrame(() => {
    if (selectedNodeId && planetPositions[selectedNodeId]) {
      const planetPos = planetPositions[selectedNodeId];
      isFollowing.current = true;
      
      // Fixed offset from planet (behind and above)
      const targetCameraPos = new THREE.Vector3(
        planetPos.x + 15,
        planetPos.y + 12,
        planetPos.z + 25
      );
      
      // Very smooth lerp (0.02 = very gradual)
      smoothedPos.current.lerp(targetCameraPos, 0.02);
      smoothedLookAt.current.lerp(planetPos, 0.03);
      
      camera.position.copy(smoothedPos.current);
      camera.lookAt(smoothedLookAt.current);
    } else if (isFollowing.current) {
      // Reset to default view when deselected
      const defaultPos = new THREE.Vector3(0, 80, 150);
      const defaultLookAt = new THREE.Vector3(0, 0, 0);
      
      smoothedPos.current.lerp(defaultPos, 0.02);
      smoothedLookAt.current.lerp(defaultLookAt, 0.02);
      
      camera.position.copy(smoothedPos.current);
      camera.lookAt(smoothedLookAt.current);
      
      // Check if we're close enough to stop
      if (smoothedPos.current.distanceTo(defaultPos) < 0.5) {
        isFollowing.current = false;
      }
    }
  });
  
  return null;
};

// Centered Sun at origin
const CenteredSun: React.FC = () => {
  const texture = useTexture('/sun.jpg');
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });
  
  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[8, 64, 64]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* Point light from sun */}
      <pointLight color="#ffaa55" intensity={3} distance={0} decay={0} />
    </group>
  );
};

// Textured planet sphere
const TexturedPlanetSphere: React.FC<{
  size: number;
  textureUrl: string;
  selected: boolean;
  theme: ThemeConfig;
  onClick: () => void;
}> = ({ size, textureUrl, selected, theme, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(textureUrl);
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });
  
  return (
    <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial 
        map={texture}
        roughness={0.7}
        metalness={0.1}
        emissive={selected ? theme.accentColor : '#000000'}
        emissiveIntensity={selected ? 0.3 : 0}
      />
    </mesh>
  );
};

// Simple fallback planet
const FallbackPlanetSphere: React.FC<{
  size: number;
  onClick: () => void;
}> = ({ size, onClick }) => (
  <mesh onClick={(e) => { e.stopPropagation(); onClick(); }}>
    <sphereGeometry args={[size, 32, 32]} />
    <meshStandardMaterial color="#888888" roughness={0.8} />
  </mesh>
);

// Single orbiting planet (a note)
const OrbitingPlanet: React.FC<{
  node: OrbitingNode;
  theme: ThemeConfig;
  selected: boolean;
  onClick: () => void;
}> = ({ node, theme, selected, onClick }) => {
  const orbitRef = useRef<THREE.Group>(null);
  const angleRef = useRef(node.orbitAngle || Math.random() * Math.PI * 2);
  
  const orbitRadius = node.orbitRadius || 50;
  const orbitSpeed = node.orbitSpeed || 1;
  const planetSize = node.planetSize || 2;

  useFrame((_, delta) => {
    // Update orbit angle
    angleRef.current += delta * orbitSpeed * 0.1;
    
    // Calculate position
    const x = orbitRadius * Math.cos(angleRef.current);
    const z = orbitRadius * Math.sin(angleRef.current);
    
    if (orbitRef.current) {
      orbitRef.current.position.set(x, 0, z);
      
      // Store position for camera tracking
      if (!planetPositions[node.id]) {
        planetPositions[node.id] = new THREE.Vector3();
      }
      planetPositions[node.id].set(x, 0, z);
    }
  });

  // Create fake PlanetCategory for OrbitPath
  const fakePlanet: PlanetCategory = {
    id: node.id,
    name: node.title,
    label: node.title,
    color: '#ffffff',
    description: '',
    orbit: {
      radius: orbitRadius,
      speed: orbitSpeed,
      eccentricity: 0.02,
      inclination: 0
    },
    size: planetSize
  };

  return (
    <group>
      {/* Orbit path */}
      <OrbitPath planet={fakePlanet} />
      
      {/* Orbiting group */}
      <group ref={orbitRef}>
        {/* Planet sphere with texture */}
        <Suspense fallback={<FallbackPlanetSphere size={planetSize} onClick={onClick} />}>
          <TexturedPlanetSphere 
            size={planetSize} 
            textureUrl={node.textureUrl || '/moon.jpg'} 
            selected={selected}
            theme={theme}
            onClick={onClick}
          />
        </Suspense>
        
        {/* Label - always visible */}
        <Html
          distanceFactor={15}
          position={[0, planetSize + 1.5, 0]}
          style={{ pointerEvents: 'none' }}
          center
          zIndexRange={[0, 0]}
        >
          <div style={{
            color: '#fff',
            background: selected ? `${theme.accentColor}dd` : 'rgba(0,0,0,0.7)',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
            border: selected ? `2px solid ${theme.accentColor}` : '1px solid rgba(255,255,255,0.2)',
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {node.title || 'Untitled'}
          </div>
        </Html>
      </group>
    </group>
  );
};

export const SolarSystemView: React.FC<SolarSystemViewProps> = ({
  nodes,
  selectedNodeId,
  theme,
  onNodeSelect
}) => {
  const themeConfig = theme || THEMES['deep-space'];

  return (
    <group>
      {/* Camera Tracker - follows selected planet */}
      <CameraTracker selectedNodeId={selectedNodeId} />

      {/* Centered Sun */}
      <Suspense fallback={null}>
        <CenteredSun />
      </Suspense>

      {/* Asteroid Belt */}
      <Suspense fallback={null}>
        <AsteroidBelt />
      </Suspense>

      {/* Each note as an orbiting planet */}
      {nodes.map((node) => (
        <OrbitingPlanet
          key={node.id}
          node={node}
          theme={themeConfig}
          selected={node.id === selectedNodeId}
          onClick={() => onNodeSelect?.(node.id)}
        />
      ))}
    </group>
  );
};
