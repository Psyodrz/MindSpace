export type Vector3Object = { x: number; y: number; z: number };
export type NodeId = string;

export interface MindNode {
  id: NodeId;
  title: string;
  content: string;
  position: Vector3Object;
  galaxyPosition?: Vector3Object;  // Store original position for Galaxy mode
  parentId?: NodeId;
  connections?: NodeId[];          // Connected node IDs
  color?: string;
  textureUrl?: string;
  createdAt: number;
  updatedAt: number;
  
  // Orbital properties for Solar System view
  orbitRadius?: number;    // Distance from sun
  orbitSpeed?: number;     // Revolution speed
  orbitAngle?: number;     // Current position in orbit (radians)
  planetSize?: number;     // Visual size of planet
  isDefaultPlanet?: boolean; // True for pre-seeded planets
}

export type SpaceMode = 'GALAXY' | 'SOLAR' | 'PATH';

export interface SpaceState {
  nodes: Record<NodeId, MindNode>;
  mode: SpaceMode;
  activeNodeId: NodeId | null;
}

