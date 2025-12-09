import { useStore } from '../store/useStore';
import './NavigationCarousel.css';

export const NavigationCarousel: React.FC = () => {
  const { nodes, activeNodeId, setActiveNode } = useStore();
  const nodeList = Object.values(nodes);
  
  if (nodeList.length < 2) return null;
  
  return (
    <div className="nav-carousel">
      <div className="nav-carousel-inner">
        {nodeList.map(node => (
          <button
            key={node.id}
            className={`nav-item ${activeNodeId === node.id ? 'active' : ''}`}
            onClick={() => setActiveNode(node.id)}
          >
            <span className="nav-dot" style={{ background: node.color }} />
            <span className="nav-title">{node.title || 'Untitled'}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
