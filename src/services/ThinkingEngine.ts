export type EffortLevel = "low" | "medium" | "high" | "extra" | "max";

export type TaskType =
  | "chat"
  | "code"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "file_analysis"
  | "security"
  | "trading"
  | "research"
  | "data_analysis"
  | "project"
  | "memory"
  | "knowledge_lab"
  | "quiz"
  | "skill"
  | "math";

export type Complexity = "simple" | "normal" | "hard" | "critical";

export interface NavixRequest {
  userText: string;
  taskType?: TaskType;
  effort?: EffortLevel;
  thinking?: boolean;
  sessionId: string;
  userId?: string;
  context?: string[];
}

export interface EffortPolicy {
  maxSteps: number;
  maxToolCalls: number;
  maxRetries: number;
  maxReasonPasses: number;
  allowSearch: boolean;
  allowMemory: boolean;
  allowCodeCheck: boolean;
  allowSelfRefine: boolean;
  requireVerifier: boolean;
}

export const EFFORT_POLICY: Record<EffortLevel, EffortPolicy> = {
  low: {
    maxSteps: 2,
    maxToolCalls: 0,
    maxRetries: 0,
    maxReasonPasses: 1,
    allowSearch: false,
    allowMemory: false,
    allowCodeCheck: false,
    allowSelfRefine: false,
    requireVerifier: false,
  },
  medium: {
    maxSteps: 4,
    maxToolCalls: 1,
    maxRetries: 1,
    maxReasonPasses: 2,
    allowSearch: true,
    allowMemory: true,
    allowCodeCheck: false,
    allowSelfRefine: true,
    requireVerifier: true,
  },
  high: {
    maxSteps: 7,
    maxToolCalls: 3,
    maxRetries: 2,
    maxReasonPasses: 3,
    allowSearch: true,
    allowMemory: true,
    allowCodeCheck: true,
    allowSelfRefine: true,
    requireVerifier: true,
  },
  extra: {
    maxSteps: 10,
    maxToolCalls: 5,
    maxRetries: 3,
    maxReasonPasses: 4,
    allowSearch: true,
    allowMemory: true,
    allowCodeCheck: true,
    allowSelfRefine: true,
    requireVerifier: true,
  },
  max: {
    maxSteps: 15,
    maxToolCalls: 8,
    maxRetries: 4,
    maxReasonPasses: 5,
    allowSearch: true,
    allowMemory: true,
    allowCodeCheck: true,
    allowSelfRefine: true,
    requireVerifier: true,
  },
};

