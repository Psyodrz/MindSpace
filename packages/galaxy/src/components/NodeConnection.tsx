import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface NodeConnectionProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
}

export const NodeConnection: React.FC<NodeConnectionProps> = ({
  start,
  end,
  color = '#22d3ee'
}) => {
  const lineRef = useRef<any>(null);
  
  // Animate dash offset
  useFrame((_, delta) => {
    if (lineRef.current?.material) {
      lineRef.current.material.dashOffset -= delta * 0.5;
    }
  });
  
  // Calculate midpoint with slight curve
  const points = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().lerpVectors(startVec, endVec, 0.5);
    
    // Add slight curve upward
    mid.y += startVec.distanceTo(endVec) * 0.15;
    
    // Create smooth curve with 3 points
    const curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
    return curve.getPoints(20);
  }, [start, end]);

  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.7}
      dashed
      dashSize={0.3}
      gapSize={0.15}
    />
  );
};
