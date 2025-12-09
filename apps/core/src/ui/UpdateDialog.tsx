import React from 'react';
import { useUpdateStore } from '../store/useUpdateStore';
import './UpdateDialog.css';

export const UpdateDialog: React.FC = () => {
  const { hasUpdate, latestVersion, changelog, apkUrl, resetUpdate } = useUpdateStore();

  if (!hasUpdate) return null;

  const handleDownload = () => {
    if (apkUrl) {
      window.open(apkUrl, '_blank');
    }
  };

  return (
    <div className="update-overlay">
      <div className="update-dialog">
        <div className="update-header">
          <h3>Update Available 🚀</h3>
          <span className="version-badge">{latestVersion}</span>
        </div>
        
        <div className="update-content">
          <p>A new version of MindSpace is available!</p>
          
          {changelog && (
            <div className="changelog-box">
              <h4>What's New:</h4>
              <p>{changelog}</p>
            </div>
          )}
        </div>
        
        <div className="update-actions">
          <button className="btn-secondary" onClick={resetUpdate}>
            Later
          </button>
          <button className="btn-primary" onClick={handleDownload}>
            Download Update
          </button>
        </div>
      </div>
    </div>
  );
};
