import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface NodeHandlesProps {
  nodeType: string;
}

export const NodeHandles: React.FC<NodeHandlesProps> = ({ nodeType }) => {
  return (
    <>
      {/* Input Handle (Target) - Green dot for incoming connections */}
      {nodeType !== 'start' && (
        <Handle
          type="target"
          position={Position.Top}
          id="input"
          className="w-3 h-3 bg-green-500 border-2 border-green-600 hover:bg-green-400 transition-colors shadow-sm"
        />
      )}

      {/* Output Handles (Source) - Blue dots for outgoing connections */}
      {nodeType !== 'terminal' && (
        <>
          {nodeType === 'decision' ? (
            // Decision nodes have multiple output handles
            <>
              <Handle
                type="source"
                position={Position.Left}
                id="left"
                className="w-3 h-3 bg-blue-500 border-2 border-blue-600 hover:bg-blue-400 transition-colors shadow-sm"
              />
              <Handle
                type="source"
                position={Position.Right}
                id="right"
                className="w-3 h-3 bg-blue-500 border-2 border-blue-600 hover:bg-blue-400 transition-colors shadow-sm"
              />
              <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                className="w-3 h-3 bg-blue-500 border-2 border-blue-600 hover:bg-blue-400 transition-colors shadow-sm"
              />
            </>
          ) : (
            // Other nodes have single bottom output handle
            <Handle
              type="source"
              position={Position.Bottom}
              id="output"
              className="w-3 h-3 bg-blue-500 border-2 border-blue-600 hover:bg-blue-400 transition-colors shadow-sm"
            />
          )}
        </>
      )}
    </>
  );
};
