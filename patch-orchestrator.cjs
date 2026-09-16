const fs = require('fs');
let code = fs.readFileSync('src/services/Orchestrator.ts', 'utf8');

// Import workflow manager at the top
const importInject = `import { ServiceRegistry } from './ServiceRegistry';
import { globalDeliberationCouncil } from './skills/mcp/NavixDeliberationCouncil';
import { navixMemoryEngine } from './skills/mcp/NavixCognitiveMemory';
import { NavixSkillRouter } from './skills/mcp/NavixSkillRouter';
import { globalAdaptiveEngine } from './skills/mcp/AdaptiveExecutionEngine';
import { workflowManager } from './GlobalWorkflowManager';`;

code = code.replace(/import { ServiceRegistry } from '.\/ServiceRegistry';[\s\S]*?import { globalAdaptiveEngine } from '.\/skills\/mcp\/AdaptiveExecutionEngine';/, importInject);

// rename processUserRequest to processUserRequestInternal
const processTarget = `  async processUserRequest(req: OrchestratorRequest): Promise<OrchestratorResponse> {`;
const processReplacement = `  async processUserRequest(req: OrchestratorRequest): Promise<OrchestratorResponse> {
    // Arbitrate via GlobalWorkflowManager to prevent UI race conditions
    return workflowManager.enqueue('Orchestrator: User Request', () => this.processUserRequestInternal(req), 'NORMAL');
  }

  private async processUserRequestInternal(req: OrchestratorRequest): Promise<OrchestratorResponse> {`;

if (code.includes(processTarget)) {
  code = code.replace(processTarget, processReplacement);
  console.log("Patched Orchestrator to use GlobalWorkflowManager");
}

fs.writeFileSync('src/services/Orchestrator.ts', code);
