const fs = require('fs');
let code = fs.readFileSync('src/services/Orchestrator.ts', 'utf8');

code = code.replace(/const isVideoRequest = lowercaseMsg\.includes\('video'\);/, `const isVideoRequest = (lowercaseMsg.includes('buat') || lowercaseMsg.includes('bikin') || lowercaseMsg.includes('generate')) && (lowercaseMsg.includes('video') || lowercaseMsg.includes('animasi'));`);

fs.writeFileSync('src/services/Orchestrator.ts', code);
console.log("Updated Orchestrator.ts video intent");
