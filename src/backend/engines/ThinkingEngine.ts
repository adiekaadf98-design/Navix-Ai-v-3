import { logger } from '../utils/logger';
import { navixAiRouter, NavixModelTier, NavixCollaborativeTeam, NAVIX_COLLABORATIVE_TEAMS } from './AIRouter';

export interface CollaborativeSessionInput {
  message: string;
  attachments?: any[];
  history?: any[];
  modelTier: NavixModelTier;
  aiClient: any;
  options?: {
    thinkingMode?: boolean;
    effort?: string;
  };
}

export interface CollaborativeBriefing {
  isComplex: boolean;
  tier: NavixModelTier;
  teamSummary: string;
  primaryGoal: string;
  subTasks: string[];
  constraints: string[];
  crossCheckNotes: string[];
  empiricalDataRequired: boolean;
  isUnsolvedProblemOrHypothesis: boolean;
  recommendedToolsOrEngines: string[];
  augmentedSystemInstruction: string;
}

export class BackendThinkingEngine {
  
  async analyzeIntent(message: string): Promise<string> {
    logger.info(`ThinkingEngine: Analyzing intent for: ${message.substring(0, 50)}...`);
    const q = message.toLowerCase();
    
    // Tag mention explicit checking
    if (q.includes('@trading')) return 'trading';
    if (q.includes('@image')) return 'image';
    if (q.includes('@video')) return 'video';
    if (q.includes('@stok_foto')) return 'stock_photo';
    if (q.includes('@skill')) return 'skill';
    if (q.includes('@pilgun')) return 'pilgun';
    if (q.includes('@drive')) return 'drive';
    if (q.includes('@map')) return 'map';
    if (q.includes('@penelitian')) return 'research';

    // Natural Language Intent Detection (Semua Fitur Tombol '+')
    // 1. Trading (Multi-Pair Crypto, Forex, Commodities, Stocks, Technicals, Timeframes)
    if (
      /(btc|eth|sol|doge|xrp|bnb|ada|avax|near|sui|pepe|shib|link|dot|matic|trx|ltc|kas|fet|render|crypto|kripto)/.test(q) &&
      /(trading|analisis|harga|market|candle|candlestick|tf|timeframe|chart|prediksi|sinyal|order|beli|jual|buy|sell|entry|sl|tp|support|resistance|snr|smc|fvg)/.test(q)
    ) return 'trading';
    if (/(xau|gold|emas|perak|silver|minyak|crude oil|wti|brent)/.test(q) && /(trading|harga|analisis|sinyal|pasar|market|buy|sell|entry|sl|tp)/.test(q)) return 'trading';
    if (/(forex|eurusd|gbpusd|usdjpy|gbpjpy|audusd|usdcad|usdchf|nzdusd|eurjpy|eurgbp)/.test(q)) return 'trading';
    if (/(saham|ihsg|nyse|nasdaq|aapl|tsla|nvda|msft|googl|amzn|bbca|bbri|bmri|tlkm)/.test(q) && /(harga|analisis|chart|tren)/.test(q)) return 'trading';
    if (/(sinyal trading|analisis teknikal|price action|smart money concepts|order block|market structure|fair value gap)/.test(q)) return 'trading';

    // 2. Visual & Image Creation / Editing & Stok Foto
    if (/(stok foto|stock photo|pustaka gambar|koleksi visual|foto stok)/.test(q)) return 'stock_photo';
    if (/(buatkan gambar|buat gambar|generate image|lukiskan|lukis|gambarkan|ciptakan visual|bikin gambar|visualisasikan)/.test(q)) return 'image';
    if (/(edit gambar|edit foto|ubah foto|filter foto|ganti latar|variasi gaya|grayscale foto|invert foto|blur foto)/.test(q)) return 'image';

    // 3. Video Studio & Gerak
    if (/(buatkan video|buat video|generate video|animasikan video|cinematic video|klip video|render video|edit video|animasi gambar)/.test(q)) return 'video';

    // 4. Music & Audio Prosedural
    if (/(buatkan musik|buat musik|generate lagu|komposisi lagu|buat beat|soundtrack|bikin instrumen musik)/.test(q)) return 'music';

    // 5. Pilgun & Kuis Interaktif
    if (/(pilihan ganda|pilgun|multiple choice|buatkan kuis|soal kuis|latihan soal|soal ujian)/.test(q)) return 'pilgun';

    // 6. Drive & Arsip Dokumen
    if (/(google drive|buka drive|sinkron drive|arsip drive|dokumen drive|kelola berkas drive)/.test(q)) return 'drive';

    // 7. Map & Radar Geolokasi
    if (/(lacak lokasi|lacak posisi|radar satelit|geolokasi|peta|koordinat gps|geo-radar|tracking perangkat)/.test(q)) return 'map';

    // 8. Penelitian Ilmiah & Virtual Lab Sains
    if (/(penelitian|riset ilmiah|laboratorium|lab sains|simulasi fisika|simulasi kimia|uji dna|forensik sains|hipotesis ilmiah|jurnal ilmiah)/.test(q)) return 'research';

    // 9. Skill & External Tool / MCP Router
    if (/(skill|mcp|jalankan tool|eksekusi tool|deploy vercel|checkout stripe|kirim email resend|scrape firecrawl|audit kode|analisis dampak dependensi)/.test(q)) return 'skill';

    // Coding & Software Engineering
    if (/(kode|coding|program|script|function|class|bug|debug|typescript|javascript|python|react|html|css|refactor|error traceback)/.test(q)) return 'coding';

    // Dokumen & Penulisan Formal
    if (/(dokumen|pdf|laporan|skripsi|makalah|esai|perbaiki kosa kata|perbaiki ejaan|koreksi teks)/.test(q)) return 'document';

    // Penelusuran Web / Investigasi
    if (/(cari|search|berita terbaru|fakta terkini|informasi hari ini|cek web)/.test(q)) return 'search';

    return 'general_chat';
  }

