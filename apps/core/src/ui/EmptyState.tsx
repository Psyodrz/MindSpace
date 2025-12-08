import './EmptyState.css';

interface EmptyStateProps {
  onCreateFirst: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateFirst }) => {
  return (
    <div className="empty-state-overlay">
      <div className="empty-state-content">
        {/* Logo */}
        <div className="empty-logo">
          <img src="/logo.png" alt="MindSpace" className="empty-logo-image" />
        </div>
        
        {/* Message */}
        <h2 className="empty-title">Welcome to MindSpace</h2>
        <p className="empty-description">
          Your ideas become planets in your own universe.<br />
          Create, connect, and explore your thoughts in 3D.
        </p>
        
        {/* CTA */}
        <button className="empty-cta" onClick={onCreateFirst}>
          <span className="cta-icon">+</span>
          Create your first planet
        </button>
      </div>
    </div>
  );
};
