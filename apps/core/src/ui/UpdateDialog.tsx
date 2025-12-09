import React from 'react';
import { useUpdateStore } from '../store/useUpdateStore';
import './UpdateDialog.css';

export const UpdateDialog: React.FC = () => {
  const { hasUpdate, latestVersion, changelog, updateAvailable, resetUpdate } = useUpdateStore();

  if (!hasUpdate) return null;

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="update-overlay">
      <div className="update-dialog">
        <div className="update-header">
          <h3>{updateAvailable ? 'Update Ready 🚀' : 'Downloading...'}</h3>
          <span className="version-badge">{latestVersion}</span>
        </div>
        
        <div className="update-content">
          <p>
            {updateAvailable 
              ? 'A new version has been downloaded. Restart to apply.' 
              : 'Downloading the latest version in the background...'}
          </p>
          
          {changelog && (
            <div className="changelog-box">
              <h4>What's New:</h4>
              <p>{changelog}</p>
            </div>
          )}
        </div>
        
        <div className="update-actions">
          <button className="btn-secondary" onClick={resetUpdate}>
            {updateAvailable ? 'Later' : 'Hide'}
          </button>
          
          {updateAvailable && (
            <button className="btn-primary" onClick={handleRestart}>
              Restart Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
