import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useStore } from '../store/useStore';
import './NodeEditor.css';

interface NodeEditorProps {
  nodeId: string;
  onClose: () => void;
}

export const NodeEditor: React.FC<NodeEditorProps> = ({ nodeId, onClose }) => {
  const { nodes, updateNode, removeNode } = useStore();
  const node = nodes[nodeId];
  
  const [title, setTitle] = useState(node?.title || '');
  const [content, setContent] = useState(node?.content || '');
  const [saved, setSaved] = useState(false);
  
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus title on mount
  useEffect(() => {
    titleRef.current?.focus();
    titleRef.current?.select();
  }, []);
  
  // Sync from store if node changes externally
  useEffect(() => {
    if (node) {
      setTitle(node.title);
      setContent(node.content);
    }
  }, [node?.id]);
  
  if (!node) return null;
  
  const handleSave = () => {
    updateNode(nodeId, { title: title.trim() || 'Untitled', content });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  
  const handleDelete = () => {
    if (confirm(`Delete "${node.title}"?`)) {
      removeNode(nodeId);
      onClose();
    }
  };
  
  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      contentRef.current?.focus();
    }
  };
  
  const handleContentKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="node-editor">
      {/* Title Input */}
      <input
        ref={titleRef}
        type="text"
        className="editor-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleTitleKeyDown}
        placeholder="Title"
        maxLength={100}
      />
      
      {/* Timestamp */}
      <div className="editor-meta">
        <span>Updated {formatDate(node.updatedAt)}</span>
        {saved && <span className="saved-badge">Saved ✓</span>}
      </div>
      
      {/* Content Textarea */}
      <textarea
        ref={contentRef}
        className="editor-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleContentKeyDown}
        placeholder="Write your notes here..."
      />
      
      {/* Actions */}
      <div className="editor-actions">
        <button className="btn-save" onClick={handleSave}>
          Save
        </button>
        <button className="btn-close" onClick={onClose}>
          Close
        </button>
        <button className="btn-delete" onClick={handleDelete}>
          Delete
        </button>
      </div>
      
      {/* Keyboard hint */}
      <div className="editor-hint">
        <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to save
      </div>
    </div>
  );
};
