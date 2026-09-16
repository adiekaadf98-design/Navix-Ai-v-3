const fs = require('fs');
let sidebarCode = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Change existing Plugins & SDK to just Plugins
sidebarCode = sidebarCode.replace(
  "label: 'Plugins & SDK',",
  "label: 'Plugins',"
);
sidebarCode = sidebarCode.replace(
  "badge: 'Gateway',",
  "badge: 'Add-ons',"
);
sidebarCode = sidebarCode.replace(
  "desc: 'Sandbox, OCR, Web Crawler',",
  "desc: 'Marketplace, Extensions',"
);

// Add the new API Keys item right below plugins_sdk
const newApiItem = `
        {
          id: 'api_keys' as NavixAppView,
          label: 'API Keys',
          badge: 'Developer',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          desc: 'BaaS, Integrations, Usage',
          icon: <Key size={17} className="shrink-0 text-white" />,
          activeClass: 'bg-neutral-800 text-white border-neutral-700 font-semibold shadow-md',
          accentBorder: 'bg-purple-500'
        },`;

if (!sidebarCode.includes("id: 'api_keys' as NavixAppView")) {
  sidebarCode = sidebarCode.replace(
    "id: 'plugins_sdk' as NavixAppView,",
    "id: 'plugins_sdk' as NavixAppView,"
  ); // just checking
  
  // Actually insert it after plugins_sdk block
  const pluginsBlockRegex = /id: 'plugins_sdk' as NavixAppView,[\s\S]*?accentBorder: 'bg-indigo-500'\s*\},/;
  sidebarCode = sidebarCode.replace(pluginsBlockRegex, match => match + newApiItem);
  
  if (!sidebarCode.includes('Key,')) {
    sidebarCode = sidebarCode.replace('import { ', 'import { Key, ');
  }
}

fs.writeFileSync('src/components/Sidebar.tsx', sidebarCode);
console.log('Sidebar patched.');
