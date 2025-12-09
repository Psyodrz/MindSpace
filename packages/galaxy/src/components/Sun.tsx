import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const SunShader = {
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
      gl_FragColor = vec4(1.0, 0.6, 0.3, 1.0) * intensity * 2.0;
    }
  `
};

interface SunProps {
  color?: string;
  intensity?: number;
}

export const Sun: React.FC<SunProps> = ({ color = '#ffaa55', intensity = 1.5 }) => {
  const texture = useTexture('/sun.jpg');
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y -= delta * 0.6; // Faster rotation
    }
  });

  const glowMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: SunShader.vertexShader,
    fragmentShader: SunShader.fragmentShader,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  }), []);

  return (
    <group position={[40, 20, -40]}> {/* Distant sun position */}
      {/* Main Light Source (Infinite Reach) */}
      <pointLight intensity={intensity * 2} color={color} distance={0} decay={0} />
      <ambientLight intensity={0.2} color="#404040" />

      {/* Sun Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial map={texture} color="#ffffff" toneMapped={false} />
      </mesh>

      {/* Corona / Glow Effect */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[5, 64, 64]} />
        <primitive object={glowMaterial} />
      </mesh>
      
      {/* Lens Flare Billboard (Simulated with simple transparent plane) */}
      <sprite scale={[25, 25, 1]}>
        <spriteMaterial 
          color="#ffaa00" 
          opacity={0.4} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={useMemo(() => {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const context = canvas.getContext('2d');
            if (context) {
                const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
                gradient.addColorStop(0, 'rgba(255, 200, 100, 1)');
                gradient.addColorStop(0.4, 'rgba(255, 100, 50, 0.2)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                context.fillStyle = gradient;
                context.fillRect(0, 0, 128, 128);
            }
            return new THREE.CanvasTexture(canvas);
          }, [])}
        />
      </sprite>
    </group>
  );
};
