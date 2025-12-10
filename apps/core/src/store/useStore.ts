import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type MindNode, type NodeId, type SpaceMode, type Vector3Object, type ThemeId, type ViewMode, generateRandomPosition } from '@mindspace/galaxy';
import { exportToJSON, importFromJSON, clearAllData } from '../utils/storage';
import { get, set, del } from 'idb-keyval';

// Undo action types
interface UndoAction {
  type: 'DELETE_NODE' | 'MOVE_NODE';
  nodeId: NodeId;
  nodeData?: MindNode;  // For delete undo
  previousPosition?: Vector3Object;  // For move undo
}

// Theme type - use ThemeId from galaxy package
type AppTheme = ThemeId;

interface AppState {
  nodes: Record<NodeId, MindNode>;
  mode: SpaceMode;
  activeNodeId: NodeId | null;
  hasSeenTutorial: boolean;
  linkingNodeId: NodeId | null;  // Node being linked from
  undoHistory: UndoAction[];  // Max 10
  theme: AppTheme;
  viewMode: ViewMode;
  
  // Actions
  addNode: (title?: string, textureUrl?: string) => void;
  removeNode: (id: NodeId) => void;
  updateNodePosition: (id: NodeId, position: Vector3Object) => void;
  updateNode: (id: NodeId, updates: { title?: string; content?: string }) => void;
  setActiveNode: (id: NodeId | null) => void;
  setMode: (mode: SpaceMode) => void;
  setTheme: (theme: AppTheme) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setHasSeenTutorial: (seen: boolean) => void;
  hydrateTextures: () => void;
  initializeDefaultPlanets: () => void;
  
  // Linking
  startLinking: (id: NodeId) => void;
  completeLink: (targetId: NodeId) => void;
  cancelLinking: () => void;
  
  // Undo
  undo: () => void;
  canUndo: () => boolean;
  removeConnection: (fromId: NodeId, toId: NodeId) => void;
  
  // Import/Export
  exportData: () => void;
  importData: () => Promise<void>;
  resetData: () => Promise<void>;
}

// Available textures
const PLANET_TEXTURES = [
  '/earth-day.jpg',
  '/mars.jpg',
  '/moon.jpg',
  '/jupiter.jpg',
  '/mercury.jpg',
  '/venus.jpg',
  '/neptune.jpg',
  '/uranus.jpg'
];

// Default planets configuration (pre-seeded on first load)
const DEFAULT_PLANETS = [
  { title: 'Mercury', textureUrl: '/mercury.jpg', orbitRadius: 15, orbitSpeed: 4.8, planetSize: 1.2, content: 'The smallest planet, closest to the Sun.' },
  { title: 'Venus', textureUrl: '/venus.jpg', orbitRadius: 22, orbitSpeed: 3.5, planetSize: 2, content: 'The hottest planet with thick atmosphere.' },
  { title: 'Earth', textureUrl: '/earth-day.jpg', orbitRadius: 30, orbitSpeed: 3.0, planetSize: 2, content: 'Our home planet, the blue marble.' },
  { title: 'Mars', textureUrl: '/mars.jpg', orbitRadius: 40, orbitSpeed: 2.4, planetSize: 1.5, content: 'The red planet, future destination.' },
  { title: 'Jupiter', textureUrl: '/jupiter.jpg', orbitRadius: 60, orbitSpeed: 1.3, planetSize: 4, content: 'The largest planet, gas giant.' },
  { title: 'Saturn', textureUrl: '/moon.jpg', orbitRadius: 80, orbitSpeed: 0.97, planetSize: 3.5, content: 'Famous for its beautiful rings.' },
  { title: 'Uranus', textureUrl: '/uranus.jpg', orbitRadius: 100, orbitSpeed: 0.68, planetSize: 2.8, content: 'The ice giant that rotates on its side.' },
  { title: 'Neptune', textureUrl: '/neptune.jpg', orbitRadius: 120, orbitSpeed: 0.54, planetSize: 2.6, content: 'The windiest planet in our solar system.' }
];

// Get next available orbit radius for new planets
const getNextOrbitRadius = (existingNodes: Record<string, MindNode>): number => {
  const existingRadii = Object.values(existingNodes)
    .map(n => n.orbitRadius || 0)
    .filter(r => r > 0);
  
  if (existingRadii.length === 0) return 140;
  
  const maxRadius = Math.max(...existingRadii);
  return maxRadius + 20; // Each new planet 20 units further out
};

