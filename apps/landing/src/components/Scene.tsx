import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, MeshDistortMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// Scroll progress hook
function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = window.scrollY / scrollHeight;
      setProgress(Math.min(1, Math.max(0, currentProgress)));
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return progress;
}

// Central Sun
function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1);
    }
  });

  return (
    <group position={[0, 0, -50]}>
      {/* Core */}
      <mesh ref={meshRef as any}>
        <sphereGeometry args={[8, 64, 64]} />
        <meshStandardMaterial
          color="#ff6b00"
          emissive="#ff4400"
          emissiveIntensity={2}
          roughness={0.2}
        />
      </mesh>
      {/* Glow layers */}
      <mesh ref={glowRef as any} scale={1.5}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>
      <mesh scale={2}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
      {/* Point light from sun */}
      <pointLight intensity={100} distance={200} color="#ff6600" />
    </group>
  );
}

// Orbiting Planet
interface PlanetProps {
  orbitRadius: number;
  size: number;
  color: string;
  speed: number;
  initialAngle?: number;
  emissive?: string;
}

function OrbitingPlanet({ orbitRadius, size, color, speed, initialAngle = 0, emissive }: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const angle = useRef(initialAngle);

  useFrame(() => {
    angle.current += speed;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle.current) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle.current) * orbitRadius - 50;
      groupRef.current.position.y = Math.sin(angle.current * 0.5) * 2;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef as any}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={planetRef as any}>
          <sphereGeometry args={[size, 32, 32]} />
          <MeshDistortMaterial
            color={color}
            emissive={emissive || color}
            emissiveIntensity={0.3}
            roughness={0.4}
            metalness={0.6}
            distort={0.2}
            speed={2}
          />
        </mesh>
        {/* Glow */}
        <mesh scale={1.3}>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      </Float>
    </group>
  );
}

// Orbit Ring
function OrbitRing({ radius }: { radius: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -50]}>
      <ringGeometry args={[radius - 0.02, radius + 0.02, 128]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.08} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Animated Asteroids
function AsteroidBelt() {
  const count = 100;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const speeds = useMemo(() => Array.from({ length: count }, () => 0.0005 + Math.random() * 0.001), []);
  const angles = useMemo(() => Array.from({ length: count }, () => Math.random() * Math.PI * 2), []);
  const radii = useMemo(() => Array.from({ length: count }, () => 28 + Math.random() * 8), []);
  const yOffsets = useMemo(() => Array.from({ length: count }, () => (Math.random() - 0.5) * 3), []);

  useFrame(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      angles[i] += speeds[i];
      dummy.position.set(
        Math.cos(angles[i]) * radii[i],
        yOffsets[i],
        Math.sin(angles[i]) * radii[i] - 50
      );
      dummy.rotation.set(angles[i], angles[i] * 2, 0);
      dummy.scale.setScalar(0.1 + Math.random() * 0.15);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef as any} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#666666" roughness={0.8} metalness={0.2} />
    </instancedMesh>
  );
}

// Space Dust Particles
function SpaceDust() {
  const count = 300;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 100 - 30,
      ] as [number, number, number],
      scale: 0.02 + Math.random() * 0.05,
    }));
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      dummy.position.set(...p.position);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [particles, dummy]);

  return (
    <instancedMesh ref={meshRef as any} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
    </instancedMesh>
  );
}

// Scroll-Driven Camera
function ScrollCamera() {
  const { camera } = useThree();
  const scrollProgress = useScrollProgress();
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
    // Scroll-based Z position (fly through space)
    const targetZ = 30 - scrollProgress * 60;
    const targetY = scrollProgress * 15;
    const targetX = Math.sin(scrollProgress * Math.PI) * 10;

    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.x += (targetX + mouseX.current * 3 - camera.position.x) * 0.03;

    // Parallax from mouse
    camera.rotation.y = -mouseX.current * 0.05;
    camera.rotation.x = mouseY.current * 0.03;
  });

  return null;
}

// Nebula Background
function Nebula() {
  return (
    <>
      {/* Gold nebula */}
      <mesh position={[-40, 20, -80]}>
        <sphereGeometry args={[30, 32, 32]} />
        <meshBasicMaterial color="#B08D57" transparent opacity={0.03} />
      </mesh>
      {/* Grey nebula */}
      <mesh position={[50, -10, -90]}>
        <sphereGeometry args={[40, 32, 32]} />
        <meshBasicMaterial color="#6B7280" transparent opacity={0.025} />
      </mesh>
      {/* Bronze nebula near sun */}
      <mesh position={[0, 0, -70]}>
        <sphereGeometry args={[25, 32, 32]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.02} />
      </mesh>
    </>
  );
}

// Main Scene Component
export default function Scene() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 30], fov: 60 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={['#0C0F0E']} />
        <fog attach="fog" args={['#0C0F0E', 20, 120]} />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[20, 20, 20]} intensity={0.5} color="#B08D57" />
        <pointLight position={[-20, -10, 20]} intensity={0.3} color="#D4AF37" />

        {/* Stars */}
        <Stars
          radius={100}
          depth={60}
          count={3000}
          factor={4}
          saturation={0}
          fade
          speed={0.3}
        />

        {/* Nebula clouds */}
        <Nebula />

        {/* Central Sun */}
        <Sun />

        {/* Orbit Rings */}
        <OrbitRing radius={15} />
        <OrbitRing radius={22} />
        <OrbitRing radius={35} />

        {/* Planets */}
        <OrbitingPlanet orbitRadius={15} size={1.5} color="#B08D57" speed={0.003} initialAngle={0} />
        <OrbitingPlanet orbitRadius={22} size={2} color="#D4AF37" speed={0.002} initialAngle={Math.PI / 3} />
        <OrbitingPlanet orbitRadius={35} size={2.5} color="#C9A962" speed={0.001} initialAngle={Math.PI} emissive="#8B6914" />

        {/* Asteroid Belt */}
        <AsteroidBelt />

        {/* Space Dust */}
        <SpaceDust />

        {/* Scroll Camera */}
        <ScrollCamera />

        {/* Post Processing */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={new THREE.Vector2(0.0005, 0.0005) as any}
            radialModulation={false}
            modulationOffset={0}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
