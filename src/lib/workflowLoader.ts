import type { Workflow, WorkflowNode, WorkflowEdge } from '../types/workflow';
import { sampleWorkflow } from '../data/sampleWorkflow';
import { applyLayout } from './layoutUtils';

export interface LoadingStep {
  id: string;
  title: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  delay: number; // milliseconds
  newNodeIds: string[]; // IDs of nodes added in this step for auto-scrolling
}

/**
 * Creates a sequence of loading steps for progressive workflow reveal
 */
export function createLoadingSteps(workflow: Workflow): LoadingStep[] {
  const steps: LoadingStep[] = [];
  const allNodes = [...workflow.nodes];
  const allEdges = [...workflow.edges];
  
  // Group nodes by their hierarchical level for progressive loading
  const nodesByLevel = new Map<number, WorkflowNode[]>();
  const levels = calculateNodeLevels(allNodes, allEdges);
  
  allNodes.forEach(node => {
    const level = levels.get(node.id) || 0;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)!.push(node);
  });

  const sortedLevels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);
  let accumulatedNodes: WorkflowNode[] = [];
  let accumulatedEdges: WorkflowEdge[] = [];

  sortedLevels.forEach((level, index) => {
    const levelNodes = nodesByLevel.get(level)!;
    accumulatedNodes = [...accumulatedNodes, ...levelNodes];
    
    // Add edges that connect to nodes we've already added
    const nodeIds = new Set(accumulatedNodes.map(n => n.id));
    const newEdges = allEdges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target) && 
      !accumulatedEdges.some(e => e.id === edge.id)
    );
    accumulatedEdges = [...accumulatedEdges, ...newEdges];

    // Apply layout to current nodes
    const layoutNodes = applyLayout(accumulatedNodes, accumulatedEdges, 'hierarchical');

    steps.push({
      id: `step-${index + 1}`,
      title: getStepTitle(level, levelNodes),
      description: getStepDescription(level, levelNodes),
      nodes: layoutNodes,
      edges: accumulatedEdges,
      delay: index === 0 ? 500 : 800, // First step faster, subsequent steps slower
      newNodeIds: levelNodes.map(n => n.id) // Track new nodes for auto-scrolling
    });
  });

  return steps;
}

function calculateNodeLevels(nodes: WorkflowNode[], edges: WorkflowEdge[]): Map<string, number> {
  const levels = new Map<string, number>();
  const inDegree = new Map<string, number>();
  const adjacencyList = new Map<string, string[]>();

  // Initialize
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    adjacencyList.set(node.id, []);
  });

  // Build adjacency list and calculate in-degrees
  edges.forEach(edge => {
    const sourceTargets = adjacencyList.get(edge.source) || [];
    sourceTargets.push(edge.target);
    adjacencyList.set(edge.source, sourceTargets);
    
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Find start nodes
  const startNodes = nodes.filter(node => inDegree.get(node.id) === 0);
  const rootNodes = startNodes.length > 0 
    ? startNodes 
    : nodes.filter(node => node.type === 'start');

  // BFS to assign levels
  const queue: Array<{ nodeId: string; level: number }> = [];
  
  rootNodes.forEach(node => {
    levels.set(node.id, 0);
    queue.push({ nodeId: node.id, level: 0 });
  });

  while (queue.length > 0) {
    const { nodeId, level } = queue.shift()!;
    const children = adjacencyList.get(nodeId) || [];
    
    children.forEach(childId => {
      const currentLevel = levels.get(childId);
      const newLevel = level + 1;
      
      if (currentLevel === undefined || newLevel > currentLevel) {
        levels.set(childId, newLevel);
        queue.push({ nodeId: childId, level: newLevel });
      }
    });
  }

  // Handle orphaned nodes
  nodes.forEach(node => {
    if (!levels.has(node.id)) {
      levels.set(node.id, 0);
    }
  });

  return levels;
}

function getStepTitle(level: number, nodes: WorkflowNode[]): string {
  if (level === 0) return "Starting the Journey";
  
  const nodeTypes = nodes.map(n => n.type);
  const hasDecision = nodeTypes.includes('decision');
  const hasAction = nodeTypes.includes('action');
  const hasTerminal = nodeTypes.includes('terminal');
  
  if (hasDecision && hasAction) return `Decision & Action Layer ${level}`;
  if (hasDecision) return `Decision Points - Level ${level}`;
  if (hasAction) return `Action Steps - Level ${level}`;
  if (hasTerminal) return `Final Outcomes - Level ${level}`;
  
  return `Workflow Layer ${level}`;
}

function getStepDescription(level: number, nodes: WorkflowNode[]): string {
  if (level === 0) return "Setting up the entry points for your workflow";
  
  const nodeCount = nodes.length;
  const nodeTypes = [...new Set(nodes.map(n => n.type))];
  
  if (nodeTypes.length === 1) {
    const type = nodeTypes[0];
    switch (type) {
      case 'action':
        return `Adding ${nodeCount} action step${nodeCount > 1 ? 's' : ''} to process data`;
      case 'decision':
        return `Adding ${nodeCount} decision point${nodeCount > 1 ? 's' : ''} to branch the flow`;
      case 'terminal':
        return `Adding ${nodeCount} terminal node${nodeCount > 1 ? 's' : ''} as final outcomes`;
      default:
        return `Adding ${nodeCount} ${type} node${nodeCount > 1 ? 's' : ''}`;
    }
  }
  
  return `Adding ${nodeCount} nodes with ${nodeTypes.join(', ')} operations`;
}

/**
 * Progressive workflow loader class
 */
export class WorkflowLoader {
  private steps: LoadingStep[];
  private currentStepIndex: number = -1;
  private isLoading: boolean = false;
  private onStepCallback?: (step: LoadingStep, index: number, total: number) => void;
  private onCompleteCallback?: (workflow: Workflow) => void;

  constructor(workflow: Workflow) {
    this.steps = createLoadingSteps(workflow);
  }

  start(
    onStep: (step: LoadingStep, index: number, total: number) => void,
    onComplete: (workflow: Workflow) => void
  ) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.currentStepIndex = -1;
    this.onStepCallback = onStep;
    this.onCompleteCallback = onComplete;
    
    this.loadNextStep();
  }

  private loadNextStep() {
    if (this.currentStepIndex >= this.steps.length - 1) {
      this.complete();
      return;
    }

    this.currentStepIndex++;
    const step = this.steps[this.currentStepIndex];
    
    if (this.onStepCallback) {
      this.onStepCallback(step, this.currentStepIndex, this.steps.length);
    }

    setTimeout(() => {
      if (this.isLoading) {
        this.loadNextStep();
      }
    }, step.delay);
  }

  private complete() {
    this.isLoading = false;
    
    if (this.onCompleteCallback) {
      const finalWorkflow: Workflow = {
        ...sampleWorkflow,
        nodes: this.steps[this.steps.length - 1].nodes,
        edges: this.steps[this.steps.length - 1].edges,
        updatedAt: new Date()
      };
      
      this.onCompleteCallback(finalWorkflow);
    }
  }

  stop() {
    this.isLoading = false;
  }

  get totalSteps() {
    return this.steps.length;
  }

  get currentStep() {
    return this.currentStepIndex;
  }

  get loading() {
    return this.isLoading;
  }
}
