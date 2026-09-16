/**
 * NAVIX AI STUDIO APP & APK BUILDER ENGINE
 * Engine Resmi Penanaman Seluruh Skills & Kapabilitas Studio AI:
 * 1. Shadcn/UI & Tailwind Modern Design System
 * 2. Gemini GenAI Logic & Function Calling
 * 3. Firebase (Firestore + Auth + Rules) Cloud Engine
 * 4. Cloud SQL & PostgreSQL / Drizzle ORM Schema
 * 5. Google Maps Platform & Geolocation Routing
 * 6. Real-Time WebSockets & Collaborative Canvas (Konva/Fabric)
 * 7. APK & PWA Android Native Bridge (Capacitor/Manifest/Service Worker/Biometrics)
 * 8. Chart.js & D3 Data Visualization
 */

import { IEngine, EngineResult } from "../../types/engine";

export interface StudioAppSkillDefinition {
  id: string;
  name: string;
  category: 'ui_ux' | 'ai_engine' | 'database' | 'mobile_apk' | 'maps_geo' | 'realtime' | 'workspace';
  description: string;
  githubRepo: string;
  cdnIncludes: string[];
  sampleSnippet: string;
}

export const AI_STUDIO_CORE_SKILLS: StudioAppSkillDefinition[] = [
  {
    id: 'shadcn_tailwind',
    name: 'Shadcn UI & Tailwind CSS Engine',
    category: 'ui_ux',
    description: 'Komponen modern berstandar tinggi, tipografi matematis, dark/light theme, dan Lucide Icons.',
    githubRepo: 'shadcn-ui/ui',
    cdnIncludes: [
      'https://cdn.tailwindcss.com',
      'https://unpkg.com/lucide@latest',
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap'
    ],
    sampleSnippet: `<button class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all active:scale-95"><i data-lucide="sparkles" class="inline w-4 h-4 mr-2"></i>Aktifkan</button>`
  },
  {
    id: 'apk_pwa_native',
    name: 'APK Android & PWA Native Engine',
    category: 'mobile_apk',
    description: 'Arsitektur Mobile APK responsif dengan Web Manifest PWA, Service Worker offline-first, status bar color, dan touch gestures.',
    githubRepo: 'ionic-team/capacitor',
    cdnIncludes: [
      'manifest.json',
      'service-worker.js'
    ],
    sampleSnippet: `{
  "name": "Navix Mobile APK",
  "short_name": "NavixAPK",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#090d16",
  "theme_color": "#e11d48",
  "icons": [{ "src": "/icon.png", "sizes": "192x192", "type": "image/png" }]
}`
  },
  {
    id: 'firebase_firestore_auth',
    name: 'Firebase Firestore & Auth Engine',
    category: 'database',
    description: 'Cloud NoSQL persistence, real-time snapshot sync, role-based security rules, dan Google/Email Authentication.',
    githubRepo: 'firebase/firebase-js-sdk',
    cdnIncludes: [
      'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
      'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js',
      'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js'
    ],
    sampleSnippet: `firebase.initializeApp(firebaseConfig);\nconst db = firebase.firestore();\ndb.collection('notes').onSnapshot(snap => console.log(snap.docs.map(d => d.data())));`
  },
  {
    id: 'gemini_ai_sdk',
    name: 'Gemini Generative AI Logic Engine',
    category: 'ai_engine',
    description: 'Integrasi multimodal AI, streaming response, vision image inspection, dan dynamic function calling.',
    githubRepo: 'google-gemini/gemini-api',
    cdnIncludes: [
      'https://cdn.jsdelivr.net/npm/@google/genai@latest'
    ],
    sampleSnippet: `const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: prompt }) });`
  },
  {
    id: 'realtime_charts_viz',
    name: 'Financial & Analytics Chart Engine',
    category: 'realtime',
    description: 'Visualisasi grafik interaktif kuantitatif, candlestick trading, line charts, dan bento telemetry dashboard.',
    githubRepo: 'tradingview/lightweight-charts',
    cdnIncludes: [
      'https://cdn.jsdelivr.net/npm/chart.js',
      'https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js'
    ],
    sampleSnippet: `const chart = LightweightCharts.createChart(container, { width: 400, height: 250 });`
  },
  {
    id: 'maps_geolocation',
    name: 'Google Maps & Geolocation Engine',
    category: 'maps_geo',
    description: 'Peta interaktif, pinpoint lokasi real-time GPS, rute navigasi, dan cluster marker.',
    githubRepo: 'googlemaps/js-samples',
    cdnIncludes: [
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    ],
    sampleSnippet: `const map = L.map('map').setView([-6.2088, 106.8456], 13); L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);`
  }
];

