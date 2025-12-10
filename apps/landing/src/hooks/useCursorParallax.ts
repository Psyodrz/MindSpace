import { useEffect, useRef, useState } from 'react';

interface CursorPosition {
  x: number; // -1 to 1 (left to right)
  y: number; // -1 to 1 (top to bottom)
}

interface ParallaxOptions {
  smoothing?: number; // Easing factor (0-1, smaller = smoother)
  maxOffset?: number; // Maximum offset in world units
}

/**
 * Hook for cursor-based parallax effect.
 * 
 * Returns smoothed x,y values from -1 to 1 based on cursor position.
 * Uses lerp interpolation for heavy, space-like motion feel.
 */
export function useCursorParallax(options: ParallaxOptions = {}) {
  const { smoothing = 0.05, maxOffset = 0.4 } = options;
  
  // Raw cursor position (target)
  const targetRef = useRef<CursorPosition>({ x: 0, y: 0 });
  
  // Smoothed cursor position (current)
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const currentRef = useRef<CursorPosition>({ x: 0, y: 0 });
  
  // Is the user actively interacting?
  const [isActive, setIsActive] = useState(false);
  const activityTimeout = useRef<number | null>(null);

  useEffect(() => {
    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      // Convert to -1 to 1 range
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1); // Invert Y
      
      targetRef.current = { x, y };
      setIsActive(true);
      
      // Reset activity after no movement
      if (activityTimeout.current) {
        clearTimeout(activityTimeout.current);
      }
      activityTimeout.current = window.setTimeout(() => {
        setIsActive(false);
      }, 2000);
    };

    // Handle touch movement
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const x = (touch.clientX / window.innerWidth) * 2 - 1;
        const y = -((touch.clientY / window.innerHeight) * 2 - 1);
        
        targetRef.current = { x, y };
        setIsActive(true);
        
        if (activityTimeout.current) {
          clearTimeout(activityTimeout.current);
        }
        activityTimeout.current = window.setTimeout(() => {
          setIsActive(false);
        }, 2000);
      }
    };

    // Handle device orientation for mobile tilt
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // Gamma: left-to-right tilt (-90 to 90)
        // Beta: front-to-back tilt (-180 to 180)
        const x = Math.max(-1, Math.min(1, e.gamma / 30));
        const y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
        
        targetRef.current = { x, y };
      }
    };

    // Animation loop for smooth interpolation
    let animationId: number;
    const animate = () => {
      // Lerp current toward target
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * smoothing;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * smoothing;
      
      // Only update state if there's meaningful change (performance)
      const threshold = 0.001;
      if (
        Math.abs(currentRef.current.x - position.x) > threshold ||
        Math.abs(currentRef.current.y - position.y) > threshold
      ) {
        setPosition({
          x: currentRef.current.x,
          y: currentRef.current.y,
        });
      }
      
      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    // Request orientation permission on iOS
    if (typeof DeviceOrientationEvent !== 'undefined') {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    
    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('deviceorientation', handleOrientation);
      cancelAnimationFrame(animationId);
      if (activityTimeout.current) {
        clearTimeout(activityTimeout.current);
      }
    };
  }, [smoothing, position.x, position.y]);

  return {
    // Smoothed position (-1 to 1)
    x: position.x,
    y: position.y,
    // Scaled offset for camera (in world units)
    offsetX: position.x * maxOffset,
    offsetY: position.y * maxOffset,
    // Is user actively moving cursor?
    isActive,
  };
}
