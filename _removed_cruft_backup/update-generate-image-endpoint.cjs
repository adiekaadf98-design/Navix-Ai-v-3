const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `      const { prompt, image } = req.body;
      const rawPromptText = prompt || 'A beautiful abstract art';
      const enrichedPrompt = enrichPromptForQuality(rawPromptText);
      
      // Determine Aspect Ratio from prompt
      let aspectRatio = "1:1";
      const arMatch = rawPromptText.match(/Rasio Aspek:\\s*([0-9]+:[0-9]+)/i);
      if (arMatch && ["1:1", "16:9", "9:16", "4:3", "3:4"].includes(arMatch[1])) {
        aspectRatio = arMatch[1];
      }`;

const replacementStr = `      const { prompt, image, aspectRatio: reqAspectRatio } = req.body;
      const rawPromptText = prompt || 'A beautiful abstract art';
      const enrichedPrompt = enrichPromptForQuality(rawPromptText);
      
      // Determine Aspect Ratio
      let aspectRatio = reqAspectRatio || "1:1";
      if (!reqAspectRatio) {
        const arMatch = rawPromptText.match(/Rasio Aspek:\\s*([0-9]+:[0-9]+)/i);
        if (arMatch && ["1:1", "16:9", "9:16", "4:3", "3:4"].includes(arMatch[1])) {
          aspectRatio = arMatch[1];
        }
      }`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('server.ts', code);
  console.log("Updated server.ts generate-image endpoint successfully");
} else {
  console.log("Target string not found in server.ts (generate-image endpoint).");
}
