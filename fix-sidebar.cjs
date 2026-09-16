const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

if (!code.includes('Shield,')) {
  code = code.replace('Trash2,', 'Trash2,\n  Shield,');
  fs.writeFileSync('src/components/Sidebar.tsx', code);
  console.log('Fixed Shield import in Sidebar.tsx');
} else {
  console.log('Shield already imported or Trash2 not found');
}
