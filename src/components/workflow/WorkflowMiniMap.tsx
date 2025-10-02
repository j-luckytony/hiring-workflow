import React from 'react';
import { MiniMap, type Node } from '@xyflow/react';
import type { WorkflowNode } from '../../types/workflow';

interface WorkflowMiniMapProps {
  workflowNodes: WorkflowNode[];
  className?: string;
}

export const WorkflowMiniMap: React.FC<WorkflowMiniMapProps> = ({ workflowNodes, className }) => {
  const getNodeColor = (node: Node): string => {
    const nodeType = workflowNodes.find(n => n.id === node.id)?.type;
    switch (nodeType) {
      case 'start': return '#10b981';
      case 'action': return '#3b82f6';
      case 'decision': return '#f59e0b';
      case 'terminal': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <MiniMap 
      nodeColor={getNodeColor}
      maskColor="rgba(240, 242, 247, 0.6)"
      nodeStrokeWidth={3}
      nodeBorderRadius={2}
      className={className}
      style={{
        width: 280,
        height: 200,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
      pannable
      zoomable
    />
  );
};
