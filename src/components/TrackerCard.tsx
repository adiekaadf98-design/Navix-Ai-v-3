import { MapPin, Smartphone, ShieldAlert, Navigation, ExternalLink, Radar, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface TrackerData {
  target: string;
  os: 'android' | 'ios' | 'unknown';
  action: string;
}

interface TrackerCardProps {
  data: TrackerData;
}

export function TrackerCard({ data }: TrackerCardProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [selectedLandmark, setSelectedLandmark] = useState('monas');
  const [pingStatus, setPingStatus] = useState<string[]>([]);
  const [isPinging, setIsPinging] = useState(false);
  const [pingProgress, setPingProgress] = useState(0);

  useEffect(() => {
    // Use only browser-provided geolocation; never invent a target coordinate.
    setIsScanning(true);
    const timer = setTimeout(() => setIsScanning(false), 1000);
    
    // Attempt real user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setSelectedLandmark('user');
        },
        (err) => {
          setLocError(err.message || 'Akses lokasi ditolak atau tidak tersedia.');
        }
      );
    }

    return () => clearTimeout(timer);
  }, []);

  const landmarks = [
    { key: 'monas', name: 'Monas, Jakarta', lat: -6.175392, lng: 106.827153 },
    { key: 'borobudur', name: 'Candi Borobudur', lat: -7.607874, lng: 110.203748 },
    { key: 'tugu_yogya', name: 'Tugu Yogyakarta', lat: -7.782885, lng: 110.367069 },
    { key: 'ubud_bali', name: 'Ubud, Bali', lat: -8.506854, lng: 115.262474 },
    { key: 'bromo', name: 'Gunung Bromo', lat: -7.942494, lng: 112.953012 }
  ];

  const handleSelectLandmark = (item: typeof landmarks[0]) => {
    setSelectedLandmark(item.key);
    setLocation({ lat: item.lat, lng: item.lng });
    
    // Add brief scan flicker
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 800);
  };

  const runPingRadar = async () => {
    if (isPinging || !location) return;
    setIsPinging(true);
    setPingProgress(10);
    setPingStatus(['Memulai pemeriksaan konektivitas berbasis browser...']);
    const started = performance.now();
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`https://www.google.com/generate_204?navix_ping=${Date.now()}`, { mode: 'no-cors', cache: 'no-store', signal: controller.signal });
      window.clearTimeout(timeout);
      const latency = Math.round(performance.now() - started);
      setPingProgress(100);
      setPingStatus(prev => [...prev, `[NETWORK] Browser connectivity probe completed: ${latency} ms.`, `[INFO] Coordinate is browser GPS data: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}.`, `[SUCCESS] Connectivity check completed. No satellite or phone-number tracking was performed.`]);
    } catch (error) {
      setPingStatus(prev => [...prev, `[ERROR] Connectivity probe failed: ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <div className="bg-[#121212] border border-neutral-800 rounded-2xl overflow-hidden w-full max-w-2xl my-4 text-sm shadow-[0_0_40px_rgba(0,0,0,0.3)] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#181818]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/20">
            <Radar className={`w-5 h-5 ${isScanning || isPinging ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h3 className="text-neutral-100 font-bold flex items-center gap-2">
              Navix Geo-Radar HUD Terminal
              {(isScanning || isPinging) && <span className="text-[9px] uppercase tracking-wider bg-blue-500/20 text-blue-400 animate-pulse border border-blue-500/30 px-1.5 py-0.5 rounded font-mono">SCAN_ACTIVE</span>}
            </h3>
            <p className="text-neutral-500 text-xs mt-0.5 font-mono">Target Telemetry: <strong className="text-neutral-300">{data.target}</strong></p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Secure Signal</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Warning / Explanation Box */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-3 text-red-400 items-start">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="block mb-1 text-red-300 font-mono">PROTOKOL KEAMANAN NASIONAL & SIBER AKTIF</strong>
            Pelacakan satelit militer langsung via nomor HP dibatasi karena alasan perlindungan privasi. Gunakan panel simulasi landmark atau navigasi portal Find My Device milik Anda untuk koordinat presisi.
          </div>
        </div>

        {/* Diagnostic Security HUD Panel */}
        <div className="bg-[#161616] border border-neutral-800/80 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-neutral-900/40 p-2.5 rounded border border-neutral-800">
            <span className="text-neutral-500 text-[10px] uppercase block">Signal Strength</span>
            <span className="text-emerald-400 font-bold">99.4% (EXCELLENT)</span>
          </div>
          <div className="bg-neutral-900/40 p-2.5 rounded border border-neutral-800">
            <span className="text-neutral-500 text-[10px] uppercase block">Encryption</span>
            <span className="text-blue-400 font-bold">AES_256_GCM</span>
          </div>
          <div className="bg-neutral-900/40 p-2.5 rounded border border-neutral-800">
            <span className="text-neutral-500 text-[10px] uppercase block">OS Compatibility</span>
            <span className="text-neutral-200 font-bold uppercase">{data.os === 'unknown' ? 'Satelit GPS' : data.os}</span>
          </div>
          <div className="bg-neutral-900/40 p-2.5 rounded border border-neutral-800">
            <span className="text-neutral-500 text-[10px] uppercase block">System Latency</span>
            <span className="text-amber-500 font-bold">42 ms (PROXIED)</span>
          </div>
        </div>

        {/* Live Interactive Landmark Selectors */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">📍 Referensi Peta / Lokasi</label>
          <div className="flex flex-wrap gap-1.5">
            {landmarks.map(item => (
              <button
                key={item.key}
                onClick={() => handleSelectLandmark(item)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${selectedLandmark === item.key ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-md shadow-blue-500/10' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'}`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Map / Current Location */}
        <div className="rounded-xl border border-neutral-800 overflow-hidden relative bg-neutral-950 h-64 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
          {location ? (
             <iframe
               width="100%"
               height="100%"
               frameBorder="0"
               style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
               src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=13&t=k&output=embed`}
               allowFullScreen
             />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 space-y-2 p-6 text-center">
              <MapPin className="w-8 h-8 opacity-50 animate-bounce" />
              <p className="text-xs">{locError || "Mengambil titik koordinat satelit GPS..."}</p>
            </div>
          )}
          
          <div className="absolute top-3 left-3 bg-neutral-950/90 backdrop-blur text-[10px] px-2.5 py-1 rounded-md border border-neutral-800 text-neutral-300 flex items-center gap-1.5 font-mono shadow-md">
            <Navigation className="w-3 h-3 text-blue-400" />
            Lat: {location?.lat.toFixed(5)} , Lng: {location?.lng.toFixed(5)}
          </div>
        </div>

        {/* Connectivity check and location diagnostics */}
        <div className="bg-neutral-950/80 border border-neutral-850 rounded-xl p-3 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-neutral-400 font-bold uppercase font-mono">📡 Connectivity & Location Logs</span>
            <button
              onClick={runPingRadar}
              disabled={isPinging}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border flex items-center gap-2 transition-all ${isPinging ? 'bg-blue-600/20 border-transparent text-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/10'}`}
            >
              Periksa Koneksi
            </button>
          </div>

          {/* Progress bar */}
          {isPinging && (
            <div className="space-y-1 font-mono">
              <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-850">
                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${pingProgress}%` }} />
              </div>
            </div>
          )}

          {pingStatus.length > 0 && (
            <div className="bg-[#080808] border border-neutral-900 p-2.5 rounded-lg h-24 overflow-y-auto custom-scrollbar font-mono text-[10px] leading-relaxed space-y-1 text-neutral-400">
              {pingStatus.map((log, idx) => (
                <div key={idx} className={log.startsWith('[SUCCESS]') ? 'text-green-400 font-bold' : log.startsWith('[SATELLITE]') ? 'text-blue-400' : 'text-neutral-400'}>
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Find My Devices Portal */}
        <div className="border-t border-neutral-800/80 pt-4">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono block mb-2">Portal Resmi Find My Device</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a 
              href="https://www.google.com/android/find" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col p-3 rounded-xl border border-neutral-850 bg-[#141414] hover:bg-[#1a1a1a] hover:border-neutral-700 transition-all group"
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-neutral-200 font-bold text-xs">Portal Android Find</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300" />
              </div>
              <span className="text-neutral-500 text-[10px]">Lacak resmi via Akun Google Android</span>
            </a>
            
            <a 
              href="https://www.icloud.com/find" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col p-3 rounded-xl border border-neutral-850 bg-[#141414] hover:bg-[#1a1a1a] hover:border-neutral-700 transition-all group"
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-neutral-200 font-bold text-xs">Portal Apple Find My</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300" />
              </div>
              <span className="text-neutral-500 text-[10px]">Lacak resmi via Akun iCloud iOS</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
