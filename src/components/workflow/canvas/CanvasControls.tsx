import React, { useState } from 'react';
import { Controls, Panel } from '@xyflow/react';
import { WorkflowStats } from '../WorkflowStats';
import { NodeTypePalette } from '../NodeTypePalette';

interface CanvasControlsProps {
  editMode?: boolean;
  nodeStats?: {
    startNodes: number;
    actionNodes: number;
    decisionNodes: number;
    terminalNodes: number;
    totalNodes: number;
  };
  onAddNode?: (nodeType: string, subType?: string) => void;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  editMode: _editMode,
  nodeStats,
  onAddNode
}) => {
  const [showTips, setShowTips] = useState(false);
  return (
    <>
      {/* React Flow Controls */}
      <Controls 
        position="bottom-left"
        showZoom={true}
        showFitView={true}
        showInteractive={true}
      />

      {/* Node Type Palette (Always visible) */}
      {onAddNode && nodeStats && (
        <Panel position="top-left" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
          <NodeTypePalette nodeStats={nodeStats} onAddNode={onAddNode} />
        </Panel>
      )}

      {/* Workflow Statistics */}
      {nodeStats && (
        <Panel position="top-right" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
          <WorkflowStats 
            stats={{
              total: nodeStats.totalNodes,
              visible: nodeStats.totalNodes, // Assuming all nodes are visible for now
              start: nodeStats.startNodes,
              action: nodeStats.actionNodes,
              decision: nodeStats.decisionNodes,
              terminal: nodeStats.terminalNodes
            }} 
          />
        </Panel>
      )}

      {/* Tips / Help */}
      <Panel position="top-right" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg mt-28">
        <div className="p-2 text-xs text-gray-700 w-80">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Quick Tips</div>
            <button
              onClick={() => setShowTips(!showTips)}
              className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              {showTips ? 'Hide' : 'Show'}
            </button>
          </div>
          {showTips && (
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li><strong>Mini Map</strong>: Click or drag on the overview map to navigate the large workflow.</li>
              <li><strong>Move nodes</strong>: Click and drag any node directly to reposition it.</li>
              <li><strong>Pan canvas</strong>: Click and drag empty space or use two-finger scroll.</li>
              <li><strong>Add nodes</strong>: Use left toolbar or drag from a blue dot to empty space (auto-creates: Start→Action, Action/Decision→Terminal, Terminal→Action).</li>
              <li><strong>Connect</strong>: Drag from blue output to green input. Decision node handles auto-label edges (Reject/Advance/Follow-up).</li>
              <li><strong>Edit config</strong>: Click a node → detail panel opens for configuration.</li>
              <li><strong>Clone/Delete</strong>: Select node → use clipboard/trash buttons. Shortcuts: Cmd/Ctrl+C, V, Delete.</li>
              <li><strong>Zoom</strong>: Pinch to zoom, double-click to zoom in. Use Fit View button for overview.</li>
            </ul>
          )}
        </div>
      </Panel>
    </>
  );
};