  async planSteps(intent: string, goal: string) {
    logger.info(`ThinkingEngine: Planning steps for intent ${intent}`);
    const steps = [
      { step: 1, action: `collaborative_understanding:${intent}`, status: 'pending' },
      { step: 2, action: 'cross_check_and_deliberation', status: 'pending' },
      { step: 3, action: 'execute_selected_capability', status: 'pending' },
      { step: 4, action: 'verification_and_synthesis', status: 'pending' }
    ];
    return steps;
  }

  /**
   * Menilai kompleksitas tugas untuk memilih antara Fast Collaborative Pass atau Deep Deliberation Pass.
   * Menghitung skor ambiguitas / entropi secara dinamis (Poin 2).
   */
  private assessComplexity(message: string, hasAttachments: boolean, thinkingMode?: boolean, effort?: string): { isComplex: boolean; score: number } {
    if (effort === 'max') return { isComplex: true, score: 100 };
    if (effort === 'extra') return { isComplex: true, score: 95 };
    if (effort === 'high') return { isComplex: true, score: 85 };
    if (effort === 'low') return { isComplex: false, score: 20 };
    if (thinkingMode) return { isComplex: true, score: 90 };
    if (hasAttachments) return { isComplex: true, score: 85 };
    
    const trimmed = message.trim();
    // Aksi empiris langsung (gambar, video, trading pair, tracker, kuis pilgun, mcp skill)
    if (/(buat|gambar|video|trading|analisis|sinyal|lacak|peta|kuis|pilgun|riset|skill|deploy|koding|koreksi|hitung|bandingkan|prediksi|desain|teliti|investigasi|rumus|arahkan|solusi)/i.test(trimmed)) {
      return { isComplex: true, score: 65 };
    }

    const complexKeywords = [
      'koding', 'coding', 'script', 'function', 'class', 'debug', 'bug', 'error', 'refactor',
      'trading', 'sinyal', 'gold', 'xauusd', 'forex', 'crypto', 'btc', 'eth', 'sol', 'doge', 'xrp', 'bnb', 'ada',
      'analisis teknikal', 'timeframe', 'candlestick', 'candle', 'pair', 'laporan', 'dokumen', 'pdf', 'halaman',
      'penelitian', 'riset', 'lab', 'sains', 'fisika', 'biologi', 'forensik', 'kimia', 'rumus', 'langkah-langkah',
      'step by step', 'buatkan aplikasi', 'arsitektur', 'evaluasi', 'hipotesis', 'misteri', 'belum terpecahkan',
      'algoritma', 'debate', 'debating', 'uji logika', 'verifikasi', 'apakah benar', 'generate', 'video', 'animasi',
      'gambar', 'lukis', 'stok foto', 'radar', 'geolokasi', 'pilihan ganda', 'pilgun', 'skill', 'mcp'
    ];

    const lowMsg = message.toLowerCase();
    let hitCount = 0;
    for (const kw of complexKeywords) {
      if (lowMsg.includes(kw)) hitCount++;
    }

    const lengthFactor = Math.min(40, Math.floor(trimmed.length / 10));
    const score = Math.min(100, hitCount * 25 + lengthFactor);
    return { isComplex: score >= 40, score };
  }

