import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Planet } from './Planet';
import { DustField } from './DustField';
import { Lights } from './Lights';
import { CameraRig } from './CameraRig';
import { useCursorParallax } from '../../hooks/useCursorParallax';

/**
 * Main solar system 3D background scene.
 * 
 * Features:
 * - Multiple planets at varying depths with slow orbits
 * - Cursor-reactive camera parallax
 * - Ambient space dust particles
 * - Realistic moving starfield
 * - Subtle postprocessing (bloom, vignette)
 * - Fog for depth cueing
 */
export function SolarSystemScene() {
  const { offsetX, offsetY, x, y } = useCursorParallax({
    smoothing: 0.03,  // Heavy smoothing for space-like feel
    maxOffset: 0.4,   // Maximum camera offset
  });

  return (
    <div 
      className="fixed inset-0 -z-10"
      style={{ pointerEvents: 'none' }}
    >
      <Canvas
        camera={{ position: [0, 0, 30], fov: 60 }}
        dpr={[1, 1.5]} // Limit DPR for performance
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        {/* Background color */}
        <color attach="background" args={['#0C0F0E']} />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#0C0F0E', 25, 100]} />
        
        {/* Lighting */}
        <Lights />
        
        {/* Camera with parallax */}
        <CameraRig
          parallaxOffset={{ x: offsetX, y: offsetY }}
          smoothing={0.02}
          enableAutoDrift={true}
          driftAmplitude={0.25}
        />
        
        {/* ===== STARFIELD ===== */}
        {/* Realistic stars with slow movement */}
        <Stars
          radius={120}
          depth={80}
          count={4000}
          factor={3}
          saturation={0.1}
          fade
          speed={0.3}
        />
        
        {/* ===== FOREGROUND PLANETS ===== */}
        {/* Large foreground planet - partially in frame for depth */}
        <Planet
          orbitRadius={12}
          orbitSpeed={0.02}
          size={3.5}
          color="#4A3F35"
          emissive="#2A2520"
          emissiveIntensity={0.05}
          roughness={0.85}
          metalness={0.1}
          initialAngle={-0.5}
          parallaxFactor={0.3}
          parallaxOffset={{ x, y }}
          hasRing={true}
          ringColor="#B08D57"
        />
        
        {/* ===== MIDGROUND PLANETS ===== */}
        {/* Bronze-tinted planet */}
        <Planet
          orbitRadius={20}
          orbitSpeed={0.015}
          orbitTilt={0.15}
          size={1.8}
          color="#8B7355"
          emissive="#6B5444"
          emissiveIntensity={0.08}
          roughness={0.75}
          metalness={0.15}
          initialAngle={Math.PI / 4}
          parallaxFactor={0.2}
          parallaxOffset={{ x, y }}
        />
        
        {/* Grey-blue planet */}
        <Planet
          orbitRadius={28}
          orbitSpeed={0.01}
          orbitTilt={-0.2}
          size={2.2}
          color="#5A6B7C"
          emissive="#3A4B5C"
          emissiveIntensity={0.05}
          roughness={0.8}
          metalness={0.1}
          initialAngle={Math.PI}
          parallaxFactor={0.15}
          parallaxOffset={{ x, y }}
        />
        
        {/* Warm earth-like planet */}
        <Planet
          orbitRadius={35}
          orbitSpeed={0.008}
          size={1.4}
          color="#6B5B4F"
          emissive="#4A4035"
          emissiveIntensity={0.06}
          roughness={0.7}
          metalness={0.05}
          initialAngle={Math.PI * 1.5}
          parallaxFactor={0.1}
          parallaxOffset={{ x, y }}
        />
        
        {/* ===== BACKGROUND PLANETS ===== */}
        {/* Distant faint planet 1 */}
        <Planet
          orbitRadius={50}
          orbitSpeed={0.005}
          orbitTilt={0.3}
          size={1.0}
          color="#3A3A3A"
          emissive="#1A1A1A"
          emissiveIntensity={0.02}
          roughness={0.9}
          metalness={0}
          initialAngle={0.8}
          parallaxFactor={0.05}
          parallaxOffset={{ x, y }}
        />
        
        {/* Distant faint planet 2 */}
        <Planet
          orbitRadius={60}
          orbitSpeed={0.004}
          orbitTilt={-0.15}
          size={0.8}
          color="#454540"
          emissive="#252520"
          emissiveIntensity={0.02}
          roughness={0.9}
          metalness={0}
          initialAngle={2.5}
          parallaxFactor={0.03}
          parallaxOffset={{ x, y }}
        />
        
        {/* Very distant small planet */}
        <Planet
          orbitRadius={75}
          orbitSpeed={0.003}
          size={0.6}
          color="#2A2A2F"
          emissive="#1A1A1F"
          emissiveIntensity={0.01}
          roughness={0.95}
          metalness={0}
          initialAngle={4}
          parallaxFactor={0.02}
          parallaxOffset={{ x, y }}
        />
        
        {/* ===== AMBIENT EFFECTS ===== */}
        {/* Space dust particles */}
        <DustField
          count={400}
          radius={70}
          size={0.025}
          color="#9B9F9C"
          opacity={0.25}
          speed={0.015}
        />
        
        {/* ===== POSTPROCESSING ===== */}
        <EffectComposer multisampling={0}>
          {/* Very subtle bloom on bright highlights */}
          <Bloom
            intensity={0.3}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          {/* Vignette to draw focus to center */}
          <Vignette
            offset={0.3}
            darkness={0.5}
            blendFunction={BlendFunction.NORMAL}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
