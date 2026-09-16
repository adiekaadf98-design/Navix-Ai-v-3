const fs = require('fs');
let code = fs.readFileSync('src/components/MediaCard.tsx', 'utf8');

let targetStr = `  const generateServerImage = async (prompt: string, image?: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        let p = 0;
        const interval = setInterval(() => { p += 10; if(p > 90) p = 90; setProgress(p); }, 500);
        
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCustomApiKeyHeader()
          },
          body: JSON.stringify({ prompt, image })
        });`;

let replacementStr = `  const generateServerImage = async (prompt: string, image?: string, aspectRatio?: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        let p = 0;
        const interval = setInterval(() => { p += 10; if(p > 90) p = 90; setProgress(p); }, 500);
        
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCustomApiKeyHeader()
          },
          body: JSON.stringify({ prompt, image, aspectRatio })
        });`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  console.log("Updated generateServerImage signature in MediaCard");
}

targetStr = `            const url = await generateServerImage(media.prompt || '', media.image);`;
replacementStr = `            const url = await generateServerImage(media.prompt || '', media.image, media.aspectRatio);`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  console.log("Updated generateServerImage call in MediaCard");
}

fs.writeFileSync('src/components/MediaCard.tsx', code);
