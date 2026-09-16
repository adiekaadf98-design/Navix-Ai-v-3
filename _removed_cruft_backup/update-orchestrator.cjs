const fs = require('fs');
let code = fs.readFileSync('src/services/Orchestrator.ts', 'utf8');

code = code.replace("const isVideoRequest = (lowercaseMsg.includes('buat') || lowercaseMsg.includes('bikin') || lowercaseMsg.includes('generate')) && (lowercaseMsg.includes('video') || lowercaseMsg.includes('animasi'));", `const videoKeywords = ['buat video', 'bikin video', 'buatkan video', 'generate video', 'tolong buat video', 'tolong bikin video', 'buat animasi', 'bikin animasi'];
      const isVideoRequest = videoKeywords.some(kw => lowercaseMsg.includes(kw)) && !lowercaseMsg.includes('ringkasan') && !lowercaseMsg.includes('analisis');`);

fs.writeFileSync('src/services/Orchestrator.ts', code);
console.log("Updated Orchestrator.ts video intent");
