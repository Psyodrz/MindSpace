import { useEffect, useRef, Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { 
  StarField, 
  SpaceEnvironment, 
  CameraController, 
  StarNode,
  NodeConnection,
  OrbitRing,
  SolarSystemView,
  getTheme
} from '@mindspace/galaxy';
import { useStore } from './store/useStore';
import { BottomSheet } from './ui/BottomSheet';
import { TutorialHint } from './ui/TutorialHint';
import { LoadingScreen } from './ui/LoadingScreen';
import { EmptyState } from './ui/EmptyState';
import { SettingsPanel } from './ui/SettingsPanel';
import { ContextMenu } from './ui/ContextMenu';
import { NavigationCarousel } from './ui/NavigationCarousel';
import { UpdateDialog } from './ui/UpdateDialog';
import { useUpdateStore } from './store/useUpdateStore';
import './App.css';

function App() {
  const { 
    nodes, 
    activeNodeId, 
    addNode,
    removeNode,
    updateNodePosition, 
    setActiveNode,
    linkingNodeId,
    startLinking,
    completeLink,
    cancelLinking,
    undo,
    canUndo,
    mode,
    theme,
    viewMode,
    setViewMode
  } = useStore();
  const cameraRef = useRef<CameraControls>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [fabPulse, setFabPulse] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const lastTapTime = useRef<{ [key: string]: number }>({});
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  
  const nodeList = Object.values(nodes);
  const primaryNodeId = nodeList[0]?.id;
  const isEmpty = nodeList.length === 0;
  
  // Get current theme config
  const themeConfig = getTheme(theme);
  
  // Apply theme on mount/change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Inject theme colors as CSS variables
    if (themeConfig) {
      const root = document.documentElement;
      root.style.setProperty('--theme-bg', themeConfig.backgroundColor);
      root.style.setProperty('--theme-text', '#ffffff'); // Default text color
      root.style.setProperty('--theme-accent', themeConfig.accentColor);
      root.style.setProperty('--theme-accent-glow', themeConfig.accentGlow);
    }
  }, [theme, themeConfig]);

  // Check for updates on startup
  useEffect(() => {
    useUpdateStore.getState().checkForUpdate();
  }, []);

  // Camera Animation Logic
  useEffect(() => {
    if (!cameraRef.current || isLoading) return;

    if (activeNodeId) {
      const node = nodes[activeNodeId];
      if (node) {
        cameraRef.current.setLookAt(
          node.position.x + 6, node.position.y + 3, node.position.z + 6,
          node.position.x, node.position.y, node.position.z,
          true
        );
      }
    } else if (primaryNodeId) {
      const node = nodes[primaryNodeId];
      if (node) {
         cameraRef.current.setLookAt(
          node.position.x + 15, node.position.y + 8, node.position.z + 15,
          node.position.x, node.position.y, node.position.z,
          true
        );
      }
    }
  }, [activeNodeId, nodes, primaryNodeId, isLoading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Ctrl/Cmd+Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      
      // Escape = Deselect / Cancel linking
      if (e.key === 'Escape') {
        setActiveNode(null);
        cancelLinking();
        setContextMenu(null);
      }
      
      // Delete/Backspace = Delete selected node
      if ((e.key === 'Delete' || e.key === 'Backspace') && activeNodeId) {
        e.preventDefault();
        removeNode(activeNodeId);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, setActiveNode, cancelLinking, activeNodeId, removeNode]);

  // Handle creating first planet
  const handleCreateFirst = () => {
    addNode('My First Idea', '/earth-day.jpg');
    showCreationFeedback();
  };
  
  // Show creation feedback (pulse + toast)
  const showCreationFeedback = () => {
    setFabPulse(true);
    setShowToast(true);
    setTimeout(() => setFabPulse(false), 300);
    setTimeout(() => setShowToast(false), 2000);
  };
  
  // Handle adding new planet with feedback
  const handleAddNode = () => {
    addNode();
    showCreationFeedback();
  };

  // Long press handlers for context menu
  const handlePointerDown = useCallback((nodeId: string, e: PointerEvent) => {
    longPressTimer.current = setTimeout(() => {
      setContextMenu({ nodeId, x: e.clientX, y: e.clientY });
    }, 600);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Handle node click (select, complete link, or double-tap to edit)
  const handleNodeClick = useCallback((nodeId: string, e: any) => {
    e.stopPropagation();
    handlePointerUp();
    
    // Double-tap detection for quick edit
    const now = Date.now();
    if (lastTapTime.current[nodeId] && now - lastTapTime.current[nodeId] < 300) {
      setActiveNode(nodeId);
      lastTapTime.current[nodeId] = 0;
      return;
    }
    lastTapTime.current[nodeId] = now;
    
    if (linkingNodeId) {
      completeLink(nodeId);
    } else {
      setActiveNode(nodeId);
    }
  }, [linkingNodeId, completeLink, setActiveNode, handlePointerUp]);
  
  // Context menu handlers
  const handleEdit = useCallback(() => {
    if (contextMenu) {
      setActiveNode(contextMenu.nodeId);
      setContextMenu(null);
    }
  }, [contextMenu, setActiveNode]);
  
  const handleDelete = useCallback(() => {
    if (contextMenu) {
      removeNode(contextMenu.nodeId);
      setContextMenu(null);
    }
  }, [contextMenu, removeNode]);
  
  const handleLink = useCallback(() => {
    if (contextMenu) {
      startLinking(contextMenu.nodeId);
      setContextMenu(null);
    }
  }, [contextMenu, startLinking]);

  // Get all unique connections for rendering
  const connections = nodeList.flatMap(node => 
    (node.connections || [])
      .filter(targetId => targetId > node.id) // Only render one direction
      .map(targetId => ({
        from: node.id,
        to: targetId,
        startPos: node.position,
        endPos: nodes[targetId]?.position
      }))
      .filter(c => c.endPos)
  );

  return (
    <div className="canvas-container">
      {/* Loading Screen */}
      {isLoading && (
        <LoadingScreen onReady={() => setIsLoading(false)} />
      )}

      <Canvas 
        camera={{ 
          position: viewMode === 'solar-system' ? [0, 80, 180] : [0, 10, 25], 
          fov: viewMode === 'solar-system' ? 60 : 55,
          far: viewMode === 'solar-system' ? 2000 : 500
        }} 
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true,
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={null}>
          <SpaceEnvironment theme={themeConfig} hideSun={viewMode === 'solar-system'} />
          <StarField 
            count={Math.round(3000 * themeConfig.star.density)} 
            color={themeConfig.star.color} 
            size={themeConfig.star.size} 
          />
          <CameraController ref={cameraRef} />
          
          {/* Solar System View */}
          {viewMode === 'solar-system' ? (
            <SolarSystemView
              nodes={nodeList.map(n => ({
                id: n.id,
                title: n.title,
                textureUrl: n.textureUrl,
                orbitRadius: n.orbitRadius,
                orbitSpeed: n.orbitSpeed,
                orbitAngle: n.orbitAngle,
                planetSize: n.planetSize
              }))}
              selectedNodeId={activeNodeId}
              theme={themeConfig}
              onNodeSelect={(id) => setActiveNode(id)}
            />
          ) : (
            <>
              {/* Galaxy View - Orbit Ring for Solar mode */}
              {mode === 'SOLAR' && primaryNodeId && nodes[primaryNodeId] && (
                <OrbitRing 
                  center={[
                    nodes[primaryNodeId].position.x, 
                    nodes[primaryNodeId].position.y, 
                    nodes[primaryNodeId].position.z
                  ]} 
                />
              )}
              
              {/* Render Connections */}
              {connections.map(conn => (
                <NodeConnection
                  key={`${conn.from}-${conn.to}`}
                  start={[conn.startPos.x, conn.startPos.y, conn.startPos.z]}
                  end={[conn.endPos.x, conn.endPos.y, conn.endPos.z]}
                />
              ))}
              
              {/* Render User Nodes */}
              {nodeList.map((node) => (
                <StarNode 
                  key={node.id}
                  id={node.id}
                  position={[node.position.x, node.position.y, node.position.z]}
                  label={node.title}
                  color={node.color}
                  textureUrl={node.textureUrl}
                  selected={activeNodeId === node.id}
                  isPrimary={node.id === primaryNodeId}
                  hovered={linkingNodeId === node.id}
                  theme={themeConfig}
                  onClick={(e) => handleNodeClick(node.id, e)}
                  onPointerDown={(e) => handlePointerDown(node.id, e)}
                  onPointerUp={handlePointerUp}
                  onPositionChange={(id, pos) => {
                    updateNodePosition(id, { x: pos[0], y: pos[1], z: pos[2] });
                  }}
                />
              ))}
            </>
          )}
        </Suspense>
        
        {/* Deselect on bg click */}
        <mesh onClick={() => { setActiveNode(null); cancelLinking(); }} visible={false}>
          <sphereGeometry args={[500, 16, 16]} />
          <meshBasicMaterial side={2} />
        </mesh>
      </Canvas>
      
      {/* Linking Indicator */}
      {linkingNodeId && (
        <div className="linking-indicator">
          <span>🔗</span> Tap another planet to connect
          <button onClick={cancelLinking}>Cancel</button>
        </div>
      )}
      
      {/* Header with View Toggle */}
      <div className="ui-header">
        <img src="/logo.png" alt="MindSpace" className="header-logo" />
        
        {/* View Mode Toggle */}
        <div className="view-toggle">
          <button 
            className={`view-btn ${viewMode === 'galaxy' ? 'active' : ''}`}
            onClick={() => setViewMode('galaxy')}
          >
            🌌
          </button>
          <button 
            className={`view-btn ${viewMode === 'solar-system' ? 'active' : ''}`}
            onClick={() => setViewMode('solar-system')}
          >
            ☀️
          </button>
        </div>
        
        <button className="settings-btn" onClick={() => setShowSettings(true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      
      {/* Empty State (shown when no nodes) */}
      {!isLoading && isEmpty && (
        <EmptyState onCreateFirst={handleCreateFirst} />
      )}
      
      {/* FAB - only show when not empty */}
      {!isEmpty && (
        <button className={`fab ${fabPulse ? 'pulse' : ''}`} onClick={handleAddNode}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      )}
      
      {/* Toast Notification */}
      {showToast && (
        <div className="toast">Planet created ✓</div>
      )}

      {!isEmpty && <TutorialHint />}
      {!isEmpty && <NavigationCarousel />}
      {!isEmpty && <BottomSheet />}
      
      <UpdateDialog />
      
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onLink={handleLink}
          onClose={() => setContextMenu(null)}
        />
      )}
      
      {/* Undo Button */}
      {canUndo() && (
        <button className="undo-btn" onClick={undo}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10h10a5 5 0 0 1 0 10H8"/>
            <polyline points="3 10 8 5 3 10 8 15"/>
          </svg>
          Undo
        </button>
      )}
    </div>
  );
}

export default App;
