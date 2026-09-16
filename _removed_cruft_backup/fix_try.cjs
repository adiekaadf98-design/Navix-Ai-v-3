const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
    '    try {\n      const { prompt, aspectRatio, authMode } = req.body;\n      const cleanPromptText = prompt || "A photorealistic image";\n    try {',
    '    try {\n      const { prompt, aspectRatio, authMode } = req.body;\n      const cleanPromptText = prompt || "A photorealistic image";'
);
fs.writeFileSync('server.ts', code);
