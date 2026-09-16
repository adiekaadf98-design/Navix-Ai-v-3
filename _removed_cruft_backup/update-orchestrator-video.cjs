const fs = require('fs');
let code = fs.readFileSync('src/services/Orchestrator.ts', 'utf8');

const targetStr = `        // Return a media block to trigger MediaCard video generation
        return { text: \`\`\`media\\n{\\n  "type": "video",\\n  "prompt": "\${req.message.replace(/"/g, "'")}"\\n}\\n\`\`\`\` };`;

const replacementStr = `        // Return a media block to trigger MediaCard video generation
        return { text: '\`\`\`media\\n{\\n  "type": "video",\\n  "prompt": "' + req.message.replace(/"/g, "'") + '"\\n}\\n\`\`\`' };`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/services/Orchestrator.ts', code);
  console.log("Updated Orchestrator.ts syntax successfully");
} else {
  console.log("Target string not found in Orchestrator.ts.");
}
