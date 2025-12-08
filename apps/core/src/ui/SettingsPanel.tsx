import { useStore } from '../store/useStore';
import './SettingsPanel.css';

interface SettingsPanelProps {
  onClose: () => void;
}

const THEMES = [
  { id: 'deep-space', name: 'Deep Space', color: '#8a2be2' },
  { id: 'nebula', name: 'Nebula', color: '#d946ef' },
  { id: 'ocean', name: 'Ocean', color: '#06b6d4' },
] as const;

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const { resetData, theme, setTheme } = useStore();

  const handleReset = async () => {
    await resetData();
    onClose();
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Theme Section */}
        <div className="settings-section">
          <h3>Theme</h3>
          <div className="theme-options">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`theme-btn ${theme === t.id ? 'active' : ''}`}
                onClick={() => setTheme(t.id)}
                style={{ '--theme-color': t.color } as React.CSSProperties}
              >
                <span className="theme-swatch"></span>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="settings-section">
          <h3>How to Use</h3>
          <div className="help-content">
            <p><strong>Create</strong> — Tap the + button to add a new planet</p>
            <p><strong>Edit</strong> — Tap any planet to open the editor</p>
            <p><strong>Navigate</strong> — Drag to rotate, pinch to zoom</p>
            <p><strong>Organize</strong> — Drag planets to reposition them</p>
          </div>
        </div>

        {/* About Section */}
        <div className="settings-section">
          <h3>About</h3>
          <div className="about-content">
            <p><strong>MindSpace</strong></p>
            <p className="version">Version 1.0.0</p>
            <p className="tagline">Your ideas, your universe.</p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section danger-zone">
          <h3>Danger Zone</h3>
          <button className="reset-btn" onClick={handleReset}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
            </svg>
            Reset All Data
          </button>
          <p className="reset-warning">This will delete all your planets and notes.</p>
        </div>
      </div>
    </div>
  );
};