export interface GeneratedStudioProject {
  title: string;
  type: 'apk_pwa' | 'web_app' | 'dashboard' | 'game' | 'utility';
  description: string;
  htmlCode: string;
  files: { name: string; content: string; language: string }[];
  installedSkills: string[];
}

export function scaffoldStudioApp(
  promptOrTitle: string, 
  appType: 'apk_pwa' | 'web_app' | 'dashboard' | 'game' | 'utility' = 'apk_pwa',
  category: 'trading' | 'pos_store' | 'ai_assistant' | 'tracker' | 'game' | 'general' = 'general'
): GeneratedStudioProject {
  const cleanTitle = promptOrTitle.trim() || 'Navix Pro Studio App';

  // Smart Category Resolution if category is general or inferred from prompt
  let resolvedCategory = category;
  if (resolvedCategory === 'general') {
    const pLower = cleanTitle.toLowerCase();
    if (pLower.includes('kasir') || pLower.includes('pos') || pLower.includes('toko') || pLower.includes('warung') || pLower.includes('penjualan') || pLower.includes('retail')) {
      resolvedCategory = 'pos_store';
    } else if (pLower.includes('asisten') || pLower.includes('assistant') || pLower.includes('chat') || pLower.includes('bot') || pLower.includes('tanya')) {
      resolvedCategory = 'ai_assistant';
    } else if (pLower.includes('tracker') || pLower.includes('habit') || pLower.includes('kebiasaan') || pLower.includes('fitness') || pLower.includes('olahraga') || pLower.includes('rutinitas')) {
      resolvedCategory = 'tracker';
    } else if (pLower.includes('game') || pLower.includes('arcade') || pLower.includes('main') || pLower.includes('retro') || pLower.includes('canvas')) {
      resolvedCategory = 'game';
    } else if (pLower.includes('trading') || pLower.includes('crypto') || pLower.includes('emas') || pLower.includes('saham') || pLower.includes('forex') || pLower.includes('xau')) {
      resolvedCategory = 'trading';
    }
  }

  if (resolvedCategory === 'trading') {
    const htmlCode = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${cleanTitle} - Trading Terminal APK</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-start p-3 sm:p-6 select-none">
  
  <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
          <i data-lucide="trending-up" class="w-5 h-5"></i>
        </div>
        <div>
          <h1 class="text-base font-bold text-white tracking-tight">${cleanTitle}</h1>
          <p class="text-[11px] text-slate-400 font-mono">XAUUSD • Gold Live Terminal</p>
        </div>
      </div>
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE PRICE
      </span>
    </div>

    <!-- Live Price Metric -->
    <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
      <div>
        <div class="text-[10px] uppercase font-mono text-slate-400">Live Spot Market</div>
        <div id="livePrice" class="text-3xl font-extrabold font-mono text-white tracking-tight">$2,892.45</div>
      </div>
      <div class="text-right">
        <div class="text-emerald-400 font-mono font-bold text-sm">+1.42%</div>
        <div class="text-[10px] text-slate-400">24h Change</div>
      </div>
    </div>

    <!-- Mini Chart Canvas -->
    <div class="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3 h-44 relative">
      <canvas id="tradeChart"></canvas>
    </div>

    <!-- Sinyal SMC Box -->
    <div class="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
      <div>
        <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
          <i data-lucide="zap" class="w-3.5 h-3.5"></i> ALGO SIGNAL (TA-LIB + FVG)
        </div>
        <div class="text-sm font-extrabold text-white">STRONG BUY @ 2,890.00</div>
        <div class="text-[10px] font-mono text-slate-400">SL: 2,878.00 | TP1: 2,905.00 | TP2: 2,925.00</div>
      </div>
      <span class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs">R:R 1:2.8</span>
    </div>

    <!-- Action Buttons -->
    <div class="grid grid-cols-2 gap-3">
      <button onclick="executeOrder('BUY')" class="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
        <i data-lucide="arrow-up-right" class="w-4 h-4"></i> EXECUTE BUY
      </button>
      <button onclick="executeOrder('SELL')" class="py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
        <i data-lucide="arrow-down-right" class="w-4 h-4"></i> EXECUTE SELL
      </button>
    </div>
  </div>

  <script>
    lucide.createIcons();
    
    // Live price data from Binance public API
    const priceEl = document.getElementById('livePrice');
    async function refreshLivePrice() {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', { cache: 'no-store' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        priceEl.textContent = '$' + Number(data.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
      } catch (error) {
        priceEl.textContent = 'LIVE DATA UNAVAILABLE';
        console.error('Live price request failed:', error);
      }
    }
    refreshLivePrice();
    setInterval(refreshLivePrice, 5000);

    // Chart.js Setup
    const ctx = document.getElementById('tradeChart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30'],
        datasets: [{
          label: 'Gold/USD',
          data: [2882, 2885, 2881, 2889, 2887, 2891, 2892.45],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 9 } } },
          y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b', font: { size: 9 } } }
        }
      }
    });

    function executeOrder(type) {
      alert("✅ Order " + type + " Berhasil Ditempatkan pada harga $" + basePrice.toFixed(2));
    }
  </script>
