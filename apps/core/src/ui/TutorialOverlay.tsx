import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

interface Step {
  title: string;
  description: string;
  targetSelector?: string;
  preferredPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: Step[] = [
  {
    title: "Welcome to MindSpace",
    description: "Transform your thoughts into a living solar system. Each idea becomes a planet in your personal universe."
  },
  {
    title: "Create Ideas",
    description: "Tap the + button to create a new planet. Give it a name and watch it orbit the sun.",
    targetSelector: '.fab',
    preferredPosition: 'left' // FAB is usually bottom-right or bottom-center
  },
  {
    title: "Switch Views",
    description: "Toggle between the 3D Galaxy view and the Solar System view.",
    targetSelector: '.view-toggle',
    preferredPosition: 'bottom' // Top center usually
  },
  {
    title: "Settings",
    description: "Access themes, reset data, and view app info here.",
    targetSelector: '.settings-btn',
    preferredPosition: 'bottom' // Top right usually
  },
  {
    title: "Navigate & Edit",
    description: "Drag to rotate, pinch to zoom. Tap any planet to edit its content."
  }
];

export const TutorialOverlay: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { hasSeenTutorial, setHasSeenTutorial, initializeDefaultPlanets } = useStore();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  // Update target position on step change or resize
  useEffect(() => {
    const updatePosition = () => {
      const step = TOUR_STEPS[currentStep];
      if (step.targetSelector) {
        const element = document.querySelector(step.targetSelector);
        if (element) {
          setTargetRect(element.getBoundingClientRect());
          return;
        }
      }
      setTargetRect(null);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    // MutationObserver could be used if elements move, but resize is usually enough for static UI
    
    // Small delay to ensure UI is rendered
    const timer = setTimeout(updatePosition, 100);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      clearTimeout(timer);
    };
  }, [currentStep]);

  // If already seen, don't render anything
  if (hasSeenTutorial) return null;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishTour();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const finishTour = () => {
    setHasSeenTutorial(true);
    initializeDefaultPlanets();
  };

  const step = TOUR_STEPS[currentStep];
  
  // Calculate Card Position
  const getCardStyle = (): React.CSSProperties => {
    if (!targetRect || !step.preferredPosition) {
      // Default center
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed'
      };
    }

    const margin = 20;
    const cardWidth = 320; // Approx max width
    
    let top = 0;
    let left = 0;
    let transform = '';

    switch (step.preferredPosition) {
      case 'bottom':
        top = targetRect.bottom + margin;
        left = targetRect.left + (targetRect.width / 2);
        transform = 'translateX(-50%)';
        break;
      case 'top':
        top = targetRect.top - margin;
        left = targetRect.left + (targetRect.width / 2);
        transform = 'translate(-50%, -100%)';
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2);
        left = targetRect.left - margin;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2);
        left = targetRect.right + margin;
        transform = 'translate(0, -50%)';
        break;
    }

    // Boundary checks to keep card within viewport
    // cardWidth is already defined above
    const screenPadding = 20; // Padding from screen edges

    // Clamp horizontal position if centered
    if (transform.includes('translateX(-50%)')) {
      const minLeft = (cardWidth / 2) + screenPadding;
      const maxLeft = window.innerWidth - (cardWidth / 2) - screenPadding;
      
      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;
    }
    
    // Clamp vertical position to avoid top overlap
    if (top < screenPadding) top = screenPadding;
    
    return {
      top: `${top}px`,
      left: `${left}px`,
      transform,
      position: 'fixed',
      margin: 0
    };
  };

  return (
    <div className="tutorial-overlay">
      {/* Spotlight / Dimmer */}
      <div className="tutorial-dimmer" />
      
      {/* Target Highlighter */}
      {targetRect && (
        <div 
          className="target-highlighter"
          style={{
            top: targetRect.top - 5,
            left: targetRect.left - 5,
            width: targetRect.width + 10,
            height: targetRect.height + 10,
          }}
        />
      )}

      {/* Info Card */}
      <div className="tutorial-card" style={getCardStyle()}>
        <div className="tutorial-content">
          <div className="tutorial-step-indicator">
            {currentStep + 1} / {TOUR_STEPS.length}
          </div>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </div>
        
        <div className="tutorial-actions">
          {currentStep > 0 ? (
            <button className="secondary-btn" onClick={handleBack}>
              Back
            </button>
          ) : (
            <button className="secondary-btn" onClick={finishTour}>
              Skip
            </button>
          )}
          
          <button className="primary-btn" onClick={handleNext}>
            {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
        
        <div className="step-dots">
          {TOUR_STEPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`dot ${idx === currentStep ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .tutorial-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          pointer-events: none; /* Let clicks pass through overlay container */
        }

        .tutorial-dimmer {
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5); /* Semi-transparent dark */
          pointer-events: auto; /* Block clicks on background */
        }
        
        /* Cutout effect or just highlighter on top? 
           Simple approach: Highlighter sits on top of dimmer with Glow 
        */
        .target-highlighter {
          position: absolute;
          border: 2px solid var(--theme-accent, #4fd0e0);
          border-radius: 12px;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), /* Mask around */
                      0 0 15px var(--theme-accent, #4fd0e0), /* Outer Glow */
                      inset 0 0 10px rgba(var(--theme-accent-rgb), 0.3); /* Inner Glow */
          pointer-events: none;
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          z-index: 10000;
        }

        .tutorial-card {
          background: rgba(20, 20, 30, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          padding: 24px;
          width: 90%;
          max-width: 340px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          text-align: center;
          z-index: 10001;
          pointer-events: auto; /* Enable clicks on card */
          transition: top 0.4s cubic-bezier(0.25, 1, 0.5, 1), 
                      left 0.4s cubic-bezier(0.25, 1, 0.5, 1),
                      transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .tutorial-step-indicator {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .tutorial-content h3 {
          margin: 0 0 10px 0;
          font-size: 1.5rem;
          color: white;
        }

        .tutorial-content p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
          margin-bottom: 20px;
          font-size: 0.95rem;
        }

        .tutorial-actions {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }

        .primary-btn, .secondary-btn {
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
          border: none;
          font-size: 0.9rem;
        }

        .primary-btn {
          background: var(--theme-accent, #4fd0e0);
          color: #000;
          box-shadow: 0 4px 12px rgba(var(--theme-accent-rgb, 79, 208, 224), 0.3);
        }
        
        .primary-btn:active { transform: scale(0.96); }

        .secondary-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        
        .secondary-btn:hover { background: rgba(255, 255, 255, 0.15); }

        .step-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
        }
        
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
        }
        
        .dot.active {
          background: var(--theme-accent, #4fd0e0);
          transform: scale(1.3);
          box-shadow: 0 0 8px var(--theme-accent, #4fd0e0);
        }
      `}</style>
    </div>
  );
};
