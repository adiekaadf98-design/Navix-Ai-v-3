const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const adminButton = `
          {isDeveloper && (
            <button 
              onClick={() => handleAction(() => onSwitchView('admin_dashboard'))} 
              className={\`w-full min-h-[40px] flex items-center gap-3 text-white hover:bg-neutral-800/70 active:bg-neutral-800 active:scale-[0.99] py-2 px-2.5 rounded-lg transition-colors cursor-pointer select-none \${
                !isOpen && !isMobile ? 'justify-center px-0' : 'justify-between'
              }\`}
              title="Admin Panel"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-1.5 rounded-lg bg-neutral-900 text-white border border-neutral-800 shrink-0">
                  <Shield size={17} className="text-red-500 shrink-0" />
                </div>
                {(isOpen || isMobile) && (
                  <div className="flex flex-col text-left truncate">
                    <span className="text-xs font-semibold text-white">Admin Panel</span>
                    <span className="text-[10px] text-neutral-300 font-normal">Kelola Pengguna</span>
                  </div>
                )}
              </div>
              {(isOpen || isMobile) && (
                <ChevronRight size={14} className="text-neutral-400 shrink-0" />
              )}
            </button>
          )}
          <button 
            onClick={() => handleAction(() => setIsSettingsOpen(true))} 
`;

if (!content.includes('Kelola Pengguna')) {
  content = content.replace(
    '          <button \n            onClick={() => handleAction(() => setIsSettingsOpen(true))} ',
    adminButton
  );
  
  if (!content.includes('Shield')) {
    content = content.replace('Trash2,', 'Trash2,\n  Shield,');
  }
}

fs.writeFileSync('src/components/Sidebar.tsx', content);
console.log("Patched Sidebar.tsx with Admin Button");
