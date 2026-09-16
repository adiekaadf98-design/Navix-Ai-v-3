const fs = require('fs');
let code = fs.readFileSync('src/components/studios/PluginsStudio.tsx', 'utf8');

// 1. Add firebase imports
if (!code.includes("import { db } from '../../lib/firebase';")) {
  code = code.replace(
    "import { useAuthStore } from '../../store/useAuthStore';",
    "import { useAuthStore } from '../../store/useAuthStore';\nimport { db } from '../../lib/firebase';\nimport { doc, onSnapshot, setDoc } from 'firebase/firestore';"
  );
}

// 2. Add Firestore Background Observer and sync logic
const observerLogic = `  const [searchQuery, setSearchQuery] = useState('');

  // Sinkronisasi status ke Firestore (Background Observer)
  useEffect(() => {
    if (!user || !user.firebaseUid) return;
    
    const pluginDocRef = doc(db, 'users', user.firebaseUid, 'settings', 'plugins');
    const unsubscribe = onSnapshot(pluginDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.plugins && Array.isArray(data.plugins)) {
          // Update local state without triggering an infinite loop
          setPlugins(data.plugins);
          // Automatically remove installed plugins from the available store list
          setStorePlugins((prevStore) => {
             return prevStore.filter(sp => !data.plugins.find((p: any) => p.id === sp.id));
          });
        }
      }
    }, (error) => {
      console.warn("Firestore plugins sync error:", error);
    });
    
    return () => unsubscribe();
  }, [user]);

  const savePluginsToFirestore = (newPlugins: any[]) => {
    if (user?.firebaseUid) {
      const pluginDocRef = doc(db, 'users', user.firebaseUid, 'settings', 'plugins');
      setDoc(pluginDocRef, { plugins: newPlugins }, { merge: true }).catch(console.error);
    }
  };`;

if (!code.includes("savePluginsToFirestore")) {
  code = code.replace("  const [searchQuery, setSearchQuery] = useState('');", observerLogic);
}

// 3. Update handleInstall
const oldHandleInstall = `    const newPlugin = {
      id: plugin.id,
      name: plugin.name,
      desc: plugin.desc,
      category: plugin.category,
      version: plugin.version,
      active: true
    };
    setPlugins([newPlugin, ...plugins]);`;

const newHandleInstall = `    const newPlugin = {
      id: plugin.id,
      name: plugin.name,
      desc: plugin.desc,
      category: plugin.category,
      version: plugin.version,
      active: true
    };
    const newPlugins = [newPlugin, ...plugins];
    setPlugins(newPlugins);
    savePluginsToFirestore(newPlugins);`;

if (!code.includes("savePluginsToFirestore(newPlugins)")) {
  code = code.replace(oldHandleInstall, newHandleInstall);
}

// 4. Update togglePlugin
const oldTogglePlugin = `  const togglePlugin = (id: string) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === id) {
        const nextState = !p.active;
        showToast(
          nextState ? \`Plugin \${p.name} diaktifkan\` : \`Plugin \${p.name} dinonaktifkan\`,
          nextState ? 'success' : 'info'
        );
        return { ...p, active: nextState };
      }
      return p;
    }));
  };`;

const newTogglePlugin = `  const togglePlugin = (id: string) => {
    const newPlugins = plugins.map(p => {
      if (p.id === id) {
        const nextState = !p.active;
        showToast(
          nextState ? \`Plugin \${p.name} diaktifkan\` : \`Plugin \${p.name} dinonaktifkan\`,
          nextState ? 'success' : 'info'
        );
        return { ...p, active: nextState };
      }
      return p;
    });
    setPlugins(newPlugins);
    savePluginsToFirestore(newPlugins);
  };`;

if (code.includes(oldTogglePlugin)) {
  code = code.replace(oldTogglePlugin, newTogglePlugin);
} else {
    // If exact match fails, let's use regex or partial match
    code = code.replace(
      /const togglePlugin = \(id: string\) => {[\s\S]*?\}\)\);\n  };/,
      newTogglePlugin
    );
}

fs.writeFileSync('src/components/studios/PluginsStudio.tsx', code);
console.log('PluginsStudio patched with Firestore Sync');
