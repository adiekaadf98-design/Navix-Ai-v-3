const fs = require('fs');

let orchCode = fs.readFileSync('src/services/Orchestrator.ts', 'utf8');

const pluginInjectionLogic = `
      let finalMessageToSend = messageToSend;
      try {
        if (typeof window !== 'undefined') {
          const pluginsStr = localStorage.getItem('navix_plugins_list');
          if (pluginsStr) {
            const plugins = JSON.parse(pluginsStr);
            const activePlugins = plugins.filter((p: any) => p.active);
            
            if (activePlugins.length > 0) {
              const pluginDescriptions = activePlugins.map((p: any) => \`- \${p.name}: \${p.desc}\`).join('\\n');
              
              // We inject a system-level hidden instruction for Gemini to know it has access to these plugins
              finalMessageToSend = \`[SYSTEM CONTEXT: You are NAVIX AI. The user has installed the following third-party MCP Open Source Plugins in their studio:\\n\${pluginDescriptions}\\n\\nIf the user's request relates to the capabilities of any of these plugins, explicitly acknowledge that you are using them (e.g. "Saya akan menggunakan plugin X untuk..."). Act as if you are retrieving the data from these plugins directly.]\\n\\nUSER MESSAGE:\\n\` + finalMessageToSend;
            }
          }
        }
      } catch (e) {
        console.warn('Failed to inject plugins context:', e);
      }
      
      const res = await rotateFetch('/api/chat', {
`;

if (!orchCode.includes('finalMessageToSend')) {
  orchCode = orchCode.replace(
    "const res = await rotateFetch('/api/chat', {",
    pluginInjectionLogic
  );

  orchCode = orchCode.replace(
    "message: messageToSend,",
    "message: finalMessageToSend,"
  );

  fs.writeFileSync('src/services/Orchestrator.ts', orchCode);
  console.log('Orchestrator patched with Plugin Context Injection');
}

let pluginsCode = fs.readFileSync('src/components/studios/PluginsStudio.tsx', 'utf8');

const oldHandleInstall = `  const handleInstall = (plugin: any) => {
    if (plugins.find(p => p.id === plugin.id)) {
      showToast('Plugin ini sudah terinstal', 'info');
      return;
    }`;

const newHandleInstall = `
  const [usage, setUsage] = useState<{plan: string} | null>(null);
  
  useEffect(() => {
    if (user?.id) {
      fetch('/api/developer/keys?userId=' + user.id)
        .then(res => res.json())
        .then(data => {
          if (data.usage) setUsage(data.usage);
        })
        .catch(console.error);
    }
  }, [user]);

  const handleInstall = (plugin: any) => {
    if (!user) {
      showToast('Silakan login terlebih dahulu', 'error');
      return;
    }
    
    // Check if user is Pro, Ultra, or Developer
    const plan = usage?.plan?.toLowerCase() || 'free tier';
    if (!plan.includes('pro') && !plan.includes('ultra') && !plan.includes('developer')) {
      showToast('Instalasi Plugin Open Source hanya tersedia untuk pengguna Pro/Ultra.', 'error');
      if (onUpgradeClick) onUpgradeClick();
      return;
    }

    if (plugins.find(p => p.id === plugin.id)) {
      showToast('Plugin ini sudah terinstal', 'info');
      return;
    }`;

if (!pluginsCode.includes('Instalasi Plugin Open Source hanya tersedia')) {
  pluginsCode = pluginsCode.replace(oldHandleInstall, newHandleInstall);
  fs.writeFileSync('src/components/studios/PluginsStudio.tsx', pluginsCode);
  console.log('PluginsStudio patched to lock installations for Pro/Ultra');
}