export function classifyTask(input: string): {
  taskType: TaskType;
  complexity: Complexity;
} {
  const text = input.toLowerCase();

  // 1. Explicit tags from Chat Input (+)
  if (text.includes("@trading")) return { taskType: "trading", complexity: "critical" };
  if (text.includes("@math") || text.includes("@kalkulator")) return { taskType: "math", complexity: "normal" };
  if (text.includes("@image") || text.includes("@stok_foto")) return { taskType: "image", complexity: "normal" };
  if (text.includes("@video")) return { taskType: "video", complexity: "hard" };
  if (text.includes("@audio")) return { taskType: "audio", complexity: "hard" };
  if (text.includes("@drive")) return { taskType: "document", complexity: "normal" };
  if (text.includes("@penelitian")) return { taskType: "knowledge_lab", complexity: "critical" };
  if (text.includes("@map")) return { taskType: "research", complexity: "normal" };
  if (text.includes("@pilgun") || text.includes("kuis interaktif") || text.includes("pilihan ganda")) return { taskType: "quiz", complexity: "normal" };
  if (text.includes("@skill")) {
    if (text.includes("crypto_hash") || text.includes("hash_generator") || text.includes("sql_query") || text.includes("sanitizer") || text.includes("vercel") || text.includes("stripe") || text.includes("firecrawl") || text.includes("resend") || text.includes("posthog") || text.includes("mcp")) {
      return { taskType: "skill", complexity: "hard" };
    }
    if (text.includes("gambar") || text.includes("foto") || text.includes("desain")) return { taskType: "image", complexity: "normal" };
    if (text.includes("video") || text.includes("animasi")) return { taskType: "video", complexity: "hard" };
    if (text.includes("audio") || text.includes("musik")) return { taskType: "audio", complexity: "hard" };
    if (text.includes("trading") || text.includes("chart") || text.includes("forex") || text.includes("saham") || (text.includes("crypto") && (text.includes("pasar") || text.includes("analis") || text.includes("sinyal") || text.includes("harga") || text.includes("trade")))) return { taskType: "trading", complexity: "critical" };
    if (text.includes("koding") || text.includes("kode") || text.includes("script") || text.includes("deploy")) return { taskType: "code", complexity: "hard" };
    if (text.includes("dokumen") || text.includes("pdf") || text.includes("laporan")) return { taskType: "document", complexity: "normal" };
    if (text.includes("data") || text.includes("analisis data") || text.includes("statistik")) return { taskType: "data_analysis", complexity: "hard" };
    if (text.includes("cari") || text.includes("riset") || text.includes("search")) return { taskType: "research", complexity: "normal" };
    return { taskType: "skill", complexity: "hard" };
  }

  // Project / Complex Task
  if (text.includes("periksa project") || text.includes("perbaiki") || text.includes("optimalkan") || text.includes("periksa seluruh file") || text.includes("audit project") || text.includes("jangan sampai ada yang tertinggal")) {
    return { taskType: "project", complexity: "critical" };
  }

  // Security
  if (text.includes("security") || text.includes("vulnerability") || text.includes("malware") || text.includes("audit keamanan") || text.includes("shield")) {
    return { taskType: "security", complexity: "critical" };
  }

  // Code / File Analysis
  if (text.includes("kode") || text.includes("debug") || text.includes("typescript") || text.includes("api") || text.includes("javascript") || text.includes("programming") || text.includes("coding") || text.includes("source code") || text.includes("apk") || text.includes("dependency")) {
    return { taskType: "code", complexity: "hard" };
  }

  if (text.includes("baca file") || text.includes("file analysis") || text.includes("inspeksi file")) {
    return { taskType: "file_analysis", complexity: "hard" };
  }

  // Image
  if (text.includes("gambar") || text.includes("edit foto") || text.includes("realistis") || text.includes("desain") || text.includes("lukisan") || text.includes("painting") || text.includes("photo") || text.includes("photorealistic")) {
    return { taskType: "image", complexity: "normal" };
  }

  // Video
  if (text.includes("video") || text.includes("animasi") || text.includes("motion") || text.includes("scene")) {
    return { taskType: "video", complexity: "hard" };
  }

  // Audio / Music
  if (text.includes("audio") || text.includes("musik") || text.includes("soundtrack") || text.includes("suara") || text.includes("voice")) {
    return { taskType: "audio", complexity: "hard" };
  }

  // Trading: check for real trading terminology or crypto/forex pairs with action intent
  const isDirectTrading = 
    text.includes("trading") || text.includes("smc") || text.includes("smart money") || 
    text.includes("order block") || text.includes("fair value gap") || text.includes("fvg") ||
    text.includes("candlestick") || text.includes("break of structure") || text.includes("change of character") ||
    text.includes("take profit") || text.includes("stop loss") || text.includes("sinyal trading") ||
    text.includes("analisa chart") || text.includes("analisa pasar") || text.includes("market structure") ||
    text.includes("higher high") || text.includes("lower low") || text.includes("saham") || text.includes("ihsg") || text.includes("idx");

  const hasPairAndAction = 
    /(btc|eth|sol|doge|xrp|bnb|ada|avax|near|sui|pepe|xau|xauusd|gold|emas|eurusd|gbpusd|usdjpy|btcusdt|ethusdt|solusdt)/i.test(text) &&
    /(analis|chart|harga|candle|beli|jual|buy|sell|sl|tp|long|short|timeframe|tf|setup|entry|tren|trend|sinyal|signal)/i.test(text);

  if (isDirectTrading || hasPairAndAction) {
    return { taskType: "trading", complexity: "critical" };
  }

  // Document
  if (text.includes("laporan") || text.includes("dokumen") || text.includes("proposal") || text.includes("pdf") || text.includes("excel") || text.includes("spreadsheet") || text.includes("ekstraksi")) {
    return { taskType: "document", complexity: "normal" };
  }

  // Data Analysis
  if (text.includes("analisis data") || text.includes("dataset") || text.includes("statistik") || text.includes("chart data") || text.includes("forecasting") || text.includes("visualisasi data")) {
    return { taskType: "data_analysis", complexity: "hard" };
  }

  // Research
  if (text.includes("cari") || text.includes("search") || text.includes("google") || text.includes("web") || text.includes("berita") || text.includes("riset") || text.includes("informasi") || text.includes("browsing") || text.includes("dokumentasi") || text.includes("fakta")) {
    return { taskType: "research", complexity: "normal" };
  }
  
  // Memory / Context
  if (text.includes("ingat") || text.includes("konteks") || text.includes("memori")) {
    return { taskType: "memory", complexity: "normal" };
  }

  // Math / Numerical Computation (Deterministic 50-digit high precision)
  const isSingleInteger = /^\s*-?\d+\s*$/.test(text);
  const isPureArithmetic = /^[\d\s\+\-\*\/\^\(\)\.%,sqrt|sin|cos|tan|log|pi|e|phi|abs|pow|exp]+$/i.test(text) && /\d/.test(text);
  const hasMathKeywords = /(?:hitung|kalkulasi|akar kuadrat|aritmatika|faktorial|matematika|persen|pangkat|berapa hasil)\b/i.test(text);

  if (isSingleInteger || isPureArithmetic || hasMathKeywords) {
    return { taskType: "math", complexity: isSingleInteger ? "simple" : "normal" };
  }

  return { taskType: "chat", complexity: "simple" };
}

