const fs = require('fs');

let pluginsCode = fs.readFileSync('src/components/studios/PluginsStudio.tsx', 'utf8');

// Find imports
const importsRegex = /import [\s\S]*?from ['"][^'"]+['"];/g;
let imports = [];
let match;
while ((match = importsRegex.exec(pluginsCode)) !== null) {
  imports.push(match[0]);
}

// We will construct DeveloperAPIStudio.tsx based on the structure of PluginsStudio.tsx
// It's easier to just copy the whole file and then remove non-SDK parts, and vice versa for PluginsStudio.

