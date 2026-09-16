const fs = require('fs');

let apiCode = fs.readFileSync('src/components/studios/ApiKeysStudio.tsx', 'utf8');

if (!apiCode.includes('onClose?: () => void;')) {
  apiCode = apiCode.replace(
    'onUpgradeClick?: () => void;\n}',
    'onUpgradeClick?: () => void;\n  onClose?: () => void;\n}'
  );
  
  apiCode = apiCode.replace(
    'export const ApiKeysStudio: React.FC<ApiKeysStudioProps> = ({ onOpenSidebar, onSendToChat, onUpgradeClick }) => {',
    'export const ApiKeysStudio: React.FC<ApiKeysStudioProps> = ({ onOpenSidebar, onSendToChat, onUpgradeClick, onClose }) => {'
  );
  
  if (!apiCode.includes('import { Key, Activity, Terminal, Check, Copy, Plus, Sparkles, X }')) {
     apiCode = apiCode.replace(
       'import { Key, Activity, Terminal, Check, Copy, Plus, Sparkles } from \'lucide-react\';',
       'import { Key, Activity, Terminal, Check, Copy, Plus, Sparkles, X } from \'lucide-react\';'
     );
  }

  const headerRegex = /<div className="flex items-center gap-4">([\s\S]*?)<\/div>\s*<\/div>/;
  const newHeader = `<div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <Key className="text-purple-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Navix API Keys</h2>
              <p className="text-sm text-neutral-400">Kelola kunci API Anda untuk mengintegrasikan Navix AI ke aplikasi pihak ketiga.</p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors"
              title="Tutup Panel"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>`;

  apiCode = apiCode.replace(headerRegex, newHeader);

  fs.writeFileSync('src/components/studios/ApiKeysStudio.tsx', apiCode);
  console.log('Patched ApiKeysStudio.tsx for close button');
}

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes("onClose={() => setCurrentView('chat')}")) {
  // Let's add it to ApiKeysStudio
  const apiMatch = "<ApiKeysStudio \\n            onUpgradeClick={() => setIsPaymentOpen(true)}\\n            onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)} \\n            onSendToChat={(prompt) => {";
  
  if (appCode.includes("<ApiKeysStudio \n            onUpgradeClick={() => setIsPaymentOpen(true)}")) {
    appCode = appCode.replace(
      "<ApiKeysStudio \n            onUpgradeClick={() => setIsPaymentOpen(true)}",
      "<ApiKeysStudio \n            onClose={() => setCurrentView('chat')}\n            onUpgradeClick={() => setIsPaymentOpen(true)}"
    );
    fs.writeFileSync('src/App.tsx', appCode);
    console.log('Patched App.tsx for ApiKeysStudio onClose');
  }
}
