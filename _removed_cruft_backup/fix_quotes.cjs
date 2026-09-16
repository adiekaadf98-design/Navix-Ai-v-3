const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/FUNGSI `edit_video`/g, "FUNGSI \\`edit_video\\`");
code = code.replace(/operation `animate_reference`/g, "operation \\`animate_reference\\`");
code = code.replace(/PANGGIL `edit_image`/g, "PANGGIL \\`edit_image\\`");
code = code.replace(/fungsi `edit_image`/g, "fungsi \\`edit_image\\`");

fs.writeFileSync('server.ts', code);
console.log("Fixed unescaped backticks in template literal");
