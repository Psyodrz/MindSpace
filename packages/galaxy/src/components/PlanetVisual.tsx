import React, { useMemo, useRef, Suspense } from 'react';

import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { GalaxyErrorBoundary } from './GalaxyErrorBoundary';
import { type ThemeConfig, THEMES } from '../themes';

// Fixed Fragment Shader for the actual glow intensity usage
const RealAtmosphereShader = {
    uniforms: {
        coeficient: { value: 1.0 },
        power: { value: 2.0 },
        glowColor: { value: new THREE.Color(0x00d4ff) }
    },
    vertexShader: `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
            gl_FragColor = vec4(glowColor, 1.0) * intensity;
        }
    `
};

interface PlanetVisualProps {
  color: string;
  textureUrl?: string;
  opacity?: number;
  selected?: boolean;
  hovered?: boolean;
  theme?: ThemeConfig;
  onClick?: (e: any) => void;
  onPointerDown?: (e: any) => void;
  onPointerUp?: (e: any) => void;
  onPointerMove?: (e: any) => void;
  onPointerOver?: (e: any) => void;
  onPointerOut?: (e: any) => void;
}

// Sub-component for Safe Texture Loading with theme support
const TexturedPlanet = React.forwardRef<THREE.Mesh, PlanetVisualProps & { url: string }>(
  ({ url, color, opacity = 1, theme, ...props }, ref) => {
    const texture = useTexture(url);
    const themeConfig = theme || THEMES['deep-space'];
    
    const material = useMemo(() => new THREE.MeshStandardMaterial({
      map: texture,
      roughness: themeConfig.planet.roughness,
      metalness: themeConfig.planet.metalness,
      emissive: new THREE.Color(themeConfig.planet.emissiveColor),
      emissiveIntensity: themeConfig.planet.emissiveIntensity,
      transparent: true,
      opacity: opacity,
    }), [texture, opacity, themeConfig]);

    return (
      <mesh ref={ref} {...props as any}>
         <sphereGeometry args={[0.6, 64, 64]} />
         <primitive object={material} />
      </mesh>
    );
  }
);

export const PlanetVisual: React.FC<PlanetVisualProps> = ({ 
  color, textureUrl, opacity = 1, selected, hovered, theme,
  onClick, onPointerDown, onPointerUp, onPointerMove, onPointerOver, onPointerOut
}) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const themeConfig = theme || THEMES['deep-space'];

  // Theme-aware Atmosphere Material
  const atmosphereMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(RealAtmosphereShader.uniforms),
      vertexShader: RealAtmosphereShader.vertexShader,
      fragmentShader: RealAtmosphereShader.fragmentShader,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    // Use theme emissive color for glow, or fallback to color
    const emissiveColor = themeConfig.planet.emissiveColor !== '#000000' 
      ? themeConfig.planet.emissiveColor 
      : color;
    const baseColor = new THREE.Color(emissiveColor);
    mat.uniforms.glowColor.value = baseColor.multiplyScalar(opacity * (0.5 + themeConfig.planet.emissiveIntensity));
    
    return mat;
  }, [color, themeConfig, opacity]);



  const interactionProps = { onClick, onPointerDown, onPointerUp, onPointerMove, onPointerOver, onPointerOut };

  return (
    <group scale={selected ? 1.5 : (hovered ? 1.2 : 1)}>
      {textureUrl ? (
        <GalaxyErrorBoundary fallback={
             <mesh ref={planetRef} {...interactionProps}>
               <sphereGeometry args={[0.6, 64, 64]} />
               <meshStandardMaterial 
                 color={color} 
                 roughness={themeConfig.planet.roughness} 
                 metalness={themeConfig.planet.metalness}
                 emissive={themeConfig.planet.emissiveColor}
                 emissiveIntensity={themeConfig.planet.emissiveIntensity}
               />
             </mesh>
        }>
          <Suspense fallback={null}>
            <TexturedPlanet 
                url={textureUrl} 
                color={color} 
                opacity={opacity}
                theme={themeConfig}
                {...interactionProps} 
                ref={planetRef}
            />
          </Suspense>
        </GalaxyErrorBoundary>
      ) : (
        <mesh ref={planetRef} {...interactionProps}>
          <sphereGeometry args={[0.6, 64, 64]} />
          <meshStandardMaterial 
            color={themeConfig.planet.baseColor} 
            roughness={themeConfig.planet.roughness} 
            metalness={themeConfig.planet.metalness}
            emissive={themeConfig.planet.emissiveColor}
            emissiveIntensity={themeConfig.planet.emissiveIntensity}
            transparent={true}
            opacity={opacity}
          />
        </mesh>
      )}

      {/* Theme-aware Atmosphere Glow */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[0.6, 64, 64]} />
        <primitive object={atmosphereMaterial} />
      </mesh>
    </group>
  );
};
