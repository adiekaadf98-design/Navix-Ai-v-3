const fs = require('fs');
let typesCode = fs.readFileSync('src/types.ts', 'utf8');

if (!typesCode.includes("'api_keys'")) {
  typesCode = typesCode.replace(
    "| 'plugins_sdk'",
    "| 'plugins_sdk'\n  | 'api_keys'"
  );
  fs.writeFileSync('src/types.ts', typesCode);
  console.log('Types patched.');
}
