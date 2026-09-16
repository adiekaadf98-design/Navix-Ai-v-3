const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

if (appCode.includes('<AdminDashboard />')) {
  appCode = appCode.replace('<AdminDashboard />', '<AdminDashboard onClose={() => setCurrentView(\'chat\')} />');
  fs.writeFileSync('src/App.tsx', appCode);
  console.log('Patched App.tsx for onClose prop');
}

let adminCode = fs.readFileSync('src/components/admin/AdminDashboard.tsx', 'utf8');

// Update imports
if (!adminCode.includes('X,')) {
  adminCode = adminCode.replace('import { Shield,', 'import { Shield, X,');
}

// Update function signature
adminCode = adminCode.replace('export function AdminDashboard() {', 'export function AdminDashboard({ onClose }: { onClose?: () => void }) {');

// Add close button
const headerSearch = `
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="text-red-500" />
              Admin & User Management
            </h1>
            <p className="text-sm text-neutral-400 mt-1">Kelola pengguna, verifikasi pembayaran, dan pantau metrik.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center gap-2 hidden md:flex">
              <Users size={16} className="text-blue-400" />
              <span className="text-sm font-bold">{users.length} Users</span>
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors"
                title="Tutup Admin Panel"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
`;

// Replace the old header section
const oldHeaderRegex = /\{\/\*\s*Header\s*\*\/\}.*?\{\/\*\s*Search\s*\*\/\}/s;
adminCode = adminCode.replace(oldHeaderRegex, headerSearch.trim() + '\n\n        {/* Search */}');

fs.writeFileSync('src/components/admin/AdminDashboard.tsx', adminCode);
console.log('Patched AdminDashboard.tsx for close button');