// Create default planet nodes
const createDefaultPlanets = (): Record<string, MindNode> => {
  const now = Date.now();
  const nodes: Record<string, MindNode> = {};
  
  DEFAULT_PLANETS.forEach((planet, index) => {
    const id = `default-planet-${index}`;
    nodes[id] = {
      id,
      title: planet.title,
      content: planet.content,
      position: { x: planet.orbitRadius, y: 0, z: 0 },
      galaxyPosition: { x: (index - 4) * 8, y: 0, z: (index % 2) * 5 },
      connections: [],
      createdAt: now,
      updatedAt: now,
      color: '#ffffff',
      textureUrl: planet.textureUrl,
      orbitRadius: planet.orbitRadius,
      orbitSpeed: planet.orbitSpeed,
      orbitAngle: (index / DEFAULT_PLANETS.length) * Math.PI * 2,
      planetSize: planet.planetSize,
      isDefaultPlanet: true
    };
  });
  
  return nodes;
};


const STORAGE_KEY = 'mindspace-storage';

// Custom IndexedDB storage
const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await get<string>(name);
    return value ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

// Calculate orbit positions for Solar mode
function calculateOrbitPosition(index: number, total: number, centerPos: Vector3Object, radius: number = 8): Vector3Object {
  const angle = (index / total) * Math.PI * 2;
  return {
    x: centerPos.x + Math.cos(angle) * radius,
    y: centerPos.y + (Math.random() - 0.5) * 2, // Slight y variation
    z: centerPos.z + Math.sin(angle) * radius
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      nodes: {},
      mode: 'GALAXY',
      activeNodeId: null,
      hasSeenTutorial: false,
      linkingNodeId: null,
      undoHistory: [],
      theme: 'deep-space' as const,
      viewMode: 'galaxy' as const,
      
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
      },
      
      setViewMode: (viewMode) => {
        set({ viewMode });
      },
      
      addNode: (title = 'New Idea', textureUrl) => set((state) => {
        const id = crypto.randomUUID();
        const position = generateRandomPosition(15);
        const finalTexture = textureUrl || PLANET_TEXTURES[Math.floor(Math.random() * PLANET_TEXTURES.length)];
        const now = Date.now();
        
        // Calculate orbital params for new planet
        const orbitRadius = getNextOrbitRadius(state.nodes);
        const orbitSpeed = 0.3 + Math.random() * 0.3; // Slow outer orbit

        
        const newNode: MindNode = {
          id,
          title,
          content: '',
          position,
          galaxyPosition: { ...position },
          connections: [],
          createdAt: now,
          updatedAt: now,
          color: '#ffffff',
          textureUrl: finalTexture,
          // Orbital properties
          orbitRadius,
          orbitSpeed,
          orbitAngle: Math.random() * Math.PI * 2,
          planetSize: 1.5 + Math.random() * 1.5, // Random size 1.5-3
          isDefaultPlanet: false
        };
        return { nodes: { ...state.nodes, [id]: newNode }, activeNodeId: id };
      }),
      
      updateNodePosition: (id, pos) => set((state) => {
        const node = state.nodes[id];
        if (!node) return {};
        
        // In Galaxy mode, also update galaxyPosition
        const updates: Partial<MindNode> = {
          position: pos,
          updatedAt: Date.now()
        };
        if (state.mode === 'GALAXY') {
          updates.galaxyPosition = { ...pos };
        }
        
        return {
          nodes: {
            ...state.nodes,
            [id]: { ...node, ...updates }
          }
        };
      }),
      
      updateNode: (id, updates) => set((state) => {
        const node = state.nodes[id];
        if (!node) return {};
        
        return {
          nodes: {
            ...state.nodes,
            [id]: { 
              ...node, 
              ...updates,
              updatedAt: Date.now() 
            }
          }
        };
      }),
      
      setActiveNode: (id) => set({ activeNodeId: id }),
      
      removeNode: (id) => set((state) => {
        const deletedNode = state.nodes[id];
        if (!deletedNode) return {};
        
        const { [id]: _, ...rest } = state.nodes;
        // Also remove this node from other nodes' connections
        const updatedNodes = { ...rest };
        Object.keys(updatedNodes).forEach(key => {
          const node = updatedNodes[key];
          if (node.connections?.includes(id)) {
            updatedNodes[key] = {
              ...node,
              connections: node.connections.filter(cid => cid !== id)
            };
          }
        });
        
        // Add to undo history (keep max 10)
        const newHistory: UndoAction[] = [
          ...state.undoHistory,
          { type: 'DELETE_NODE' as const, nodeId: id, nodeData: { ...deletedNode } }
        ].slice(-10);
        
        return { nodes: updatedNodes, activeNodeId: null, linkingNodeId: null, undoHistory: newHistory };
      }),
      
      // Undo action
      undo: () => set((state) => {
        if (state.undoHistory.length === 0) return {};
        
        const lastAction = state.undoHistory[state.undoHistory.length - 1];
        const newHistory = state.undoHistory.slice(0, -1);
        
        if (lastAction.type === 'DELETE_NODE' && lastAction.nodeData) {
          // Restore deleted node
          return {
            nodes: { ...state.nodes, [lastAction.nodeId]: lastAction.nodeData },
            undoHistory: newHistory
          };
        }
        
        return { undoHistory: newHistory };
      }),
      
      canUndo: () => get().undoHistory.length > 0,
      
      setMode: (mode) => set((state) => {
        const nodeList = Object.values(state.nodes);
        if (nodeList.length === 0) return { mode };
        
        const primaryNode = nodeList[0];
        const otherNodes = nodeList.slice(1);
        
        if (mode === 'SOLAR') {
          // Arrange in orbit around primary
          const updatedNodes = { ...state.nodes };
          otherNodes.forEach((node, index) => {
            const orbitPos = calculateOrbitPosition(index, otherNodes.length, primaryNode.position, 10);
            updatedNodes[node.id] = {
              ...node,
              position: orbitPos
            };
          });
          return { mode, nodes: updatedNodes };
        } else {
          // Restore galaxy positions
          const updatedNodes = { ...state.nodes };
          nodeList.forEach(node => {
            if (node.galaxyPosition) {
              updatedNodes[node.id] = {
                ...node,
                position: { ...node.galaxyPosition }
              };
            }
          });
          return { mode, nodes: updatedNodes };
        }
      }),
      
      setHasSeenTutorial: (seen) => set({ hasSeenTutorial: seen }),
      
      // Linking actions
      startLinking: (id) => set({ linkingNodeId: id }),
      
      completeLink: (targetId) => set((state) => {
        const { linkingNodeId } = state;
        if (!linkingNodeId || linkingNodeId === targetId) {
          return { linkingNodeId: null };
        }
        
        const fromNode = state.nodes[linkingNodeId];
        const toNode = state.nodes[targetId];
        if (!fromNode || !toNode) return { linkingNodeId: null };
        
        // Check if already connected
        if (fromNode.connections?.includes(targetId)) {
          return { linkingNodeId: null };
        }
        
        // Add bidirectional connection
        const updatedNodes = {
          ...state.nodes,
          [linkingNodeId]: {
            ...fromNode,
            connections: [...(fromNode.connections || []), targetId]
          },
          [targetId]: {
            ...toNode,
            connections: [...(toNode.connections || []), linkingNodeId]
          }
        };
        
        return { nodes: updatedNodes, linkingNodeId: null };
      }),
      
      cancelLinking: () => set({ linkingNodeId: null }),
      
      removeConnection: (fromId, toId) => set((state) => {
        const fromNode = state.nodes[fromId];
        const toNode = state.nodes[toId];
        if (!fromNode || !toNode) return {};
        
        return {
          nodes: {
            ...state.nodes,
            [fromId]: {
              ...fromNode,
              connections: (fromNode.connections || []).filter(id => id !== toId)
            },
            [toId]: {
              ...toNode,
              connections: (toNode.connections || []).filter(id => id !== fromId)
            }
          }
        };
      }),
      
      // Auto-patch missing textures and migrate old data
      hydrateTextures: () => set((state) => {
        const updatedNodes = { ...state.nodes };
        let hasChanges = false;
        
        Object.keys(updatedNodes).forEach(key => {
          const node = updatedNodes[key];
          let nodeChanged = false;
          const updates: Partial<MindNode> = {};
          
          // Fix missing textures
          const isValidTexture = node.textureUrl && PLANET_TEXTURES.includes(node.textureUrl);
          if (!isValidTexture) {
            updates.textureUrl = PLANET_TEXTURES[Math.floor(Math.random() * PLANET_TEXTURES.length)];
            updates.color = '#ffffff';
            nodeChanged = true;
          }
          
          // Migrate old 'content' field to 'title' if title is missing
          if (!node.title && (node as any).content) {
            updates.title = (node as any).content;
            updates.content = (node as any).description || '';
            nodeChanged = true;
          }
          
          // Add missing updatedAt
          if (!node.updatedAt) {
            updates.updatedAt = node.createdAt || Date.now();
            nodeChanged = true;
          }
          
          // Add missing galaxyPosition
          if (!node.galaxyPosition) {
            updates.galaxyPosition = { ...node.position };
            nodeChanged = true;
          }
          
          // Add missing connections array
          if (!node.connections) {
            updates.connections = [];
            nodeChanged = true;
          }
          
          if (nodeChanged) {
            updatedNodes[key] = { ...node, ...updates };
            hasChanges = true;
          }
        });
        
        return hasChanges ? { nodes: updatedNodes } : {};
      }),
      
      // Initialize default planets for new users (called after tour)
      initializeDefaultPlanets: () => set((state) => {
        const hasDefaultPlanets = Object.keys(state.nodes).some(id => id.startsWith('default-planet-'));
        if (hasDefaultPlanets) return {};

        const defaultPlanets = createDefaultPlanets();
        
        // Merge with existing nodes (e.g. if user created one before finishing tour)
        // Also ensure existing nodes have orbit stats
        const currentNodes = { ...state.nodes };
        let nextRadius = 140;
        
        Object.keys(currentNodes).forEach((id, index) => {
          const node = currentNodes[id];
          if (node.orbitRadius === undefined) {
             currentNodes[id] = {
              ...node,
              orbitRadius: nextRadius,
              orbitSpeed: 0.3 + Math.random() * 0.3,
              orbitAngle: (index / Object.keys(currentNodes).length) * Math.PI * 2,
              planetSize: 2 + Math.random() * 1.5,
              isDefaultPlanet: false
            };
            nextRadius += 20;
          }
        });

        return { nodes: { ...defaultPlanets, ...currentNodes } };
      }),
      
      // Export current state as JSON file
      exportData: () => {
        const state = get();
        const exportState = {
          nodes: state.nodes,
          mode: state.mode,
          exportedAt: new Date().toISOString(),
          version: '1.2'
        };
        exportToJSON(exportState, `mindspace-backup-${Date.now()}.json`);
      },
      
      // Import state from JSON file
      importData: async () => {
        try {
          const data = await importFromJSON() as { nodes?: Record<NodeId, MindNode>; mode?: SpaceMode };
          if (data && data.nodes) {
            set({
              nodes: data.nodes,
              mode: data.mode || 'GALAXY',
              activeNodeId: null,
              linkingNodeId: null
            });
          }
        } catch (err) {
          console.error('Import failed:', err);
          alert('Failed to import data. Please check the file format.');
        }
      },
      
      // Reset all data
      resetData: async () => {
        if (confirm('This will delete all your data. Are you sure?')) {
          await clearAllData(STORAGE_KEY);
          set({
            nodes: {},
            mode: 'GALAXY',
            activeNodeId: null,
            hasSeenTutorial: false,
            linkingNodeId: null
          });
        }
      }
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        nodes: state.nodes,
        mode: state.mode,
        hasSeenTutorial: state.hasSeenTutorial,
        theme: state.theme,
        viewMode: state.viewMode
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const currentNodes = state.nodes;
          const defaultPlanets = createDefaultPlanets();
          
          // Check if default planets already exist
          const hasDefaultPlanets = Object.keys(currentNodes).some(id => id.startsWith('default-planet-'));
          
          if (!hasDefaultPlanets) {
            // Merge default planets with existing nodes
            // Also migrate existing notes to have orbital params
            const migratedNodes = { ...currentNodes };
            let nextRadius = 140;
            
            Object.keys(migratedNodes).forEach((id, index) => {
              const node = migratedNodes[id];
              if (node.orbitRadius === undefined) {
                migratedNodes[id] = {
                  ...node,
                  orbitRadius: nextRadius,
                  orbitSpeed: 0.3 + Math.random() * 0.3,
                  orbitAngle: (index / Object.keys(migratedNodes).length) * Math.PI * 2,
                  planetSize: 2 + Math.random() * 1.5,
                  isDefaultPlanet: false
                };
                nextRadius += 20;
              }
            });
            
            // Merge: default planets + user notes
            const mergedNodes = { ...defaultPlanets, ...migratedNodes };
            useStore.setState({ nodes: mergedNodes });
          }
        }
      }
    }
  )
);
