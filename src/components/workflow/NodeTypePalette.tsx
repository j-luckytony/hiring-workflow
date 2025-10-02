import React from 'react';
import { Panel } from '@xyflow/react';
import {
  Play,
  GitBranch,
  Square,
  Zap
} from 'lucide-react';

interface NodeTypePaletteProps {
  nodeStats: {
    startNodes: number;
    actionNodes: number;
    decisionNodes: number;
    terminalNodes: number;
    totalNodes: number;
  };
  onAddNode?: (nodeType: string, subType?: string) => void;
  className?: string;
}

export const NodeTypePalette: React.FC<NodeTypePaletteProps> = ({ nodeStats, onAddNode, className }) => {
  const handleNodeClick = (nodeType: string, subType?: string) => {
    onAddNode?.(nodeType, subType);
  };
  return (
    <Panel position="top-left" className={`bg-white rounded-lg shadow-xl border-2 p-3 w-24 ${className || ''}`}>
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 text-xs text-center">Node Types</h3>
        <div className="space-y-2">
          {/* Start Node - Circle */}
          <div
            className="relative group flex flex-col items-center cursor-pointer"
            title={`Start Nodes: Circular entry points (${nodeStats.startNodes} nodes)`}
            onClick={() => handleNodeClick('start')}
          >
            <div className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md">
              <Play className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-700 mt-1">Start</span>
            <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[9999]">
              <div className="font-medium">Start Nodes</div>
              <div className="text-gray-300">Circular entry points</div>
              <div className="text-gray-300">{nodeStats.startNodes} nodes</div>
              <div className="absolute right-full top-2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          </div>
          
          {/* Action Node - Rectangle */}
          <div
            className="relative group flex flex-col items-center cursor-pointer"
            title={`Action Nodes: Rectangular process blocks (${nodeStats.actionNodes} nodes)`}
            onClick={() => handleNodeClick('action')}
          >
            <div className="w-8 h-6 bg-cyan-500 hover:bg-cyan-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-700 mt-1">Action</span>
            <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[9999]">
              <div className="font-medium">Action Nodes</div>
              <div className="text-gray-300">Rectangular process blocks</div>
              <div className="text-gray-300">{nodeStats.actionNodes} nodes</div>
              <div className="flex gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                  <span className="text-gray-400">AI</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-sm"></div>
                  <span className="text-gray-400">Human</span>
                </div>
              </div>
              <div className="absolute right-full top-2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          </div>
          
          {/* Decision Node - Diamond */}
          <div
            className="relative group flex flex-col items-center cursor-pointer"
            title={`Decision Nodes: Diamond-shaped decision points (${nodeStats.decisionNodes} nodes)`}
            onClick={() => handleNodeClick('decision')}
          >
            <div className="w-7 h-7 bg-orange-500 hover:bg-orange-600 transform rotate-45 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md">
              <GitBranch className="w-3 h-3 text-white transform -rotate-45" />
            </div>
            <span className="text-xs font-medium text-gray-700 mt-1">Decision</span>
            <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[9999]">
              <div className="font-medium">Decision Nodes</div>
              <div className="text-gray-300">Diamond-shaped decision points</div>
              <div className="text-gray-300">{nodeStats.decisionNodes} nodes</div>
              <div className="absolute right-full top-2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          </div>
          
          {/* Terminal Node - Rounded Rectangle */}
          <div
            className="relative group flex flex-col items-center cursor-pointer"
            title={`Terminal Nodes: Rounded end states (${nodeStats.terminalNodes} nodes)`}
            onClick={() => handleNodeClick('terminal')}
          >
            <div className="w-8 h-5 bg-red-500 hover:bg-red-600 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md">
              <Square className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-700 mt-1">Terminal</span>
            <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[9999]">
              <div className="font-medium">Terminal Nodes</div>
              <div className="text-gray-300">Rounded end states</div>
              <div className="text-gray-300">{nodeStats.terminalNodes} nodes</div>
              <div className="absolute right-full top-2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
          <div className="font-medium">{nodeStats.totalNodes} Total</div>
        </div>
      </div>
    </Panel>
  );
};
