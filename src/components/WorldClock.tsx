import { useEffect, useMemo, useState } from 'react';
import { Clock3, Globe2, Plus, Trash2 } from 'lucide-react';

interface TimeZoneOption {
  id: string;
  label: string;
  city: string;
}

const TIME_ZONES: TimeZoneOption[] = [
  { id: 'Asia/Jakarta', label: 'WIB', city: 'Jakarta' },
  { id: 'Asia/Singapore', label: 'SGT', city: 'Singapore' },
  { id: 'Asia/Tokyo', label: 'JST', city: 'Tokyo' },
  { id: 'Australia/Sydney', label: 'AEDT/AEST', city: 'Sydney' },
  { id: 'Europe/London', label: 'GMT/BST', city: 'London' },
  { id: 'Europe/Paris', label: 'CET/CEST', city: 'Paris' },
  { id: 'America/New_York', label: 'ET', city: 'New York' },
  { id: 'America/Los_Angeles', label: 'PT', city: 'Los Angeles' },
  { id: 'America/Sao_Paulo', label: 'BRT', city: 'São Paulo' },
  { id: 'UTC', label: 'UTC', city: 'Universal Time' },
];

const DEFAULT_ZONES = ['Asia/Jakarta', 'Asia/Tokyo', 'Europe/London', 'America/New_York'];
const STORAGE_KEY = 'navix-clock-timezones';

function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function formatDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getOffset(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  }).formatToParts(date);
  return parts.find((part) => part.type === 'timeZoneName')?.value.replace('GMT', 'UTC') || 'UTC';
}

export function WorldClock() {
  const [now, setNow] = useState(() => new Date());
  const [zones, setZones] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return Array.isArray(saved) && saved.length > 0 ? saved.filter((zone) => TIME_ZONES.some((item) => item.id === zone)) : DEFAULT_ZONES;
    } catch {
      return DEFAULT_ZONES;
    }
  });
  const [selectedZone, setSelectedZone] = useState('Asia/Singapore');

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
  }, [zones]);

  const availableZones = useMemo(() => TIME_ZONES.filter((zone) => !zones.includes(zone.id)), [zones]);

  const addZone = () => {
    if (!zones.includes(selectedZone)) setZones((current) => [...current, selectedZone]);
  };

  return (
    <section className="h-full overflow-y-auto bg-[#0c0c0c] px-4 py-6 text-white sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-red-400"><Globe2 size={18} /><span className="font-mono text-xs uppercase tracking-[0.25em]">World time</span></div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Jam Digital Global</h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-400">Pantau waktu saat ini di berbagai zona waktu secara realtime.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 p-2">
            <select value={selectedZone} onChange={(event) => setSelectedZone(event.target.value)} className="min-w-0 bg-transparent px-2 py-2 text-sm text-neutral-200 outline-none">
              {availableZones.length === 0 ? <option value="">Semua zona ditambahkan</option> : availableZones.map((zone) => <option key={zone.id} value={zone.id}>{zone.city} ({zone.label})</option>)}
            </select>
            <button type="button" onClick={addZone} disabled={availableZones.length === 0} className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"><Plus size={15} /> Tambah</button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zoneId) => {
            const zone = TIME_ZONES.find((item) => item.id === zoneId) || { id: zoneId, city: zoneId, label: 'TZ' };
            return (
              <article key={zoneId} className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-5 shadow-lg">
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-red-500/10 blur-2xl" />
                <div className="relative flex items-start justify-between">
                  <div><p className="text-lg font-medium">{zone.city}</p><p className="mt-1 font-mono text-xs text-neutral-500">{zone.id} · {getOffset(now, zone.id)}</p></div>
                  <button type="button" onClick={() => setZones((current) => current.filter((item) => item !== zoneId))} aria-label={`Hapus zona ${zone.city}`} className="rounded-lg p-2 text-neutral-600 transition hover:bg-red-500/10 hover:text-red-400"><Trash2 size={16} /></button>
                </div>
                <div className="relative mt-7 flex items-center gap-3"><Clock3 className="text-red-400" size={20} /><time className="font-mono text-4xl font-medium tracking-tight tabular-nums">{formatTime(now, zone.id)}</time></div>
                <p className="relative mt-3 text-sm capitalize text-neutral-400">{formatDate(now, zone.id)} <span className="ml-1 text-neutral-600">· {zone.label}</span></p>
              </article>
            );
          })}
        </div>
        <p className="mt-6 text-xs text-neutral-600">Waktu diperbarui setiap detik menggunakan zona waktu IANA pada browser Anda.</p>
      </div>
    </section>
  );
}
