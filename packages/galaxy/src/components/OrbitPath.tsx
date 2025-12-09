import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { type PlanetCategory } from '../solarSystem';
import { type ThemeConfig } from '../themes';

interface OrbitPathProps {
  planet: PlanetCategory;
  theme?: ThemeConfig;
}

export const OrbitPath: React.FC<OrbitPathProps> = ({ planet }) => {


  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 128;
    const a = planet.orbit.radius;
    const e = planet.orbit.eccentricity;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const r = a * (1 - e * e) / (1 + e * Math.cos(angle));
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      pts.push(new THREE.Vector3(x, 0, z));
    }

    return pts;
  }, [planet]);

  return (
    <group rotation={[planet.orbit.inclination * (Math.PI / 180), 0, 0]}>
      <Line
        points={points}
        color="#ffffff"
        lineWidth={1.5}
        transparent
        opacity={0.4}
        dashed={false}
      />
    </group>
  );
};
