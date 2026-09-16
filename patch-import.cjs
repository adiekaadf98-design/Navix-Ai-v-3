const fs = require('fs');
let code = fs.readFileSync('src/services/Orchestrator.ts', 'utf8');

const importTarget = `import { NavixSkillRouter } from './skills/mcp/McpSkillRouter';`;
const importReplacement = `import { NavixSkillRouter } from './skills/mcp/McpSkillRouter';
import { workflowManager } from './GlobalWorkflowManager';`;

if (code.includes(importTarget)) {
  code = code.replace(importTarget, importReplacement);
}

fs.writeFileSync('src/services/Orchestrator.ts', code);
