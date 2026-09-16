const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `        if (m.text) {
          parts.push({ text: m.text });
        }`;

const replacementStr = `        if (m.text) {
          // Replace \`\`\`media blocks with a descriptive placeholder so Gemini doesn't try to mimic the JSON format
          const cleanText = m.text.replace(/\`\`\`(json )?media[\\s\\S]*?\`\`\`/g, '[Aset Media (Gambar/Video) berhasil dibuat dan ditampilkan kepada pengguna]');
          parts.push({ text: cleanText });
        }`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Updated App.tsx successfully.");
} else {
  console.log("Target string not found in App.tsx.");
}