export function isHeavyTask(input: string): boolean {
  // 1. Classification check
  const { taskType } = classifyTask(input);
  if (taskType !== "chat") {
    return true;
  }
  return false;
}

export function decideEffort(
  taskType: TaskType,
  complexity: Complexity,
  userEffort?: EffortLevel | string
): EffortLevel {
  if (userEffort && userEffort !== "auto" && EFFORT_POLICY[userEffort as EffortLevel]) {
    return userEffort as EffortLevel;
  }

  if (complexity === "critical") return "max";
  if (complexity === "hard") return "high";
  if (complexity === "normal") return "medium";
  return "low";
}

export interface TaskPlan {
  goal: string;
  subGoals: string[];
  steps: string[];
  neededTools: string[];
  risks: string[];
  outputFormat: string;
}

export function createTaskPlan(
  input: string,
  taskType: TaskType,
  complexity: Complexity,
  maxSteps?: number,
  effort?: EffortLevel | string
): TaskPlan {
  const resolvedEffort = (effort as EffortLevel) || decideEffort(taskType, complexity, effort);
  
  // Base customized pathways based on taskType and scaled by effort level
  let selectedSteps: string[] = [];

  if (resolvedEffort === 'low') {
    selectedSteps = [
      "Identifikasi Cepat & Ekstraksi Maksud",
      "Sintesis Langsung & Penyampaian Output"
    ];
  } else if (resolvedEffort === 'medium') {
    switch (taskType) {
      case "image":
        selectedSteps = [
          "Dekonstruksi Intent Visual",
          "Parameter Setup & Optical Processing",
          "Generative Prompt Engineering",
          "Output Canvas Verification & Delivery"
        ];
        break;
      case "code":
        selectedSteps = [
          "Dekonstruksi Persyaratan Koding",
          "React Component & Logic Blueprinting",
          "Virtual Sandbox Compilation",
          "Executable Output Delivery"
        ];
        break;
      case "trading":
        selectedSteps = [
          "Audit Risiko & Pembacaan Data Pasar",
          "TA-Lib Math & SMC Calculation",
          "Risk/Reward & SL/TP Validation",
          "Final Sinyal & Rekomendasi Disiplin"
        ];
        break;
      case "math":
        selectedSteps = [
          "Dekonstruksi Notasi & Formula Matematika",
          "Komputasi Deterministik 50 Digit Signifikan",
          "Verifikasi Invariant Rasional & Desimal",
          "Penyajian Bukti & Hasil Eksak"
        ];
        break;
      default:
        selectedSteps = [
          "Pemahaman Konteks & Intent Pengguna",
          "Perumusan Strategi & Pengambilan Data",
          "Pemrosesan Mesin & Formulasi Solusi",
          "Verifikasi Akhir & Penyajian Jawaban"
        ];
        break;
    }
  } else if (resolvedEffort === 'high') {
    switch (taskType) {
      case "image":
        selectedSteps = [
          "Sidang Dewan Diskusi (Dekonstruksi Intent & Komposisi)",
          "Mesin Media Multimodal & Parameter Setup",
          "Generative Prompt Engineering 8K Fotorealistis",
          "High-Res Neural Rendering & Upscaling",
          "Audit Kualitas Visual & Anti-Artifak",
          "Output Canvas Verification & Delivery"
        ];
        break;
      case "code":
        selectedSteps = [
          "Sidang Dewan Diskusi (Dekonstruksi Intent & Anti-Malas)",
          "Mesin Koding & Arsitektur Solusi",
          "React Component & Logic Blueprinting",
          "Tailwind CSS & UI Structuring",
          "Virtual Sandbox Compilation & Logic Audit",
          "Verifikasi Integritas & 100% Executable Output"
        ];
        break;
      case "trading":
        selectedSteps = [
          "Sidang Dewan Diskusi (Audit Risiko & Struktur Pasar)",
          "Market & Quant Engine (Live Feed Spot)",
          "TA-Lib Math & SMC Calculation (FVG / BOS)",
          "Key Support & Resistance Validation",
          "Risk/Reward & SL/TP Invariant Setup",
          "Audit Sinyal Terverifikasi & Rekomendasi Disiplin"
        ];
        break;
      case "math":
        selectedSteps = [
          "Sidang Dewan Diskusi (Audit Formula & Definisi Operasi)",
          "Mesin Matematika Deterministik 50-Digit Navix AI",
          "Analisis Sifat Bilangan & Teori Angka (Miller-Rabin / Faktorisasi)",
          "Verifikasi Presisi Tinggi & Invariant Eksak",
          "Audit Kesalahan Pembulatan & Konsistensi Logika",
          "Penyajian Hasil Terbukti Bebas Halusinasi"
        ];
        break;
      default:
        selectedSteps = [
          "Sidang Dewan Diskusi Di Balik Layar (Dekonstruksi Mendalam)",
          "Analisis Konteks & Pemetaan Dependensi Logika",
          "Tree-of-Thought: Eksplorasi Hipotesis & Sudut Pandang",
          "Eksekusi Komputasi & Pemrosesan Data Inti",
          "Adversarial Debate: Audit Kelemahan & Anti-Halusinasi",
          "Sintesis Solusi Menyeluruh & Komprehensif",
          "Verifikasi Kualitas, Format & Penyelarasan Akhir"
        ];
        break;
    }
  } else if (resolvedEffort === 'extra') {
    selectedSteps = [
      "Inisialisasi Sidang Dewan Penalaran Ekstra (Tier High-Rigor)",
      "Dekonstruksi Maksud Pengguna & Batasan Implisit",
      "Eksplorasi Multi-Branch Tree of Thought (ToT)",
      "Pemeriksaan Silang & Pemanggilan Mesin Spesialis Terpadu",
      "Adversarial Devil's Advocate: Uji Logika & Kontradiksi",
      "Mitigasi Risiko & Validasi Edge-Cases",
      "Self-Refine Pass 1: Pengayaan Argumen & Bukti Empiris",
      "Self-Refine Pass 2: Audit Sintaks, Format & Integritas",
      "Sintesis Solusi Master Terstruktur",
      "Final Verification Gate & Output Delivery"
    ];
  } else { // 'max'
    selectedSteps = [
      "Inisialisasi Full AGI Deliberation Council (Effort Maksimal)",
      "Dekonstruksi Sasaran Inti & Pemetaan Ambiguity Matrix",
      "Pencarian Kontekstual & Integrasi Kompas Memori Jangka Panjang",
      "Multi-Branch Tree-of-Thought (ToT) Hypothesis Generation",
      "Orkestrasi Mesin Otonom & Pengambilan Data Empiris",
      "Adversarial Debate: Devil's Advocate Audit Berpikir Kritis",
      "Strict Grounding: Pemisahan Fakta Terbukti vs Hipotesis",
      "Uji Ketahanan Logika & Simulasi Kasus Ekstrem (Edge Cases)",
      "Matriks Evaluasi Risiko & Formula Solusi Optimal",
      "Penyusunan Draf Solusi Holistik & Anti-Kemalasan",
      "Self-Correction & Refinement Pass Lapisan 1",
      "Self-Correction & Refinement Pass Lapisan 2",
      "Verifikasi Keamanan, Invariant Finansial / Sintaks Kode",
      "Penyelarasan Gaya Bahasa Elegan, Edukatif & Manusiawi",
      "Konsensus Puncak AI & Penyerahan Output Terverifikasi 100%"
    ];
  }

  // If maxSteps is explicitly provided and smaller than selectedSteps, respect it
  if (maxSteps && maxSteps > 0 && selectedSteps.length > maxSteps) {
    selectedSteps = selectedSteps.slice(0, maxSteps);
  }

  return {
    goal: input,
    subGoals: [
      `Jenis tugas: ${taskType}`,
      `Kompleksitas: ${complexity}`,
      `Tingkatan Berpikir: ${resolvedEffort.toUpperCase()}`,
      `Langkah aktif: ${selectedSteps.length}`
    ],
    steps: selectedSteps,
    neededTools: [],
    risks: [
      "Kemungkinan halusinasi data",
      "Kompleksitas task yang diremehkan"
    ],
    outputFormat: "Structured Analysis & Output"
  };
}