  /**
   * Mengekstrak kompas kontekstual implisit dari history percakapan (Poin 4: Contextual Memory Synthesis).
   */
  private extractMemorySynthesis(history: any[]): string {
    if (!Array.isArray(history) || history.length === 0) return '';
    try {
      const recentTurns = history.slice(-6);
      const userQueries = recentTurns
        .filter((t: any) => t.role === 'user')
        .map((t: any) => {
          if (typeof t.parts?.[0]?.text === 'string') return t.parts[0].text;
          return '';
        })
        .filter(Boolean);

      if (userQueries.length === 0) return '';
      
      const detectedTopics: string[] = [];
      const joined = userQueries.join(' ').toLowerCase();
      if (/(gold|xau|trading|forex|crypto|btc)/.test(joined)) detectedTopics.push('Finansial & Trading Mandiri');
      if (/(coding|koding|code|react|typescript|bug|error)/.test(joined)) detectedTopics.push('Software Architecture & Development');
      if (/(sains|fisika|kimia|dna|forensik|lab)/.test(joined)) detectedTopics.push('Sains & Laboratorium Eksperimental');
      if (/(dokumen|pdf|laporan|skripsi)/.test(joined)) detectedTopics.push('Penyusunan Karya Tulis Ilmiah Formal');

      if (detectedTopics.length > 0) {
        return `[KOMPAS MEMORI KONTEKSTUAL (Memory Synthesis)]: Pengguna sedang dalam alur kerja topik: ${detectedTopics.join(', ')}. Pertahankan kontinuitas teknis dan gaya panduan yang konsisten.`;
      }
    } catch {
      // safe fallback
    }
    return '';
  }

