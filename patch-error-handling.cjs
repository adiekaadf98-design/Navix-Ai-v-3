const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const oldLogic = `      if (errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand')) {
         console.warn("Gemini API Warning:", errStr);
         res.status(503).json({ error: "Sistem sedang mengalami permintaan tinggi (High Demand). Mohon tunggu beberapa saat dan coba lagi. (503 Unavailable)" });
      } else if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED')) {
         console.warn("Gemini API Quota Exceeded:", errStr);
         res.status(429).json({ error: "API Limit/Quota exceeded (429). Server kehabisan kuota atau sedang dibatasi dari Google. Mohon periksa API Key Anda atau coba beberapa saat lagi." });
      } else if (errStr.includes('401') || errStr.includes('UNAUTHENTICATED') || errStr.includes('access_token_type_unsupported')) {
         console.warn("Gemini API Auth Error:", errStr);
         res.status(401).json({ error: "Kredensial API Key tidak valid atau otentikasi gagal (401). Mohon periksa kembali API Key Gemini di Pengaturan." });
      }`;

const newLogic = `      const lowerErr = errStr.toLowerCase();
      if (lowerErr.includes('503') || lowerErr.includes('unavailable') || lowerErr.includes('high demand')) {
         console.warn("Gemini API Warning:", errStr);
         res.status(503).json({ error: "Sistem sedang mengalami permintaan tinggi (High Demand). Mohon tunggu beberapa saat dan coba lagi. (503 Unavailable)" });
      } else if (lowerErr.includes('429') || lowerErr.includes('resource_exhausted') || lowerErr.includes('quota')) {
         console.warn("Gemini API Quota Exceeded:", errStr);
         res.status(429).json({ error: "API Limit/Quota exceeded (429). Server kehabisan kuota atau sedang dibatasi dari Google. Mohon periksa API Key Anda atau coba beberapa saat lagi." });
      } else if (lowerErr.includes('401') || lowerErr.includes('unauthenticated') || lowerErr.includes('access_token_type_unsupported')) {
         console.warn("Gemini API Auth Error:", errStr);
         res.status(401).json({ error: "Kredensial API Key tidak valid atau otentikasi gagal (401). Mohon periksa kembali API Key Gemini di Pengaturan." });
      }`;

if (serverCode.includes("errStr.includes('RESOURCE_EXHAUSTED')")) {
  serverCode = serverCode.replace(oldLogic, newLogic);
  fs.writeFileSync('server.ts', serverCode);
  console.log("Patched server.ts error handling to be case-insensitive.");
} else {
  console.log("Could not find the target code in server.ts");
}
