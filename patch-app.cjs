const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Import WorkflowHealthDashboard
const importTarget = `import { ThinkingIndicator } from './components/ThinkingIndicator';`;
const importReplacement = `import { ThinkingIndicator } from './components/ThinkingIndicator';
import { WorkflowHealthDashboard } from './components/WorkflowHealthDashboard';`;

if (code.includes(importTarget)) {
  code = code.replace(importTarget, importReplacement);
}

// Inject into the main layout
const renderTarget = `      <div className="flex-1 flex flex-col h-screen bg-[#0a0a0a] relative w-full overflow-hidden">`;
const renderReplacement = `      <div className="flex-1 flex flex-col h-screen bg-[#0a0a0a] relative w-full overflow-hidden">
        {/* Global Workflow Monitor */}
        <WorkflowHealthDashboard />`;

if (code.includes(renderTarget)) {
  code = code.replace(renderTarget, renderReplacement);
}

fs.writeFileSync('src/App.tsx', code);
