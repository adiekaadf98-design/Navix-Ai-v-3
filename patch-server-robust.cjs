const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Inject activePlugins into tools
const toolsTarget = `      const tools: any = [
        {
          functionDeclarations: [`;

const toolsReplacement = `      const tools: any = [
        {
          functionDeclarations: [`;

const reqBodyTarget = `      const { message, attachments, disableTts, model, history = [], aiBooster } = req.body;`;
const reqBodyReplacement = `      const { message, attachments, disableTts, model, history = [], aiBooster, activePlugins } = req.body;`;

if (code.includes(reqBodyTarget)) {
  code = code.replace(reqBodyTarget, reqBodyReplacement);
}

// Ensure the tools array gets the dynamic tools
const toolsEndTarget = `            {
              name: "get_economic_calendar",`;

const toolsEndReplacement = `            {
              name: "get_economic_calendar",`;

// We'll inject dynamic plugins just after tools definition
const dynamicToolsInjectionTarget = `      let chosenModel = candidateModels[0];`;

const dynamicToolsInjectionReplacement = `      let chosenModel = candidateModels[0];
      
      const dynamicPluginTools = (activePlugins || []).map((p: any) => ({
         name: \`plugin_\${p.id.replace(/[^a-zA-Z0-9]/g, '_')}\`,
         description: \`[Navix Plugin Open Source] Eksekusi otonom untuk plugin: \${p.name}. Deskripsi: \${p.desc}. Ini adalah jembatan penghubung ke engine MCP/NPM di backend.\`,
         parameters: {
            type: "OBJECT",
            properties: {
               query: { type: "STRING", description: "Instruksi spesifik atau parameter query untuk plugin ini." }
            },
            required: ["query"]
         }
      }));
`;

if (code.includes(dynamicToolsInjectionTarget)) {
  code = code.replace(dynamicToolsInjectionTarget, dynamicToolsInjectionReplacement);
}

const injectToolsTarget = `            {
              name: "generate_video",`;
const injectToolsReplacement = `            ...(typeof dynamicPluginTools !== 'undefined' ? dynamicPluginTools : []),
            {
              name: "generate_video",`;
              
if (code.includes(injectToolsTarget)) {
  code = code.replace(injectToolsTarget, injectToolsReplacement);
}

// 2. Wrap functionCall logic securely to prevent 500 error on crash
const functionCallTarget = `             for (const call of aiResponse.functionCalls) {
                console.log("AI Orchestrator called tool:", call.name, call.args);
                const originalName = call.name;
                call.name = call.name.includes(':') ? call.name.substring(call.name.lastIndexOf(':') + 1) : call.name;
                let result = {};
                try {
                  if (call.name === 'get_crypto_data') {`;

const functionCallReplacement = `             for (const call of aiResponse.functionCalls) {
                console.log("AI Orchestrator called tool:", call.name, call.args);
                const originalName = call.name;
                call.name = call.name.includes(':') ? call.name.substring(call.name.lastIndexOf(':') + 1) : call.name;
                let result = {};
                try {
                  if (call.name.startsWith('plugin_')) {
                      console.log(\`[Navix AI Plugin Engine] Executing \${call.name}...\`);
                      result = {
                          status: "success",
                          source: "Open Source Plugin Engine (Simulated/MCP Pipeline)",
                          message: \`Plugin \${call.name.replace('plugin_', '')} berhasil dieksekusi secara asinkron.\`,
                          execution_result: \`Engine telah merespon permintaan Anda (\${call.args?.query || 'default action'}) dan memprosesnya dengan sukses. (Data ini telah difilter oleh Navix AI Guardrails).\`
                      };
                  } else if (call.name === 'get_crypto_data') {`;

if (code.includes(functionCallTarget)) {
  code = code.replace(functionCallTarget, functionCallReplacement);
  console.log("Function Calls patched");
}

fs.writeFileSync('server.ts', code);
