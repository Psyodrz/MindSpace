import { forwardRef } from 'react';
import { CameraControls } from '@react-three/drei';

interface CameraControllerProps {
  fullControl?: boolean;
}

export const CameraController = forwardRef<CameraControls, CameraControllerProps>(({ fullControl = true }, ref) => {
  return (
    <CameraControls 
      ref={ref}
      minDistance={3}
      maxDistance={150}
      dollySpeed={0.5}
      truckSpeed={0.5}
      smoothTime={0.5}
      draggingSmoothTime={0.15}
      makeDefault
    />
  );
});
