const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components/studios');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  let modified = false;
  
  // AudioStudio, VideoStudio, MediaLibrary, AppConnectors already modified via multi_edit or manually?
  // I'll run a regex to safely add onSendToChat to interfaces and components that don't have it.

  // 1. Add to interface
  const interfaceName = file.replace('.tsx', 'Props');
  if (content.includes(`interface ${interfaceName} {`) && !content.includes('onSendToChat')) {
    content = content.replace(
      new RegExp(`(interface\\s+${interfaceName}\\s*\\{[\\s\\S]*?onOpenSidebar:\\s*\\(\\)\\s*=>\\s*void;)`),
      "$1\n  onSendToChat?: (prompt: string) => void;"
    );
    modified = true;
  }

  // 2. Add to component args
  const componentName = file.replace('.tsx', '');
  if (content.includes(`export const ${componentName}: React.FC<${interfaceName}> = ({ onOpenSidebar }) => {`)) {
    content = content.replace(
      `export const ${componentName}: React.FC<${interfaceName}> = ({ onOpenSidebar }) => {`,
      `export const ${componentName}: React.FC<${interfaceName}> = ({ onOpenSidebar, onSendToChat }) => {`
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched props in ${file}`);
  }
}
