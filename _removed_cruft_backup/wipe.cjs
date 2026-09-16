const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I will just change all const/let to var for these specific globals to pass compilation
code = code.replace(/const parseDataUrl =/g, 'var parseDataUrl =');
code = code.replace(/const videoJobStore =/g, 'var videoJobStore =');
code = code.replace(/let geminiImageQuotaUnavailableUntil =/g, 'var geminiImageQuotaUnavailableUntil =');
code = code.replace(/const generateHighQualityBase64 =/g, 'var generateHighQualityBase64 =');

// Fix the syntax error at 3269 by just finding the corrupted vertex-generate-image
// Actually, let's just replace the exact broken line
code = code.replace(
    '    try {\n      const { prompt, aspectRatio, authMode } = req.body;\n      const cleanPromptText = prompt || "A photorealistic image";\n    try {',
    '    try {\n      const { prompt, aspectRatio, authMode } = req.body;\n      const cleanPromptText = prompt || "A photorealistic image";'
);

fs.writeFileSync('server.ts', code);