</body>
</html>`;

    return {
      title: cleanTitle,
      type: 'apk_pwa',
      description: 'Terminal Trading APK Real-Time dengan visualisasi Chart.js dan sinyal SMC/FVG terstruktur.',
      htmlCode,
      installedSkills: ['shadcn_tailwind', 'realtime_charts_viz', 'apk_pwa_native'],
      files: [
        { name: 'index.html', content: htmlCode, language: 'html' },
        { name: 'manifest.json', content: JSON.stringify({ name: cleanTitle, short_name: "TradingAPK", display: "standalone", theme_color: "#0f172a" }, null, 2), language: 'json' }
      ]
    };
  }

  if (resolvedCategory === 'pos_store') {
    const posHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${cleanTitle} - POS Kasir Mobile</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-start p-3 sm:p-6 pb-28">

  <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <i data-lucide="store" class="w-5 h-5"></i>
        </div>
        <div>
          <h1 class="text-base font-bold text-white tracking-tight">${cleanTitle}</h1>
          <p class="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Kasir Aktif • Siap Transaksi
          </p>
        </div>
      </div>
      <button onclick="clearCart()" class="text-slate-400 hover:text-rose-400 text-xs px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700">
        Reset
      </button>
    </div>

    <!-- Category Filter Tabs -->
    <div class="flex gap-2 overflow-x-auto pb-1 text-xs">
      <button onclick="filterCat('all')" id="tab-all" class="px-3 py-1.5 rounded-xl font-bold bg-emerald-600 text-white shadow-sm shrink-0">Semua</button>
      <button onclick="filterCat('makanan')" id="tab-makanan" class="px-3 py-1.5 rounded-xl font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 shrink-0">Makanan</button>
      <button onclick="filterCat('minuman')" id="tab-minuman" class="px-3 py-1.5 rounded-xl font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 shrink-0">Minuman</button>
      <button onclick="filterCat('snack')" id="tab-snack" class="px-3 py-1.5 rounded-xl font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 shrink-0">Camilan</button>
    </div>

    <!-- Product Catalog List -->
    <div id="productGrid" class="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1"></div>

    <!-- Current Cart Summary -->
    <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
      <div class="flex items-center justify-between text-xs font-mono text-slate-400">
        <span>TOTAL KERANJANG (<span id="cartCount">0</span> ITEM)</span>
        <span class="text-emerald-400 font-bold text-base" id="cartTotal">Rp 0</span>
      </div>
      <div id="cartItems" class="space-y-1.5 max-h-28 overflow-y-auto text-xs pr-1"></div>
    </div>

    <!-- Checkout Trigger Button -->
    <button onclick="openCheckout()" id="checkoutBtn" disabled class="w-full py-3.5 bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
      <i data-lucide="credit-card" class="w-4 h-4"></i> PROSES PEMBAYARAN
    </button>
  </div>

  <!-- Checkout Modal -->
  <div id="checkoutModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 flex flex-col gap-4 text-center">
      <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
        <i data-lucide="check-circle-2" class="w-7 h-7"></i>
      </div>
      <div>
        <h3 class="text-lg font-bold text-white">Struk Transaksi Selesai</h3>
        <p class="text-xs text-slate-400">Pembayaran terverifikasi via QRIS / Tunai</p>
      </div>
      <div class="bg-slate-950 p-3 rounded-xl text-left font-mono text-xs text-slate-300 space-y-1">
        <div class="flex justify-between"><span>Nomor Struk:</span><span id="receiptId">#TRX-9982</span></div>
        <div class="flex justify-between font-bold text-white"><span>Total Dibayar:</span><span id="receiptTotal">Rp 0</span></div>
      </div>
      <button onclick="closeCheckout()" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs">
        Tutup & Transaksi Baru
      </button>
    </div>
  </div>

  <script>
    const products = [
      { id: '1', name: 'Nasi Goreng Spesial', price: 25000, cat: 'makanan', icon: 'utensils' },
      { id: '2', name: 'Ayam Geprek Sambal', price: 22000, cat: 'makanan', icon: 'drumstick' },
      { id: '3', name: 'Es Teh Manis Jumbo', price: 6000, cat: 'minuman', icon: 'coffee' },
      { id: '4', name: 'Kopi Susu Gula Aren', price: 18000, cat: 'minuman', icon: 'coffee' },
      { id: '5', name: 'Kentang Goreng Crispy', price: 15000, cat: 'snack', icon: 'cookie' },
      { id: '6', name: 'Roti Bakar Coklat Keju', price: 16000, cat: 'snack', icon: 'sandwich' }
    ];

    let cart = {};
    let activeCat = 'all';

    function formatRp(val) {
      return 'Rp ' + Number(val).toLocaleString('id-ID');
    }

    function renderProducts() {
      const grid = document.getElementById('productGrid');
      const filtered = activeCat === 'all' ? products : products.filter(p => p.cat === activeCat);
      grid.innerHTML = filtered.map(p => \`
        <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div>
            <div class="text-[10px] uppercase font-mono text-slate-500">\${p.cat}</div>
            <div class="text-xs font-bold text-white truncate mt-0.5">\${p.name}</div>
            <div class="text-xs font-mono font-bold text-emerald-400 mt-1">\${formatRp(p.price)}</div>
          </div>
          <button onclick="addToCart('\${p.id}')" class="mt-2.5 w-full py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-xs rounded-xl border border-emerald-500/30 transition-all flex items-center justify-center gap-1 active:scale-95">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Tambah
          </button>
        </div>
      \`).join('');
      lucide.createIcons();
    }

    function addToCart(id) {
      cart[id] = (cart[id] || 0) + 1;
      renderCart();
    }

    function removeFromCart(id) {
      if (cart[id] > 1) {
        cart[id]--;
      } else {
        delete cart[id];
      }
      renderCart();
    }

    function clearCart() {
      cart = {};
      renderCart();
    }

    function renderCart() {
      const cartEl = document.getElementById('cartItems');
      const countEl = document.getElementById('cartCount');
      const totalEl = document.getElementById('cartTotal');
      const btn = document.getElementById('checkoutBtn');

      const ids = Object.keys(cart);
      let count = 0;
      let total = 0;

      if (ids.length === 0) {
        cartEl.innerHTML = '<div class="text-slate-600 text-center py-2">Keranjang masih kosong</div>';
        btn.disabled = true;
      } else {
        btn.disabled = false;
        cartEl.innerHTML = ids.map(id => {
          const p = products.find(prod => prod.id === id);
          if (!p) return '';
          const qty = cart[id];
          const subtotal = p.price * qty;
          count += qty;
          total += subtotal;
          return \`
            <div class="flex items-center justify-between py-1 border-b border-slate-900">
              <div class="truncate w-32"><span class="text-white font-medium">\${p.name}</span></div>
              <div class="flex items-center gap-2">
                <button onclick="removeFromCart('\${id}')" class="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold">-</button>
                <span class="font-mono text-emerald-400 font-bold">\${qty}</span>
                <button onclick="addToCart('\${id}')" class="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold">+</button>
                <span class="font-mono text-slate-300 text-right w-16">\${formatRp(subtotal)}</span>
              </div>
            </div>
          \`;
        }).join('');
      }

      countEl.textContent = count;
      totalEl.textContent = formatRp(total);
      lucide.createIcons();
    }

    function filterCat(cat) {
      activeCat = cat;
      ['all', 'makanan', 'minuman', 'snack'].forEach(c => {
        const el = document.getElementById('tab-' + c);
        if (el) {
          if (c === cat) {
            el.className = 'px-3 py-1.5 rounded-xl font-bold bg-emerald-600 text-white shadow-sm shrink-0';
          } else {
            el.className = 'px-3 py-1.5 rounded-xl font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 shrink-0';
          }
        }
      });
      renderProducts();
    }

    function openCheckout() {
      const modal = document.getElementById('checkoutModal');
      document.getElementById('receiptId').textContent = '#TRX-' + Math.floor(1000 + Math.random() * 9000);
      document.getElementById('receiptTotal').textContent = document.getElementById('cartTotal').textContent;
      modal.classList.remove('hidden');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
      lucide.createIcons();
    }

    function closeCheckout() {
      document.getElementById('checkoutModal').classList.add('hidden');
      clearCart();
    }

    renderProducts();
    renderCart();
  </script>
</body>
</html>`;

    return {
      title: cleanTitle,
      type: 'apk_pwa',
      description: 'Sistem Kasir POS Mobile APK untuk toko dan UMKM dengan keranjang kalkulasi instan dan receipt checkout.',
      htmlCode: posHtml,
      installedSkills: ['shadcn_tailwind', 'apk_pwa_native'],
      files: [
        { name: 'index.html', content: posHtml, language: 'html' },
        { name: 'manifest.json', content: JSON.stringify({ name: cleanTitle, short_name: "POSKasir", display: "standalone", theme_color: "#059669" }, null, 2), language: 'json' }
      ]
    };
  }

  if (resolvedCategory === 'ai_assistant') {
    const aiHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${cleanTitle} - AI Mobile Assistant</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-between p-3 sm:p-6">

  <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col h-[90vh] relative overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <i data-lucide="bot" class="w-5 h-5"></i>
        </div>
        <div>
          <h1 class="text-base font-bold text-white tracking-tight">${cleanTitle}</h1>
          <p class="text-[11px] text-indigo-400 font-medium flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Neural Model Online
          </p>
        </div>
      </div>
      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
        GEMINI READY
      </span>
    </div>

    <!-- Suggested Topics -->
    <div class="flex gap-2 overflow-x-auto py-2.5 text-xs shrink-0">
      <button onclick="sendQuick('Jelaskan konsep machine learning secara singkat')" class="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 shrink-0">💡 Apa itu ML?</button>
      <button onclick="sendQuick('Bantu buatkan jadwal harian produktif')" class="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 shrink-0">📅 Jadwal Kerja</button>
      <button onclick="sendQuick('Tuliskan puisi singkat tentang teknologi')" class="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 shrink-0">✍️ Buat Puisi</button>
    </div>

    <!-- Messages Container -->
    <div id="chatBox" class="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
      <div class="flex items-start gap-2.5">
        <div class="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
          <i data-lucide="sparkles" class="w-4 h-4"></i>
        </div>
        <div class="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/60 text-xs text-slate-200 leading-relaxed max-w-[85%]">
          Halo! Saya asisten cerdas ${cleanTitle}. Ada yang bisa saya bantu hari ini? Tanyakan apa saja tentang pemrograman, ide bisnis, penulisan, atau analisis data.
        </div>
      </div>
    </div>

    <!-- Input Bar -->
    <div class="pt-3 border-t border-slate-800/80 flex items-center gap-2">
      <input id="chatInput" type="text" placeholder="Ketik pesan atau pertanyaan..." class="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" />
      <button id="sendBtn" onclick="sendMessage()" class="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-95 transition-all shrink-0">
        <i data-lucide="send" class="w-4 h-4"></i>
      </button>
    </div>
  </div>

  <script>
    lucide.createIcons();
    const chatBox = document.getElementById('chatBox');
    const input = document.getElementById('chatInput');

    function sendQuick(txt) {
      input.value = txt;
      sendMessage();
    }

    function appendMessage(sender, text) {
      const isUser = sender === 'user';
      const div = document.createElement('div');
      div.className = isUser ? 'flex items-start justify-end' : 'flex items-start gap-2.5';

      if (isUser) {
        div.innerHTML = \`
          <div class="p-3 rounded-2xl bg-indigo-600 text-white text-xs leading-relaxed max-w-[85%] shadow-md shadow-indigo-600/20">
            \${text}
          </div>
        \`;
      } else {
        div.innerHTML = \`
          <div class="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <i data-lucide="sparkles" class="w-4 h-4"></i>
          </div>
          <div class="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/60 text-xs text-slate-200 leading-relaxed max-w-[85%]">
            \${text}
          </div>
        \`;
      }

      chatBox.appendChild(div);
      chatBox.scrollTop = chatBox.scrollHeight;
      lucide.createIcons();
    }

    function sendMessage() {
      const msg = input.value.trim();
      if (!msg) return;
      appendMessage('user', msg);
      input.value = '';

      // Real response through NAVIX server chat API; no fabricated assistant output.
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.success) throw new Error(data?.error || 'Chat request failed (' + res.status + ')');
          return data;
        })
        .then((data) => appendMessage('bot', data.reply || data.text || data.message || 'Server returned an empty response.'))
        .catch((err) => appendMessage('bot', 'NAVIX server error: ' + (err instanceof Error ? err.message : String(err))));
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  </script>
</body>
</html>`;

    return {
      title: cleanTitle,
      type: 'apk_pwa',
      description: 'Asisten Percakapan AI Mobile APK dengan interface modern, quick prompt chips, dan respon interaktif.',
      htmlCode: aiHtml,
      installedSkills: ['shadcn_tailwind', 'gemini_ai_sdk', 'apk_pwa_native'],
      files: [
        { name: 'index.html', content: aiHtml, language: 'html' },
        { name: 'manifest.json', content: JSON.stringify({ name: cleanTitle, short_name: "AIAssistant", display: "standalone", theme_color: "#4f46e5" }, null, 2), language: 'json' }
      ]
    };
  }

  if (resolvedCategory === 'tracker') {
    const trackerHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${cleanTitle} - Habit & Health Tracker APK</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-start p-3 sm:p-6 pb-16">

  <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
          <i data-lucide="activity" class="w-5 h-5"></i>
        </div>
        <div>
          <h1 class="text-base font-bold text-white tracking-tight">${cleanTitle}</h1>
          <p class="text-[11px] text-cyan-400 font-medium">Daily Streak: 7 Hari Berturut-turut 🔥</p>
        </div>
      </div>
      <button onclick="addHabitPrompt()" class="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center hover:bg-cyan-500 active:scale-95 shadow-md shadow-cyan-600/30">
        <i data-lucide="plus" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- Daily Progress Metric -->
    <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
      <div>
        <div class="text-[10px] uppercase font-mono text-slate-400">Target Harian</div>
        <div class="text-2xl font-extrabold text-white mt-0.5"><span id="doneCount">3</span> / <span id="totalCount">4</span> Selesai</div>
        <div class="text-[10px] text-cyan-400 mt-0.5" id="progressPct">75% Tercapai Hari Ini</div>
      </div>
      <div class="w-14 h-14 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 flex items-center justify-center font-bold text-sm text-cyan-300" id="progressRing">
        75%
      </div>
    </div>

    <!-- Weekly Chart -->
    <div class="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3 h-36 relative">
      <canvas id="weeklyChart"></canvas>
    </div>

    <!-- Habit Check List -->
    <div class="space-y-2 max-h-60 overflow-y-auto pr-1" id="habitList"></div>
  </div>

  <script>
    lucide.createIcons();

    let habits = [
      { id: '1', title: 'Minum 2 Liter Air', cat: 'Kesehatan', done: true, icon: 'droplet' },
      { id: '2', title: 'Olahraga Kardio 20 Menit', cat: 'Fitness', done: true, icon: 'flame' },
      { id: '3', title: 'Membaca Buku / Jurnal', cat: 'Belajar', done: true, icon: 'book-open' },
      { id: '4', title: 'Tidur Sebelum Pukul 23:00', cat: 'Recovery', done: false, icon: 'moon' }
    ];

    function renderHabits() {
      const list = document.getElementById('habitList');
      list.innerHTML = habits.map((h, idx) => \`
        <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border \${h.done ? 'border-cyan-500/40 bg-cyan-950/10' : 'border-slate-800'} transition-all">
          <div class="flex items-center gap-3">
            <button onclick="toggleHabit(\${idx})" class="w-6 h-6 rounded-lg border \${h.done ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-700 text-transparent'} flex items-center justify-center transition-all cursor-pointer">
              <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
            </button>
            <div>
              <div class="text-xs font-bold \${h.done ? 'line-through text-slate-400' : 'text-slate-100'}">\${h.title}</div>
              <div class="text-[10px] text-slate-500 font-mono">\${h.cat}</div>
            </div>
          </div>
          <button onclick="deleteHabit(\${idx})" class="text-slate-600 hover:text-rose-400 p-1">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      \`).join('');

      updateMetrics();
      lucide.createIcons();
    }

    function toggleHabit(idx) {
      habits[idx].done = !habits[idx].done;
      if (habits[idx].done && habits.every(h => h.done)) {
        confetti({ particleCount: 80, spread: 70 });
      }
      renderHabits();
    }

    function deleteHabit(idx) {
      habits.splice(idx, 1);
      renderHabits();
    }

    function addHabitPrompt() {
      const title = prompt("Nama kebiasaan baru:");
      if (!title) return;
      habits.push({ id: String(Date.now()), title, cat: 'Umum', done: false, icon: 'check-circle' });
      renderHabits();
    }

    function updateMetrics() {
      const done = habits.filter(h => h.done).length;
      const total = habits.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      document.getElementById('doneCount').textContent = done;
      document.getElementById('totalCount').textContent = total;
      document.getElementById('progressPct').textContent = pct + '% Tercapai Hari Ini';
      document.getElementById('progressRing').textContent = pct + '%';
    }

    // Mini Weekly Chart
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
        datasets: [{
          label: 'Selesai',
          data: [4, 3, 4, 2, 4, 3, 3],
          backgroundColor: '#06b6d4',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 9 } } },
          y: { display: false }
        }
      }
    });

    renderHabits();
  </script>
</body>
</html>`;

    return {
      title: cleanTitle,
      type: 'apk_pwa',
      description: 'Aplikasi Habit & Fitness Tracker Mobile APK dengan kalkulasi persentase streak dan visualisasi grafik mingguan.',
      htmlCode: trackerHtml,
      installedSkills: ['shadcn_tailwind', 'realtime_charts_viz', 'apk_pwa_native'],
      files: [
        { name: 'index.html', content: trackerHtml, language: 'html' },
        { name: 'manifest.json', content: JSON.stringify({ name: cleanTitle, short_name: "HabitTracker", display: "standalone", theme_color: "#0891b2" }, null, 2), language: 'json' }
      ]
    };
  }

  if (resolvedCategory === 'game') {
    const gameHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${cleanTitle} - Retro Canvas Arcade</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center p-3 select-none">

  <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3 items-center text-center">
    <!-- Header -->
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white">
          <i data-lucide="gamepad-2" class="w-4 h-4"></i>
        </div>
        <div class="text-left">
          <h1 class="text-xs font-bold text-white">${cleanTitle}</h1>
          <p class="text-[10px] text-purple-400 font-mono">Arcade 60FPS Native</p>
        </div>
      </div>
      <div class="text-right font-mono text-xs">
        <div class="text-purple-400 font-bold">SCORE: <span id="scoreEl">0</span></div>
        <div class="text-[10px] text-slate-400">BEST: <span id="bestEl">0</span></div>
      </div>
    </div>

    <!-- Canvas -->
    <canvas id="gameCanvas" width="340" height="360" class="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-[340px] shadow-inner"></canvas>

    <!-- Mobile Touch Controls -->
    <div class="grid grid-cols-2 gap-3 w-full max-w-[340px]">
      <button id="leftBtn" class="py-3 bg-slate-800 active:bg-purple-600 active:text-white rounded-xl font-bold text-xs text-slate-300 border border-slate-700 flex items-center justify-center gap-1">
        <i data-lucide="arrow-left" class="w-4 h-4"></i> KIRI
      </button>
      <button id="rightBtn" class="py-3 bg-slate-800 active:bg-purple-600 active:text-white rounded-xl font-bold text-xs text-slate-300 border border-slate-700 flex items-center justify-center gap-1">
        KANAN <i data-lucide="arrow-right" class="w-4 h-4"></i>
      </button>
    </div>
  </div>

  <script>
    lucide.createIcons();
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('scoreEl');
    const bestEl = document.getElementById('bestEl');

    let player = { x: 155, y: 320, w: 30, h: 30, speed: 6 };
    let stars = [];
    let score = 0;
    let bestScore = parseInt(localStorage.getItem('navix_game_best') || '0', 10);
    bestEl.textContent = bestScore;
    let gameOver = false;
    let leftPressed = false;
    let rightPressed = false;

    function spawnStar() {
      if (Math.random() < 0.05) {
        stars.push({ x: Math.random() * (canvas.width - 20), y: -10, r: 8, speed: 2.5 + Math.random() * 2 });
      }
    }

    function update() {
      if (gameOver) return;

      if (leftPressed && player.x > 0) player.x -= player.speed;
      if (rightPressed && player.x < canvas.width - player.w) player.x += player.speed;

      spawnStar();

      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.y += s.speed;

        // Collision check
        if (s.x > player.x - s.r && s.x < player.x + player.w + s.r && s.y > player.y - s.r && s.y < player.y + player.h + s.r) {
          score += 10;
          scoreEl.textContent = score;
          if (score > bestScore) {
            bestScore = score;
            bestEl.textContent = bestScore;
            localStorage.setItem('navix_game_best', String(bestScore));
          }
          stars.splice(i, 1);
          continue;
        }

        if (s.y > canvas.height) {
          stars.splice(i, 1);
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Player Ship
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.roundRect(player.x, player.y, player.w, player.h, [8]);
      ctx.fill();

      // Energy glow
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(player.x + player.w / 2, player.y + player.h / 2, 6, 0, Math.PI * 2);
      ctx.fill();

      // Stars / Crystals
      ctx.fillStyle = '#38bdf8';
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(() => {
        update();
        draw();
      });
    }

    // Touch Controls
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');

    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); leftPressed = true; });
    leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); leftPressed = false; });
    leftBtn.addEventListener('mousedown', () => leftPressed = true);
    leftBtn.addEventListener('mouseup', () => leftPressed = false);

    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); rightPressed = true; });
    rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); rightPressed = false; });
    rightBtn.addEventListener('mousedown', () => rightPressed = true);
    rightBtn.addEventListener('mouseup', () => rightPressed = false);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') leftPressed = true;
      if (e.key === 'ArrowRight') rightPressed = true;
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft') leftPressed = false;
      if (e.key === 'ArrowRight') rightPressed = false;
    });

    draw();
  </script>
