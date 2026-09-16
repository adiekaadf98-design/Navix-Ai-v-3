const fs = require('fs');

let apiCode = fs.readFileSync('src/components/studios/ApiKeysStudio.tsx', 'utf8');

// In case the user hasn't generated a key yet, we want to show the quota as soon as they generate one.
const oldGenerateHandle = `      if (data.success && data.key) {
        setApiKeys([{ id: '1', key: data.key, createdAt: new Date().toISOString() }]);
        showToast('API Key berhasil dibuat!', 'success');
      }`;

const newGenerateHandle = `      if (data.success && data.key) {
        setApiKeys([{ id: '1', key: data.key, createdAt: new Date().toISOString() }]);
        setUsage({ requests: 0, limit: 100, plan: 'Free Tier' }); // Set initial usage
        showToast('API Key berhasil dibuat!', 'success');
      }`;

apiCode = apiCode.replace(oldGenerateHandle, newGenerateHandle);
fs.writeFileSync('src/components/studios/ApiKeysStudio.tsx', apiCode);
console.log("Patched ApiKeysStudio state update");
