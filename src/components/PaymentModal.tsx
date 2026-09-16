import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, CheckCircle, CreditCard, ShieldCheck, Copy, Check, 
  Send, MessageCircle, Sparkles, User, Mail, Smartphone 
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';
import { showToast } from '../utils/toast';

export type PricingPlanId = 'starter' | 'pro' | 'ultra';

interface PaymentModalProps {
  plan: PricingPlanId;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PRICING_PLANS = {
  starter: { 
    id: 'starter' as const,
    name: 'Starter Plan', 
    priceRp: 75000, 
    priceUsd: 5,
    credits: 100,
    dailyLimit: '100 Query Akurasi Tinggi/hari',
    badge: 'Starter',
    badgeColor: 'bg-neutral-800 text-neutral-300 border-neutral-700'
  },
  pro: { 
    id: 'pro' as const,
    name: 'Pro Plan', 
    priceRp: 150000, 
    priceUsd: 10,
    credits: 500,
    dailyLimit: '500 Query Akurasi Tinggi/hari',
    badge: 'Paling Laris',
    badgeColor: 'bg-red-600/20 text-red-400 border-red-500/30'
  },
  ultra: { 
    id: 'ultra' as const,
    name: 'Ultra Plan', 
    priceRp: 450000, 
    priceUsd: 30,
    credits: 9999,
    dailyLimit: 'Unlimited Query Akurasi Maksimal',
    badge: 'Enterprise',
    badgeColor: 'bg-amber-600/20 text-amber-400 border-amber-500/30'
  }
};

export function PaymentModal({ plan: initialPlan, onClose, onSuccess }: PaymentModalProps) {
  const { user } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlanId>(initialPlan || 'pro');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [senderNote, setSenderNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const currentPlan = PRICING_PLANS[selectedPlan];
  const DANA_PHONE = '085235475328';
  const DANA_NAME = 'ADI EKA BUANA';

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast(`${field} berhasil disalin!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTransferDone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetEmail = user?.email || guestEmail.trim();
    const targetName = user?.name || guestName.trim() || 'Pengguna Navix';
    const targetUid = user?.firebaseUid || user?.id || null;

    if (!targetEmail) {
      showToast('Harap masukkan alamat email Anda untuk aktivasi akun!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: targetUid,
        userEmail: targetEmail,
        userName: targetName,
        plan: selectedPlan,
        planName: currentPlan.name,
        amount: currentPlan.priceRp,
        amountUsd: currentPlan.priceUsd,
        credits: currentPlan.credits,
        status: 'pending',
        createdAt: serverTimestamp(),
        method: 'DANA',
        danaAccount: DANA_NAME,
        senderNote: senderNote.trim() || null,
        clientTimestamp: new Date().toISOString()
      });
      
      setIsSuccess(true);
      showToast('Konfirmasi transaksi berhasil dicatat! Menunggu verifikasi admin.', 'success');
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        onClose();
      }, 5000);
      
    } catch (err) {
      console.error('Failed to submit transaction:', err);
      showToast('Gagal mengirim konfirmasi. Periksa koneksi internet Anda.', 'error');
      setIsSubmitting(false);
    }
  };

  const openWhatsAppConfirmation = () => {
    const targetEmail = user?.email || guestEmail || 'email@anda.com';
    const targetName = user?.name || guestName || 'Pengguna Navix';
    const msg = encodeURIComponent(
      `Halo Mas Adi Eka Buana (Admin Navix AI),\n\nSaya telah melakukan transfer DANA untuk paket:\n` +
      `- Paket: *${currentPlan.name}* (Rp ${currentPlan.priceRp.toLocaleString('id-ID')})\n` +
      `- Nama: *${targetName}*\n` +
      `- Email Akun: *${targetEmail}*\n` +
      `- Catatan/Pengirim: *${senderNote || '-'}*\n\n` +
      `Mohon segera diverifikasi dan di-approve kuotanya ya Mas. Terima kasih!`
    );
    window.open(`https://wa.me/6285235475328?text=${msg}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#121212] border border-neutral-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-blue-950/40 via-neutral-900 to-neutral-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <CreditCard size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  Upgrade & Pembayaran DANA
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 font-mono">
                    QRIS
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-400">Pilih paket & scan QR DANA resmi</p>
              </div>
            </div>
            {!isSuccess && (
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {!isSuccess ? (
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar">
              {/* Plan Switcher Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-900/80 border border-neutral-800 rounded-xl">
                {(['starter', 'pro', 'ultra'] as const).map((pKey) => {
                  const p = PRICING_PLANS[pKey];
                  const isSelected = selectedPlan === pKey;
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => setSelectedPlan(pKey)}
                      className={`py-2 px-2 rounded-lg text-center transition-all flex flex-col items-center gap-0.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                      }`}
                    >
                      <span className="text-xs font-semibold">{p.badge}</span>
                      <span className="text-[11px] font-mono">${p.priceUsd} / bln</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Plan Details Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-900/20 via-blue-950/10 to-neutral-900 border border-blue-500/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-blue-400" />
                    <span className="font-bold text-white text-sm">{currentPlan.name}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{currentPlan.dailyLimit}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-400 font-mono">
                    Rp {currentPlan.priceRp.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[10px] text-neutral-500">Kredit: +{currentPlan.credits} Query</span>
                </div>
              </div>

              {/* DANA QR Code Box */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center space-y-3 shadow-xl text-neutral-900">
                <div className="w-full flex items-center justify-between border-b border-neutral-200 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-[#118EEA] text-white px-2 py-0.5 rounded font-black text-xs tracking-wider">
                      DANA
                    </div>
                    <span className="text-xs font-bold text-neutral-800">QR PROFIL RESMI</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">Bebas Biaya Admin</span>
                </div>

                {/* SVG Visual DANA QR Code */}
                <div className="p-3 bg-white border-2 border-neutral-300 rounded-xl shadow-inner relative group">
                  <svg 
                    viewBox="0 0 200 200" 
                    className="w-48 h-48 sm:w-52 sm:h-52 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Background */}
                    <rect width="200" height="200" fill="#ffffff" />
                    
                    {/* QR Code Matrix Elements */}
                    {/* Top-Left Finder */}
                    <rect x="15" y="15" width="45" height="45" fill="#118EEA" rx="4" />
                    <rect x="23" y="23" width="29" height="29" fill="#ffffff" rx="2" />
                    <rect x="29" y="29" width="17" height="17" fill="#118EEA" rx="2" />

                    {/* Top-Right Finder */}
                    <rect x="140" y="15" width="45" height="45" fill="#118EEA" rx="4" />
                    <rect x="148" y="23" width="29" height="29" fill="#ffffff" rx="2" />
                    <rect x="154" y="29" width="17" height="17" fill="#118EEA" rx="2" />

                    {/* Bottom-Left Finder */}
                    <rect x="15" y="140" width="45" height="45" fill="#118EEA" rx="4" />
                    <rect x="23" y="148" width="29" height="29" fill="#ffffff" rx="2" />
                    <rect x="29" y="154" width="17" height="17" fill="#118EEA" rx="2" />

                    {/* Timing & Data Blocks */}
                    <g fill="#1f2937">
                      <rect x="70" y="20" width="8" height="8" />
                      <rect x="85" y="20" width="8" height="8" />
                      <rect x="100" y="20" width="8" height="8" />
                      <rect x="115" y="20" width="8" height="8" />
                      
                      <rect x="20" y="70" width="8" height="8" />
                      <rect x="35" y="70" width="8" height="8" />
                      <rect x="50" y="70" width="8" height="8" />
                      <rect x="70" y="70" width="8" height="8" />
                      <rect x="85" y="70" width="8" height="8" />
                      <rect x="105" y="70" width="8" height="8" />
                      <rect x="125" y="70" width="8" height="8" />
                      <rect x="145" y="70" width="8" height="8" />
                      <rect x="165" y="70" width="8" height="8" />

                      <rect x="70" y="40" width="8" height="8" />
                      <rect x="115" y="40" width="8" height="8" />
                      <rect x="70" y="55" width="8" height="8" />
                      <rect x="85" y="55" width="8" height="8" />
                      <rect x="100" y="55" width="8" height="8" />

                      <rect x="70" y="85" width="8" height="8" />
                      <rect x="125" y="85" width="8" height="8" />
                      <rect x="145" y="85" width="8" height="8" />

                      <rect x="20" y="105" width="8" height="8" />
                      <rect x="40" y="105" width="8" height="8" />
                      <rect x="55" y="105" width="8" height="8" />
                      <rect x="135" y="105" width="8" height="8" />
                      <rect x="155" y="105" width="8" height="8" />
                      <rect x="170" y="105" width="8" height="8" />

                      <rect x="70" y="125" width="8" height="8" />
                      <rect x="90" y="125" width="8" height="8" />
                      <rect x="110" y="125" width="8" height="8" />
                      <rect x="130" y="125" width="8" height="8" />
                      <rect x="150" y="125" width="8" height="8" />
                      <rect x="170" y="125" width="8" height="8" />

                      <rect x="70" y="145" width="8" height="8" />
                      <rect x="85" y="145" width="8" height="8" />
                      <rect x="105" y="145" width="8" height="8" />
                      <rect x="135" y="145" width="8" height="8" />
                      <rect x="155" y="145" width="8" height="8" />

                      <rect x="70" y="165" width="8" height="8" />
                      <rect x="100" y="165" width="8" height="8" />
                      <rect x="120" y="165" width="8" height="8" />
                      <rect x="140" y="165" width="8" height="8" />
                      <rect x="165" y="165" width="8" height="8" />
                    </g>

                    {/* Center DANA Shield Emblem */}
                    <rect x="82" y="82" width="36" height="36" fill="#118EEA" rx="8" stroke="#ffffff" strokeWidth="2" />
                    <text x="100" y="104" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
                      D
                    </text>
                  </svg>
                </div>

                {/* Account Details & Quick Copy */}
                <div className="w-full space-y-2 pt-1 text-left bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-medium block">Penerima Resmi:</span>
                      <span className="text-xs font-bold text-neutral-900">{DANA_NAME}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                      Terverifikasi
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-200">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-medium block">Nomor Akun DANA:</span>
                      <span className="text-xs font-mono font-bold text-blue-700">0852-3547-5328</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(DANA_PHONE, 'Nomor DANA')}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      {copiedField === 'Nomor DANA' ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                      {copiedField === 'Nomor DANA' ? 'Tersalin' : 'Salin Nomor'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-200">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-medium block">Nominal Pas:</span>
                      <span className="text-xs font-mono font-bold text-red-600">Rp {currentPlan.priceRp.toLocaleString('id-ID')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentPlan.priceRp.toString(), 'Nominal')}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      {copiedField === 'Nominal' ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                      {copiedField === 'Nominal' ? 'Tersalin' : 'Salin Nominal'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Confirmation */}
              <form onSubmit={handleTransferDone} className="space-y-3.5">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-neutral-300 block">
                    Informasi Akun Anda untuk Aktivasi:
                  </span>
                  
                  {user ? (
                    <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <User size={15} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{user.name || 'Pengguna Navix'}</p>
                          <p className="text-[11px] text-neutral-400 font-mono">{user.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-mono">
                        Logged In
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
                        <input
                          type="email"
                          required
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="Masukkan Email Anda (untuk akun Navix)*"
                          className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-neutral-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Nama Anda (opsional)"
                          className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-neutral-500 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* Sender Note / Account name in DANA */}
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
                    <input
                      type="text"
                      value={senderNote}
                      onChange={(e) => setSenderNote(e.target.value)}
                      placeholder="Nama Akun DANA Anda (agar admin cepat approve)*"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-neutral-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="text-[11px] text-neutral-400 space-y-1.5 bg-blue-950/20 p-3.5 rounded-xl border border-blue-900/30">
                  <p className="font-bold text-blue-400 flex items-center gap-1">
                    <ShieldCheck size={13} /> Cara Pembayaran:
                  </p>
                  <ol className="list-decimal pl-4 space-y-0.5 text-neutral-300">
                    <li>Buka aplikasi <strong>DANA</strong> atau mobile banking apa saja.</li>
                    <li>Scan QR Code di atas atau transfer ke nomor DANA <strong>0852-3547-5328</strong>.</li>
                    <li>Pastikan atas nama penerima adalah <strong>{DANA_NAME}</strong>.</li>
                    <li>Kirim nominal <strong>Rp {currentPlan.priceRp.toLocaleString('id-ID')}</strong>.</li>
                    <li>Klik tombol <strong>"Saya Sudah Transfer"</strong> di bawah.</li>
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle size={17} />
                        SAYA SUDAH TRANSFER DANA
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={openWhatsAppConfirmation}
                    className="w-full py-2.5 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-600/40 text-emerald-400 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={15} />
                    Konfirmasi Cepat via WhatsApp
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Success State */
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle size={36} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Konfirmasi Berhasil Dikirim!</h3>
                <p className="text-xs text-neutral-300 mt-2 max-w-sm mx-auto leading-relaxed">
                  Terima kasih! Admin Navix AI (Mas Adi Eka Buana) akan segera memverifikasi bukti transfer dan mengaktifkan paket <strong>{currentPlan.name}</strong> Anda.
                </p>
              </div>

              <div className="w-full p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 text-left text-xs space-y-1.5">
                <div className="flex justify-between text-neutral-400">
                  <span>Paket:</span>
                  <span className="font-bold text-white">{currentPlan.name}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Total:</span>
                  <span className="font-mono text-blue-400 font-bold">Rp {currentPlan.priceRp.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Status:</span>
                  <span className="text-amber-400 font-semibold">Menunggu Verifikasi Admin</span>
                </div>
              </div>

              <div className="flex gap-2 w-full pt-2">
                <button
                  type="button"
                  onClick={openWhatsAppConfirmation}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={15} />
                  Chat Admin di WA
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