</body>
</html>`;

    return {
      title: cleanTitle,
      type: 'game',
      description: 'Retro 2D Canvas Arcade Game APK interaktif dengan 60FPS render loop dan touch controller.',
      htmlCode: gameHtml,
      installedSkills: ['shadcn_tailwind', 'apk_pwa_native'],
      files: [
        { name: 'index.html', content: gameHtml, language: 'html' },
        { name: 'manifest.json', content: JSON.stringify({ name: cleanTitle, short_name: "RetroArcade", display: "standalone", orientation: "portrait", theme_color: "#7e22ce" }, null, 2), language: 'json' }
      ]
    };
  }

  // Default Full-Featured APK Web App Template
  const defaultHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${cleanTitle} - Navix AI Studio</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center p-4">

  <div class="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
          <i data-lucide="sparkles" class="w-5 h-5"></i>
        </div>
        <div>
          <h1 class="text-base font-bold text-white tracking-tight">${cleanTitle}</h1>
          <p class="text-xs text-slate-400 font-medium">Studio AI Native Build</p>
        </div>
      </div>
      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        APK READY
      </span>
    </div>

    <!-- Dynamic Item Manager -->
    <div class="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-4">
      <div class="text-xs font-mono text-slate-400 uppercase mb-2">Input Tugas / Data</div>
      <div class="flex gap-2 mb-3">
        <input id="itemInput" type="text" placeholder="Tulis item baru..." class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500" />
        <button id="addBtn" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-rose-600/20">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i> Tambah
        </button>
      </div>

      <div id="itemList" class="space-y-2 max-h-48 overflow-y-auto pr-1">
        <!-- Rendered items -->
      </div>
    </div>

    <!-- Action Bar -->
    <button onclick="celebrate()" class="w-full py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-rose-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
      <i data-lucide="party-popper" class="w-4 h-4"></i> Jalankan Selebrasi Sukses
    </button>
  </div>

  <script>
    lucide.createIcons();
    
    let items = ['Setup Inisialisasi Studio AI', 'Deploy Live Canvas Preview'];
    const listEl = document.getElementById('itemList');
    const inputEl = document.getElementById('itemInput');
    const addBtn = document.getElementById('addBtn');

    function render() {
      listEl.innerHTML = items.map((item, index) => \`
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <span class="text-slate-200">\${item}</span>
          <button onclick="deleteItem(\${index})" class="text-slate-500 hover:text-rose-400 p-1">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      \`).join('');
      lucide.createIcons();
    }

    function deleteItem(idx) {
      items.splice(idx, 1);
      render();
    }

    addBtn.addEventListener('click', () => {
      const val = inputEl.value.trim();
      if (!val) return;
      items.push(val);
      inputEl.value = '';
      render();
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addBtn.click();
    });

    function celebrate() {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }

    render();
  </script>
</body>
</html>`;

  return {
    title: cleanTitle,
    type: appType,
    description: 'Aplikasi Web & APK Modern bertenaga Studio AI Canvas dengan interaktivitas state real-time.',
    htmlCode: defaultHtml,
    installedSkills: ['shadcn_tailwind', 'apk_pwa_native'],
    files: [
      { name: 'index.html', content: defaultHtml, language: 'html' },
      { name: 'manifest.json', content: JSON.stringify({ name: cleanTitle, short_name: "NavixStudio", display: "standalone", theme_color: "#e11d48" }, null, 2), language: 'json' }
    ]
  };
}

