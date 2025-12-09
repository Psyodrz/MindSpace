import React, { useRef, useState, useCallback } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetVisual } from './PlanetVisual';
import { type ThemeConfig, THEMES } from '../themes';

interface StarNodeProps {
  id: string;
  position: [number, number, number];
  color?: string;
  textureUrl?: string;
  label?: string;
  selected?: boolean;
  isPrimary?: boolean;
  hovered?: boolean;
  theme?: ThemeConfig;
  onPositionChange?: (id: string, newPos: [number, number, number]) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerDown?: (e: PointerEvent) => void;
  onPointerUp?: () => void;
}

// ... imports

export const StarNode: React.FC<StarNodeProps> = ({ 
  id, 
  position, 
  color = '#ffd700',
  textureUrl,
  label, 
  selected, 
  isPrimary,
  hovered: hoveredProp,
  theme,
  onPositionChange,
  onClick,
  onPointerDown: onPointerDownProp,
  onPointerUp: onPointerUpProp
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(hoveredProp || false);
  const [dragging, setDragging] = useState(false);
  
  // LOD State
  const [opacity, setOpacity] = useState(1);
  const [visible, setVisible] = useState(true);
  
  // Get theme config (fallback to deep-space)
  const themeConfig = theme || THEMES['deep-space'];
  
  const { camera, raycaster, gl } = useThree();
  const planeIntersectPoint = new THREE.Vector3();
  const dragPlane = new THREE.Plane();
  const nodePos = new THREE.Vector3(...position);

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    
    // Call parent handler for long-press (pass native event for position)
    onPointerDownProp?.(e.nativeEvent);
    
    if (!onPositionChange) return;

    setDragging(true);
    
    // Set drag plane to face camera, centered at node
    const normal = camera.getWorldDirection(new THREE.Vector3()).negate();
    dragPlane.setFromNormalAndCoplanarPoint(normal, new THREE.Vector3(...position));
    
    // @ts-ignore
    e.target.setPointerCapture(e.pointerId);
  }, [camera, position, onPositionChange, onPointerDownProp]);

  const handlePointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    setDragging(false);
    
    // Call parent handler
    onPointerUpProp?.();
    
    // @ts-ignore
    e.target.releasePointerCapture(e.pointerId);
  }, [onPointerUpProp]);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!dragging || !onPositionChange) return;
    
    const pointer = { 
      x: (e.nativeEvent.clientX / gl.domElement.clientWidth) * 2 - 1,
      y: -(e.nativeEvent.clientY / gl.domElement.clientHeight) * 2 + 1
    };
    raycaster.setFromCamera(new THREE.Vector2(pointer.x, pointer.y), camera);

    if (raycaster.ray.intersectPlane(dragPlane, planeIntersectPoint)) {
      onPositionChange(id, [planeIntersectPoint.x, planeIntersectPoint.y, planeIntersectPoint.z]);
    }
  }, [dragging, onPositionChange, camera, gl, id, dragPlane]);

  // Theme-aware motion + LOD Logic
  useFrame((state, delta) => {
    const rotSpeed = themeConfig.motion.rotationSpeed;
    const bobAmp = themeConfig.motion.bobAmplitude;
    
    // Rotation and bob animation
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotSpeed * (isPrimary ? 0.8 : 1);
      
      // Vertical bob
      const bob = Math.sin(state.clock.elapsedTime * 0.8) * bobAmp;
      meshRef.current.position.y = bob;
      
      // Pulse for selection/primary (only if theme has pulse enabled for ring)
      const doPulse = (selected && themeConfig.ring.pulse) || isPrimary;
      const pulse = doPulse ? 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05 : 1;
      const baseScale = isPrimary ? 2.5 : 1;
      const hoverScale = hovered ? 1.2 : 1;
      meshRef.current.scale.setScalar(baseScale * hoverScale * pulse);
    }
    
    // Ring pulse animation
    if (ringRef.current && selected && themeConfig.ring.pulse) {
      const ringPulse = 1 + Math.sin(state.clock.elapsedTime * Math.PI) * 0.08;
      ringRef.current.scale.setScalar(ringPulse);
    }
    
    // LOD Calculation
    if (isPrimary || selected) {
      if (opacity !== 1) setOpacity(1);
      if (!visible) setVisible(true);
      return;
    }

    const dist = camera.position.distanceTo(nodePos);
    const maxVisibleDist = 120;
    const fadeStartDist = 80;
    
    if (dist > maxVisibleDist) {
      if (visible) setVisible(false);
    } else {
      if (!visible) setVisible(true);
      let targetOp = 1;
      if (dist > fadeStartDist) {
        targetOp = 1 - (dist - fadeStartDist) / (maxVisibleDist - fadeStartDist);
      }
      const diff = targetOp - opacity;
      if (Math.abs(diff) > 0.01) {
        setOpacity(prev => prev + diff * 5 * delta);
      }
    }
  });

  // Always show label if it exists, with different visibility for selected/hovered
  const showLabel = visible && label;
  
  // Theme-aware colors
  const ringColor = themeConfig.ring.color;
  const ringThickness = themeConfig.ring.thickness;
  const ringGlow = themeConfig.ring.glowStrength;
  const accentColor = themeConfig.accentColor;

  return (
    <group position={position} visible={visible}>
      <PlanetVisual 
        color={color}
        textureUrl={textureUrl}
        opacity={opacity}
        selected={selected} 
        hovered={hovered}
        theme={themeConfig}
        onClick={onClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      />
      
      {showLabel && (
        <Html 
          distanceFactor={15} 
          position={[0, isPrimary ? 1.8 : 1.0, 0]} 
          style={{ pointerEvents: 'none' }}
          center
          zIndexRange={[0, 0]}
        >
          <div style={{ 
            color: selected ? '#fff' : 'rgba(255,255,255,0.75)', 
            background: selected 
              ? `${accentColor}dd`
              : `rgba(10,12,20,${0.7 * opacity})`, 
            padding: selected ? '6px 12px' : '4px 8px', 
            borderRadius: '10px',
            border: selected 
              ? `1px solid ${accentColor}99`
              : '1px solid rgba(255,255,255,0.08)',
            whiteSpace: 'nowrap',
            fontSize: isPrimary ? '14px' : selected ? '13px' : '11px',
            fontWeight: selected || isPrimary ? '600' : '500',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s',
            backdropFilter: 'blur(10px)',
            opacity: selected || hovered || isPrimary ? 1 : opacity * 0.85,
            boxShadow: selected ? `0 4px 16px ${themeConfig.accentGlow}` : 'none',
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {label}
          </div>
        </Html>
      )}
      
      {/* Theme-aware Selection/Primary Ring */}
      {(selected || isPrimary) && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[
            isPrimary ? 1.8 : 0.8, 
            isPrimary ? 1.8 + ringThickness * 2 : 0.8 + ringThickness, 
            64
          ]} />
          <meshBasicMaterial 
            color={selected ? ringColor : color} 
            transparent 
            opacity={(selected ? 0.4 + ringGlow * 0.4 : 0.3) * opacity} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      )}
    </group>
  );
};
