import { useEffect, useState } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onReady?: () => void;
  minDuration?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  onReady,
  minDuration = 1500 
}) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Minimum display time for smooth UX
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Wait for fade animation then hide
      setTimeout(() => {
        setHidden(true);
        onReady?.();
      }, 500);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onReady]);

  if (hidden) return null;

  return (
    <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loading-content">
        {/* Logo */}
        <div className="loading-logo">
          <img src="/logo.png" alt="MindSpace" className="logo-image" />
        </div>
        
        {/* Subtitle */}
        <p className="loading-subtitle">Your ideas, your universe</p>
        
        {/* Loading indicator */}
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};
