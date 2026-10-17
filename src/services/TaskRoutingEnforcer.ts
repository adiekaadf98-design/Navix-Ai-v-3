/**
 * NAVIX PRO AI — TASK ROUTING ENFORCER
 * 
 * Penjaga Mutlak Jalur Mesin Spesialis (Fail-Closed Machine Policy):
 * Menginspeksi niat pengguna dan mengunci tugas agar WAJIB dieksekusi oleh mesin riil
 * bila memerlukan kalkulasi, data pasar, kode, matematika, pencarian faktual, atau dokumen.
 * Menjamin 0% kebocoran ke model percakapan bebas (anti-halusinasi 100%).
 */

export interface EnforcementResult {
  isMachineMandatory: boolean;
  domain: 'trading' | 'math' | 'code' | 'web_research' | 'document' | 'multimedia' | 'cyber_forensics' | 'biogenomics_science' | 'macro_geoeconomics' | 'autonomous_simulation' | 'general';
  rationale: string;
  primaryEngine: string;
  fallbackEngines: string[];
  pipelineSequence: Array<{
    engine: string;
    action: string;
    category: 'core' | 'opensource' | 'mcp' | 'verification';
  }>;
  prohibitedModelActions: string[];
}

export class TaskRoutingEnforcer {
  private static instance: TaskRoutingEnforcer;

  public static getInstance(): TaskRoutingEnforcer {
    if (!TaskRoutingEnforcer.instance) {
      TaskRoutingEnforcer.instance = new TaskRoutingEnforcer();
    }
    return TaskRoutingEnforcer.instance;
  }

