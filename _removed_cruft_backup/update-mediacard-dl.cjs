const fs = require('fs');
let code = fs.readFileSync('src/components/MediaCard.tsx', 'utf8');

const targetStr = `        const dlRes = await fetch('/api/generate-video/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCustomApiKeyHeader()
          },
          body: JSON.stringify({ operationName: opName })
        });
        const dlData = await dlRes.json();
        if (!dlRes.ok || !dlData.success) throw new Error(dlData.error || 'Failed to download video');
        
        setProgress(100);
        setCurrentModule(getVideoProgressMessage(100, prompt, !!image));
        resolve(dlData.videoBase64);`;

const replacementStr = `        const dlRes = await fetch('/api/generate-video/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCustomApiKeyHeader()
          },
          body: JSON.stringify({ operationName: opName })
        });
        
        if (!dlRes.ok) {
          const errText = await dlRes.text();
          throw new Error(errText || 'Failed to download video');
        }
        
        const blob = await dlRes.blob();
        const videoUrl = URL.createObjectURL(blob);
        
        setProgress(100);
        setCurrentModule(getVideoProgressMessage(100, prompt, !!image));
        resolve(videoUrl);`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/MediaCard.tsx', code);
  console.log("Updated MediaCard.tsx download logic successfully");
} else {
  console.log("Target string not found in MediaCard.tsx.");
}
