const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("- DILARANG KERAS merespons dengan JSON block ```media ... ``` secara manual.", "- DILARANG KERAS merespons dengan JSON block '\\`\\`\\`media ... \\`\\`\\`' secara manual.");

fs.writeFileSync('server.ts', code);
console.log("Updated server.ts syntax");
