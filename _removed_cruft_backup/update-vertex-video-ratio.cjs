const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `          const payload = {
            model: 'veo-2.0-generate-001',
            prompt: enrichedPrompt,
            config: {
              numberOfVideos: 1,
              resolution: '720p',
              aspectRatio: '16:9'
            }
          };`;

const replacementStr = `          let aspectRatio = "16:9";
          const arMatch = (prompt || '').match(/Rasio Aspek:\\s*([0-9]+:[0-9]+)/i);
          if (arMatch && ["1:1", "16:9", "9:16"].includes(arMatch[1])) {
              aspectRatio = arMatch[1];
          } else if ((prompt || '').toLowerCase().includes("1:1") || (prompt || '').toLowerCase().includes("persegi") || (prompt || '').toLowerCase().includes("kotak")) {
              aspectRatio = "1:1";
          } else if ((prompt || '').toLowerCase().includes("9:16") || (prompt || '').toLowerCase().includes("portrait") || (prompt || '').toLowerCase().includes("berdiri") || (prompt || '').toLowerCase().includes("vertikal")) {
              aspectRatio = "9:16";
          }
          const payload = {
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
  console.log("Updated server.ts vertex video ratio successfully");
} else {
  console.log("Target string not found in server.ts (vertex video ratio).");
}
