import React from 'react';
import { X, CheckCircle2, AlertCircle, Clock, Bell, BookOpen, Layers, Send } from 'lucide-react';
import { StrategyEngineType, EngineAnalysisResult } from '../../types/cloudMarket';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. Cara Baca Modal
export const CaraBacaModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 mb-4 text-emerald-400">
          <BookOpen size={20} />
          <h3 className="text-lg font-bold text-white">Panduan Cara Membaca Mesin Analisa</h3>
        </div>

        <div className="space-y-4 text-sm text-neutral-300">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
              <CheckCircle2 size={16} />
              <span>1. Status: SETUP (Siap Eksekusi)</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Semua syarat aturan strategi telah terpenuhi secara matematis. Harga berada dalam jangkauan eksekusi (&lt; 1 ATR). Anda dapat memasang limit order atau mengeksekusi posisi dengan Risk-Reward terukur.
            </p>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
              <Clock size={16} />
              <span>2. Status: PANTAU (Tunggu Konfirmasi)</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Struktur dan arah tren sudah terkonfirmasi, namun harga masih berada dalam jarak 1 - 2 ATR dari area entry yang ideal. Jangan masuk tergesa-gesa; tunggu harga retest ke zona acuan.
            </p>
          </div>

          <div className="p-3 bg-neutral-800/40 border border-neutral-700/60 rounded-xl">
            <div className="flex items-center gap-2 text-neutral-400 font-semibold mb-1">
              <AlertCircle size={16} />
              <span>3. Status: TIDAK DICETAK / DI LUAR BATAS</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Jarak harga &gt; 2 ATR dari titik entry atau kondisi pasar tidak memenuhi ambang rasio risiko. Mesin menolak mencetak sinyal demi menjaga keamanan modal akun Anda.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Istilah / Glossary Modal
