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
}

export type SpaceMode = 'GALAXY' | 'SOLAR' | 'PATH';

export interface SpaceState {
  nodes: Record<NodeId, MindNode>;
  mode: SpaceMode;
  activeNodeId: NodeId | null;
}
