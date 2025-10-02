import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingStep {
  title: string;
  description: string;
}

interface WorkflowLoadingIndicatorProps {
  isLoading: boolean;
  currentStep: LoadingStep | null;
  progress: {
    current: number;
    total: number;
  };
  className?: string;
}

export const WorkflowLoadingIndicator: React.FC<WorkflowLoadingIndicatorProps> = ({
  isLoading,
  currentStep,
  progress,
  className = ''
}) => {
  return (
    <AnimatePresence>
      {isLoading && currentStep && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 shadow-lg ${className}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {currentStep.title}
                </span>
              </div>
              <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                Step {progress.current} of {progress.total}
              </div>
            </div>
            <div className="text-sm text-blue-700">
              {currentStep.description}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(progress.current / progress.total) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
