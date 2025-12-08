import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Floating Planet
function Planet({ 
  position, 
  size = 1, 
  color,
  speed = 0.001
}: { 
  position: [number, number, number]; 
  size?: number;
  color: string;
  speed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.2 + position[0]) * 0.3;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef as any}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>
      {/* Glow */}
      <mesh scale={1.2}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// Particle dust
function SpaceDust() {
  const count = 200;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 80,
          (Math.random() - 0.5) * 80,
          (Math.random() - 0.5) * 80,
        ] as [number, number, number],
        scale: 0.02 + Math.random() * 0.04,
      });
    }
    return temp;
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    particles.forEach((particle, i) => {
      dummy.position.set(...particle.position);
      dummy.scale.setScalar(particle.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [particles, dummy]);

  return (
    <instancedMesh ref={meshRef as any} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
    </instancedMesh>
  );
}

// Camera parallax
function CameraRig() {
  const { camera } = useThree();
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY.current = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  useFrame(() => {
    camera.position.x += (mouseX.current * 2 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY.current * 1.5 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, -10);
  });

  return null;
}

// Main Scene
export default function Scene() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: false, 
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <color attach="background" args={['#030014']} />
        <fog attach="fog" args={['#030014', 15, 60]} />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[15, 15, 15]} intensity={1.5} color="#a855f7" />
        <pointLight position={[-15, -10, -15]} intensity={1} color="#06b6d4" />

        {/* Stars */}
        <Stars 
          radius={80} 
          depth={40} 
          count={2000} 
          factor={3} 
          saturation={0} 
          fade 
          speed={0.2} 
        />

        {/* Dust */}
        <SpaceDust />

        {/* Planets - just 3 for performance */}
        <Planet position={[-10, 3, -20]} size={2.5} color="#a855f7" speed={0.002} />
        <Planet position={[12, -2, -30]} size={3.5} color="#f97316" speed={0.001} />
        <Planet position={[5, 5, -15]} size={1.2} color="#06b6d4" speed={0.003} />

        <CameraRig />

        {/* Subtle bloom */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.4}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
