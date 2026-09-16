const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components/studios');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Need to ensure useEffect is imported
  if (content.includes('useState') && !content.includes('useEffect')) {
    content = content.replace(/import React,\s*\{\s*useState\s*\}\s*from\s*'react';/, "import React, { useState, useEffect } from 'react';");
    content = content.replace(/import React,\s*\{\s*useState,\s*useRef\s*\}\s*from\s*'react';/, "import React, { useState, useRef, useEffect } from 'react';");
  }

  let modified = false;

  const patchState = (stateName, storageKey) => {
    const regex = new RegExp(`const\\s+\\[${stateName},\\s+set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}\\]\\s*=\\s*useState(<[^>]+>)?\\(\\s*\\[([\\s\\S]*?)\\]\\s*\\);`);
    const match = content.match(regex);
    if (match) {
      const typeStr = match[1] || '';
      const defaultArrayContent = match[2];
      const replacement = `const [${stateName}, set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}] = useState${typeStr}(() => {
    try {
      const saved = localStorage.getItem('${storageKey}');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load ${storageKey}', e);
    }
    return [${defaultArrayContent}];
  });

  useEffect(() => {
    localStorage.setItem('${storageKey}', JSON.stringify(${stateName}));
  }, [${stateName}]);`;

      content = content.replace(match[0], replacement);
      modified = true;
      console.log(`Patched ${stateName} in ${file}`);
    }
  };
  
  if (file === 'AutomationsStudio.tsx') patchState('workflows', 'navix_automations_workflows');
  if (file === 'KnowledgeBaseStudio.tsx') patchState('collections', 'navix_kb_collections');
  if (file === 'PluginsStudio.tsx') patchState('plugins', 'navix_plugins_list');

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}