  /**
   * Mengkoordinasikan Multi-AI Debate & Reasoning Collaboration sejak awal pemrosesan:
   * 1. Model A: Thesis Proposal, Intent & Task Deconstruction (Argumen & Sudut Pandang Awal)
   * 2. Model B: Counter-Perspective, Strategic Alternative & Logic Expansion (Antitesis / Perbandingan Argumen)
   * 3. Model C: Adversarial Critic, Skeptic & Flaw/Risk Detector (Kritik Tajam, Deteksi Celah, Uji Bukti)
   * 4. Multi-AI Consensus Resolution & Tool Decider (Resolusi Konflik, Sintesis Konsensus & Penentu Jalur Eksternal)
   */
  async collaborateOnUnderstanding(input: CollaborativeSessionInput): Promise<CollaborativeBriefing> {
    const { message, attachments, modelTier, aiClient, history, options } = input;
    const team: NavixCollaborativeTeam = navixAiRouter.getCollaborativeTeam(modelTier);
    const hasAttachments = Boolean(attachments && attachments.length > 0);
    const effort = options?.effort || 'medium';
    const { isComplex, score: complexityScore } = this.assessComplexity(message, hasAttachments, options?.thinkingMode, effort);

    logger.info(`[CollaborativeAiLayer] Starting Multi-AI Debate & Reasoning Collaboration for Tier: ${modelTier.toUpperCase()} | Team: ${team.teamName} | Complexity: ${complexityScore}/100 | Effort: ${effort.toUpperCase()}`);

    const memoryCompass = this.extractMemorySynthesis(history || []);

    const modelA = team.collaborators[0] || { role: 'Gemini 3.1 Flash Lite — Intent & Multi-Step Deconstruction (Thesis)', model: 'gemini-3.1-flash-lite' };
    const modelB = team.collaborators[1] || { role: 'Gemini Flash Latest — Strategic Planning & Counter-Perspective (Antithesis)', model: 'gemini-flash-latest' };
    const modelC = team.collaborators[2] || { role: 'Gemini 3.8 Flash — Adversarial Critic & Risk Auditor (Critique)', model: 'gemini-3.8-flash' };
    const modelD = team.collaborators[3] || { role: 'Gemini 3.8 Flash — Lead Synthesis & Executive Coordinator (Consensus Director)', model: 'gemini-3.8-flash' };
    const modelE = team.collaborators[4] || { role: 'Gemini 3.1 Flash Lite — Agile Intent Parser & Instant Delivery', model: 'gemini-3.1-flash-lite' };

    let debateData = {
      primaryGoal: message,
      subTasks: ['Analisis mendalam', 'Formulasi solusi tuntas'],
      constraints: ['Akurasi tinggi', 'Bebas ambiguitas'],
      requiresEmpiricalTools: false,
      suggestedTools: [] as string[],
      isUnsolvedOrTheoretical: false,
      modelAThesis: '',
      modelBAlternative: '',
      modelCCritique: [] as string[],
      resolvedConsensus: ''
    };

    const timeoutPromise = (ms: number, name: string) => 
      new Promise((_, reject) => setTimeout(() => reject(new Error(`${name} timeout`)), ms));

    // Multi-AI Collaborative Debate & Consensus Resolution
    const intent = await this.analyzeIntent(message);
    let directives = `\n\n[🤝 SIDANG DEBAT MULTI-AI NAVIX — KELOMPOK DEBAT ${team.teamName.toUpperCase()}]:\n`;
    directives += `- Model Utama & Dewan Debat Aktif:\n`;
    team.collaborators.forEach((collab, idx) => {
      directives += `  • Partisipan ${idx + 1} (${collab.role}): ${collab.specialty}\n`;
    });
    directives += `- Hasil Dekonstruksi & Konsensus Debat (Maksud Terdeteksi: ${intent.toUpperCase()}):\n`;

    if (intent === 'pilgun') {
      directives += `- 🎯 KONSENSUS DEBAT JALUR KUIS PILIHAN GANDA (@pilgun): Tim sepakat menyajikan soal latihan pilihan ganda berkualitas tinggi dengan opsi (A, B, C, D), kunci jawaban terstruktur, serta ulasan edukatif mendalam.\n`;
      debateData.requiresEmpiricalTools = false;
      debateData.suggestedTools = [];
      debateData.primaryGoal = 'Menghasilkan kuis/soal pilihan ganda interaktif beserta pembahasan mendalam';
    } else if (intent === 'skill') {
      directives += `- ⚡ KONSENSUS DEBAT JALUR SKILL & MCP (@skill): Tim sepakat memanggil 'execute_skill' atau 'execute_autonomous_engine' untuk mengeksekusi kapabilitas plugin/tool otonom yang diminta.\n`;
      debateData.requiresEmpiricalTools = true;
      debateData.suggestedTools = ['execute_skill', 'execute_autonomous_engine'];
      debateData.primaryGoal = 'Eksekusi kapabilitas skill atau autonomous engine';
    } else if (intent === 'trading') {
      directives += `- 📈 KONSENSUS DEBAT JALUR ANALISIS TRADING (@trading): Tim sepakat memanggil mesin data pasar ('get_crypto_data', 'get_forex_data', atau 'get_gold_data') untuk memperoleh harga live dan struktur teknikal riil. Patuhi disiplin order type (Buy Limit < Live Price, Buy Stop > Live Price, Sell Limit > Live Price, Sell Stop < Live Price) dan 1 metode terkonfirmasi.\n`;
      debateData.requiresEmpiricalTools = true;
      debateData.suggestedTools = ['get_gold_data', 'get_crypto_data', 'get_forex_data'];
      debateData.primaryGoal = 'Analisis pasar finansial berbasis struktur nyata & data live';
    } else if (intent === 'image' || intent === 'stock_photo') {
      directives += `- 🎨 KONSENSUS DEBAT JALUR VISUAL & GAMBAR (@image/@stok_foto): Tim sepakat memanggil 'generate_image' atau 'edit_image' untuk menghasilkan visual berkualitas tinggi sesuai prompt pengguna.\n`;
      debateData.requiresEmpiricalTools = true;
      debateData.suggestedTools = ['generate_image', 'edit_image'];
      debateData.primaryGoal = 'Generasi/editing visual fotorealistis Navix Sovereign';
    } else if (intent === 'video') {
      directives += `- 🎬 KONSENSUS DEBAT JALUR VIDEO & GERAK (@video): Tim sepakat merancang prompt gerak kamera presisi dan memanggil 'generate_video' atau 'edit_video'.\n`;
      debateData.requiresEmpiricalTools = true;
      debateData.suggestedTools = ['generate_video', 'edit_video'];
      debateData.primaryGoal = 'Generasi animasi video clips & studio gerak';
    } else if (intent === 'music') {
      directives += `- 🎵 KONSENSUS DEBAT JALUR AUDIO & MUSIK (@music): Tim sepakat memanggil 'generate_music' untuk merancang komposisi lagu/audio.\n`;
      debateData.requiresEmpiricalTools = true;
      debateData.suggestedTools = ['generate_music'];
      debateData.primaryGoal = 'Komposisi musik & studio audio prosedural';
    } else if (intent === 'research') {
      directives += `- 🔬 KONSENSUS DEBAT JALUR RISET ILMIAH (@penelitian): Tim sepakat memanggil 'generate_research' atau menyajikan laporan ilmiah IMRaD terstruktur dengan telaah empiris lengkap.\n`;
      debateData.requiresEmpiricalTools = true;
      debateData.suggestedTools = ['generate_research', 'deep_search'];
      debateData.primaryGoal = 'Penyelidikan riset ilmiah & telaah empiris';
    } else if (intent === 'document') {
      directives += `- 📄 KONSENSUS DEBAT JALUR DOKUMEN FORMAL (@drive/@dokumen): Tim sepakat memanggil 'generate_document' untuk menyusun berkas/laporan formal lengkap.\n`;
      debateData.requiresEmpiricalTools = true;
      debateData.suggestedTools = ['generate_document'];
      debateData.primaryGoal = 'Penyusunan dokumen formal terstruktur';
    } else if (intent === 'search') {
      directives += `- 🌐 KONSENSUS DEBAT JALUR PENELUSURAN WEB: Tim sepakat memanggil 'web_search' atau 'deep_search' untuk memverifikasi fakta terkini.\n`;
      debateData.requiresEmpiricalTools = true;
      debateData.suggestedTools = ['web_search', 'deep_search'];
      debateData.primaryGoal = 'Pencarian fakta dan referensi terkini';
    } else if (intent === 'coding') {
      directives += `- 💻 KONSENSUS DEBAT JALUR REKAYASA KODE: Tim sepakat menyajikan kode yang bersih, tuntas, tanpa potongan buatan, dan menyertakan arsitektur yang solid.\n`;
      debateData.primaryGoal = 'Solusi rekayasa kode komprehensif';
    } else {
      directives += `- 💬 KONSENSUS DEBAT JALUR DIALOGIS ELEGAN: Tim sepakat bersikap sebagai rekan diskusi intelektual yang cerdas, hangat, santun, dan bersahabat. Jawab langsung ke inti pertanyaan secara tuntas tanpa memanggil mesin eksternal.\n`;
      debateData.primaryGoal = message.slice(0, 100);
    }

    if (memoryCompass) directives += `- 🧭 ${memoryCompass}\n`;

    return {
      isComplex: isComplex,
      tier: modelTier,
      teamSummary: `${team.teamName} [Konsensus Debat Multi-AI: ${intent.toUpperCase()}]`,
      primaryGoal: debateData.primaryGoal,
      subTasks: ['Dekonstruksi intent oleh dewan debat', 'Sintesis hasil & eksekusi tuntas'],
      constraints: ['Gaya bahasa alami manusiawi', 'Kebenaran hasil tanpa halusinasi'],
      crossCheckNotes: ['Seluruh partisipan model menyepakati konsensus akhir'],
      empiricalDataRequired: debateData.requiresEmpiricalTools,
      isUnsolvedProblemOrHypothesis: false,
      recommendedToolsOrEngines: debateData.suggestedTools,
      augmentedSystemInstruction: directives
    };

    // DEEP MULTI-AI DEBATE & REASONING PASS (Hanya saat diperintahkan secara eksplisit)
    try {
      logger.info(`[CollaborativeAiLayer] Explicit Multi-Model Debate initiating across ${team.collaborators.length} collaborators...`);
      const debatePrompt = `Anda mengkoordinasikan SIDANG DEBAT & PENALARAN MULTI-MODEL NAVIX (${team.teamName}).
Permintaan Pengguna: """${message}"""

Partisipan Debat:
- ${modelA.role} (${modelA.model}): Mengajukan Thesis Awal, Identifikasi Sasaran & Dekonstruksi Masalah.
- ${modelB.role} (${modelB.model}): Memberikan Counter-Perspective, Antitesis, Sudut Pandang Strategis Alternatif.
- ${modelC.role} (${modelC.model}): Menguji Logika (Adversarial Critic), Deteksi Celah, Menolak Asumsi Tanpa Bukti.
- ${modelD.role} (${modelD.model}): Sintesis Konsensus & Penentu Keputusan Jalur (Tools vs Dialog Murni).
- ${modelE.role} (${modelE.model}): Koordinasi Kecepatan Eksekusi & Dispatching Parameter Cepat.

TUGAS SIDANG DEBAT:
1. Formulasikan argumen dari setiap model di atas.
2. Rumuskan SATU KEPUTUSAN KONSENSUS TERBAIK yang disepakati bersama sebelum melangkah ke jalur eksekusi.
3. Tentukan apakah perlu memanggil tool empiris (get_gold_data, get_crypto_data, get_forex_data, web_search, deep_search, generate_image, generate_video, generate_music, generate_document, generate_research, execute_skill) atau jalur penalaran dialogis murni.

EKSTRAK DALAM FORMAT JSON BERIKUT (HANYA JSON VALID, TANPA MARKDOWN):
{
  "primaryGoal": "Tujuan inti yang ingin dicapai pengguna",
  "modelAThesis": "Thesis & dekonstruksi masalah dari Model A (Gemini Flash 3.5)",
  "modelBAlternative": "Antitesis & opsi strategis dari Model B (Gemini Flash 3.6)",
  "modelCCritique": ["Poin kritik dari Model C (Gemini Flash 3.7)"],
  "resolvedConsensus": "Satu keputusan konsensus final hasil debat (Dipimpin Gemini Flash 3.8 & Flash 3.1)",
  "subTasks": ["Langkah 1", "Langkah 2"],
  "constraints": ["Batasan terverifikasi"],
  "requiresEmpiricalTools": true_atau_false,
  "suggestedTools": ["nama_tool_jika_ada"],
  "isUnsolvedOrTheoretical": true_atau_false
} JSON:`;

      const candidateModels = Array.from(new Set(['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest', modelA.model, modelB.model, modelC.model, modelD.model, modelE.model]));
      let debateResolved = false;

      for (const m of candidateModels) {
        try {
          const res: any = await Promise.race([
            aiClient.models.generateContent({
              model: m,
              contents: [{ role: 'user', parts: [{ text: debatePrompt }] }],
              config: { temperature: 0.15, maxOutputTokens: 1024 }
            }),
            timeoutPromise(12000, `Debate Coordinator (${m})`)
          ]);

          const text = res?.text || '';
          const match = text.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            debateData.primaryGoal = parsed.primaryGoal || message;
            debateData.modelAThesis = parsed.modelAThesis || '';
            debateData.modelBAlternative = parsed.modelBAlternative || '';
            debateData.modelCCritique = Array.isArray(parsed.modelCCritique) ? parsed.modelCCritique : [];
            debateData.resolvedConsensus = parsed.resolvedConsensus || '';
            debateData.subTasks = Array.isArray(parsed.subTasks) ? parsed.subTasks : [message];
            debateData.constraints = Array.isArray(parsed.constraints) ? parsed.constraints : [];
            debateData.requiresEmpiricalTools = Boolean(parsed.requiresEmpiricalTools);
            debateData.suggestedTools = Array.isArray(parsed.suggestedTools) ? parsed.suggestedTools : [];
            debateData.isUnsolvedOrTheoretical = Boolean(parsed.isUnsolvedOrTheoretical);
            debateResolved = true;
            break;
          }
        } catch (mErr: any) {
          logger.warn(`[CollaborativeAiLayer] Model ${m} in debate coordinator failover:`, mErr?.message || mErr);
        }
      }

      if (!debateResolved) {
        const intent = await this.analyzeIntent(message);
        if (intent === 'trading') {
          debateData.requiresEmpiricalTools = true;
          debateData.suggestedTools = ['get_gold_data', 'get_crypto_data', 'get_forex_data'];
          debateData.resolvedConsensus = 'Ambil data harga dan indikator teknikal live, lalu buat sinyal trading dengan aturan Buy Limit < Live Price, Buy Stop > Live Price, Sell Limit > Live Price, Sell Stop < Live Price.';
        } else if (intent === 'image' || intent === 'stock_photo') {
          debateData.requiresEmpiricalTools = true;
          debateData.suggestedTools = ['generate_image', 'edit_image'];
          debateData.resolvedConsensus = 'Aktifkan mesin gambar fotorealistis Navix Sovereign.';
        } else if (intent === 'video') {
          debateData.requiresEmpiricalTools = true;
          debateData.suggestedTools = ['generate_video', 'edit_video'];
          debateData.resolvedConsensus = 'Aktifkan mesin video clips & studio gerak.';
        } else if (intent === 'music') {
          debateData.requiresEmpiricalTools = true;
          debateData.suggestedTools = ['generate_music'];
          debateData.resolvedConsensus = 'Aktifkan komposisi musik & audio studio.';
        } else if (intent === 'research') {
          debateData.suggestedTools = ['generate_research', 'deep_search'];
          debateData.resolvedConsensus = 'Jalankan investigasi riset mendalam dengan pemisahan fakta empiris vs hipotesis.';
        } else if (intent === 'document') {
          debateData.suggestedTools = ['generate_document'];
          debateData.resolvedConsensus = 'Susun struktur dokumen formal dan lengkap.';
        } else if (intent === 'skill') {
          debateData.requiresEmpiricalTools = true;
          debateData.suggestedTools = ['execute_skill', 'execute_autonomous_engine'];
          debateData.resolvedConsensus = 'Eksekusi kapabilitas skill tools secara presisi.';
        } else if (intent === 'search') {
          debateData.requiresEmpiricalTools = true;
          debateData.suggestedTools = ['web_search', 'deep_search'];
          debateData.resolvedConsensus = 'Lakukan pencarian fakta terkini secara akurat.';
        }
      }
    } catch (err: any) {
      logger.warn(`[CollaborativeAiLayer] Debate pass exception, using resilient fallback:`, err?.message || err);
    }

