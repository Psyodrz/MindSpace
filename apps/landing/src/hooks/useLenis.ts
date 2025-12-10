import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

interface LenisOptions {
  duration?: number;
  smoothWheel?: boolean;
  wheelMultiplier?: number;
  touchMultiplier?: number;
}

/**
 * Hook to setup Lenis smooth scrolling.
 * 
 * Provides buttery-smooth scrolling while keeping the 3D background fixed.
 */
export function useLenis(options: LenisOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis with sensible defaults
    lenisRef.current = new Lenis({
      duration: options.duration ?? 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: options.smoothWheel ?? true,
      wheelMultiplier: options.wheelMultiplier ?? 1,
      touchMultiplier: options.touchMultiplier ?? 2,
    });

    // RAF loop for Lenis
    function raf(time: number) {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, [options.duration, options.smoothWheel, options.wheelMultiplier, options.touchMultiplier]);

  return lenisRef;
}