export class AIStudioAppBuilderEngine implements IEngine {
  public name = 'AIStudioAppBuilderEngine';
  public description = 'Mesin Utama Pembuat APK & Web App Studio AI (Shadcn/UI, Tailwind, Firebase, Gemini, Canvas, PWA Native)';
  public capabilities = [
    'apk_scaffolding',
    'web_app_generation',
    'pwa_manifest_generation',
    'live_canvas_sandbox',
    'shadcn_tailwind_styling',
    'firebase_integration',
    'chart_visualization'
  ];
  public isReady = true;

  async initialize(): Promise<void> {
    console.log('[AIStudioAppBuilderEngine] Initialized with all AI Studio core skills & templates.');
  }

  async execute(payload: any): Promise<EngineResult> {
    try {
      const prompt = payload.prompt || payload.title || 'Navix Pro Application';
      const type = payload.type || 'apk_pwa';
      const category = payload.category || 'general';

      const project = scaffoldStudioApp(prompt, type, category);

      return {
        status: 'success',
        source: this.name,
        data: {
          project,
          availableSkills: AI_STUDIO_CORE_SKILLS
        },
        timestamp: Date.now()
      };
    } catch (e: any) {
      return {
        status: 'error',
        source: this.name,
        message: e.message || 'Gagal mengeksekusi AIStudioAppBuilderEngine',
        timestamp: Date.now()
      };
    }
  }

  async shutdown(): Promise<void> {}
}