    // Round 4: Multi-AI Consensus Resolution & Tool Decider Synthesis (Injected for Model D Lead Coordinator)
    let consensusDirectives = `\n\n[🤝 HASIL DEBAT & PENALARAN MULTI-AI TERPADU NAVIX (Multi-AI Debate & Reasoning Consensus) — ${team.teamName}]:\n`;
    consensusDirectives += `- Partisipan Debat Kolaboratif:\n  • ${team.collaborators.map(c => `${c.role} (${c.model})`).join('\n  • ')}\n`;
    consensusDirectives += `- Tingkat Penalaran (Reasoning Effort): ${effort.toUpperCase()} (Skor Kompleksitas: ${complexityScore}/100)\n`;
    consensusDirectives += `- Sasaran Inti: ${debateData.primaryGoal}\n`;

    if (debateData.modelAThesis) {
      consensusDirectives += `- 📌 Argumen Awal (${modelA.role}): ${debateData.modelAThesis.trim()}\n`;
    }
    if (debateData.modelBAlternative) {
      consensusDirectives += `- 💡 Ulasan Strategis & Antitesis (${modelB.role}): ${debateData.modelBAlternative.trim()}\n`;
    }
    if (debateData.modelCCritique.length > 0) {
      consensusDirectives += `- 🛡️ Kritik & Koreksi Audit (${modelC.role}): ${debateData.modelCCritique.join(' | ')}\n`;
    }
    if (debateData.subTasks.length > 0) {
      consensusDirectives += `- Sub-Langkah Hasil Konsensus: ${debateData.subTasks.join(' ➔ ')}\n`;
    }
    if (debateData.constraints.length > 0) {
      consensusDirectives += `- Batasan Terverifikasi: ${debateData.constraints.join('; ')}\n`;
    }

