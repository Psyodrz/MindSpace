import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ASTEROID_BELT_CONFIG, PASSING_ASTEROIDS_CONFIG } from '../solarSystem';

interface AsteroidData {
  position: THREE.Vector3;
  size: number;
  rotation: THREE.Euler;
}

interface PassingAsteroid {
  orbitRadius: number;
  angle: number;
  speed: number;
  size: number;
  yOffset: number;
}

export const AsteroidBelt: React.FC = () => {
  const beltRef = useRef<THREE.Group>(null);
  const passingRef = useRef<THREE.Group>(null);
  const { innerRadius, outerRadius, count, sizeRange } = ASTEROID_BELT_CONFIG;

  // Main asteroid belt data
  const asteroidData = useMemo((): AsteroidData[] => {
    const data: AsteroidData[] = [];

    for (let i = 0; i < count; i++) {
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 2;
      const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);

      data.push({
        position: new THREE.Vector3(
          radius * Math.cos(angle),
          height,
          radius * Math.sin(angle)
        ),
        size,
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        )
      });
    }

    return data;
  }, [innerRadius, outerRadius, count, sizeRange]);

  // Passing asteroids data (large, far from planets)
  const passingAsteroids = useMemo((): PassingAsteroid[] => {
    const data: PassingAsteroid[] = [];
    const { count: passCount, minRadius, maxRadius, sizeRange: passSizeRange } = PASSING_ASTEROIDS_CONFIG;

    for (let i = 0; i < passCount; i++) {
      data.push({
        orbitRadius: minRadius + Math.random() * (maxRadius - minRadius),
        angle: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.02, // Very slow
        size: passSizeRange[0] + Math.random() * (passSizeRange[1] - passSizeRange[0]),
        yOffset: (Math.random() - 0.5) * 20 // Higher variation for passing asteroids
      });
    }

    return data;
  }, []);

  // Angle refs for passing asteroids
  const passingAngles = useRef<number[]>(passingAsteroids.map(a => a.angle));

  useFrame((_, delta) => {
    // Slow rotation for main belt
    if (beltRef.current) {
      beltRef.current.rotation.y += delta * 0.015;
    }

    // Update passing asteroid positions
    if (passingRef.current) {
      passingAngles.current = passingAngles.current.map((angle, i) => {
        return angle + delta * passingAsteroids[i].speed;
      });

      passingRef.current.children.forEach((child, i) => {
        const asteroid = passingAsteroids[i];
        const angle = passingAngles.current[i];
        child.position.set(
          asteroid.orbitRadius * Math.cos(angle),
          asteroid.yOffset,
          asteroid.orbitRadius * Math.sin(angle)
        );
        child.rotation.y += delta * 0.1;
      });
    }
  });

  return (
    <group>
      {/* Main asteroid belt */}
      <group ref={beltRef}>
        {asteroidData.map((asteroid, i) => (
          <mesh
            key={i}
            position={asteroid.position}
            rotation={asteroid.rotation}
          >
            <dodecahedronGeometry args={[asteroid.size, 0]} />
            <meshStandardMaterial 
              color="#5a4a3a"
              roughness={0.9} 
              metalness={0.1}
            />
          </mesh>
        ))}
      </group>

      {/* Passing asteroids (large, distant) */}
      <group ref={passingRef}>
        {passingAsteroids.map((asteroid, i) => (
          <mesh key={`passing-${i}`}>
            <dodecahedronGeometry args={[asteroid.size, 1]} />
            <meshStandardMaterial 
              color="#4a3a2a"
              roughness={0.95} 
              metalness={0.05}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
