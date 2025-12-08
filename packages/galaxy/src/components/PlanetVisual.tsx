import React, { useMemo, useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { GalaxyErrorBoundary } from './GalaxyErrorBoundary';

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
  opacity?: number; // Added opacity
  selected?: boolean;
  hovered?: boolean;
  onClick?: (e: any) => void;
  onPointerDown?: (e: any) => void;
  onPointerUp?: (e: any) => void;
  onPointerMove?: (e: any) => void;
  onPointerOver?: (e: any) => void;
  onPointerOut?: (e: any) => void;
}

// Sub-component for Safe Texture Loading
const TexturedPlanet = React.forwardRef<THREE.Mesh, PlanetVisualProps & { url: string }>(({ url, color, opacity = 1, ...props }, ref) => {
  const texture = useTexture(url);
  
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.7,
    metalness: 0.1,
    transparent: true,
    opacity: opacity,
  }), [texture, opacity]);

  return (
    <mesh ref={ref} {...props as any}>
       <sphereGeometry args={[0.6, 64, 64]} />
       <primitive object={material} />
    </mesh>
  );
});

export const PlanetVisual: React.FC<PlanetVisualProps> = ({ 
  color, textureUrl, opacity = 1, selected, hovered,
  onClick, onPointerDown, onPointerUp, onPointerMove, onPointerOver, onPointerOut
}) => {
  const planetRef = useRef<THREE.Mesh>(null);

  // Common Atmosphere Material
  const atmosphereMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(RealAtmosphereShader.uniforms),
      vertexShader: RealAtmosphereShader.vertexShader,
      fragmentShader: RealAtmosphereShader.fragmentShader,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: opacity // Though shader handles its own alpha, usually we pass uniform or rely on blending
    });
    // Inject opacity into glow color or uniform if needed, but for AdditiveBlending, 
    // we scale the color intensity by opacity
    const baseColor = new THREE.Color(textureUrl ? '#44aaff' : color);
    mat.uniforms.glowColor.value = baseColor.multiplyScalar(opacity);
    
    return mat;
  }, [color, textureUrl, opacity]);

  useFrame((state, delta) => {
    if (planetRef.current) {
        // Slow rotation for planet
        planetRef.current.rotation.y += delta * 0.1;
    }
  });

  const interactionProps = { onClick, onPointerDown, onPointerUp, onPointerMove, onPointerOver, onPointerOut };

  return (
    <group scale={selected ? 1.5 : (hovered ? 1.2 : 1)}>
      {textureUrl ? (
        <GalaxyErrorBoundary fallback={
             <mesh ref={planetRef} {...interactionProps}>
               <sphereGeometry args={[0.6, 64, 64]} />
               <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
             </mesh>
        }>
          <Suspense fallback={null}>
            <TexturedPlanet 
                url={textureUrl} 
                color={color} 
                opacity={opacity}
                {...interactionProps} 
                ref={planetRef}
            />
          </Suspense>
        </GalaxyErrorBoundary>
      ) : (
        <mesh ref={planetRef} {...interactionProps}>
          <sphereGeometry args={[0.6, 64, 64]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.7} 
            metalness={0.1}
            transparent={true}
            opacity={opacity}
          />
        </mesh>
      )}

      {/* Atmosphere Glow (Separate mesh to avoid texture conflicts) */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[0.6, 64, 64]} />
        <primitive object={atmosphereMaterial} />
      </mesh>
    </group>
  );
};
