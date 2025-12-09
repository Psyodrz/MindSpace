import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type PlanetCategory } from '../solarSystem';
import { OrbitPath } from './OrbitPath';
import { type ThemeConfig } from '../themes';

interface PlanetOrbitProps {
  planet: PlanetCategory;
  theme?: ThemeConfig;
  showOrbitLine?: boolean;
  children: React.ReactNode;
}

export const PlanetOrbit: React.FC<PlanetOrbitProps> = ({
  planet,
  showOrbitLine = true,
  children
}) => {
  const orbitGroupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2); // Random start position

  useFrame((_, delta) => {
    if (!orbitGroupRef.current) return;

    // Update orbit angle
    angleRef.current += delta * planet.orbit.speed * 0.1;

    // Calculate position with eccentricity (ellipse)
    const a = planet.orbit.radius;
    const e = planet.orbit.eccentricity;
    const angle = angleRef.current;
    
    const r = a * (1 - e * e) / (1 + e * Math.cos(angle));
    const x = r * Math.cos(angle);
    const z = r * Math.sin(angle);

    orbitGroupRef.current.position.set(x, 0, z);
  });

  return (
    <group rotation={[planet.orbit.inclination * (Math.PI / 180), 0, 0]}>
      {/* Orbit path visualization */}
      {showOrbitLine && <OrbitPath planet={planet} />}
      
      {/* Orbiting group containing planet and its moons */}
      <group ref={orbitGroupRef}>
        {children}
      </group>
    </group>
  );
};
