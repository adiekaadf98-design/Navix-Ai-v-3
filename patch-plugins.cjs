const fs = require('fs');

let pluginsCode = fs.readFileSync('src/components/studios/PluginsStudio.tsx', 'utf8');

// Remove the SDK API KEYS tab from the mapping
pluginsCode = pluginsCode.replace(
  "{ id: 'sdk', label: 'SDK API KEYS & WEBHOOKS' }",
  ""
);

// Check if any commas were left trailing in the array
pluginsCode = pluginsCode.replace(
  /,\s*\]/,
  ']'
);

fs.writeFileSync('src/components/studios/PluginsStudio.tsx', pluginsCode);
console.log("Removed SDK API KEYS tab from PluginsStudio");
