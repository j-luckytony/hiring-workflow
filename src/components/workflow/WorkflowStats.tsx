import React from 'react';
import { Panel } from '@xyflow/react';

interface WorkflowStatsProps {
  stats: {
    total: number;
    visible: number;
    start: number;
    action: number;
    decision: number;
    terminal: number;
  };
  className?: string;
}

export const WorkflowStats: React.FC<WorkflowStatsProps> = ({ stats, className }) => {
  return (
    <Panel position="bottom-right" className={`bg-white rounded-lg shadow-sm border p-3 text-sm ${className || ''}`}>
      <div className="space-y-1">
        <div className="font-semibold text-gray-700">Workflow Stats</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Total: {stats.total}</div>
          <div>Visible: {stats.visible}</div>
          <div className="text-green-600">Start: {stats.start}</div>
          <div className="text-blue-600">Action: {stats.action}</div>
          <div className="text-yellow-600">Decision: {stats.decision}</div>
          <div className="text-red-600">Terminal: {stats.terminal}</div>
        </div>
      </div>
    </Panel>
  );
};
