const fs = require('fs');
let code = fs.readFileSync('src/services/Orchestrator.ts', 'utf8');

// 1. Wrap globalAdaptiveEngine
const adaptiveTarget = `      if (!req.message.startsWith('[GOOGLE_COMPOSITE]') && req.thinkingMode) {
        adaptiveResult = await globalAdaptiveEngine.processRequest(req.message, req.attachments?.length || 0, {
           onStateChange: (state, details) => {
             notify("supervisor_state", "pending", state);
           },
           onProgress: (step) => {
             notify("workflow_step", "pending", step);
           }
        });
      }`;

const adaptiveReplacement = `      if (!req.message.startsWith('[GOOGLE_COMPOSITE]') && req.thinkingMode) {
        try {
          adaptiveResult = await globalAdaptiveEngine.processRequest(req.message, req.attachments?.length || 0, {
             onStateChange: (state, details) => {
               notify("supervisor_state", "pending", state);
             },
             onProgress: (step) => {
               notify("workflow_step", "pending", step);
             }
          });
        } catch (engineError: any) {
          console.warn("[Orchestrator] AdaptiveExecutionEngine Warning:", engineError);
          notify("workflow_step", "error", "Engine Timeout / Fallback Activated");
          // Fail gracefully by nullifying adaptiveResult so it falls back to default AI processing
          adaptiveResult = null;
        }
      }`;

if (code.includes(adaptiveTarget)) {
  code = code.replace(adaptiveTarget, adaptiveReplacement);
  console.log("AdaptiveEngine patched");
}

// 2. Wrap MCP Router execution
const mcpTarget = `        const executionResult = await NavixSkillRouter.routeSkill(toolName, args);`;
const mcpReplacement = `        let executionResult;
        try {
          executionResult = await NavixSkillRouter.routeSkill(toolName, args);
        } catch (skillErr: any) {
          console.warn("[Orchestrator] Skill Execution Error:", skillErr);
          executionResult = { error: "Skill execution failed or timed out", details: skillErr.message };
        }`;

if (code.includes(mcpTarget)) {
  code = code.replace(mcpTarget, mcpReplacement);
  console.log("MCP Router patched");
}

// 3. Inject activePlugins into payload
const payloadTarget = `          history: req.history || [],
          isImageEdit: imageIntent === 'edit',
          isImageDiscuss: imageIntent === 'discuss',
          effort: req.effort,
          thinkingMode: req.thinkingMode,
          aiBooster: req.aiBooster
        })
      });`;

const payloadReplacement = `          history: req.history || [],
          isImageEdit: imageIntent === 'edit',
          isImageDiscuss: imageIntent === 'discuss',
          effort: req.effort,
          thinkingMode: req.thinkingMode,
          aiBooster: req.aiBooster,
          activePlugins: typeof window !== 'undefined' && localStorage.getItem('navix_plugins_list') 
            ? JSON.parse(localStorage.getItem('navix_plugins_list') || '[]').filter((p: any) => p.active)
            : []
        })
      });`;

if (code.includes(payloadTarget)) {
  code = code.replace(payloadTarget, payloadReplacement);
  console.log("Payload patched");
}

fs.writeFileSync('src/services/Orchestrator.ts', code);
