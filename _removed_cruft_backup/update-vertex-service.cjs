const fs = require('fs');
let code = fs.readFileSync('src/services/VertexService.ts', 'utf8');

code = code.replace(/async generateImage\\(prompt: string, aspectRatio: string = "16:9"\\)/, 'async generateImage(prompt: string, aspectRatio: string = "1:1")');

fs.writeFileSync('src/services/VertexService.ts', code);
console.log("Updated VertexService.ts");
