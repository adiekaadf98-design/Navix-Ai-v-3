const fs = require('fs');
let code = fs.readFileSync('src/components/studios/PluginsStudio.tsx', 'utf8');

// 1. Add state
const searchState = "  const [searchQuery, setSearchQuery] = useState('');";
if (!code.includes("selectedPlugins")) {
  code = code.replace(
    searchState,
    searchState + "\n  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);"
  );
}

// 2. Add functions
const handlers = `  const handleToggleSelect = (id: string) => {
    setSelectedPlugins(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlugins.length === storePlugins.length && storePlugins.length > 0) {
      setSelectedPlugins([]);
    } else {
      setSelectedPlugins(storePlugins.map(p => p.id));
    }
  };

  const handleBatchInstall = () => {
    if (!user) {
      showToast('Silakan login terlebih dahulu', 'error');
      return;
    }
    const pluginsToInstall = storePlugins.filter(p => selectedPlugins.includes(p.id)).map(p => ({
      id: p.id,
      name: p.name,
      desc: p.desc,
      category: p.category,
      version: p.version,
      active: true
    }));
    if (pluginsToInstall.length === 0) return;

    const newPlugins = [...pluginsToInstall, ...plugins];
    setPlugins(newPlugins);
    savePluginsToFirestore(newPlugins);
    
    setStorePlugins(prev => prev.filter(p => !selectedPlugins.includes(p.id)));
    setSelectedPlugins([]);
    showToast(\`\${pluginsToInstall.length} Plugin berhasil diinstall dari Open Source!\`, 'success');
  };`;

if (!code.includes("handleBatchInstall")) {
  code = code.replace(
    "const handleInstall = (plugin: any) => {",
    handlers + "\n\n  const handleInstall = (plugin: any) => {"
  );
}

// 3. Update fetchRealPlugins to clear selected
if (!code.includes("setSelectedPlugins([]);")) {
   code = code.replace("setStorePlugins(realPlugins);", "setStorePlugins(realPlugins);\n      setSelectedPlugins([]);");
}

fs.writeFileSync('src/components/studios/PluginsStudio.tsx', code);
console.log('Patch step 1 applied.');
