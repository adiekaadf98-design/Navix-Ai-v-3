const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

const apiKeysComponent = `
        {currentView === 'api_keys' && (
          <ApiKeysStudio 
            onUpgradeClick={() => setIsPaymentOpen(true)}
            onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onSendToChat={(prompt) => {
              setCurrentView('chat');
              handleSendMessage(prompt);
            }}
          />
        )}`;

if (!appCode.includes("currentView === 'api_keys'")) {
  appCode = appCode.replace(
    "{currentView === 'plugins_sdk' && (",
    apiKeysComponent + "\n        {currentView === 'plugins_sdk' && ("
  );
  fs.writeFileSync('src/App.tsx', appCode);
  console.log("App.tsx patched");
}
