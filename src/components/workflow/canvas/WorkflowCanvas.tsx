import React, { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { Workflow, WorkflowNode as WorkflowNodeType } from '../../../types/workflow';
import { nodeTypes } from '../nodes/WorkflowNode';
import { CanvasControls } from './CanvasControls';
import { useConnectionHandler } from './ConnectionHandler';
import { cn } from '../../../lib/utils';

interface WorkflowCanvasProps {
  workflow: Workflow;
  editMode?: boolean;
  onNodeSelect?: (nodeId: string | null) => void;
  handleSubtreeToggle?: (nodeId: string) => void;
  handleSubtreeCopy?: (nodeId: string) => void;
  handleSubtreeDelete?: (nodeId: string) => void;
  handleNodeDelete?: (nodeId: string) => void;
  handleNodeCopy?: (nodeId: string) => void;
  onNodePositionChange?: (nodeId: string, position: { x: number; y: number }) => void;
  onAddNode?: (nodeType: string, subType?: string) => void;
  onAddConnectedNode?: (sourceNodeId: string, position: { x: number; y: number }, nodeType?: string, subType?: string) => void;
  onEdgeAdd?: (source: string, target: string, label?: string) => void;
  selectedNodeId?: string;
  focusNodeIds?: string[]; // Node IDs to focus on (for auto-scrolling)
  nodeStats?: {
    startNodes: number;
    actionNodes: number;
    decisionNodes: number;
    terminalNodes: number;
    totalNodes: number;
  };
  className?: string;
}

const WorkflowCanvasInner: React.FC<WorkflowCanvasProps> = ({
  workflow,
  editMode = false,
  onNodeSelect,
  handleSubtreeToggle,
  handleSubtreeCopy,
  handleSubtreeDelete,
  handleNodeDelete,
  handleNodeCopy,
  onNodePositionChange,
  onAddNode,
  onAddConnectedNode,
  onEdgeAdd,
  selectedNodeId,
  focusNodeIds,
  nodeStats,
  className
}) => {
  const { fitView } = useReactFlow();

  // Connection handling
  const { handleConnect, handleConnectStart, handleConnectEnd } = useConnectionHandler({
    workflow,
    onAddConnectedNode,
    onEdgeAdd
  });

  // Convert workflow nodes to React Flow nodes
  const reactFlowNodes: Node[] = useMemo(() => {
    return workflow.nodes.map((node: WorkflowNodeType) => {
      // Calculate child information
      const children = workflow.nodes.filter(n => n.parentId === node.id);
      const childCount = children.length;

      return {
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          ...node.data,
          nodeType: node.type,
          children: children.map(c => c.id),
          childCount,
          collapsed: node.collapsed,
          onToggleCollapse: handleSubtreeToggle,
          onCopySubtree: handleSubtreeCopy,
          onDeleteSubtree: handleSubtreeDelete,
          onDeleteNode: handleNodeDelete,
          onNodeCopy: handleNodeCopy,
          editMode: true
        },
        selected: node.id === selectedNodeId,
        hidden: node.parentId ? isNodeCollapsed(node.parentId, workflow.nodes) : false
      };
    });
  }, [workflow.nodes, selectedNodeId, editMode, handleSubtreeToggle, handleSubtreeCopy, handleSubtreeDelete, handleNodeDelete, handleNodeCopy]);

  // Convert workflow edges to React Flow edges with smooth bezier curves
  const reactFlowEdges: Edge[] = useMemo(() => {
    return workflow.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: edge.type || 'default', // 'default' uses smooth bezier curves
      animated: edge.animated ?? true,
      style: edge.style || {
        stroke: '#64748b',
        strokeWidth: 2,
      },
      // Additional smoothing for bezier curves
      markerEnd: {
        type: 'arrowclosed' as const,
        color: '#64748b',
        width: 20,
        height: 20,
      }
    }));
  }, [workflow.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  // Update nodes when workflow changes
  useEffect(() => {
    setNodes(reactFlowNodes);
  }, [reactFlowNodes, setNodes]);

  // Update edges when workflow changes
  useEffect(() => {
    setEdges(reactFlowEdges);
  }, [reactFlowEdges, setEdges]);

  // Handle node position changes
  const handleNodesChange = useCallback((changes: any[]) => {
    onNodesChange(changes);
    
    // Capture position changes and update workflow
    changes.forEach(change => {
      if (change.type === 'position' && change.position && onNodePositionChange) {
        onNodePositionChange(change.id, change.position);
      }
    });
  }, [onNodesChange, onNodePositionChange]);

  // Handle node selection
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    onNodeSelect?.(node.id);
  }, [onNodeSelect]);

  // Handle pane click (deselect)
  const handlePaneClick = useCallback(() => {
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  // Auto-scroll to focus nodes
  useEffect(() => {
    if (focusNodeIds && focusNodeIds.length > 0) {
      setTimeout(() => {
        fitView({
          nodes: focusNodeIds.map(id => ({ id })),
          duration: 800,
          padding: 0.3,
          minZoom: 0.5,
          maxZoom: 1.2
        });
      }, 100);
    }
  }, [focusNodeIds, fitView]);

  return (
    <div className={cn('w-full h-full bg-gray-50 overflow-hidden', className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onConnectStart={handleConnectStart}
        onConnectEnd={handleConnectEnd}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        minZoom={0.05}
        maxZoom={2}
        translateExtent={[[-10000, -1000], [10000, 12000]]}
        deleteKeyCode={'Delete'}
        multiSelectionKeyCode={'Shift'}
        panOnDrag={true} // Pan canvas when dragging empty space with left mouse
        panOnScroll={true} // Pan with two-finger scroll / mouse wheel
        zoomOnScroll={false} // Use pinch to zoom; avoid scroll zoom conflicts
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
        nodesDraggable={true} // Drag nodes directly with left mouse
        nodesConnectable={true}
        elementsSelectable={true}
        preventScrolling={true}
        selectionKeyCode={'Shift'} // Use Shift for box selection
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#e2e8f0"
        />
        
        {/* Interactive MiniMap for navigation */}
        <MiniMap
          nodeColor={(node) => {
            const workflowNode = workflow.nodes.find(n => n.id === node.id);
            switch (workflowNode?.type) {
              case 'start': return '#059669';      // Darker green for start
              case 'action': return '#2563eb';     // Darker blue for actions
              case 'decision': return '#f97316';   // Bright orange for decisions
              case 'terminal': return '#dc2626';   // Bright red for terminals
              default: return '#4b5563';
            }
          }}
          maskColor="rgba(226, 232, 240, 0.5)"
          nodeStrokeWidth={4}
          nodeBorderRadius={3}
          style={{
            width: 350,
            height: 280,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            border: '3px solid #cbd5e1',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            cursor: 'pointer'
          }}
          pannable
          zoomable
        />
        
        <CanvasControls
          editMode={editMode}
          nodeStats={nodeStats}
          onAddNode={onAddNode}
        />
      </ReactFlow>
    </div>
  );
};

// Helper function to check if a node is collapsed
const isNodeCollapsed = (nodeId: string, nodes: WorkflowNodeType[]): boolean => {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return false;
  
  if (node.collapsed) return true;
  
  // Check if any parent is collapsed
  if (node.parentId) {
    return isNodeCollapsed(node.parentId, nodes);
  }
  
  return false;
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
};
