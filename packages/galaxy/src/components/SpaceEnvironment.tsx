import React from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Sun } from './Sun';
import { type ThemeConfig, THEMES } from '../themes';

interface SpaceEnvironmentProps {
  theme?: ThemeConfig;
  hideSun?: boolean;
}

export const SpaceEnvironment: React.FC<SpaceEnvironmentProps> = ({ theme, hideSun = false }) => {
  const config = theme || THEMES['deep-space'];
  
  // Use theme-specific backgrounds
  const getBackgroundTexture = () => {
    if (config.id === 'nebula') return '/nebula-bg.jpg';
    if (config.id === 'cyberpunk') return '/cyberpunk-bg.jpg';
    return '/milky-way.jpg';
  };
  const map = useTexture(getBackgroundTexture());

  return (
    <>
      <ambientLight intensity={config.ambientIntensity} color={config.ambientColor} />
      {!hideSun && <Sun color={config.sunColor} intensity={config.sunIntensity} />}
      
      {/* Secondary Fill Light */}
      <pointLight 
        position={[-30, -10, 20]} 
        intensity={config.fillLightIntensity} 
        color={config.fillLightColor} 
      />
      
      {/* Background Sphere with Space Texture + Color Tint */}
      <mesh>
        <sphereGeometry args={[500, 64, 64]} />
        <meshBasicMaterial 
          map={map} 
          color={config.backgroundColor === '#000000' ? '#ffffff' : config.backgroundColor}
          side={THREE.BackSide} 
          fog={false} 
          toneMapped={false}
        />
      </mesh>
      
      {/* Theme-aware Fog */}
      <fog attach="fog" args={[config.fogColor, config.fogNear, config.fogFar]} />
    </>
  );
};
