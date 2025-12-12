import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DustFieldProps {
  count?: number;           // Number of particles
  radius?: number;          // Spread radius
  size?: number;            // Particle size
  color?: string;           // Particle color
  opacity?: number;         // Particle opacity
  speed?: number;           // Drift speed
}

/**
 * Instanced mesh dust field for ambient space particles.
 * 
 * Uses InstancedMesh for performance (single draw call for all particles).
 * Particles drift slowly for a living, ambient feel.
 */
export function DustField({
  count = 500,
  radius = 80,
  size = 0.03,
  color = '#9B9F9C',
  opacity = 0.3,
  speed = 0.02,
}: DustFieldProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Initialize particle positions and velocities
  const particles = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const velocities: THREE.Vector3[] = [];
    
    for (let i = 0; i < count; i++) {
      // Random position in sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * radius; // Cube root for even distribution
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      positions.push(new THREE.Vector3(x, y, z));
      
      // Very slow random drift velocity
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.5) * speed
      ));
    }
    
    return { positions, velocities };
  }, [count, radius, speed]);

  // Set initial instance matrices
  useMemo(() => {
    if (!meshRef.current) return;
    
    const matrix = new THREE.Matrix4();
    
    particles.positions.forEach((pos, i) => {
      matrix.setPosition(pos);
      meshRef.current!.setMatrixAt(i, matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [particles.positions]);

  // Animate dust drift
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    
    for (let i = 0; i < count; i++) {
      meshRef.current.getMatrixAt(i, matrix);
      position.setFromMatrixPosition(matrix);
      
      // Apply velocity
      position.add(particles.velocities[i].clone().multiplyScalar(delta));
      
      // Wrap around if too far
      if (position.length() > radius) {
        position.normalize().multiplyScalar(-radius * 0.9);
      }
      
      matrix.setPosition(position);
      meshRef.current.setMatrixAt(i, matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef as any} args={[undefined, undefined, count]}>
      <sphereGeometry args={[size, 4, 4]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
