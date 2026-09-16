const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components/studios');

function patchFile(fileName, stateName, storageKey) {
  const filePath = path.join(dir, fileName);
  let content = fs.readFileSync(filePath, 'utf8');

  // Insert useEffect if missing
  if (content.includes('useState') && !content.includes('useEffect')) {
    content = content.replace(/import React,\s*\{\s*useState\s*\}\s*from\s*'react';/, "import React, { useState, useEffect } from 'react';");
    content = content.replace(/import React,\s*\{\s*useState,\s*useRef\s*\}\s*from\s*'react';/, "import React, { useState, useRef, useEffect } from 'react';");
  }

  // Regex to find: const [audioLibrary, setAudioLibrary] = useState<any_type>([ ... ]);
  // Since it might span many lines, we find the first occurrence of const [stateName, setStateName] = useState...
  const matchStart = content.indexOf(`const [${stateName}, set`);
  if (matchStart === -1) return;

  const useStateStart = content.indexOf('useState', matchStart);
  const openBracket = content.indexOf('([', useStateStart);
  
  // Find the matching close bracket for useState
  let closeBracket = -1;
  let brackets = 0;
  for (let i = openBracket + 1; i < content.length; i++) {
    if (content[i] === '[') brackets++;
    if (content[i] === ']') {
      if (brackets === 0) {
        // we found the closing bracket of the array
        closeBracket = i;
        break;
      }
      brackets--;
    }
  }

  // Find the closing parenthesis of useState
  const closeParen = content.indexOf(')', closeBracket);
  
  const typeStr = content.substring(useStateStart + 8, openBracket); // e.g. <Array<{...}>>
  const arrayContent = content.substring(openBracket + 2, closeBracket); // e.g. \n { id: 'aud-1' ... } \n
  const capitalizedState = stateName.charAt(0).toUpperCase() + stateName.slice(1);

  const replacement = `const [${stateName}, set${capitalizedState}] = useState${typeStr}(() => {
    try {
      const saved = localStorage.getItem('${storageKey}');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load ${storageKey}', e);
    }
    return [${arrayContent}];
  });

  useEffect(() => {
    localStorage.setItem('${storageKey}', JSON.stringify(${stateName}));
  }, [${stateName}]);`;

  content = content.substring(0, matchStart) + replacement + content.substring(closeParen + 2); // +2 for ); or whatever follows

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched ${stateName} in ${fileName}`);
}

patchFile('AudioStudio.tsx', 'audioLibrary', 'navix_audio_library');
patchFile('ImageStudio.tsx', 'generatedImages', 'navix_image_gallery');
