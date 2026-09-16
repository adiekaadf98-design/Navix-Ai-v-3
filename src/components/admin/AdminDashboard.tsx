import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Shield, X, Users, Activity, Crown, Search, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function AdminDashboard({ onClose }: { onClose?: () => void }) {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeUser = async (userId: string, newPlan: string) => {
    if (!window.confirm(`Yakin ingin mengubah paket pengguna ini menjadi ${newPlan.toUpperCase()}?`)) return;
    
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { 
        plan: newPlan,
        credits: newPlan === 'pro' || newPlan === 'ultra' ? 1000 : 5 // Just an example, backend quotaGuard rules now!
      });
      alert('Berhasil memperbarui paket pengguna!');
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      alert('Gagal memperbarui paket.');
    }
  };

  if (user?.role !== 'developer') {
    return (
      <div className="h-full flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <Shield size={48} className="mx-auto text-red-500" />
          <h2 className="text-xl font-bold">Akses Ditolak</h2>
          <p className="text-sm text-neutral-400">Halaman ini khusus untuk Developer Navix AI.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full bg-[#0a0a0a] text-white overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          <input 
            type="text" 
            placeholder="Cari berdasarkan nama atau email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500"
          />
        </div>

        {/* User Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-black/40 border-b border-neutral-800 text-neutral-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pengguna</th>
                  <th className="px-4 py-3 font-semibold">Provider</th>
                  <th className="px-4 py-3 font-semibold">Plan Saat Ini</th>
                  <th className="px-4 py-3 font-semibold">Aksi Manual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-neutral-500">Memuat data pengguna...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-neutral-500">Tidak ada pengguna ditemukan.</td></tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-neutral-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar || 'https://ui-avatars.com/api/?name=User'} alt="Avatar" className="w-8 h-8 rounded-full bg-neutral-800" />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1">
                              {u.name} {u.role === 'developer' && <Shield size={12} className="text-red-500" />}
                            </div>
                            <div className="text-xs text-neutral-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-neutral-800 rounded text-xs capitalize">{u.provider}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                          u.plan === 'developer' ? 'bg-red-500/20 text-red-400' :
                          u.plan === 'pro' || u.plan === 'ultra' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-neutral-800 text-neutral-400'
                        }`}>
                          {u.plan || 'free'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {u.plan !== 'free' && u.plan !== 'developer' && (
                             <button onClick={() => handleUpgradeUser(u.id, 'free')} className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded transition-colors">
                               Reset ke Free
                             </button>
                          )}
                          {u.plan !== 'pro' && u.plan !== 'developer' && (
                             <button onClick={() => handleUpgradeUser(u.id, 'pro')} className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs rounded transition-colors border border-blue-600/30">
                               Set to Pro
                             </button>
                          )}
                          {u.plan !== 'ultra' && u.plan !== 'developer' && (
                             <button onClick={() => handleUpgradeUser(u.id, 'ultra')} className="px-2 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 text-xs rounded transition-colors border border-amber-600/30">
                               Set to Ultra
                             </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
