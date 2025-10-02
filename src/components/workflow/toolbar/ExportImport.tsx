import React from 'react';
import { Download, Upload } from 'lucide-react';

interface ExportImportProps {
  onExport: () => void;
  onImport: () => void;
}

export const ExportImport: React.FC<ExportImportProps> = ({
  onExport,
  onImport
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        title="Export Workflow"
      >
        <Download className="w-4 h-4" />
        Export
      </button>
      <button
        onClick={onImport}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        title="Import Workflow"
      >
        <Upload className="w-4 h-4" />
        Import
      </button>
    </div>
  );
};
