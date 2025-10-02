import React from 'react';
import { FileText } from 'lucide-react';
import { ConfigField } from './ConfigField';
import type { WorkflowNode } from '../../../types/workflow';

interface NodeBasicInfoProps {
  node: WorkflowNode;
  editMode: boolean;
  onFieldChange: (field: string, value: any) => void;
}

export const NodeBasicInfo: React.FC<NodeBasicInfoProps> = ({
  node,
  editMode,
  onFieldChange
}) => {
  return (
    <ConfigField 
      label="Node Name" 
      value={node.data.label} 
      icon={<FileText className="w-4 h-4" />}
      editable={editMode}
      onChange={(value) => onFieldChange('data.label', value)}
    />
  );
};
