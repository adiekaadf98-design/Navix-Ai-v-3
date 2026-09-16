const fs = require('fs');

let pluginsCode = fs.readFileSync('src/components/studios/PluginsStudio.tsx', 'utf8');

// The original size was hardcoded to 12. Let's increase it to 250 (NPM limit) and add infinite scrolling / pagination if needed.
// Actually, NPM search size limit is 250, so we can fetch a large chunk.
const oldFetch = "const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${query}&size=12`);";
const newFetch = "const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${query}&size=250`);";

pluginsCode = pluginsCode.replace(oldFetch, newFetch);

// Add scroll area class to make the grid scrollable with a fixed height if needed, 
// but it's already in an overflow-y-auto container. So just fetching 250 is enough to show a massive list.

fs.writeFileSync('src/components/studios/PluginsStudio.tsx', pluginsCode);
console.log("Patched plugin fetch size to 250");
