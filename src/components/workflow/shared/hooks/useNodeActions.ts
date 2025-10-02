import { useCallback } from 'react';
import type {
  Workflow,
  WorkflowNode,
  StartNode,
  ActionNode,
  DecisionNode,
  TerminalNode
} from '../../../../types/workflow';

export interface NodeActionsHook {
  handleNodeSelect: (nodeId: string | null) => void;
  handleNodeUpdate: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  handleNodeDelete: (nodeId: string) => void;
  handleNodeCopy: (nodeId: string) => void;
  handleSubtreeToggle: (nodeId: string) => void;
  handleSubtreeCopy: (nodeId: string) => void;
  handleSubtreeDelete: (nodeId: string) => void;
}

export const useNodeActions = (
  workflow: Workflow,
  setWorkflow: (workflow: Workflow) => void,
  setSelectedNodeId: (id: string | undefined) => void,
  setShowDetailPanel: (show: boolean) => void
): NodeActionsHook => {
  
  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId || undefined);
    setShowDetailPanel(!!nodeId);
  }, [setSelectedNodeId, setShowDetailPanel]);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    // Preserve discriminated union by narrowing on node.type and applying
    // the correct Partial<SpecificNode> updates. Also ignore attempts to change `type`.
    const updatedWorkflow: Workflow = {
      ...workflow,
      nodes: workflow.nodes.map((node) => {
        if (node.id !== nodeId) return node;
        const { type: _ignoredType, ...rest } = updates as any;
        switch (node.type) {
          case 'start':
            return { ...node, ...(rest as Partial<StartNode>) };
          case 'action':
            return { ...node, ...(rest as Partial<ActionNode>) };
          case 'decision':
            return { ...node, ...(rest as Partial<DecisionNode>) };
          case 'terminal':
            return { ...node, ...(rest as Partial<TerminalNode>) };
        }
      }),
      updatedAt: new Date()
    };
    setWorkflow(updatedWorkflow);
  }, [workflow, setWorkflow]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    if (confirm('Are you sure you want to delete this node?')) {
      const updatedWorkflow = {
        ...workflow,
        nodes: workflow.nodes.filter(node => node.id !== nodeId),
        edges: workflow.edges.filter(edge => 
          edge.source !== nodeId && edge.target !== nodeId
        ),
        updatedAt: new Date()
      };
      setWorkflow(updatedWorkflow);
      setSelectedNodeId(undefined);
      setShowDetailPanel(false);
    }
  }, [workflow, setWorkflow, setSelectedNodeId, setShowDetailPanel]);

  const handleNodeCopy = useCallback((nodeId: string) => {
    const sourceNode = workflow.nodes.find(n => n.id === nodeId);
    if (!sourceNode) return;

    const newNodeId = `${sourceNode.type}-${Date.now()}`;
    const copiedNode = {
      ...sourceNode,
      id: newNodeId,
      position: {
        x: sourceNode.position.x + 50,
        y: sourceNode.position.y + 50
      },
      data: {
        ...sourceNode.data,
        label: `${sourceNode.data.label} (Clone)`
      },
      parentId: undefined,
      children: undefined
    } as WorkflowNode;

    const updatedWorkflow = {
      ...workflow,
      nodes: [...workflow.nodes, copiedNode],
      updatedAt: new Date()
    } as Workflow;

    setWorkflow(updatedWorkflow);
    setSelectedNodeId(newNodeId);
  }, [workflow, setWorkflow, setSelectedNodeId]);

  // Helper: collect descendants by following edges (source -> target)
  // This is more robust than parentId-based traversal when there are duplicate IDs in data.
  const collectDescendantIdsByEdges = (parentId: string, visited: Set<string> = new Set()): string[] => {
    const childIds = workflow.edges
      .filter(e => e.source === parentId)
      .map(e => e.target);

    const result: string[] = [];
    for (const childId of childIds) {
      if (visited.has(childId)) continue;
      visited.add(childId);
      result.push(childId);
      result.push(...collectDescendantIdsByEdges(childId, visited));
    }
    return Array.from(new Set(result));
  };

  const handleSubtreeToggle = useCallback((nodeId: string) => {
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) return;

    handleNodeUpdate(nodeId, { collapsed: !node.collapsed });
  }, [workflow.nodes, handleNodeUpdate]);

  const handleSubtreeCopy = useCallback((nodeId: string) => {
    const sourceNode = workflow.nodes.find(n => n.id === nodeId);
    if (!sourceNode) return;

    // Prefer edge-based traversal to determine subtree
    const descendantIds = collectDescendantIdsByEdges(nodeId);
    const subtreeNodes = [
      sourceNode,
      ...descendantIds
        .map(id => workflow.nodes.find(n => n.id === id))
        .filter((n): n is WorkflowNode => Boolean(n))
    ];

    // Create new IDs for copied nodes
    const idMap = new Map<string, string>();
    const ts = Date.now();
    subtreeNodes.forEach(node => {
      idMap.set(node.id, `${node.id}-copy-${ts}`);
    });

    // Copy nodes with new IDs
    const copiedNodes = subtreeNodes.map(node => ({
      ...node,
      id: idMap.get(node.id)!,
      position: {
        x: node.position.x + 100,
        y: node.position.y + 50
      },
      // Remap parent by ID if it's within the subtree; otherwise drop parentId
      parentId: node.parentId && idMap.has(node.parentId) ? idMap.get(node.parentId) : undefined,
      children: node.children?.map(childId => idMap.get(childId)!).filter(Boolean),
      data: {
        ...node.data,
        label: node.id === nodeId ? `${node.data.label} (Copy)` : node.data.label
      }
    })) as WorkflowNode[];

    // Copy edges
    const copiedEdges = workflow.edges
      .filter(edge => idMap.has(edge.source) && idMap.has(edge.target))
      .map(edge => ({
        ...edge,
        id: `edge-${idMap.get(edge.source)}-${idMap.get(edge.target)}-${Date.now()}`,
        source: idMap.get(edge.source)!,
        target: idMap.get(edge.target)!
      }));

    const updatedWorkflow: Workflow = {
      ...workflow,
      nodes: [...workflow.nodes, ...copiedNodes],
      edges: [...workflow.edges, ...copiedEdges],
      updatedAt: new Date()
    };

    setWorkflow(updatedWorkflow);
    setSelectedNodeId(idMap.get(nodeId));
  }, [workflow, setWorkflow, setSelectedNodeId]);

  const handleSubtreeDelete = useCallback((nodeId: string) => {
    if (confirm('Are you sure you want to delete this entire subtree? This action cannot be undone.')) {
      // Get all descendants using edge-based traversal
      const descendants = collectDescendantIdsByEdges(nodeId);
      const nodesToDelete = [nodeId, ...descendants];

      const updatedWorkflow = {
        ...workflow,
        nodes: workflow.nodes.filter(node => !nodesToDelete.includes(node.id)),
        edges: workflow.edges.filter(edge => 
          !nodesToDelete.includes(edge.source) && !nodesToDelete.includes(edge.target)
        ),
        updatedAt: new Date()
      };

      setWorkflow(updatedWorkflow);
      setSelectedNodeId(undefined);
      setShowDetailPanel(false);
    }
  }, [workflow, setWorkflow, setSelectedNodeId, setShowDetailPanel]);

  return {
    handleNodeSelect,
    handleNodeUpdate,
    handleNodeDelete,
    handleNodeCopy,
    handleSubtreeToggle,
    handleSubtreeCopy,
    handleSubtreeDelete
  };
};
