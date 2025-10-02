import { useCallback, useRef } from 'react';
import { useReactFlow, type Connection, type OnConnectStartParams } from '@xyflow/react';
import type { WorkflowNode } from '../../../types/workflow';

interface ConnectionHandlerProps {
  workflow: { nodes: WorkflowNode[] };
  onAddConnectedNode?: (sourceNodeId: string, position: { x: number; y: number }, nodeType?: string, subType?: string) => void;
  onEdgeAdd?: (source: string, target: string, label?: string) => void;
}

export const useConnectionHandler = ({
  workflow,
  onAddConnectedNode,
  onEdgeAdd
}: ConnectionHandlerProps) => {
  const { screenToFlowPosition } = useReactFlow();
  const connectionSourceRef = useRef<{ nodeId: string; handleId?: string } | null>(null);

  const handleConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target && onEdgeAdd) {
      // Optional labeling for decision branches based on source handle
      const sourceNode = workflow.nodes.find(n => n.id === connection.source);
      let label: string | undefined;
      if (sourceNode?.type === 'decision') {
        switch (connection.sourceHandle) {
          case 'left':
            label = 'Reject';
            break;
          case 'right':
            label = 'Advance';
            break;
          case 'bottom':
            label = 'Follow-up';
            break;
          default:
            label = undefined;
        }
      }
      onEdgeAdd(connection.source, connection.target, label);
    }
  }, [onEdgeAdd, workflow.nodes]);

  const handleConnectStart = useCallback((_: any, params: OnConnectStartParams) => {
    // Store the source node ID and handle for potential auto-node creation
    if (params.nodeId) {
      connectionSourceRef.current = { nodeId: params.nodeId, handleId: params.handleId || undefined };
    } else {
      connectionSourceRef.current = null;
    }
  }, []);

  const handleConnectEnd = useCallback((event: MouseEvent | TouchEvent, _connectionState: any) => {
    const src = connectionSourceRef.current;
    
    if (!src || !onAddConnectedNode) return;

    // Check if connection ended on empty space (not on a node)
    const targetIsPane = (event.target as Element)?.classList?.contains('react-flow__pane');
    if (!targetIsPane) return;

    const sourceNode = workflow.nodes.find(n => n.id === src.nodeId);
    if (!sourceNode) return;

    // Get mouse position and convert to flow coordinates
    const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
    const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY;
    
    const flowPosition = screenToFlowPosition({
      x: clientX,
      y: clientY,
    });

    // Determine the next node type based on source node type (simplified mapping)
    let nextNodeType: string;
    switch (sourceNode.type) {
      case 'start':
        nextNodeType = 'action';
        break;
      case 'action':
        nextNodeType = 'terminal';
        break;
      case 'decision':
        nextNodeType = 'terminal';
        break;
      case 'terminal':
        nextNodeType = 'action';
        break;
      default:
        nextNodeType = 'action';
    }

    // Derive edge label from decision handle when auto-creating
    let edgeLabel: string | undefined;
    if (sourceNode.type === 'decision') {
      switch (src.handleId) {
        case 'left': edgeLabel = 'Reject'; break;
        case 'right': edgeLabel = 'Advance'; break;
        case 'bottom': edgeLabel = 'Follow-up'; break;
        default: edgeLabel = undefined;
      }
    }

    onAddConnectedNode(src.nodeId, flowPosition, nextNodeType, edgeLabel);
    
    // Clear the connection source
    connectionSourceRef.current = null;
  }, [workflow.nodes, onAddConnectedNode, screenToFlowPosition]);

  return {
    handleConnect,
    handleConnectStart,
    handleConnectEnd
  };
};
