import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlanetProps {
  // Orbital parameters
  orbitRadius: number;      // Distance from center
  orbitSpeed?: number;      // Radians per second
  orbitTilt?: number;       // Tilt angle of orbit plane
  initialAngle?: number;    // Starting angle in orbit
  
  // Planet properties
  size: number;             // Radius of planet
  rotationSpeed?: number;   // Self-rotation speed
  
  // Visual properties
  color: string;            // Base color
  emissive?: string;        // Emissive color for glow
  emissiveIntensity?: number;
  roughness?: number;       // Material roughness (0-1)
  metalness?: number;       // Material metalness (0-1)
  
  // Parallax depth factor (higher = more parallax movement)
  parallaxFactor?: number;
  parallaxOffset?: { x: number; y: number };
  
  // Ring (optional Saturn-like ring)
  hasRing?: boolean;
  ringColor?: string;
}

/**
 * Planet component with realistic materials and slow orbit/rotation.
 * 
 * Orbit calculation:
 * - Position = (cos(angle) * radius, 0, sin(angle) * radius)
 * - Angle increases by orbitSpeed each frame
 * - Tilt rotates the orbit plane
 */
export function Planet({
  orbitRadius,
  orbitSpeed = 0.01,
  orbitTilt = 0,
  initialAngle = 0,
  size,
  rotationSpeed = 0.1,
  color,
  emissive,
  emissiveIntensity = 0.1,
  roughness = 0.8,
  metalness = 0.1,
  parallaxFactor = 0,
  parallaxOffset = { x: 0, y: 0 },
  hasRing = false,
  ringColor = '#B08D57',
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(initialAngle);
  
  // Create slightly varied geometry for visual interest
  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(size, 32, 32);
  }, [size]);

  useFrame((_, delta) => {
    if (!meshRef.current || !groupRef.current) return;
    
    // Update orbit angle (very slow - 60-120 seconds per orbit)
    angleRef.current += orbitSpeed * delta;
    
    // Calculate orbital position
    const x = Math.cos(angleRef.current) * orbitRadius;
    const z = Math.sin(angleRef.current) * orbitRadius;
    
    // Apply orbit tilt
    const y = Math.sin(orbitTilt) * z;
    const adjustedZ = Math.cos(orbitTilt) * z;
    
    // Apply parallax offset based on cursor position
    const parallaxX = parallaxOffset.x * parallaxFactor;
    const parallaxY = parallaxOffset.y * parallaxFactor;
    
    groupRef.current.position.set(
      x + parallaxX,
      y + parallaxY,
      adjustedZ
    );
    
    // Self rotation
    meshRef.current.rotation.y += rotationSpeed * delta;
  });

  return (
    <group ref={groupRef as any}>
      <mesh ref={meshRef as any} geometry={geometry as any}>
        <meshStandardMaterial
          color={color}
          emissive={emissive || color}
          emissiveIntensity={emissiveIntensity}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>
      
      {/* Optional ring */}
      {hasRing && (
        <mesh rotation={[Math.PI / 2.5, 0.2, 0]}>
          <ringGeometry args={[size * 1.4, size * 2.2, 64]} />
          <meshStandardMaterial
            color={ringColor}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            roughness={0.9}
            metalness={0}
          />
        </mesh>
      )}
    </group>
  );
}
