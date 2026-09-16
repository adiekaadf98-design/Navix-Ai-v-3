const fs = require('fs');
let content = fs.readFileSync('src/components/studios/StockImageStudio.tsx', 'utf8');

content = content.replace(
  'const pages = Object.values(data.query.pages).filter((p) => p.original && p.original.source);',
  'const pages = Object.values(data.query.pages).filter((p: any) => p.original && p.original.source);'
);
content = content.replace(
  'validUrls = pages.map((p) => p.original.source);',
  'validUrls = pages.map((p: any) => p.original.source);'
);
content = content.replace(
  'validTitles = pages.map((p) => p.title);',
  'validTitles = pages.map((p: any) => p.title);'
);
content = content.replace(
  "generation_status: isDuplicate ? 'DUPLICATE' : 'VALIDATED',",
  "generation_status: (isDuplicate ? 'DUPLICATE' : 'VALIDATED') as 'DUPLICATE' | 'VALIDATED',"
);

fs.writeFileSync('src/components/studios/StockImageStudio.tsx', content);
console.log("Success 3");
