import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { NodeEditor } from './NodeEditor';
import './BottomSheet.css';

export const BottomSheet: React.FC = () => {
  const { 
    nodes, 
    activeNodeId, 
    setActiveNode, 
    mode, 
    setMode,
    exportData,
    importData 
  } = useStore();
  
  // Start collapsed on mobile
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startTranslate = useRef(0);

  const activeNode = activeNodeId ? nodes[activeNodeId] : null;

  // Auto-open when node is selected
  useEffect(() => {
    if (activeNodeId) {
      setIsOpen(true);
    }
  }, [activeNodeId]);

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    startTranslate.current = dragY;
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    const newY = Math.max(0, startTranslate.current + diff);
    setDragY(newY);
  };

  // Handle touch end - snap to open or closed
  const handleTouchEnd = () => {
    setIsDragging(false);
    const threshold = 100;
    if (dragY > threshold) {
      setIsOpen(false);
      setDragY(0);
    } else {
      setIsOpen(true);
      setDragY(0);
    }
  };

  // Reset drag on open state change
  useEffect(() => {
    setDragY(0);
  }, [isOpen]);

  // Calculate transform style
  const getTransform = () => {
    if (isDragging) {
      return `translateY(${dragY}px)`;
    }
    return isOpen ? 'translateY(0)' : 'translateY(calc(100% - 56px))';
  };

  const handleCloseEditor = () => {
    // Just close the sheet, don't deselect
    setIsOpen(false);
  };

  return (
    <div 
      ref={sheetRef}
      className={`bottom-sheet ${isOpen ? 'open' : 'closed'}`}
      style={{ transform: getTransform(), transition: isDragging ? 'none' : undefined }}
    >
      {/* Drag Handle */}
      <div 
        className="sheet-handle" 
        onClick={() => setIsOpen(!isOpen)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="handle-bar" />
      </div>
      
      <div className="sheet-content">
        {activeNode ? (
          // Show Node Editor when a node is selected
          <NodeEditor 
            nodeId={activeNodeId!} 
            onClose={handleCloseEditor}
          />
        ) : (
          <>
            {/* Mode Switcher */}
            <div className="mode-switcher">
              <button 
                className={mode === 'GALAXY' ? 'active' : ''} 
                onClick={() => setMode('GALAXY')}
              >
                Galaxy
              </button>
              <button 
                className={mode === 'SOLAR' ? 'active' : ''} 
                onClick={() => setMode('SOLAR')}
              >
                Solar
              </button>
            </div>

            <div className="node-list">
              <h3>Your Planets</h3>
              {Object.values(nodes).length === 0 ? (
                <p className="empty-state">Tap + to add your first idea</p>
              ) : (
                Object.values(nodes).map(node => (
                  <div 
                    key={node.id} 
                    className="list-item"
                    onClick={() => setActiveNode(node.id)}
                  >
                    <div className="dot" style={{ background: node.color }} />
                    <div className="list-item-content">
                      <span className="list-item-title">{node.title || 'Untitled'}</span>
                      {node.content && (
                        <span className="list-item-preview">
                          {node.content.slice(0, 50)}{node.content.length > 50 ? '...' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Data Actions */}
            <div className="data-actions">
              <button onClick={exportData} className="action-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export
              </button>
              <button onClick={importData} className="action-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17,8 12,3 7,8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Import
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
