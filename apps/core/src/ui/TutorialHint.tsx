import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import './TutorialHint.css';

export const TutorialHint: React.FC = () => {
  const { hasSeenTutorial, setHasSeenTutorial } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if user hasn't dismissed it before
    if (!hasSeenTutorial) {
      // Small delay for better UX
      const showTimer = setTimeout(() => setVisible(true), 1000);
      
      // Auto-hide after 6 seconds
      const hideTimer = setTimeout(() => {
        setVisible(false);
        setHasSeenTutorial(true);
      }, 7000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [hasSeenTutorial, setHasSeenTutorial]);

  const handleDismiss = () => {
    setVisible(false);
    setHasSeenTutorial(true);
  };

  if (hasSeenTutorial || !visible) return null;

  return (
    <div className="tutorial-hint">
      <div className="hint-content">
        <span className="hint-icon">💡</span>
        <span className="hint-text">Drag to rotate • Pinch to zoom • Tap planet to select</span>
      </div>
      <button className="hint-dismiss" onClick={handleDismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
};
