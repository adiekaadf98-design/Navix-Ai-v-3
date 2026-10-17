/**
 * NAVIX PRO AI — USER MANDATE & STRICT OBEDIENCE REGISTRY
 * 
 * Sistem Penegakan Mandat & Kepatuhan Mutlak (Zero-Disobedience Policy):
 * Menyimpan profil preferensi presisi tinggi pengguna dan mengunci model AI agar 100% patuh
 * pada standar NAVIX: dilarang memotong jawaban, dilarang berspekulasi/halusinasi,
 * dilarang basa-basi birokratis, serta wajib menyajikan hasil komputasi mesin secara utuh.
 */

export interface UserMandateProfile {
  id: string;
  strictnessLevel: 'ABSOLUTE' | 'HIGH' | 'FLEXIBLE';
  professionalPersona: 'INSTITUTIONAL_STRATEGIC' | 'CODE_ARCHITECTURAL' | 'MATHEMATICAL_DETERMINISTIC' | 'EXECUTIVE_CONVERSATIONAL';
  noHallucinationEnforced: boolean;
  zeroPlaceholderEnforced: boolean;
  prohibitPleasantries: boolean;
  tradingInstantSignalRequired: boolean;
  singlePassMediaRenderRequired: boolean;
  proactiveGoalDecompositionEnabled: boolean;
  customMandates: string[];
  updatedAt: number;
}

export const DEFAULT_USER_MANDATE: UserMandateProfile = {
  id: 'navix_primary_user_mandate',
  strictnessLevel: 'ABSOLUTE',
  professionalPersona: 'INSTITUTIONAL_STRATEGIC',
  noHallucinationEnforced: true,
  zeroPlaceholderEnforced: true,
  prohibitPleasantries: true,
  tradingInstantSignalRequired: true,
  singlePassMediaRenderRequired: true,
  proactiveGoalDecompositionEnabled: true,
  customMandates: [
    'Dilarang memberikan jawaban nanggung atau terpotong.',
    'Model hanya sebagai perumus akhir; komputasi dan data wajib berasal dari mesin di balik layar.',
    'Sajikan hasil secara berwibawa, tajam, komprehensif, dan realistis.'
  ],
  updatedAt: Date.now()
};

export class UserMandateRegistry {
  private static instance: UserMandateRegistry;
  private currentProfile: UserMandateProfile;
  private readonly storageKey = 'navix_user_mandate_profile';

  private constructor() {
    this.currentProfile = this.loadProfile();
  }

  public static getInstance(): UserMandateRegistry {
    if (!UserMandateRegistry.instance) {
      UserMandateRegistry.instance = new UserMandateRegistry();
    }
    return UserMandateRegistry.instance;
  }

  private loadProfile(): UserMandateProfile {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          return { ...DEFAULT_USER_MANDATE, ...JSON.parse(stored) };
        }
      } catch (err) {
        console.warn('[UserMandateRegistry] Failed to load mandate profile from storage:', err);
      }
    }
    return { ...DEFAULT_USER_MANDATE };
  }

  public getProfile(): UserMandateProfile {
    return { ...this.currentProfile };
  }

  public updateProfile(updates: Partial<UserMandateProfile>): UserMandateProfile {
    this.currentProfile = {
      ...this.currentProfile,
      ...updates,
      updatedAt: Date.now()
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.currentProfile));
      } catch (err) {
        console.warn('[UserMandateRegistry] Failed to save mandate profile:', err);
      }
    }

    return this.getProfile();
  }

  /**
   * Menghasilkan injeksi mandat ketat untuk disisipkan ke dalam instruksi orchestrator / prompt model.
   */
  public generateMandatePrompt(): string {
    const p = this.currentProfile;
    const lines: string[] = [
      `[🔒 PROTOKOL KEPATUHAN MANDAT PENGGUNA TINGKAT TINGGI (${p.strictnessLevel})]:`,
      `- Zero-Disobedience Mandate: Wajib 100% mematuhi instruksi pengguna secara langsung dan tuntas.`,
      `- Larangan Kemalasan: Dilarang keras merangkum bagian esensial, dilarang kode "// rest of code", dilarang placeholder.`,
      `- Anti-Halusinasi: Seluruh fakta, data bursa, rasio matematika, dan sintaksis kode wajib bersumber dari eksekusi mesin riil.`
    ];

    if (p.prohibitPleasantries) {
      lines.push(`- Komunikasi Tanpa Basa-Basi: Dilarang kalimat pembuka kosong ("Tentu, saya akan membantu...", "Baiklah!"). Langsung sajikan solusi pada kalimat pertama.`);
    }

    if (p.tradingInstantSignalRequired) {
      lines.push(`- Standar Trading Institusional: Bila menganalisis aset pasar, wajib sertakan parameter lengkap Entry, SL, TP, Risk:Reward, dan blok json signal terverifikasi.`);
    }

    if (p.singlePassMediaRenderRequired) {
      lines.push(`- Rendering Media Presisi: Artefak gambar/video/audio wajib dirender 1 kali dengan parameter optik/akustik presisi tanpa pengulangan.`);
    }

    if (p.customMandates && p.customMandates.length > 0) {
      p.customMandates.forEach((m, idx) => {
        lines.push(`- Mandat Spesifik #${idx + 1}: ${m}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Mengaudit respons akhir model sebelum dikirimkan ke UI untuk mendeteksi pelanggaran mandat.
   */
  public auditCompliance(rawText: string, domain: string): { compliant: boolean; violations: string[]; cleanedText: string } {
    const violations: string[] = [];
    let cleaned = rawText;

    // Audit basa-basi pembuka
    if (this.currentProfile.prohibitPleasantries) {
      const pleasantryRegex = /^(?:(?:Halo|Hai|Tentu(?: saja)?|Baik(?:lah)?|Selamat (?:pagi|siang|sore|malam))[\s,!.-]+)+(?:(?:saya|kami) akan (?:membantu|menjelaskan|menjawab|memproses)[^.\n]*[.,!\n]+\s*)?/i;
      if (pleasantryRegex.test(cleaned)) {
        violations.push('Terdeteksi kalimat basa-basi di awal respons.');
        cleaned = cleaned.replace(pleasantryRegex, '').trim();
      }
    }

    // Audit placeholder kode
    if (this.currentProfile.zeroPlaceholderEnforced) {
      if (cleaned.includes('// TODO') || cleaned.includes('// rest of code') || cleaned.includes('/* rest of code */')) {
        violations.push('Terdeteksi placeholder kode terpotong.');
      }
    }

    // Audit sinyal trading
    if (this.currentProfile.tradingInstantSignalRequired && (domain === 'trading' || domain.includes('crypto') || domain.includes('forex'))) {
      if (!cleaned.includes('```json signal') && !cleaned.includes('```signal') && !cleaned.includes('"action":')) {
        violations.push('Format trading belum menyertakan blok kode json signal institusional.');
      }
    }

    return {
      compliant: violations.length === 0,
      violations,
      cleanedText: cleaned
    };
  }
}

export const globalUserMandateRegistry = UserMandateRegistry.getInstance();
