import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { WorkflowCanvas } from '../canvas/WorkflowCanvas';
import { NodeDetailPanel } from '../panels/NodeDetailPanel';
import { WorkflowToolbar } from '../WorkflowToolbar';
import { ExportImport } from '../toolbar/ExportImport';
import { useWorkflowState } from '../shared/hooks/useWorkflowState';
import { useNodeActions } from '../shared/hooks/useNodeActions';
import { useExportImport } from '../shared/hooks/useExportImport';
import { cn } from '../../../lib/utils';
import type { Workflow } from '../../../types/workflow';

interface WorkflowManagerProps {
  workflow: Workflow;
  onWorkflowUpdate?: (workflow: Workflow) => void;
  className?: string;
}

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  workflow: initialWorkflow,
  onWorkflowUpdate,
  className
}) => {
  // State management
  const {
    workflow,
    selectedNodeId,
    showDetailPanel,
    editMode,
    setWorkflow,
    setSelectedNodeId,
    setShowDetailPanel,
    
  } = useWorkflowState(initialWorkflow, onWorkflowUpdate);

  // State for auto-scrolling to newly created nodes
  const [focusNodeIds, setFocusNodeIds] = useState<string[]>([]);

  // Node actions
  const nodeActions = useNodeActions(
    workflow,
    setWorkflow,
    setSelectedNodeId,
    setShowDetailPanel
  );

  // Handle node position changes
  const handleNodePositionChange = useCallback((nodeId: string, position: { x: number; y: number }) => {
    const updatedWorkflow = {
      ...workflow,
      nodes: workflow.nodes.map(node => 
        node.id === nodeId ? { ...node, position } : node
      ),
      updatedAt: new Date()
    };
    setWorkflow(updatedWorkflow);
  }, [workflow, setWorkflow]);

  // Keyboard shortcuts: copy (Cmd/Ctrl+C), paste (Cmd/Ctrl+V), delete (Delete)
  const [clipboardNodeId, setClipboardNodeId] = useState<string | undefined>(undefined);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isFormElement = (() => {
        const el = e.target as HTMLElement | null;
        if (!el) return false;
        const tag = el.tagName?.toLowerCase();
        const editable = (el as HTMLElement).isContentEditable;
        return editable || tag === 'input' || tag === 'textarea' || tag === 'select';
      })();
      if (isFormElement) return;

      const meta = e.metaKey || e.ctrlKey;
      if (meta && (e.key === 'c' || e.key === 'C')) {
        if (selectedNodeId) {
          setClipboardNodeId(selectedNodeId);
          e.preventDefault();
        }
      }
      if (meta && (e.key === 'v' || e.key === 'V')) {
        if (clipboardNodeId) {
          nodeActions.handleNodeCopy(clipboardNodeId);
          e.preventDefault();
        }
      }
      if (e.key === 'Delete') {
        if (selectedNodeId) {
          nodeActions.handleNodeDelete(selectedNodeId);
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, clipboardNodeId, nodeActions]);

  // Handle adding connected nodes (drag to empty space)
  const handleAddConnectedNode = useCallback((sourceNodeId: string, position: { x: number; y: number }, nodeType?: string, edgeLabel?: string) => {
    const newNodeId = `${nodeType || 'action'}-${Date.now()}`;
    const newEdgeId = `edge-${sourceNodeId}-${newNodeId}-${Date.now()}`;
    
    // Create proper typed node based on nodeType
    let newNode: any;
    const baseNodeData = {
      id: newNodeId,
      position,
      collapsed: false
    };

    switch (nodeType) {
      case 'start':
        newNode = {
          ...baseNodeData,
          type: 'start' as const,
          data: {
            label: 'New Application',
            description: 'Candidate applies for position',
            config: {
              trigger: 'job_application' as const,
              source: 'greenhouse' as const,
              jobId: '',
              department: ''
            }
          }
        };
        break;
      case 'decision':
        newNode = {
          ...baseNodeData,
          type: 'decision' as const,
          data: {
            label: 'Resume Review',
            description: 'Evaluate candidate qualifications',
            config: {
              decisionType: 'resume_score' as const,
              criteria: [],
              paths: []
            }
          }
        };
        break;
      case 'terminal':
        newNode = {
          ...baseNodeData,
          type: 'terminal' as const,
          data: {
            label: 'Application Complete',
            description: 'Final outcome reached',
            config: {
              outcome: 'archived' as const,
              emailProvider: 'gmail' as const,
              template: '',
              notifyCandidate: true,
              updateATS: true,
              atsSystem: 'greenhouse' as const
            }
          }
        };
        break;
      default: // action
        newNode = {
          ...baseNodeData,
          type: 'action' as const,
          data: {
            label: 'Email Outreach',
            description: 'Send initial contact email',
            config: {
              actionType: 'email_outreach' as const,
              emailProvider: 'gmail' as const,
              fromAddress: 'hiring@company.com',
              template: 'initial_contact',
              atsSystem: 'greenhouse' as const,
              notifySlack: true,
              slackChannel: '#hiring'
            }
          }
        };
    }

    const newEdge = {
      id: newEdgeId,
      source: sourceNodeId,
      target: newNodeId,
      label: edgeLabel
    };

    const updatedWorkflow = {
      ...workflow,
      nodes: [...workflow.nodes, newNode],
      edges: [...workflow.edges, newEdge],
      updatedAt: new Date()
    };

    setWorkflow(updatedWorkflow);
    setSelectedNodeId(newNodeId);
    setShowDetailPanel(true);
    setFocusNodeIds([newNodeId]); // Trigger auto-scroll to new node
  }, [workflow, setWorkflow, setSelectedNodeId, setShowDetailPanel]);

  // Handle edge additions
  const handleEdgeAdd = useCallback((source: string, target: string, label?: string) => {
    const newEdgeId = `edge-${source}-${target}-${Date.now()}`;
    const newEdge = {
      id: newEdgeId,
      source,
      target,
      label
    };

    const updatedWorkflow = {
      ...workflow,
      edges: [...workflow.edges, newEdge],
      updatedAt: new Date()
    };

    setWorkflow(updatedWorkflow);
  }, [workflow, setWorkflow]);

  // Handle adding new nodes from palette
  const handleAddNode = useCallback((nodeType: string, _subType?: string) => {
    const newNodeId = `${nodeType}-${Date.now()}`;
    
    // Find a good position for the new node (avoid overlaps)
    const existingPositions = workflow.nodes.map(n => n.position);
    let newPosition = { x: 100, y: 100 };
    
    // Simple positioning logic - find empty space
    while (existingPositions.some(pos => 
      Math.abs(pos.x - newPosition.x) < 200 && Math.abs(pos.y - newPosition.y) < 100
    )) {
      newPosition.x += 250;
      if (newPosition.x > 800) {
        newPosition.x = 100;
        newPosition.y += 150;
      }
    }

    // Create proper typed node based on nodeType
    let newNode: any;
    const baseNodeData = {
      id: newNodeId,
      position: newPosition,
      collapsed: false
    };

    switch (nodeType) {
      case 'start':
        newNode = {
          ...baseNodeData,
          type: 'start' as const,
          data: {
            label: 'New Application',
            description: 'Candidate applies for position',
            config: {
              trigger: 'manual_entry' as const,
              source: 'manual' as const,
              jobId: '',
              department: ''
            }
          }
        };
        break;
      case 'decision':
        newNode = {
          ...baseNodeData,
          type: 'decision' as const,
          data: {
            label: 'Resume Review',
            description: 'Evaluate candidate qualifications',
            config: {
              decisionType: 'resume_score' as const,
              criteria: [],
              paths: []
            }
          }
        };
        break;
      case 'terminal':
        newNode = {
          ...baseNodeData,
          type: 'terminal' as const,
          data: {
            label: 'Application Complete',
            description: 'Final outcome reached',
            config: {
              outcome: 'archived' as const,
              emailProvider: 'gmail' as const,
              template: '',
              notifyCandidate: true,
              updateATS: true,
              atsSystem: 'greenhouse' as const
            }
          }
        };
        break;
      default: // action
        newNode = {
          ...baseNodeData,
          type: 'action' as const,
          data: {
            label: 'Email Outreach',
            description: 'Send initial contact email',
            config: {
              actionType: 'email_outreach' as const,
              emailProvider: 'gmail' as const,
              fromAddress: 'hiring@company.com',
              template: 'initial_contact',
              atsSystem: 'greenhouse' as const,
              notifySlack: true,
              slackChannel: '#hiring'
            }
          }
        };
    }

    const updatedWorkflow = {
      ...workflow,
      nodes: [...workflow.nodes, newNode],
      updatedAt: new Date()
    };

    setWorkflow(updatedWorkflow);
    setSelectedNodeId(newNodeId);
    setShowDetailPanel(true);
    setFocusNodeIds([newNodeId]); // Trigger auto-scroll to new node
  }, [workflow, setWorkflow, setSelectedNodeId, setShowDetailPanel]);

  // Export/Import functionality
  const { handleExportWorkflow, handleImportWorkflow } = useExportImport(
    workflow,
    setWorkflow,
    setSelectedNodeId,
    setShowDetailPanel
  );

  // Reset to initial workflow
  const resetWorkflow = useCallback(() => {
    if (confirm('Reset workflow to default? This will discard all changes.')) {
      setWorkflow(initialWorkflow);
      setSelectedNodeId(undefined);
      setShowDetailPanel(false);
      onWorkflowUpdate?.(initialWorkflow);
    }
  }, [initialWorkflow, setWorkflow, setSelectedNodeId, setShowDetailPanel, onWorkflowUpdate]);

  // Selected node
  const selectedNode = useMemo(() => 
    workflow.nodes.find(node => node.id === selectedNodeId) || null,
    [workflow.nodes, selectedNodeId]
  );

  // Workflow statistics
  const workflowStats = useMemo(() => ({
    totalNodes: workflow.nodes.length,
    totalEdges: workflow.edges.length,
    startNodes: workflow.nodes.filter(n => n.type === 'start').length,
    actionNodes: workflow.nodes.filter(n => n.type === 'action').length,
    decisionNodes: workflow.nodes.filter(n => n.type === 'decision').length,
    terminalNodes: workflow.nodes.filter(n => n.type === 'terminal').length,
  }), [workflow]);

  return (
    <div className={cn('flex flex-col h-full w-full bg-gray-50 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <WorkflowToolbar
          workflowName={workflow.name}
          workflowDescription={workflow.description}
          onReset={resetWorkflow}
          onApplyLayout={() => {/* Layout logic */}}
        />
        
        <ExportImport
          onExport={handleExportWorkflow}
          onImport={handleImportWorkflow}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Canvas */}
        <div className="flex-1 relative min-w-0 min-h-0 overflow-hidden">
          <WorkflowCanvas
            workflow={workflow}
            editMode={editMode}
            selectedNodeId={selectedNodeId}
            focusNodeIds={focusNodeIds}
            onNodeSelect={nodeActions.handleNodeSelect}
            onNodePositionChange={handleNodePositionChange}
            onAddConnectedNode={handleAddConnectedNode}
            onAddNode={handleAddNode}
            onEdgeAdd={handleEdgeAdd}
            {...nodeActions}
            nodeStats={workflowStats}
            className="w-full h-full"
          />
        </div>

        {/* Detail Panel */}
        {showDetailPanel && selectedNodeId && (
          <NodeDetailPanel
            node={selectedNode}
            onClose={() => setShowDetailPanel(false)}
            onNodeUpdate={nodeActions.handleNodeUpdate}
          />
        )}
      </div>
    </div>
  );
};
