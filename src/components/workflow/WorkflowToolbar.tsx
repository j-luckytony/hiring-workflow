import React from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCcw,
  Download,
  Upload,
  Settings,
  Grid3X3
} from 'lucide-react';

interface WorkflowToolbarProps {
  workflowName?: string;
  workflowDescription?: string;
  onReset?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onSettings?: () => void;
  onApplyLayout?: () => void;
  className?: string;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  workflowName = 'Workflow Designer',
  workflowDescription,
  onReset,
  onExport,
  onImport,
  onSettings,
  onApplyLayout,
  className = ''
}) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-gray-900">
            {workflowName}
          </h1>
          {workflowDescription && (
            <p className="text-sm text-gray-500 mt-0.5">
              {workflowDescription}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onApplyLayout && (
            <motion.button
              onClick={onApplyLayout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Auto-arrange Layout"
            >
              <Grid3X3 className="w-4 h-4" />
            </motion.button>
          )}

          {onReset && (
            <motion.button
              onClick={onReset}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Reset Workflow"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          )}

          {onImport && (
            <motion.button
              onClick={onImport}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Import Workflow"
            >
              <Upload className="w-4 h-4" />
            </motion.button>
          )}

          {onExport && (
            <motion.button
              onClick={onExport}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Export Workflow"
            >
              <Download className="w-4 h-4" />
            </motion.button>
          )}

          {onSettings && (
            <motion.button
              onClick={onSettings}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* No edit mode instructions since always editable */}
    </div>
  );
};
