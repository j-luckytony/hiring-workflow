import React from 'react';
import { motion } from 'framer-motion';
import type { NodeProps } from '@xyflow/react';
import type { WorkflowNode as WorkflowNodeType } from '../../../types/workflow';
import { NodeContent } from './NodeContent';
import { NodeActions } from './NodeActions';
import { NodeHandles } from './NodeHandles';
import { getNodeStyles } from '../shared/utils/nodeUtils';
import { cn } from '../../../lib/utils';

interface CustomNodeProps extends NodeProps {
  data: WorkflowNodeType['data'] & {
    nodeType: WorkflowNodeType['type'];
    children?: string[];
    collapsed?: boolean;
    childCount?: number;
    onToggleCollapse?: (nodeId: string) => void;
    onCopySubtree?: (nodeId: string) => void;
    onDeleteSubtree?: (nodeId: string) => void;
    onDeleteNode?: (nodeId: string) => void;
    onNodeCopy?: (nodeId: string) => void;
    onViewDetails?: (nodeId: string) => void;
    onEditConfig?: (nodeId: string) => void;
    editMode?: boolean;
  };
}

export const WorkflowNode: React.FC<CustomNodeProps> = ({ 
  id, 
  data, 
  selected,
  dragging 
}) => {
  const nodeStyles = getNodeStyles(data.nodeType, data.config);
  const hasChildren = !!(data.children && data.children.length > 0);
  const childCount = data.childCount || 0;

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onToggleCollapse?.(id);
  };

  const commonClasses = cn(
    'relative shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center justify-center',
    nodeStyles.bg,
    nodeStyles.hover,
    nodeStyles.size,
    selected && 'ring-2 ring-white ring-offset-2 ring-offset-blue-500',
    dragging && 'scale-105 shadow-xl'
  );

  const renderNodeByType = () => {
    switch (data.nodeType) {
      case 'start':
        return (
          <div
            className={cn(commonClasses, nodeStyles.shape, 'p-4')}
          >
            <NodeContent
              nodeType={data.nodeType}
              label={data.label}
              config={data.config}
              collapsed={!!data.collapsed}
              hasChildren={hasChildren}
              childCount={childCount}
              onToggleCollapse={handleToggleCollapse}
            />
          </div>
        );

      case 'decision':
        return (
          <div className="relative">
            <div
              className={cn(commonClasses, nodeStyles.shape, 'p-3')}
            >
              <div className="transform -rotate-45 flex flex-col items-center justify-center h-full">
                <NodeContent
                  nodeType={data.nodeType}
                  label={data.label}
                  config={data.config}
                  collapsed={!!data.collapsed}
                  hasChildren={hasChildren}
                  childCount={childCount}
                  onToggleCollapse={handleToggleCollapse}
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div
            className={cn(commonClasses, nodeStyles.shape, 'p-3')}
          >
            <NodeContent
              nodeType={data.nodeType}
              label={data.label}
              config={data.config}
              collapsed={!!data.collapsed}
              hasChildren={hasChildren}
              childCount={childCount}
              onToggleCollapse={handleToggleCollapse}
            />
          </div>
        );
    }
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative cursor-move"
      >
        {renderNodeByType()}

        {/* Node Actions */}
        <NodeActions
          nodeId={id}
          hasChildren={hasChildren}
          selected={selected}
          editMode={!!data.editMode}
          nodeType={data.nodeType}
          onCopyNode={data.onNodeCopy || (() => {})}
          onCopySubtree={data.onCopySubtree || (() => {})}
          onDeleteNode={data.onDeleteNode || (() => {})}
          onDeleteSubtree={data.onDeleteSubtree || (() => {})}
        />
      </motion.div>

      {/* Connection Handles */}
      <NodeHandles nodeType={data.nodeType} />
    </div>
  );
};

// Export node types for React Flow
export const nodeTypes = {
  start: WorkflowNode,
  action: WorkflowNode,
  decision: WorkflowNode,
  terminal: WorkflowNode,
};