export type ToolName =
  | "search"
  | "memory"
  | "codeCheck"
  | "imageGen"
  | "videoGen"
  | "audioSynthesizer"
  | "calculator"
  | "documentParser"
  | "securityShield";

export interface ToolBudget {
  maxCalls: number;
  usedCalls: number;
  allowedTools: ToolName[];
}

export function buildToolBudget(
  effort: EffortLevel | string,
  taskType: TaskType
): ToolBudget {
  const policy = (EFFORT_POLICY[effort as EffortLevel]) || EFFORT_POLICY["medium"];

  const allowedTools: ToolName[] = [];

  if (policy?.allowSearch) allowedTools.push("search");
  if (policy?.allowMemory) allowedTools.push("memory");
  if (policy?.allowCodeCheck) allowedTools.push("codeCheck");

  if (taskType === "image") allowedTools.push("imageGen");
  if (taskType === "video") allowedTools.push("videoGen");
  if (taskType === "audio") allowedTools.push("audioSynthesizer");
  if (taskType === "document" || taskType === "file_analysis") allowedTools.push("documentParser");
  if (taskType === "data_analysis") allowedTools.push("calculator");
  if (taskType === "security") allowedTools.push("securityShield");

  return {
    maxCalls: policy?.maxToolCalls ?? 1,
    usedCalls: 0,
    allowedTools
  };
}

