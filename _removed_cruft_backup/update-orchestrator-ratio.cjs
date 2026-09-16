const fs = require('fs');
let code = fs.readFileSync('src/services/Orchestrator.ts', 'utf8');

code = code.replace(/const vertexService = new VertexService\(\);\n          const imageBase64 = await vertexService\.generateImage\(req\.message\);/, `const vertexService = new VertexService();
          let aspectRatio = "1:1";
          const msgLower = req.message.toLowerCase();
          
          if (msgLower.includes("16:9") || msgLower.includes("landscape") || msgLower.includes("memanjang") || msgLower.includes("lebar")) {
            aspectRatio = "16:9";
          } else if (msgLower.includes("9:16") || msgLower.includes("portrait") || msgLower.includes("berdiri")) {
            aspectRatio = "9:16";
          } else if (msgLower.includes("4:3")) {
            aspectRatio = "4:3";
          } else if (msgLower.includes("3:4")) {
            aspectRatio = "3:4";
          } else if (msgLower.includes("1:1") || msgLower.includes("persegi") || msgLower.includes("kotak") || msgLower.includes("square")) {
            aspectRatio = "1:1";
          }

          const imageBase64 = await vertexService.generateImage(req.message, aspectRatio);`);

fs.writeFileSync('src/services/Orchestrator.ts', code);
console.log("Updated Orchestrator.ts ratio logic");
