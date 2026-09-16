const fs = require('fs');
let apiCode = fs.readFileSync('src/components/studios/ApiKeysStudio.tsx', 'utf8');

const oldHandle = /const handleUpgradePlan = async \([\s\S]*?catch \(err\) \{[\s\S]*?showToast\('Failed to upgrade plan'\);\s*\}\s*\};/;
const newHandle = `const handleUpgradePlan = (plan: string) => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      showToast('Payment system connecting...');
    }
  };`;

apiCode = apiCode.replace(oldHandle, newHandle);
fs.writeFileSync('src/components/studios/ApiKeysStudio.tsx', apiCode);
console.log('ApiKeysStudio handleUpgradePlan patched');