export interface VerificationResult {
  instructionFit: number;
  factualFit: number;
  formatFit: number;
  completeness: number;
  clarity: number;
  safety: number;
  total: number;
  status: "pass" | "revise" | "fail";
}

export interface TreeOfThoughtBranch {
  branchId: string;
  hypothesis: string;
  premises: string[];
  evidenceWeight: number; // 0..100
  potentialFlaws: string[];
  isPruned: boolean;
  score: number;
}

export function evaluateAndPruneBranches(branches: TreeOfThoughtBranch[]): {
  activeBranches: TreeOfThoughtBranch[];
  prunedBranches: TreeOfThoughtBranch[];
  winningBranch: TreeOfThoughtBranch | null;
} {
  const scored = branches.map(b => {
    const flawPenalty = b.potentialFlaws.length * 15;
    const computedScore = Math.max(0, Math.min(100, b.evidenceWeight - flawPenalty));
    return {
      ...b,
      score: computedScore,
      isPruned: computedScore < 50 || b.potentialFlaws.length >= 3
    };
  });

  const activeBranches = scored.filter(b => !b.isPruned).sort((a, b) => b.score - a.score);
  const prunedBranches = scored.filter(b => b.isPruned);
  const winningBranch = activeBranches.length > 0 ? activeBranches[0] : (scored[0] || null);

  return { activeBranches, prunedBranches, winningBranch };
}

export function scoreVerification(v: Omit<VerificationResult, "total" | "status">) {
  const total =
    v.instructionFit * 0.30 +
    v.factualFit * 0.20 +
    v.formatFit * 0.15 +
    v.completeness * 0.20 +
    v.clarity * 0.10 +
    v.safety * 0.05;

  let status: VerificationResult["status"] = "fail";
  if (total >= 90) status = "pass";
  else if (total >= 75) status = "revise";

  return { ...v, total, status };
}
