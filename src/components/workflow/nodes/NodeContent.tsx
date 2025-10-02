import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getNodeIcon, getNodeStyles } from '../shared/utils/nodeUtils';

interface NodeContentProps {
  nodeType: string;
  label: string;
  config?: any;
  collapsed: boolean;
  hasChildren: boolean;
  childCount: number;
  onToggleCollapse: (e: React.MouseEvent) => void;
}

export const NodeContent: React.FC<NodeContentProps> = ({
  nodeType,
  label,
  config,
  collapsed,
  hasChildren,
  childCount,
  onToggleCollapse
}) => {
  const nodeStyles = getNodeStyles(nodeType, config);

  return (
    <>
      <div className={cn('mb-2', nodeStyles.icon)}>
        {getNodeIcon(nodeType, config)}
      </div>
      <span className={cn('font-medium text-xs leading-tight text-center px-2 break-words', nodeStyles.text)}>
        {label}
      </span>
      
      {/* Integration Badge - prominently display the technical integration */}
      {config?.integration && (
        <div className="mt-1 px-1 py-0.5 bg-blue-100 rounded text-xs font-medium text-blue-800 border border-blue-200 max-w-full break-words text-center">
          🔗 {config.integration}
        </div>
      )}
      
      {/* Additional technical details - show only the most important one */}
      <div className="mt-0.5 text-xs opacity-75 text-center px-1">
        {config?.emailProvider && (
          <div className="bg-green-100 text-green-700 px-1 py-0.5 rounded text-xs">
            📧 {config.emailProvider}
          </div>
        )}
        {!config?.emailProvider && config?.scheduler && (
          <div className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded text-xs">
            📅 {config.scheduler}
          </div>
        )}
        {!config?.emailProvider && !config?.scheduler && config?.phoneProvider && (
          <div className="bg-orange-100 text-orange-700 px-1 py-0.5 rounded text-xs">
            📞 {config.phoneProvider}
          </div>
        )}
        {!config?.emailProvider && !config?.scheduler && !config?.phoneProvider && config?.aiProvider && (
          <div className="bg-cyan-100 text-cyan-700 px-1 py-0.5 rounded text-xs">
            🤖 {config.aiProvider}
          </div>
        )}
        {!config?.emailProvider && !config?.scheduler && !config?.phoneProvider && !config?.aiProvider && config?.atsSystem && (
          <div className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded text-xs">
            💼 {config.atsSystem}
          </div>
        )}
      </div>
      
      {/* Collapse/Expand button - show for all nodes */}
      <div className="flex items-center gap-1 mt-1">
        <button
          onClick={onToggleCollapse}
          className={cn('p-0.5 rounded opacity-70 hover:opacity-100', nodeStyles.icon)}
          title={hasChildren ? (collapsed ? 'Expand subtree' : 'Collapse subtree') : 'No children to collapse'}
        >
          {collapsed ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
        {hasChildren && (
          <span className={cn('text-xs px-1 py-0.5 bg-black/20 rounded', nodeStyles.text)}>
            {childCount}
          </span>
        )}
      </div>
    </>
  );
};
