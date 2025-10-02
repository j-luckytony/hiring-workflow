import React, { useState, useEffect } from 'react';
import { Clipboard, Trash2, FileText, FolderTree } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface NodeActionsProps {
  nodeId: string;
  hasChildren: boolean;
  selected: boolean;
  editMode: boolean;
  nodeType: string;
  onCopyNode: (nodeId: string) => void;
  onCopySubtree: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteSubtree: (nodeId: string) => void;
}

export const NodeActions: React.FC<NodeActionsProps> = ({
  nodeId,
  hasChildren,
  selected,
  editMode,
  nodeType,
  onCopyNode,
  onCopySubtree,
  onDeleteNode,
  onDeleteSubtree
}) => {
  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const handleCopyNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyNode(nodeId);
    setShowCopyPopup(false);
  };

  const handleCopySubtree = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopySubtree(nodeId);
    setShowCopyPopup(false);
  };

  const handleDeleteNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteNode(nodeId);
    setShowDeletePopup(false);
  };

  const handleDeleteSubtree = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSubtree(nodeId);
    setShowDeletePopup(false);
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      // Show popup menu to choose between node and subtree
      setShowCopyPopup(true);
      setShowDeletePopup(false);
    } else {
      // Directly copy the node if no children
      onCopyNode(nodeId);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      // Show popup menu to choose between node and subtree
      setShowDeletePopup(true);
      setShowCopyPopup(false);
    } else {
      // Directly delete the node if no children
      onDeleteNode(nodeId);
    }
  };

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowCopyPopup(false);
      setShowDeletePopup(false);
    };
    
    if (showCopyPopup || showDeletePopup) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showCopyPopup, showDeletePopup]);

  if (!selected && !editMode) return null;

  return (
    <div className={cn(
      'absolute transition-opacity',
      selected ? 'opacity-100' : 'opacity-0 hover:opacity-100',
      nodeType === 'start' ? 'top-0 right-0' : 'top-1 right-1'
    )}>
      <div className="flex gap-1">
        {/* Copy button with conditional popup */}
        <div className="relative">
          <button
            onClick={handleCopyClick}
            className="p-1 rounded bg-green-500 hover:bg-green-600 shadow-md"
            title={hasChildren ? "Clone Options" : "Clone Node"}
          >
            <Clipboard className="w-3 h-3 text-white" />
          </button>
          
          {/* Copy popup - only shown for nodes with children */}
          {showCopyPopup && hasChildren && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-1 z-[10000] min-w-[140px]">
              <button
                onClick={handleCopyNode}
                className="flex items-center gap-2 w-full px-2 py-1 text-sm hover:bg-gray-100 rounded whitespace-nowrap"
              >
                <FileText className="w-3 h-3" />
                Clone Node
              </button>
              <button
                onClick={handleCopySubtree}
                className="flex items-center gap-2 w-full px-2 py-1 text-sm hover:bg-gray-100 rounded whitespace-nowrap"
              >
                <FolderTree className="w-3 h-3" />
                Clone Subtree
              </button>
            </div>
          )}
        </div>
        
        {/* Delete button with conditional popup */}
        <div className="relative">
          <button
            onClick={handleDeleteClick}
            className="p-1 rounded bg-red-500 hover:bg-red-600 shadow-md"
            title={hasChildren ? "Delete Options" : "Delete Node"}
          >
            <Trash2 className="w-3 h-3 text-white" />
          </button>
          
          {/* Delete popup - only shown for nodes with children */}
          {showDeletePopup && hasChildren && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-1 z-[10000] min-w-[140px]">
              <button
                onClick={handleDeleteNode}
                className="flex items-center gap-2 w-full px-2 py-1 text-sm hover:bg-gray-100 rounded text-red-600 whitespace-nowrap"
              >
                <FileText className="w-3 h-3" />
                Delete Node
              </button>
              <button
                onClick={handleDeleteSubtree}
                className="flex items-center gap-2 w-full px-2 py-1 text-sm hover:bg-gray-100 rounded text-red-600 whitespace-nowrap"
              >
                <FolderTree className="w-3 h-3" />
                Delete Subtree
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
