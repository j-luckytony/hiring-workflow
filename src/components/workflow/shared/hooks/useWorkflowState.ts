import { useState, useCallback } from 'react';
import type { Workflow } from '../../../../types/workflow';

export interface WorkflowStateHook {
  workflow: Workflow;
  selectedNodeId: string | undefined;
  showDetailPanel: boolean;
  editMode: boolean;
  setWorkflow: (workflow: Workflow) => void;
  setSelectedNodeId: (id: string | undefined) => void;
  setShowDetailPanel: (show: boolean) => void;
  setEditMode: (edit: boolean) => void;
  toggleEditMode: () => void;
}

export const useWorkflowState = (
  initialWorkflow: Workflow,
  onWorkflowUpdate?: (workflow: Workflow) => void
): WorkflowStateHook => {
  const [workflow, setWorkflowState] = useState<Workflow>(initialWorkflow);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [editMode, setEditMode] = useState(true);

  const setWorkflow = useCallback((newWorkflow: Workflow) => {
    setWorkflowState(newWorkflow);
    onWorkflowUpdate?.(newWorkflow);
  }, [onWorkflowUpdate]);

  const toggleEditMode = useCallback(() => {
    setEditMode(prev => !prev);
  }, []);

  return {
    workflow,
    selectedNodeId,
    showDetailPanel,
    editMode,
    setWorkflow,
    setSelectedNodeId,
    setShowDetailPanel,
    setEditMode,
    toggleEditMode
  };
};