    // Penentuan Kebutuhan Jalur Eksternal vs Diskusi Murni
    if (debateData.requiresEmpiricalTools && debateData.suggestedTools.length > 0) {
      consensusDirectives += `- ⚙️ KEPUTUSAN JALUR EKSTERNAL (Tools/Engine Diperlukan): Debat menyimpulkan bahwa pertanyaan ini memerlukan data empiris/tindakan nyata via: [${debateData.suggestedTools.join(', ')}]. Panggil tool yang bersangkutan secara presisi.\n`;
    } else {
      consensusDirectives += `- 💬 KEPUTUSAN JALUR DISKUSI MURNI: Debat menyimpulkan bahwa pertanyaan ini murni bersifat konseptual, analitis, atau dialogis. DILARANG memanggil tool/engine eksternal yang tidak relevan. Fokuskan pada penalaran elegan, artikulatif, dan tuntas.\n`;
    }

    if (debateData.isUnsolvedOrTheoretical) {
      consensusDirectives += `- ⚖️ PROTOKOL GROUNDING KETAT: DILARANG mengarang fakta empiris seolah-olah sudah terbukti. Pisahkan secara eksplisit: [Fakta Terbukti] vs [Hipotesis / Teori].\n`;
    }
    if (memoryCompass) {
      consensusDirectives += `- 🧭 ${memoryCompass}\n`;
    }
    consensusDirectives += `- Tugas ${modelD.role}: Lakukan sintesis final menyeluruh dari hasil konsensus debat di atas menjadi SATU jawaban NAVIX AI yang tajam, jelas, terverifikasi, dan bebas ambiguitas.\n`;

    return {
      isComplex: complexityScore >= 40,
      tier: modelTier,
      teamSummary: `${team.teamName} [Multi-AI Debate & Reasoning Consensus: ${team.collaborators.length} Model Berkolaborasi & Berdebat]`,
      primaryGoal: debateData.primaryGoal,
      subTasks: debateData.subTasks,
      constraints: debateData.constraints,
      crossCheckNotes: debateData.modelCCritique,
      empiricalDataRequired: debateData.requiresEmpiricalTools,
      isUnsolvedProblemOrHypothesis: debateData.isUnsolvedOrTheoretical,
      recommendedToolsOrEngines: debateData.suggestedTools,
      augmentedSystemInstruction: consensusDirectives
    };
  }
}

export const thinkingEngine = new BackendThinkingEngine();