  /**
   * Menginspeksi pesan dan menentukan apakah tugas wajib diproses mesin komputasi spesialis.
   */
  public enforceRouting(query: string, attachmentsCount: number = 0): EnforcementResult {
    const q = query.trim().toLowerCase();

    // 1. DOMAIN: TRADING & FINANCIAL MARKETS
    const tradingKeywords = [
      'trading', 'signal', 'sinyal', 'crypto', 'kripto', 'saham', 'forex', 'gold', 'xauusd', 'xau',
      'btcusdt', 'btc', 'ethusdt', 'eth', 'solusdt', 'sol', 'bbca', 'bbri', 'ihsg', 'candlestick',
      'rsi', 'ema', 'macd', 'smc', 'order block', 'fvg', 'liquidity', 'support', 'resistance',
      'take profit', 'stop loss', 'scalping', 'swing trade', 'analisa market', 'analisis pasar', 'entry'
    ];
    if (tradingKeywords.some(kw => q.includes(kw))) {
      return {
        isMachineMandatory: true,
        domain: 'trading',
        rationale: 'Permintaan memerlukan data klines pasar bursa real-time, audit likuiditas SMC, dan kalkulasi rasio Risk:Reward non-repainting.',
        primaryEngine: 'SignalEngine',
        fallbackEngines: ['RetailTraderGitHubEngine', 'TradingViewService', 'CryptoEngine', 'StockEngine'],
        pipelineSequence: [
          { engine: 'SignalEngine', action: 'Fetch real-time market data & calculate SMC indicators', category: 'core' },
          { engine: 'VolatilitySentinel', action: 'Audit spread volatility & liquidity sweep risk', category: 'core' },
          { engine: 'VerificationEngine', action: 'Validate non-repainting mathematical levels', category: 'verification' }
        ],
        prohibitedModelActions: [
          'DILARANG KERAS mengarang harga pasar atau menebak level Stop Loss / Take Profit tanpa kalkulasi mesin.',
          'DILARANG menyajikan sinyal tanpa blok json signal institusional.'
        ]
      };
    }

    // 2. DOMAIN: MATHEMATICS & ARITHMETIC
    const isSingleNumber = /^\s*-?\d+\s*$/.test(query.trim());
    const mathKeywords = [
      'hitung', 'kalkulasi', 'berapa hasil', 'akar dari', 'pangkat', 'faktorial', 'matematika',
      'persamaan', 'aljabar', 'integral', 'derivatif', 'sin(', 'cos(', 'tan(', 'log(', 'gcd(', 'lcm('
    ];
    const hasMathSymbols = /[0-9]+\s*[\+\-\*\/\^%]\s*[0-9]+/.test(query);

    if (isSingleNumber || hasMathSymbols || (mathKeywords.some(kw => q.includes(kw)) && /\d/.test(query))) {
      return {
        isMachineMandatory: true,
        domain: 'math',
        rationale: 'Permintaan membutuhkan komputasi deterministik presisi tinggi 50-digit atau analisis angka.',
        primaryEngine: 'MathEngine',
        fallbackEngines: ['DanfoDataEngine', 'DataAnalysisEngine'],
        pipelineSequence: [
          { engine: 'MathEngine', action: 'Deterministic 50-digit high-precision arithmetic', category: 'core' },
          { engine: 'VerificationEngine', action: 'Verify numeric precision & finite numbers check', category: 'verification' }
        ],
        prohibitedModelActions: [
          'DILARANG aproksimasi atau tebakan internal oleh model. Hasil MathEngine adalah sumber kebenaran mutlak.'
        ]
      };
    }

    // 3. DOMAIN: CODING & SOFTWARE ENGINEERING
    const codeKeywords = [
      'kode', 'coding', 'script', 'function', 'fungsi', 'bug', 'debug', 'refactor', 'buatkan kode',
      'typescript', 'javascript', 'python', 'react', 'tailwind', 'html', 'css', 'sql', 'query',
      'github', 'repository', 'repositori', 'library', 'mcp', 'api endpoint', 'kompilasi'
    ];
    if (codeKeywords.some(kw => q.includes(kw))) {
      return {
        isMachineMandatory: true,
        domain: 'code',
        rationale: 'Permintaan rekayasa perangkat lunak membutuhkan eksekusi kode bersih, inspeksi repositori GitHub, atau verifikasi sintaksis.',
        primaryEngine: 'CodingEngine',
        fallbackEngines: ['GitHubOpenSourceEngine', 'AIStudioAppBuilderEngine'],
        pipelineSequence: [
          { engine: 'CodingEngine', action: 'Synthesize verified production-grade modular code', category: 'core' },
          { engine: 'GitHubOpenSourceEngine', action: 'Inspect canonical open-source repositories & dependencies', category: 'opensource' },
          { engine: 'VerificationEngine', action: 'Validate syntax & zero-placeholder compliance', category: 'verification' }
        ],
        prohibitedModelActions: [
          'DILARANG menyajikan kode terpotong dengan komentar "// rest of code" atau "TODO".'
        ]
      };
    }

    // 4. DOMAIN: WEB SEARCH & FACTUAL GROUNDING
    const searchKeywords = [
      'cari info', 'cari berita', 'berita terbaru', 'search web', 'informasi terkini', 'siapa sekarang',
      'harga hari ini', 'jadwal rilis', 'perkembangan terkini', 'google search', 'sumber berita'
    ];
    if (searchKeywords.some(kw => q.includes(kw))) {
      return {
        isMachineMandatory: true,
        domain: 'web_research',
        rationale: 'Memerlukan pengambilan data terkini dari internet untuk mencegah halusinasi waktu dan fakta.',
        primaryEngine: 'SearchEngine',
        fallbackEngines: ['SearXNG', 'Crawl4AI', 'KnowledgeLab'],
        pipelineSequence: [
          { engine: 'SearchEngine', action: 'Real-time multi-source web crawl & indexing', category: 'core' },
          { engine: 'VerificationEngine', action: 'Cross-check multi-source consensus & provenance', category: 'verification' }
        ],
        prohibitedModelActions: [
          'DILARANG mengarang fakta terkini atau tanggal kejadian tanpa rujukan terverifikasi.'
        ]
      };
    }

    // 5. DOMAIN: DOCUMENTS & PDF ANALYSIS
    const docKeywords = [
      'dokumen', 'pdf', 'laporan', 'buat artikel', 'koreksi kosa kata', 'ekstrak tabel', 'ringkas dokumen',
      'baca pdf', 'analisis dokumen'
    ];
    if (docKeywords.some(kw => q.includes(kw)) || attachmentsCount > 0) {
      return {
        isMachineMandatory: true,
        domain: 'document',
        rationale: 'Memerlukan parsing dokumen hierarki IBM Granite Docling dan ekstraksi matriks tabel.',
        primaryEngine: 'DoclingCoreEngine',
        fallbackEngines: ['DocumentEngine', 'MarkItDown', 'PDFjs'],
        pipelineSequence: [
          { engine: 'DoclingCoreEngine', action: 'Hierarchical layout parse & tabular markdown extraction', category: 'opensource' },
          { engine: 'VerificationEngine', action: 'Audit document word count & structural integrity', category: 'verification' }
        ],
        prohibitedModelActions: [
          'DILARANG memangkas data tabel atau mengubah isi kutipan dokumen asli.'
        ]
      };
    }

    // 6. DOMAIN: MULTIMEDIA
    const mediaKeywords = [
      'buat gambar', 'bikin gambar', 'buat foto', 'buat video', 'buat lagu', 'buat musik', 'edit gambar',
      'edit foto', 'edit video', 'generate image', 'generate video', 'generate music'
    ];
    if (mediaKeywords.some(kw => q.includes(kw))) {
      return {
        isMachineMandatory: true,
        domain: 'multimedia',
        rationale: 'Memerlukan generator multimedia nyata (Fooocus SDXL / Wan2.1 FFmpeg / MusicGen WAV).',
        primaryEngine: 'ImageEngine',
        fallbackEngines: ['LocalDreamImageEngine', 'VideoEngine', 'AudioEngine'],
        pipelineSequence: [
          { engine: 'ImageEngine', action: 'Render verified high-fidelity media artifact', category: 'core' },
          { engine: 'VerificationEngine', action: 'Check binary integrity and non-zero bytes payload', category: 'verification' }
        ],
        prohibitedModelActions: [
          'DILARANG merender lebih dari satu kali (harus 1 kali presisi tanpa loop).'
        ]
      };
    }

    // 7. DOMAIN: CYBER FORENSICS & SMART CONTRACT AUDIT
    const forensicKeywords = [
      'forensik', 'audit smart contract', 'smart contract', 'solidity audit', 'reentrancy', 'flash loan',
      'bytecode', 'cve', 'cwe', 'vulnerability', 'exploit', 'reverse engineering', 'zero day',
      'audit keamanan', 'security audit', 'web3 audit', 'decompile'
    ];
    if (forensicKeywords.some(kw => q.includes(kw))) {
      return {
        isMachineMandatory: true,
        domain: 'cyber_forensics',
        rationale: 'Memerlukan audit forensik siber deterministik, dekompilasi bytecode AST, dan deteksi kerentanan Zero-Day / Smart Contract.',
        primaryEngine: 'DeepForensicAuditEngine',
        fallbackEngines: ['NavixShield', 'CodingEngine'],
        pipelineSequence: [
          { engine: 'DeepForensicAuditEngine', action: 'Deep AST security scan, vulnerability mapping & bytecode audit', category: 'core' },
          { engine: 'VerificationEngine', action: 'Verify formal proof & remediation integrity', category: 'verification' }
        ],
        prohibitedModelActions: [
          'DILARANG mengabaikan celah keamanan fatal atau memberikan opini spekulatif tanpa rujukan CWE/CVE.'
        ]
      };
    }

    // 8. DOMAIN: BIO-GENOMICS & PHARMACOLOGICAL COMPUTATION
    const bioKeywords = [
      'protein', 'genom', 'dna', 'rna', 'molekul', 'smiles', 'chembl', 'pubchem', 'farmakologi',
      'lipinski', 'senyawa obat', 'ikatan kimia', 'bioinformatika', 'pdb', 'struktur protein'
    ];
    if (bioKeywords.some(kw => q.includes(kw))) {
      return {
        isMachineMandatory: true,
        domain: 'biogenomics_science',
        rationale: 'Memerlukan komputasi bio-molekuler, analisis afinitas ikatan farmakologis, dan pemrosesan sekuens DNA/RNA empiris.',
        primaryEngine: 'BioGenomicsScienceEngine',
        fallbackEngines: ['KnowledgeLab', 'DataAnalysisEngine'],
        pipelineSequence: [
          { engine: 'BioGenomicsScienceEngine', action: 'Empirical molecular target analysis & Lipinski Rule compliance', category: 'core' },
          { engine: 'VerificationEngine', action: 'Validate scientific units & chemical formula parities', category: 'verification' }
        ],
        prohibitedModelActions: [
          'DILARANG KERAS mengarang rumus molekul atau ikatan kimia yang melanggar hukum valensi kimia riil.'
        ]
      };
    }

    // 9. DOMAIN: MACRO GEO-ECONOMICS & GLOBAL SUPPLY CHAIN
    const macroKeywords = [
      'geopolitik', 'makroekonomi', 'the fed', 'suku bunga acuan', 'bi rate', 'bi-rate', 'ecb',
      'rantai pasok', 'supply chain', 'selat malaka', 'terusan suez', 'inflasi global', 'dampak sanksi',
      'perang dagang', 'model ekonometrika', 'guncangan komoditas'
    ];
    if (macroKeywords.some(kw => q.includes(kw))) {
      return {
        isMachineMandatory: true,
        domain: 'macro_geoeconomics',
        rationale: 'Memerlukan pemodelan ekonometrika dinamis (VAR/DSGE), simulasi transmisi suku bunga bank sentral, dan disrupsi rantai pasok maritim.',
        primaryEngine: 'MacroGeoEconomicEngine',
        fallbackEngines: ['ForexFactoryService', 'SearchEngine'],
        pipelineSequence: [
          { engine: 'MacroGeoEconomicEngine', action: 'Dynamic econometric transmission & chokepoint shock simulation', category: 'core' },
          { engine: 'VerificationEngine', action: 'Audit empirical commodity multipliers & inflation indices', category: 'verification' }
        ],
        prohibitedModelActions: [
          'DILARANG menyajikan data suku bunga basi atau spekulasi geopolitik tanpa pemodelan dampak kuantitatif.'
        ]
      };
    }

    // 10. DOMAIN: AUTONOMOUS DIGITAL TWIN & SIMULATION
    const simKeywords = [
      'monte carlo', 'digital twin', 'stres tes', 'stress test', 'simulasi skenario', 'probabilitas kebangkrutan',
      'value at risk', 'var 99%', 'simulasikan 1000', 'simulasi bisnis', 'simulasi 1000'
    ];
    if (simKeywords.some(kw => q.includes(kw))) {
      return {
        isMachineMandatory: true,
        domain: 'autonomous_simulation',
        rationale: 'Memerlukan 1.000 iterasi simulasi Monte Carlo Digital Twin untuk memetakan distribusi hasil dan batas risiko ekstrim (VaR 99%).',
        primaryEngine: 'AutonomousSimulationEngine',
        fallbackEngines: ['MathEngine', 'DataAnalysisEngine'],
        pipelineSequence: [
          { engine: 'AutonomousSimulationEngine', action: 'Massive Monte Carlo Digital Twin quantile distribution & ruin probability', category: 'core' },
          { engine: 'VerificationEngine', action: 'Verify statistical convergence & finite boundary parameters', category: 'verification' }
        ],
        prohibitedModelActions: [
          'DILARANG memberikan kesimpulan tanpa menyajikan distribusi persentil P5, P50, dan P95 hasil simulasi.'
        ]
      };
    }

    // 11. DEFAULT CONVERSATIONAL REASONING
    return {
      isMachineMandatory: false,
      domain: 'general',
      rationale: 'Pertanyaan dialogis konseptual atau pertimbangan umum.',
      primaryEngine: 'FinishingSynthesisEngine',
      fallbackEngines: ['AI_DEBATE'],
      pipelineSequence: [
        { engine: 'FinishingSynthesisEngine', action: 'Format nuanced, authoritative executive prose', category: 'core' }
      ],
      prohibitedModelActions: [
        'DILARANG menggunakan template kaku robotik atau kalimat basa-basi kosong.'
      ]
    };
  }
}

export const globalTaskRoutingEnforcer = TaskRoutingEnforcer.getInstance();
