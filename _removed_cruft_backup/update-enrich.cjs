const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/    \/\/ Default fallback\n    if \(isEdit\) {\n      return \`\$\{enriched\}, MATCH ORIGINAL IMAGE STYLE: strictly preserve the original art style \(whether it's photo, illustration, 3D, or cartoon\/anime\), lighting, facial identity, and character design. Do not change the underlying identity.\`;\n    }\n    return \`\$\{enriched\}, exceptionally high quality, highly detailed textures, visually stunning masterpiece, clean and beautiful composition\`;\n  \};/, `    // Default fallback
    if (isEdit) {
      return \`\${enriched}, MATCH ORIGINAL IMAGE STYLE: strictly preserve the original art style (whether it's photo, illustration, 3D, or cartoon/anime), lighting, facial identity, and character design. Do not change the underlying identity.\`;
    }
    // Default to photorealism if not specified as cartoon/logo/etc.
    return \`\${enriched}, exceptionally high quality, photorealistic, RAW photo, authentic real-world photograph, real life, natural daylight, crisp details, highly detailed textures, visually stunning masterpiece, clean and beautiful composition. STRICTLY AVOID cartoon, anime, illustration, 3d render, doll-like, plastic skin, over-smoothed skin, cgi, simulation.\`;
  };`);

fs.writeFileSync('server.ts', code);
console.log("Updated server.ts enrich");
