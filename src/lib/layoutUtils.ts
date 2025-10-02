import type { WorkflowNode, WorkflowEdge } from '../types/workflow';

export interface LayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  startX: number;
  startY: number;
}

// Node size configurations for different types
export const getNodeDimensions = (nodeType: string) => {
  switch (nodeType) {
    case 'start':
      return { width: 96, height: 96 }; // w-24 h-24
    case 'action':
      return { width: 160, height: 80 }; // average of min-max width
    case 'decision':
      return { width: 112, height: 112 }; // w-28 h-28 (diamond)
    case 'terminal':
      return { width: 140, height: 60 }; // average of min-max width
    default:
      return { width: 140, height: 80 };
  }
};

export const defaultLayoutConfig: LayoutConfig = {
  nodeWidth: 160, // Average node width
  nodeHeight: 80, // Average node height
  horizontalSpacing: 250, // Increased spacing to prevent overlaps
  verticalSpacing: 150, // Increased vertical spacing
  startX: 50,
  startY: 50
};

interface NodeLevel {
  level: number;
  nodes: WorkflowNode[];
}

/**
 * Calculates the hierarchical level of each node based on edges
 */
export function calculateNodeLevels(nodes: WorkflowNode[], edges: WorkflowEdge[]): Map<string, number> {
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

  // Find start nodes (nodes with no incoming edges)
  const startNodes = nodes.filter(node => inDegree.get(node.id) === 0);
  
  // If no start nodes found, use nodes with type 'start'
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

  // Handle orphaned nodes (nodes not connected to the main flow)
  nodes.forEach(node => {
    if (!levels.has(node.id)) {
      levels.set(node.id, 0);
    }
  });

  return levels;
}

/**
 * Groups nodes by their hierarchical level
 */
export function groupNodesByLevel(nodes: WorkflowNode[], levels: Map<string, number>): NodeLevel[] {
  const levelGroups = new Map<number, WorkflowNode[]>();
  
  nodes.forEach(node => {
    const level = levels.get(node.id) || 0;
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)!.push(node);
  });

  return Array.from(levelGroups.entries())
    .sort(([a], [b]) => a - b)
    .map(([level, nodes]) => ({ level, nodes }));
}

/**
 * Applies hierarchical layout to workflow nodes
 */
export function applyHierarchicalLayout(
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[], 
  config: LayoutConfig = defaultLayoutConfig
): WorkflowNode[] {
  const levels = calculateNodeLevels(nodes, edges);
  const levelGroups = groupNodesByLevel(nodes, levels);
  
  // Position nodes level by level with dynamic spacing based on node types
  let maxWidth = 0;
  levelGroups.forEach((levelGroup, level) => {
    const y = config.startY + level * config.verticalSpacing;
    
    // Calculate total width needed for this level with proper spacing
    let totalWidth = 0;
    levelGroup.nodes.forEach((node, index) => {
      const nodeDimensions = getNodeDimensions(node.type);
      totalWidth += nodeDimensions.width;
      if (index < levelGroup.nodes.length - 1) {
        // Ensure minimum spacing between nodes
        totalWidth += Math.max(config.horizontalSpacing, 200);
      }
    });
    
    // Add extra padding for levels with multiple nodes to prevent crowding
    const extraPadding = levelGroup.nodes.length > 1 ? 100 : 0;
    totalWidth += extraPadding;
    
    const startX = Math.max(config.startX, (1400 - totalWidth) / 2); // Center within 1400px viewport
    
    let currentX = startX + (extraPadding / 2);
    levelGroup.nodes.forEach((node) => {
      const nodeDimensions = getNodeDimensions(node.type);
      node.position = { x: currentX, y };
      
      // Use larger spacing for nodes that tend to be wider or have more content
      const dynamicSpacing = node.type === 'action' || node.type === 'terminal' 
        ? Math.max(config.horizontalSpacing, 220)
        : config.horizontalSpacing;
      
      currentX += nodeDimensions.width + dynamicSpacing;
      maxWidth = Math.max(maxWidth, currentX);
    });
  });

  // Ensure layout fits within viewport bounds
  if (maxWidth > 1400) {
    const scaleFactor = 1400 / maxWidth;
    nodes.forEach(node => {
      node.position.x *= scaleFactor;
    });
  }

  return nodes;
}

