import { WorkflowManager } from './components/workflow/core/WorkflowManager';
import { sampleWorkflow } from './data/sampleWorkflow';
import type { Workflow } from './types/workflow';
import './App.css';

function App() {
  const handleWorkflowUpdate = (updatedWorkflow: Workflow) => {
    console.log('Workflow updated:', updatedWorkflow);
    // Here you could save to localStorage, send to API, etc.
  };

  return (
    <div className="w-screen h-screen bg-gray-50 overflow-hidden">
      <WorkflowManager
        workflow={sampleWorkflow}
        onWorkflowUpdate={handleWorkflowUpdate}
        className="w-full h-full"
      />
    </div>
  );
}

export default App;