export const IstilahModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const terms = [
    { term: 'SMC (Smart Money Concept)', desc: 'Metodologi analisis pergerakan likuiditas institusional, mengidentifikasi manipulasi pasar oleh pembuat pasar (market maker).' },
    { term: 'Order Block (OB)', desc: 'Zona lilin terakhir sebelum terjadinya pergerakan harga tajam (displacement), tempat bank besar menyisakan pesanan tertunda.' },
    { term: 'Fair Value Gap (FVG)', desc: 'Ketidakseimbangan harga antara 3 candlestick yang meninggalkan celah likuiditas yang cenderung diisi kembali oleh pasar.' },
    { term: 'BOS (Break of Structure)', desc: 'Penembusan swing high atau swing low penting yang memvalidasi kelanjutan tren arah dominan.' },
    { term: 'CHoCH (Change of Character)', desc: 'Sinyal awal pembalikan arah struktur pasar ketika tren sebelumnya gagal membuat titik baru dan menembus level sebaliknya.' },
    { term: 'Liquidity Sweep', desc: 'Pergerakan sumbu panjang yang menyapu level Stop Loss para trader ritel sebelum harga bergerak ke arah sebaliknya.' },
    { term: 'ATR (Average True Range)', desc: 'Indikator volatilitas riil per candle yang digunakan untuk mengukur jarak aman titik Stop Loss dan Entry presisi.' },
    { term: 'Golden Pocket (Fib 0.618)', desc: 'Area pembalikan harga dengan probabilitas tertinggi dalam pengukuran Fibonacci Retracement.' },
    { term: 'Kumo Cloud (Ichimoku)', desc: 'Zona awan dinamis pembatas tren bullish dan bearish yang berfungsi sebagai support dan resistance masa depan.' },
    { term: 'RR Bersih (Risk-Reward)', desc: 'Perbandingan rasio keuntungan bersih terhadap risiko per transaksi (target minimal 1:2.0).' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-200 max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 mb-4 text-cyan-400">
          <BookOpen size={20} />
          <h3 className="text-lg font-bold text-white">Glosarium Istilah Trading & Mesin Analisa</h3>
        </div>

        <div className="overflow-y-auto pr-2 space-y-3 divide-y divide-neutral-800/60">
          {terms.map((item, idx) => (
            <div key={idx} className="pt-3 first:pt-0">
              <span className="font-semibold text-white font-mono text-xs text-cyan-300">{item.term}</span>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Kabar / Telegram Alert Modal
export const KabarModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [telegramChatId, setTelegramChatId] = React.useState('');
  const [onlySetup, setOnlySetup] = React.useState(true);
  const [soundAlert, setSoundAlert] = React.useState(true);
  const [saved, setSaved] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 mb-4 text-amber-400">
          <Bell size={20} />
          <h3 className="text-lg font-bold text-white">Pengaturan Kabar & Notifikasi Sinyal</h3>
        </div>

        <p className="text-xs text-neutral-400 mb-4">
          Dapatkan sinyal otomatis saat 5 Mesin Analisa mencetak status <strong>SETUP</strong> secara real-time.
        </p>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-medium mb-1">Telegram Chat ID / Channel ID</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="@username atau -100xxxxxxxx"
                value={telegramChatId}
                onChange={e => setTelegramChatId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 font-mono focus:border-cyan-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  setSaved(true);
                  setTimeout(() => setSaved(false), 3000);
                }}
                className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Send size={13} />
                Tes
              </button>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-neutral-800">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={onlySetup}
                onChange={e => setOnlySetup(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-neutral-950 border-neutral-700"
              />
              <span>Hanya kirim saat status <strong>SETUP</strong> (semua syarat lolos)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={soundAlert}
                onChange={e => setSoundAlert(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-neutral-950 border-neutral-700"
              />
              <span>Bunyikan audio alert saat harga masuk ke &lt; 1 ATR</span>
            </label>
          </div>

          {saved && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-center font-mono text-[11px]">
              ✓ Notifikasi uji coba telah dikirim ke bot Navix Trading!
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Simpan & Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. Semua Mesin Matrix Modal
export const SemuaMesinModal: React.FC<ModalProps & { engines: Record<StrategyEngineType, EngineAnalysisResult>; pair: string }> = ({
  isOpen,
  onClose,
  engines,
  pair
}) => {
  if (!isOpen) return null;

  const items = Object.values(engines);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-200 max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 mb-4 text-emerald-400">
          <Layers size={20} />
          <div>
            <h3 className="text-lg font-bold text-white">Ringkasan Multi-Mesin Analisa • {pair}</h3>
            <p className="text-xs text-neutral-400">Status 5 mesin analitik kuantitatif secara simultan</p>
          </div>
        </div>

        <div className="overflow-y-auto space-y-3">
          {items.map(engine => {
            const isSetup = engine.status === 'setup';
            const isPantau = engine.status === 'pantau';

            return (
              <div
                key={engine.engine}
                className={`p-4 rounded-xl border transition-all ${
                  isSetup
                    ? 'bg-emerald-950/30 border-emerald-600/40'
                    : isPantau
                    ? 'bg-amber-950/20 border-amber-600/30'
                    : 'bg-neutral-950 border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono text-sm">{engine.engine}</span>
                    <span className="text-xs text-neutral-400">({engine.name})</span>
                  </div>

                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      isSetup
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isPantau
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}
                  >
                    {engine.status.replace('_', ' ')} ({engine.passedRules}/{engine.totalRules} Syarat)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/80">
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Arah</span>
                    <span className={engine.direction === 'buy' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {engine.direction.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Entry Acuan</span>
                    <span className="text-white">${engine.entryPrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Jarak ATR</span>
                    <span className="text-cyan-300">{engine.atrDistanceVal} ATR</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Risk : Reward</span>
                    <span className="text-emerald-400">{engine.rrRatio}</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 mt-2 italic">
                  &ldquo;{engine.caraMasuk}&rdquo;
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
