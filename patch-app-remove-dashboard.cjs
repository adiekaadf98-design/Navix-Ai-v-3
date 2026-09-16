const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove standalone WorkflowHealthDashboard import and component
const importTarget = `import { WorkflowHealthDashboard } from './components/WorkflowHealthDashboard';`;
if (code.includes(importTarget)) {
  code = code.replace(importTarget, '');
}

const componentTarget = `{/* Global Workflow Monitor */}
        <WorkflowHealthDashboard />`;
if (code.includes(componentTarget)) {
  code = code.replace(componentTarget, '');
}

fs.writeFileSync('src/App.tsx', code);
