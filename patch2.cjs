const fs = require('fs');
let content = fs.readFileSync('src/components/studios/StockImageStudio.tsx', 'utf8');

content = content.replace(/>Mulai Antrean Batch</g, '>Import Ke Katalog<');
content = content.replace(/AI Expanded Prompt/g, 'Photo Description');
content = content.replace(/Generation Provider/g, 'Image Source');
content = content.replace(/'Generation failed'/g, "'Import failed'");
content = content.replace(/AI Prompt/g, 'Search Term');
content = content.replace(/generateExpandedPrompt/g, 'generateMetadata');
content = content.replace(/Stock Image System/g, 'Real Stock Image Library');
content = content.replace(/Produksi & Validasi massal/g, 'Import & Validasi massal fotografi nyata');
content = content.replace(/Jumlah antrean/g, 'Jumlah gambar yang diimpor');

fs.writeFileSync('src/components/studios/StockImageStudio.tsx', content);
console.log("Success 2");
