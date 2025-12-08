import React, { useRef, useState, useCallback } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetVisual } from './PlanetVisual';

interface StarNodeProps {
  id: string;
  position: [number, number, number];
  color?: string;
  textureUrl?: string;
  label?: string;
  selected?: boolean;
  isPrimary?: boolean;
  hovered?: boolean;
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
  onPositionChange,
  onClick,
  onPointerDown: onPointerDownProp,
  onPointerUp: onPointerUpProp
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(hoveredProp || false);
  const [dragging, setDragging] = useState(false);
  
  // LOD State
  const [opacity, setOpacity] = useState(1);
  const [visible, setVisible] = useState(true);
  
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
    
    raycaster.setFromCamera(new THREE.Vector2(
      (e.nativeEvent.clientX / gl.domElement.clientWidth) * 2 - 1,
      -(e.nativeEvent.clientY / gl.domElement.clientHeight) * 2 + 1
    ), camera);

    if (raycaster.ray.intersectPlane(dragPlane, planeIntersectPoint)) {
      onPositionChange(id, [planeIntersectPoint.x, planeIntersectPoint.y, planeIntersectPoint.z]);
    }
  }, [dragging, onPositionChange, camera, gl, id, dragPlane]);

  // Visual pulse + LOD Logic
  useFrame((state, delta) => {
    // Pulse animation
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (isPrimary ? 0.2 : 0.1);
      const pulse = selected || isPrimary ? 1 + Math.sin(state.clock.elapsedTime * (isPrimary ? 2 : 4)) * 0.05 : 1;
      const baseScale = isPrimary ? 2.5 : 1;
      const hoverScale = hovered ? 1.2 : 1;
      meshRef.current.scale.setScalar(baseScale * hoverScale * pulse);
    }
    
    // LOD Calculation: Distance from camera
    // If Primary, always visible. If Selected, always visible.
    if (isPrimary || selected) {
        if (opacity !== 1) setOpacity(1);
        if (!visible) setVisible(true);
        return;
    }

    const dist = camera.position.distanceTo(nodePos);
    
    // Logic:
    // < 20: Full Opacity
    // 20 - 40: Fade Out
    // > 40: Invisible (0 Opacity)
    // Adjust these thresholds to control the "cluster size"
    
    const maxVisibleDist = 45;
    const fadeStartDist = 25;
    
    if (dist > maxVisibleDist) {
        if (visible) setVisible(false);
    } else {
        if (!visible) setVisible(true);
        // Calculate smooth opacity
        let targetOp = 1;
        if (dist > fadeStartDist) {
            targetOp = 1 - (dist - fadeStartDist) / (maxVisibleDist - fadeStartDist);
        }
        
        // Dampen opacity changes for smoothness
        const diff = targetOp - opacity;
        if (Math.abs(diff) > 0.01) {
            setOpacity(prev => prev + diff * 5 * delta); // Smooth transition
        }
    }
  });

  // Always show label if it exists, with different visibility for selected/hovered
  const showLabel = visible && label;

  return (
    <group position={position} visible={visible}>
      <PlanetVisual 
        color={color}
        textureUrl={textureUrl}
        opacity={opacity}
        selected={selected} 
        hovered={hovered}
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
        >
          <div style={{ 
            color: selected ? '#fff' : 'rgba(255,255,255,0.8)', 
            background: selected 
              ? 'rgba(255, 0, 85, 0.8)' 
              : `rgba(0,0,0,${0.5 * opacity})`, 
            padding: selected ? '6px 12px' : '4px 8px', 
            borderRadius: '10px',
            border: selected 
              ? '1px solid rgba(255, 100, 150, 0.5)' 
              : '1px solid rgba(255,255,255,0.1)',
            whiteSpace: 'nowrap',
            fontSize: isPrimary ? '14px' : selected ? '13px' : '11px',
            fontWeight: selected || isPrimary ? '600' : '500',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s',
            backdropFilter: 'blur(8px)',
            opacity: selected || hovered || isPrimary ? 1 : opacity * 0.8,
            boxShadow: selected ? '0 4px 12px rgba(255, 0, 85, 0.3)' : 'none',
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {label}
          </div>
        </Html>
      )}
      
      {/* Selection/Primary Ring */}
      {(selected || isPrimary) && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[isPrimary ? 1.8 : 0.8, isPrimary ? 2.0 : 0.85, 64]} />
          <meshBasicMaterial 
            color={selected ? "#ff0055" : color} 
            transparent 
            opacity={(selected ? 0.6 : 0.3) * opacity} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      )}
    </group>
  );
};
