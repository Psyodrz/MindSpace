import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraRigProps {
  // Parallax offset from cursor hook
  parallaxOffset?: { x: number; y: number };
  
  // Smoothing factor for camera movement (0-1, smaller = smoother)
  smoothing?: number;
  
  // Enable auto-drift when user is not interacting
  enableAutoDrift?: boolean;
  
  // Auto-drift amplitude
  driftAmplitude?: number;
}

/**
 * Camera rig with cursor parallax and auto-drift.
 * 
 * When user moves cursor: camera gently offsets toward cursor direction.
 * When idle: camera slowly drifts in a figure-8 pattern for ambient motion.
 * 
 * All motion is heavily smoothed for a weighty, space-like feel.
 */
export function CameraRig({
  parallaxOffset = { x: 0, y: 0 },
  smoothing = 0.02,
  enableAutoDrift = true,
  driftAmplitude = 0.3,
}: CameraRigProps) {
  const { camera } = useThree();
  const timeRef = useRef(0);
  
  // Store current and target positions for lerping
  const currentPos = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  
  // Base camera position
  const basePosition = new THREE.Vector3(0, 0, 30);

  useFrame((_, delta) => {
    timeRef.current += delta;
    
    // Calculate target position from parallax offset
    let targetX = parallaxOffset.x;
    let targetY = parallaxOffset.y;
    
    // Add auto-drift when enabled (slow figure-8 pattern over ~90 seconds)
    if (enableAutoDrift) {
      const driftTime = timeRef.current * 0.07; // Very slow
      const driftX = Math.sin(driftTime) * Math.cos(driftTime * 0.7) * driftAmplitude;
      const driftY = Math.sin(driftTime * 0.8) * driftAmplitude * 0.5;
      
      // Blend drift with parallax (parallax takes priority)
      targetX += driftX * (1 - Math.abs(parallaxOffset.x) / 0.5);
      targetY += driftY * (1 - Math.abs(parallaxOffset.y) / 0.5);
    }
    
    targetPos.current.x = targetX;
    targetPos.current.y = targetY;
    
    // Smooth interpolation toward target
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * smoothing;
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * smoothing;
    
    // Apply to camera position
    camera.position.x = basePosition.x + currentPos.current.x;
    camera.position.y = basePosition.y + currentPos.current.y;
    camera.position.z = basePosition.z;
    
    // Always look at center
    camera.lookAt(0, 0, 0);
  });

  return null;
}
