const fs = require('fs');

let apiCode = fs.readFileSync('src/components/studios/ApiKeysStudio.tsx', 'utf8');

// Notice that the `<div className="space-y-6 max-w-4xl mx-auto">` starts immediately after `</div>` which suggests it's not correctly closed or the old `activeTab` condition removal was flawed.

apiCode = apiCode.replace(
  /{activeTab === 'installed' && \([\s\S]*?\n\s*\)\}/,
  ''
);

// We want to keep only the `API Key Box` and `Code Snippet Box` inside the main content area.
// Let's rewrite it cleanly to ensure valid JSX structure.

let codeParts = apiCode.split('{/* Content */}');
if (codeParts.length === 2) {
  let contentPart = codeParts[1];
  
  // Find where the API Key Box starts
  let apiStartIdx = contentPart.indexOf('<div className="space-y-6 max-w-4xl mx-auto">');
  
  if (apiStartIdx !== -1) {
    let cleanContent = `
      <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full overflow-y-auto">
        ` + contentPart.substring(apiStartIdx);
        
    apiCode = codeParts[0] + '{/* Content */}' + cleanContent;
  }
}

// Ensure the end tags are balanced
let openDivs = (apiCode.match(/<div[^>]*>/g) || []).length;
let closeDivs = (apiCode.match(/<\/div>/g) || []).length;

if (openDivs > closeDivs) {
  apiCode += '\n</div>'.repeat(openDivs - closeDivs);
} else if (closeDivs > openDivs) {
  // It's harder to remove excess, but let's assume it's just the end.
  // Actually, we'll parse it.
}

// A simpler way: we just replace the whole body of the component, as it's short.
