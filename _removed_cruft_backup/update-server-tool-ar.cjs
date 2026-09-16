const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `                     appendedMedia += '\\n\`\`\`json media\\n{ "type": "image", "prompt": ' + JSON.stringify(call.args.prompt || '') + ', "operation": ' + JSON.stringify(operation) + ', "image": ' + JSON.stringify(imageUrl) + ' }\\n\`\`\`\\n';`;

const replacementStr = `                     appendedMedia += '\\n\`\`\`json media\\n{ "type": "image", "prompt": ' + JSON.stringify(call.args.prompt || '') + ', "operation": ' + JSON.stringify(operation) + ', "aspectRatio": ' + JSON.stringify(call.args.aspectRatio || '1:1') + ', "image": ' + JSON.stringify(imageUrl) + ' }\\n\`\`\`\\n';`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('server.ts', code);
  console.log("Updated server.ts tool media block successfully");
} else {
  console.log("Target string not found in server.ts (tool media block).");
}
