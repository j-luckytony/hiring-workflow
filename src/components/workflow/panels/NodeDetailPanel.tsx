import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { NodeBasicInfo } from './NodeBasicInfo';
import { EnhancedNodeConfig } from './EnhancedNodeConfig';
import { getNodeIcon, getNodeColors } from '../shared/utils/nodeUtils';
import { cn } from '../../../lib/utils';
import type { WorkflowNode } from '../../../types/workflow';

interface NodeDetailPanelProps {
  node: WorkflowNode | null;
  onClose: () => void;
  onNodeUpdate?: (nodeId: string, updates: Partial<WorkflowNode>) => void;
}

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  node,
  onClose,
  onNodeUpdate
}) => {
  const [editableNode, setEditableNode] = useState<WorkflowNode | null>(null);
  
  // Initialize editable node when node changes
  useEffect(() => {
    if (node) {
      setEditableNode({ ...node });
    }
  }, [node]);
  
  const handleFieldChange = (field: string, value: any) => {
    if (!editableNode) return;
    
    const keys = field.split('.');
    const updatedNode = { ...editableNode };
    
    // Navigate to the nested property
    let current: any = updatedNode;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    // Set the value
    current[keys[keys.length - 1]] = value;
    
    setEditableNode(updatedNode);
    
    // Immediately update the workflow
    if (onNodeUpdate) {
      onNodeUpdate(updatedNode.id, updatedNode);
    }
  };
  
  const currentNode = editableNode || node;
  if (!currentNode) return null;

  const colors = getNodeColors(currentNode.type);

  return (
    <div className="w-96 bg-white border-l border-gray-200 h-full overflow-y-auto">
      {/* Header */}
      <div className={cn('p-4 border-b-2 border-gray-200', colors)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getNodeIcon(currentNode.type)}
            <div>
              <h2 className="font-semibold text-lg">{currentNode.data.label}</h2>
              <p className="text-sm opacity-75 capitalize">{currentNode.type} Node</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Node Name - Always Editable */}
        <div className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
          <NodeBasicInfo 
            node={currentNode}
            editMode={true}
            onFieldChange={handleFieldChange}
          />
        </div>

        {/* Node-specific Configuration - HR-Friendly */}
        {currentNode.data.config && (
          <div className="bg-gradient-to-b from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
            <EnhancedNodeConfig
              node={currentNode}
              editMode={true}
              onFieldChange={handleFieldChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};
