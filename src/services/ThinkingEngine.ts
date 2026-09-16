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
  | "knowledge_lab";

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

  if (text.includes("file") || text.includes("baca file")) {
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

  // Trading
  if (text.includes("trading") || text.includes("hh") || text.includes("hl") || text.includes("ll") || text.includes("lh") || text.includes("s&r") || text.includes("market") || text.includes("crypto") || text.includes("bitcoin") || text.includes("signal") || text.includes("entry") || text.includes("smc")) {
    return { taskType: "trading", complexity: "critical" };
  }

  // Document
  if (text.includes("laporan") || text.includes("dokumen") || text.includes("proposal") || text.includes("pdf") || text.includes("excel") || text.includes("spreadsheet") || text.includes("ekstraksi")) {
    return { taskType: "document", complexity: "normal" };
  }

  // Data Analysis
  if (text.includes("analisis data") || text.includes("dataset") || text.includes("statistik") || text.includes("chart") || text.includes("forecasting") || text.includes("visualisasi")) {
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
  maxSteps: number
): TaskPlan {
  // Generate highly customized pathways based on taskType to respect user intent perfectly
  let selectedSteps: string[] = [];

  switch (taskType) {
    case "image":
      selectedSteps = [
        "Sidang Dewan Diskusi Di Balik Layar (Dekonstruksi Intent & Anti-Ngawur)",
        "Mesin Media Multimodal",
        "Parameter Setup & Optical Processing",
        "Generative Prompt Engineering",
        "High-Res Rendering & Upscaling",
        "Output Canvas Verification & Delivery"
      ];
      break;
    case "code":
      selectedSteps = [
        "Sidang Dewan Diskusi Di Balik Layar (Dekonstruksi Intent & Anti-Malas)",
        "Mesin Koding & Studio Canvas",
        "React Component & Logic Blueprinting",
        "Tailwind CSS & UI Structuring",
        "Virtual Sandbox Compilation",
        "100% Executable Output Delivery"
      ];
      break;
    case "trading":
      selectedSteps = [
        "Sidang Dewan Diskusi Di Balik Layar (Audit Risiko & Validasi Pasar)",
        "Market & Quant Engine (CCXT Live Feed)",
        "TA-Lib Math & SMC Calculation",
        "Key Support & Resistance Validation",
        "Risk/Reward & SL/TP Validation Setup",
        "Final Sinyal & Checklist Verifikasi"
      ];
      break;
    case "document":
      selectedSteps = [
        "Sidang Dewan Diskusi Di Balik Layar (Dekonstruksi Intent & Struktur)",
        "Mesin Dokumen & Konten Kreatif",
        "Data Extraction & Information Tagging",
        "Data Point Validation & Cross-checking",
        "Polished Document Synthesis"
      ];
      break;
    case "video":
      selectedSteps = [
        "Sidang Dewan Diskusi Di Balik Layar (Sinematografi & Motion Planning)",
        "Mesin Media Multimodal (Video)",
        "Visual Storyboarding & Planning",
        "Scene Motion & 24fps Cinematography",
        "Keyframe Interpolation Processing",
        "Output Video Rendering Delivery"
      ];
      break;
    case "audio":
      selectedSteps = [
        "Sidang Dewan Diskusi Di Balik Layar (Harmoni & Komposisi)",
        "Mesin Media Multimodal (Audio)",
        "Audio Transformation Analysis",
        "Polyphonic Soundtrack Generation",
        "Audio Processing & Syncing",
        "Harmonic Quality Checking"
      ];
      break;
    case "file_analysis":
      selectedSteps = [
        "Sidang Dewan Diskusi Di Balik Layar (Pemetaan Dependensi & Audit)",
        "Mesin Riset & Direktori GitHub",
        "File Discovery & Aggregation",
        "Architecture & Dependency Analysis",
        "Problem Detection & Optimization",
        "Verification"
      ];
      break;
    case "security":
      selectedSteps = [
        "Sidang Dewan Diskusi Di Balik Layar (Zero-Trust Security Assessment)",
        "Mesin Riset & Direktori GitHub (Security)",
        "System Scan & Vulnerability Detection",
        "Risk Analysis & Classification",
        "Security Remediation Planning"
      ];
      break;
    case "research":
      selectedSteps = [
        "Sidang Dewan Diskusi Di Balik Layar (Uji Falsifikasi & Anti-Halusinasi)",
        "Mesin Laboratorium Riset Ilmiah (Autonomous Lab)",
        "Autonomous Literature Mining",
        "Hypothesis Formulation (H0/H1)",
        "In-Silico Monte Carlo Simulation",
        "Empirical Statistical Analysis (T-Test)",
        "Peer-Review & Falsification Engine",
        "IMRaD Academic Report Generation"
      ];
      break;
    case "data_analysis":
      selectedSteps = [
        "Navix Dispatcher & Router",
        "Mesin Komputasi & Matematika",
        "Dataset Discovery & Cleaning",
        "Pattern Analysis & Statistics",
        "Chart & Data Visualization Generation",
        "Forecasting & Prediction Model",
        "Data Synthesis"
      ];
      break;
    case "project":
      selectedSteps = [
        "Task Decomposition",
        "Execution (Identify, Fix, Optimize)",
        "Verification & Testing",
        "Completion Check"
      ];
      break;
    case "memory":
      selectedSteps = [
        "Memory Retrieval & Context Scanning",
        "Context Association",
        "Knowledge Application"
      ];
      break;
    case "chat":
    default:
      // Discussion Mode won't reach here as it has thinking disabled mostly,
      // but in case it's forced, use simple steps.
      selectedSteps = [
        "Intent Intelligence",
        "Single Engine Processing",
        "FINAL OUTPUT"
      ];
      break;
  }

  return {
    goal: input,
    subGoals: [
      `Jenis tugas: ${taskType}`,
      `Kompleksitas: ${complexity}`,
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
