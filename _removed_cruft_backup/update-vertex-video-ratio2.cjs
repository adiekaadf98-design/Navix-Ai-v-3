const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `            const payload = {
              model: 'veo-2.0-generate-001',
              prompt: enrichedPrompt,
              config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
              }
            };`;

const replacementStr = `            const payload = {
              model: 'veo-2.0-generate-001',
              prompt: enrichedPrompt,
              config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio
              }
            };`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('server.ts', code);
  console.log("Updated server.ts vertex video ratio tier 2 successfully");
} else {
  console.log("Target string not found in server.ts (vertex video ratio tier 2).");
}
