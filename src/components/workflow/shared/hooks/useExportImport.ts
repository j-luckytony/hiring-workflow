import { useCallback } from 'react';
import type { Workflow } from '../../../../types/workflow';

export interface ExportImportHook {
  handleExportWorkflow: () => void;
  handleImportWorkflow: () => void;
}

export const useExportImport = (
  workflow: Workflow,
  setWorkflow: (workflow: Workflow) => void,
  setSelectedNodeId: (id: string | undefined) => void,
  setShowDetailPanel: (show: boolean) => void
): ExportImportHook => {
  
  const handleExportWorkflow = useCallback(() => {
    const exportData = {
      ...workflow,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, [workflow]);

  const handleImportWorkflow = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          
          // Validate the imported data has required workflow properties
          if (!importedData.id || !importedData.name || !importedData.nodes || !importedData.edges) {
            alert('Invalid workflow file format');
            return;
          }
          
          // Create a new workflow with updated timestamps
          const importedWorkflow: Workflow = {
            ...importedData,
            updatedAt: new Date(),
            // Keep original createdAt if it exists, otherwise use current time
            createdAt: importedData.createdAt ? new Date(importedData.createdAt) : new Date()
          };
          
          setWorkflow(importedWorkflow);
          setSelectedNodeId(undefined);
          setShowDetailPanel(false);
          
          alert(`Successfully imported workflow: ${importedWorkflow.name}`);
        } catch (error) {
          console.error('Error importing workflow:', error);
          alert('Error importing workflow file. Please check the file format.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }, [setWorkflow, setSelectedNodeId, setShowDetailPanel]);

  return {
    handleExportWorkflow,
    handleImportWorkflow
  };
};
