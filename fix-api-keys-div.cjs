const fs = require('fs');

let apiCode = fs.readFileSync('src/components/studios/ApiKeysStudio.tsx', 'utf8');

apiCode = apiCode.replace(
  /<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* Content \*\/\}/,
  '</div>\n      </div>\n\n      {/* Content */}'
);

fs.writeFileSync('src/components/studios/ApiKeysStudio.tsx', apiCode);
console.log("Fixed extra div");
