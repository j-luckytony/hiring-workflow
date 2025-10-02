import { useState, useCallback } from 'react';
import type { Workflow } from '../../../../types/workflow';
import { WorkflowLoader } from '../../../../lib/workflowLoader';
import type { LoadingStep } from '../../../../lib/workflowLoader';
import { sampleWorkflow } from '../../../../data/sampleWorkflow';

export interface WorkflowLoadingHook {
  isLoadingWorkflow: boolean;
  currentLoadingStep: LoadingStep | null;
  loadingProgress: {
    current: number;
    total: number;
  };
  startWorkflowLoading: () => void;
  resetWorkflow: () => void;
}

export const useWorkflowLoading = (
  _currentWorkflow: Workflow,
  setWorkflow: (workflow: Workflow) => void,
  onWorkflowUpdate?: (workflow: Workflow) => void
): WorkflowLoadingHook => {
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);
  const [currentLoadingStep, setCurrentLoadingStep] = useState<LoadingStep | null>(null);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });

  const startWorkflowLoading = useCallback(() => {
    setIsLoadingWorkflow(true);
    setLoadingProgress({ current: 0, total: 0 });
    
    const loader = new WorkflowLoader(sampleWorkflow);
    let totalSteps = 0;
    
    loader.start(
      (step: LoadingStep, index: number, total: number) => {
        totalSteps = total;
        setCurrentLoadingStep(step);
        setLoadingProgress({ current: index + 1, total });
        
        // Create intermediate workflow with current step's nodes and edges
        const intermediateWorkflow: Workflow = {
          ...sampleWorkflow,
          nodes: step.nodes,
          edges: step.edges,
          updatedAt: new Date()
        };
        
        setWorkflow(intermediateWorkflow);
        onWorkflowUpdate?.(intermediateWorkflow);
      },
      (finalWorkflow: Workflow) => {
        setIsLoadingWorkflow(false);
        setCurrentLoadingStep(null);
        setLoadingProgress({ current: totalSteps, total: totalSteps });
        setWorkflow(finalWorkflow);
        onWorkflowUpdate?.(finalWorkflow);
      }
    );
  }, [setWorkflow, onWorkflowUpdate]);

  const resetWorkflow = useCallback(() => {
    if (confirm('Are you sure you want to reset the workflow? This will remove all current nodes and edges.')) {
      // Create a minimal workflow with just a welcome node
      const minimalWorkflow: Workflow = {
        id: 'minimal-workflow',
        name: 'Welcome Workflow',
        description: 'Start building your workflow',
        nodes: [{
          id: 'welcome-node',
          type: 'start',
          position: { x: 400, y: 300 },
          data: {
            label: 'Welcome! Click "Load Example" to get started',
            description: 'This is your starting point for building workflows',
            config: {
              trigger: 'manual_entry',
              source: 'manual'
            }
          }
        }],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setWorkflow(minimalWorkflow);
      onWorkflowUpdate?.(minimalWorkflow);
      setIsLoadingWorkflow(false);
      setCurrentLoadingStep(null);
      setLoadingProgress({ current: 0, total: 0 });
    }
  }, [setWorkflow, onWorkflowUpdate]);

  return {
    isLoadingWorkflow,
    currentLoadingStep,
    loadingProgress,
    startWorkflowLoading,
    resetWorkflow
  };
};