/**
 * Applies a force-directed layout simulation for organic positioning
 */
export function applyForceLayout(
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[], 
  _config: LayoutConfig = defaultLayoutConfig,
  iterations: number = 100
): WorkflowNode[] {
  const nodeMap = new Map(nodes.map(node => [node.id, { ...node }]));
  const forces = new Map<string, { x: number; y: number }>();
  
  // Initialize forces
  nodes.forEach(node => {
    forces.set(node.id, { x: 0, y: 0 });
  });

  for (let i = 0; i < iterations; i++) {
    // Reset forces
    forces.forEach(force => {
      force.x = 0;
      force.y = 0;
    });

    // Repulsion between all nodes
    nodes.forEach(nodeA => {
      nodes.forEach(nodeB => {
        if (nodeA.id === nodeB.id) return;
        
        const posA = nodeMap.get(nodeA.id)!.position;
        const posB = nodeMap.get(nodeB.id)!.position;
        
        const dx = posA.x - posB.x;
        const dy = posA.y - posB.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const repulsionForce = 5000 / (distance * distance);
        const forceA = forces.get(nodeA.id)!;
        
        forceA.x += (dx / distance) * repulsionForce;
        forceA.y += (dy / distance) * repulsionForce;
      });
    });

    // Attraction along edges
    edges.forEach(edge => {
      const sourcePos = nodeMap.get(edge.source)!.position;
      const targetPos = nodeMap.get(edge.target)!.position;
      
      const dx = targetPos.x - sourcePos.x;
      const dy = targetPos.y - sourcePos.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      
      const attractionForce = distance * 0.01;
      
      const sourceForce = forces.get(edge.source)!;
      const targetForce = forces.get(edge.target)!;
      
      sourceForce.x += (dx / distance) * attractionForce;
      sourceForce.y += (dy / distance) * attractionForce;
      
      targetForce.x -= (dx / distance) * attractionForce;
      targetForce.y -= (dy / distance) * attractionForce;
    });

    // Apply forces with damping
    const damping = 0.1;
    nodes.forEach(node => {
      const pos = nodeMap.get(node.id)!.position;
      const force = forces.get(node.id)!;
      
      pos.x += force.x * damping;
      pos.y += force.y * damping;
      
      // Keep nodes within bounds
      pos.x = Math.max(50, Math.min(2000, pos.x));
      pos.y = Math.max(50, Math.min(2000, pos.y));
    });
  }

  return Array.from(nodeMap.values());
}

/**
 * Applies a simple grid layout to workflow nodes
 */
export function applyGridLayout(
  nodes: WorkflowNode[], 
  config: LayoutConfig = defaultLayoutConfig
): WorkflowNode[] {
  const cols = Math.ceil(Math.sqrt(nodes.length));
  
  return nodes.map((node, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    const x = config.startX + col * (config.nodeWidth + config.horizontalSpacing);
    const y = config.startY + row * (config.nodeHeight + config.verticalSpacing);
    
    return {
      ...node,
      position: { x, y }
    };
  });
}

export type LayoutType = 'hierarchical' | 'grid' | 'force';

/**
 * Main layout function that applies the specified layout algorithm
 */
export function applyLayout(
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[], 
  layoutType: LayoutType = 'hierarchical',
  config: LayoutConfig = defaultLayoutConfig
): WorkflowNode[] {
  switch (layoutType) {
    case 'hierarchical':
      return applyHierarchicalLayout(nodes, edges, config);
    case 'grid':
      return applyGridLayout(nodes, config);
    case 'force':
      return applyForceLayout(nodes, edges, config);
    default:
      return nodes;
  }
}
