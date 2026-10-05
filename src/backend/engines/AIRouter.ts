export type NavixModelTier = 'flash' | 'pro' | 'lite';

export interface ModelCollaborator {
  id: string;
  role: string;
  model: string;
  specialty: string;
}

export interface NavixCollaborativeTeam {
  tier: NavixModelTier;
  teamName: string;
  description: string;
  leadModel: string;
  deconstructorModel: string;
  crossCheckModel: string;
  evaluatorModel: string;
  collaborators: ModelCollaborator[];
  failoverChain: string[];
}

export const NAVIX_COLLABORATIVE_TEAMS: Record<NavixModelTier, NavixCollaborativeTeam> = {
  flash: {
    tier: 'flash',
    teamName: 'NAVIX FLASH Multi-Model Flash (3.8, 3.7, 3.6, 3.5)',
    description: 'Kelompok Navix Flash terdiri dari Gemini Flash 3.8, 3.7, 3.6, dan 3.5. Gesit, seimbang, dan tanggap.',
    leadModel: 'gemini-3.8-flash',
    deconstructorModel: 'gemini-3.6-flash',
    crossCheckModel: 'gemini-3.5-flash',
    evaluatorModel: 'gemini-3.7-flash',
    collaborators: [
      {
        id: 'flash_lead',
        role: 'Gemini 3.8 Flash — Lead Synthesis & Executive Coordinator',
        model: 'gemini-3.8-flash',
        specialty: 'Memimpin sintesis hasil akhir, koordinasi eksekusi engine terpadu di balik layar, dan penyampaian hasil tuntas.'
      },
      {
        id: 'flash_plan',
        role: 'Gemini 3.7 Flash — Strategic Planning & Deep Context Analysis',
        model: 'gemini-3.7-flash',
        specialty: 'Merumuskan rencana kerja alternatif, memperluas cakupan logika, dan memetakan kebutuhan tool/mesin.'
      },
      {
        id: 'flash_deconstruct',
        role: 'Gemini 3.6 Flash — Intent Deconstruction & Task Breakdown',
        model: 'gemini-3.6-flash',
        specialty: 'Membedah sasaran pokok pengguna, menyusun tesis awal, dan memetakan struktur tugas secara instan.'
      },
      {
        id: 'flash_audit',
        role: 'Gemini 3.5 Flash — Fast Verification & Cross-Check Auditor',
        model: 'gemini-3.5-flash',
        specialty: 'Menguji ketat konsistensi logika, deteksi asumsi tanpa dasar, validasi integritas data, dan audit batasan.'
      }
    ],
    failoverChain: ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-latest']
  },
  pro: {
    tier: 'pro',
    teamName: 'NAVIX PRO Multi-Model Pro (3.6, 3.7 & 3.1 PRO)',
    description: 'Kelompok Navix Pro terdiri dari Gemini Flash 3.6, Gemini Flash 3.7, dan Gemini 3.1 Pro. Penalaran arsitektural kognitif tingkat tinggi.',
    leadModel: 'gemini-3.1-pro-preview',
    deconstructorModel: 'gemini-3.6-flash',
    crossCheckModel: 'gemini-3.7-flash',
    evaluatorModel: 'gemini-3.1-pro-preview',
    collaborators: [
      {
        id: 'pro_lead',
        role: 'Gemini 3.1 Pro — Deep Architecture, STEM & Mathematical Reasoning',
        model: 'gemini-3.1-pro-preview',
        specialty: 'Penalaran kompleks, perancangan arsitektur sistem, formulasi sains-matematis, dan sintesis kepemimpinan.'
      },
      {
        id: 'pro_reason',
        role: 'Gemini 3.7 Flash — Strategic System Co-Planner & Logic Evaluator',
        model: 'gemini-3.7-flash',
        specialty: 'Evaluasi cakupan konteks holistik, analisis sistemik multi-cabang, dan perumusan langkah kerja komprehensif.'
      },
      {
        id: 'pro_audit',
        role: 'Gemini 3.6 Flash — Deconstruction & Boundary Constraint Auditor',
        model: 'gemini-3.6-flash',
        specialty: 'Pemeriksaan silang ketat terhadap integritas fakta empiris, konteks, dan batasan eksekusi.'
      }
    ],
    failoverChain: ['gemini-3.1-pro-preview', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite']
  },
  lite: {
    tier: 'lite',
    teamName: 'NAVIX LITE Multi-Model Lite (All Flash Lite Series)',
    description: 'Kelompok Navix Lite terdiri dari seluruh varian Gemini Flash Lite (3.1 Flash-Lite, Flash-Lite Latest) yang dimiliki AI Studio. Ultra-ringan, hemat kuota, dan gesit.',
    leadModel: 'gemini-3.1-flash-lite',
    deconstructorModel: 'gemini-3.1-flash-lite',
    crossCheckModel: 'gemini-flash-lite-latest',
    evaluatorModel: 'gemini-3.1-flash-lite',
    collaborators: [
      {
        id: 'lite_parser',
        role: 'Gemini 3.1 Flash-Lite — Lead High-Speed Response Generator',
        model: 'gemini-3.1-flash-lite',
        specialty: 'Pemahaman cepat maksud pengguna dan sintesis respons langsung sub-detik.'
      },
      {
        id: 'lite_extractor',
        role: 'Gemini Flash-Lite Latest — Rapid Parameter & Entity Extractor',
        model: 'gemini-flash-lite-latest',
        specialty: 'Ekstraksi parameter kunci, entitas penting, dan batasan eksplisit secara hemat token.'
      }
    ],
    failoverChain: ['gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-flash-latest']
  }
};

export class AiRouter {
  normalizeModelName(rawModel?: string): string {
    if (!rawModel) return 'gemini-3.5-flash';
    const clean = rawModel.toLowerCase().trim();
    if (clean === 'gemini-3.5-flash' || clean.includes('3.5')) return 'gemini-3.5-flash';
    if (clean.includes('3.5-flash-lite')) return 'gemini-3.5-flash-lite';
    if (clean === 'gemini-3.8-flash' || clean.includes('3.8')) return 'gemini-3.8-flash';
    if (clean === 'gemini-3.7-flash' || clean.includes('3.7')) return 'gemini-3.7-flash';
    if (clean === 'gemini-3.6-flash' || clean.includes('3.6')) return 'gemini-3.6-flash';
    if (clean.includes('pro')) return 'gemini-3.1-pro-preview';
    if (clean.includes('flash-lite-latest')) return 'gemini-flash-lite-latest';
    if (clean.includes('lite') || clean.includes('flash-lite')) return 'gemini-3.1-flash-lite';
    if (clean.includes('latest')) return 'gemini-flash-latest';
    if (clean.startsWith('gemini-')) return rawModel;
    return 'gemini-3.5-flash';
  }

  determineTier(modelPreference?: string): NavixModelTier {
    const p = (modelPreference || '').toLowerCase();
    if (p.includes('pro')) return 'pro';
    if (p.includes('lite') || p.includes('flash-lite')) return 'lite';
    return 'flash';
  }

  getCollaborativeTeam(tierOrPreference?: string): NavixCollaborativeTeam {
    const tier = this.determineTier(tierOrPreference);
    return NAVIX_COLLABORATIVE_TEAMS[tier];
  }

  getCandidateChain(tierOrPreference?: string, customModel?: string): string[] {
    const tier = this.determineTier(tierOrPreference);
    const chain = [...NAVIX_COLLABORATIVE_TEAMS[tier].failoverChain];
    if (customModel && typeof customModel === 'string') {
      const normalized = this.normalizeModelName(customModel);
      if (!chain.includes(normalized)) {
        chain.unshift(normalized);
      }
      if (customModel.startsWith('gemini-') && !chain.includes(customModel)) {
        chain.unshift(customModel);
      }
    }
    return Array.from(new Set(chain));
  }

  selectModel(modelPreference?: string, isThinkingMode?: boolean, hasAttachments?: boolean): string {
    const tier = this.determineTier(modelPreference);
    return NAVIX_COLLABORATIVE_TEAMS[tier].leadModel;
  }
}

export const navixAiRouter = new AiRouter();
