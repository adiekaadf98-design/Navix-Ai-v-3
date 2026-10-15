/**
 * NAVIX PRO AI — FINISHING SYNTHESIS ENGINE
 * 
 * Mesin Spesialis Finishing & Natural Presentation:
 * Bertindak sebagai lapisan penyempurna akhir yang menjembatani hasil komputasi empiris
 * dari mesin-mesin spesialis (MathEngine, SignalEngine, CodingEngine, Docling, Multimedia, dll.)
 * ke dalam penyajian AI Response Formatter.
 * 
 * Tujuan Utama:
 * 1. Mengeliminasi kekakuan bahasa, boilerplate birokratis ("Berdasarkan data mesin..."), dan gaya robotik.
 * 2. Mengadaptasi temperature secara dinamis sesuai domain (0.2 untuk presisi trading/math s/d 0.68 untuk penalaran/strategi).
 * 3. Mengikat 100% data empiris terhitung ke dalam narasi berwibawa, tajam, kontekstual, dan mengalir alami.
 * 4. Menjamin 0% kebocoran tag debug/telemetri ke obrolan pengguna.
 */

export type FinishingTone = 
  | 'INSTITUTIONAL_STRATEGIC'   // Trading, pasar modal, analisis risiko, audit keuangan
  | 'CODE_ARCHITECTURAL'        // Rekayasa perangkat lunak, debugging, refactor
  | 'MATHEMATICAL_DETERMINISTIC'// Aritmatika, kalkulasi presisi tinggi, persamaan
  | 'ACADEMIC_RESEARCH'         // Sains, deep research, investigasi literatur
  | 'MULTIMEDIA_CREATIVE'       // Seni rupa, video cinematic, musik, desain
  | 'EXECUTIVE_CONVERSATIONAL'; // Dialog umum, konseptual, konsultasi, sapaan

export interface FinishingSynthesisConfig {
  domain: string;
  taskCategory?: string | null;
  hasEngineOutput: boolean;
  engineName?: string;
  hasMediaArtifact?: boolean;
  isCodeTask?: boolean;
  isTradingTask?: boolean;
  isMathTask?: boolean;
}

export interface FinishingMandate {
  tone: FinishingTone;
  recommendedTemperature: number;
  antiStiffnessRules: string[];
  naturalFramingDirective: string;
  preservationRules: string[];
}

export class FinishingSynthesisEngine {
  private static instance: FinishingSynthesisEngine;

  public static getInstance(): FinishingSynthesisEngine {
    if (!FinishingSynthesisEngine.instance) {
      FinishingSynthesisEngine.instance = new FinishingSynthesisEngine();
    }
    return FinishingSynthesisEngine.instance;
  }

  /**
   * Menganalisis konteks tugas dan menyusun mandat finishing yang tajam dan luwes.
   */
  public formulateMandate(config: FinishingSynthesisConfig): FinishingMandate {
    const domain = (config.domain || config.taskCategory || 'general').toLowerCase();

    // 1. Domain: Trading & Quant Market
    if (config.isTradingTask || domain.includes('trading') || domain.includes('crypto') || domain.includes('forex') || domain.includes('gold')) {
      return {
        tone: 'INSTITUTIONAL_STRATEGIC',
        recommendedTemperature: 0.22,
        antiStiffnessRules: [
          'DILARANG membuka dengan kalimat basa-basi seperti "Berdasarkan sinyal trading yang telah dihitung oleh mesin...".',
          'DILARANG menyajikan data sebagai daftar mentah tanpa narasi konteks pasar (market structure, liquidity sweep, invalidation).',
          'Langsung sajikan tesis pasar secara lugas, tajam, dan percaya diri seperti Head of Trading Desk institusional.'
        ],
        naturalFramingDirective: 'Sajikan analisa berbasis aksi nyata: jelaskan mengapa level entry tersebut strategis, risiko apa yang dihadapi, dan bagaimana order limit harus dieksekusi. Akhiri dengan blok json signal institusional murni.',
        preservationRules: [
          'Pertahankan 100% angka numerik asli (Entry, SL, TP1, TP2, Live Price, Rasio Risk:Reward). DILARANG membulatkan secara sembrono.'
        ]
      };
    }

    // 2. Domain: Math & Arithmetic
    if (config.isMathTask || domain.includes('math') || domain.includes('arithmetic')) {
      return {
        tone: 'MATHEMATICAL_DETERMINISTIC',
        recommendedTemperature: 0.15,
        antiStiffnessRules: [
          'DILARANG bertele-tele membuat kalimat pengantar kosong.',
          'Sajikan hasil perhitungan langsung di baris teratas, lalu sertakan penjabaran analitis yang elegan.'
        ],
        naturalFramingDirective: 'Fokus pada kejelasan langkah demi langkah dan verifikasi ketelitian nilai eksak.',
        preservationRules: [
          'Hasil numerik dari MathEngine adalah mutlak dan tidak boleh diubah 1 digit pun.'
        ]
      };
    }

    // 3. Domain: Coding & Software Engineering
    if (config.isCodeTask || domain.includes('code') || domain.includes('coding') || domain.includes('developer') || domain.includes('bug')) {
      return {
        tone: 'CODE_ARCHITECTURAL',
        recommendedTemperature: 0.32,
        antiStiffnessRules: [
          'DILARANG menulis komentar kode "TODO: implement here" atau memotong kode dengan "...rest of code".',
          'DILARANG menggunakan bahasa tutorial pemula jika pengguna meminta arsitektur production.',
          'Berikan kode lengkap, teruji, tipe TypeScript ketat, dan siap pakai.'
        ],
        naturalFramingDirective: 'Gaya Staff Principal Engineer: jelaskan trade-off desain secara ringkas dan lugas, lalu berikan blok kode lengkap dengan arsitektur bersih.',
        preservationRules: [
          'Sintaksis kode harus valid, modular, dan mematuhi kaidah runtime lingkungan.'
        ]
      };
    }

    // 4. Domain: Research, Science, Documents
    if (domain.includes('research') || domain.includes('science') || domain.includes('document') || domain.includes('pdf')) {
      return {
        tone: 'ACADEMIC_RESEARCH',
        recommendedTemperature: 0.55,
        antiStiffnessRules: [
          'DILARANG membatasi diri pada rangkuman dangkal 2 paragraf.',
          'DILARANG menggunakan frasa birokratis "Hasil pencarian menunjukkan bahwa...".',
          'Rangkai temuan secara berbobot, komparatif, dan sertakan rujukan metodologis yang logis.'
        ],
        naturalFramingDirective: 'Gaya Lead Analyst / Senior Researcher: sajikan sintesis mendalam dengan struktur heading teratur, data tabular, dan wawasan kritis.',
        preservationRules: [
          'Setiap fakta empiris dan kutipan sumber harus konsisten dengan temuan mesin.'
        ]
      };
    }

    // 5. Domain: Multimedia
    if (config.hasMediaArtifact || domain.includes('media') || domain.includes('image') || domain.includes('video') || domain.includes('audio')) {
      return {
        tone: 'MULTIMEDIA_CREATIVE',
        recommendedTemperature: 0.65,
        antiStiffnessRules: [
          'DILARANG menambahkan teks penjelasan panjang jika hasil media sudah dirender.',
          'Tampilkan artefak tepat satu kali tanpa perulangan.'
        ],
        naturalFramingDirective: 'Fokus pada kualitas estetika dan rincian parameter sensor/lensa/komposisi.',
        preservationRules: [
          'Blok media JSON harus sesuai dengan MIME dan payload biner yang dihasilkan.'
        ]
      };
    }

    // 6. Domain: Default / Strategic Discussion / Conversational Reasoning
    return {
      tone: 'EXECUTIVE_CONVERSATIONAL',
      recommendedTemperature: 0.68,
      antiStiffnessRules: [
        'DILARANG menggunakan bahasa kaku atau template robot seperti "Halo! Sebagai asisten AI...", "Saya siap membantu Anda dengan...", "Berdasarkan pertanyaan Anda...".',
        'DILARANG menjawab terlalu singkat atau malas ketika pertanyaan membutuhkan eksplorasi komprehensif.',
        'Gunakan bahasa Indonesia yang profesional, hangat, berkelas, cerdas, mengalir alami, dan berwawasan luas.'
      ],
      naturalFramingDirective: 'Berikan perspektif yang tajam, solutif, komprehensif, dan mudah dipahami dengan analogi cerdas bila diperlukan.',
      preservationRules: [
        'Pertahankan integritas logika dan kebenaran faktual tanpa spekulasi yang menyesatkan.'
      ]
    };
  }

  /**
   * Menyaring dan membersihkan respons mentah dari model AI untuk membuang artefak sistem,
   * sisa tag internal, dan pembuka yang kaku.
   */
  public polishFinalResponse(text: string): string {
    if (!text || typeof text !== 'string') return '';

    let cleaned = text
      // 1. Bersihkan sisa tag XML internal
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/<deliberation>[\s\S]*?<\/deliberation>/gi, '')
      .replace(/<verification>[\s\S]*?<\/verification>/gi, '')
      
      // 2. Bersihkan tag bracket dan blok booster internal yang bocor
      .replace(/\[⚡ NAVIX AI PERFORMANCE BOOSTER[\s\S]*?\[MANDAT MUTLAK\]:[^\n]*/gi, '')
      .replace(/\[HASIL NYATA EKSEKUSI ENGINE[\s\S]*?\[INSTRUKSI UTAMA & MANDAT MUTLAK[^\]]*\]:[^\n]*/gi, '')
      .replace(/\[MANDAT FINISHING ELEGAN & NADA BICARA ALAMI\][\s\S]*?(?=\n\n|$)/gi, '')
      .replace(/^\s*-\s*(?:Status Booster|Konsensus Dewan Deliberasi|Petunjuk Anti-Kemalasan|Audit Risiko Halusinasi|Bukti Empiris Terverifikasi|Konteks Memori Kognitif|Waktu Komputasi|Harga Pasar Terkini|Pesan Mesin|Nama Mesin|Status Eksekusi|Nada Utama|Arahan Presentasi|Aturan Anti-Kekakuan):[^\n]*/gim, '')
      .replace(/\[STATUS EKSEKUSI ENGINE:[^\]]*\]:?[^\n]*/gi, '')
      .replace(/\[MANDAT MUTLAK\]:?[^\n]*/gi, '')
      .replace(/\[MANDAT KOGNITIF NAVIX AI\]:?[^\n]*/gi, '')
      .replace(/\[COUNCIL_DIRECTIVE:[^\]]*\]/gi, '')
      .replace(/\[INTERNAL EXECUTION TRACE[^\]]*\]/gi, '')
      .replace(/\[INTERNAL TELEMETRY:[^\]]*\]/gi, '')
      .replace(/\[SYSTEM CONTEXT:[^\]]*\]/gi, '')
      .replace(/\[PROMPT_INJECTION_DEFENSE:[^\]]*\]/gi, '')
      .replace(/\[ROUTING_METADATA:[^\]]*\]/gi, '')
      .replace(/\[GATE_RESULT:[^\]]*\]/gi, '');

    // Trim sebelum membersihkan frasa pembuka kaku
    cleaned = cleaned.trim();

    // 3. Bersihkan pembuka template yang kaku di awal pesan
    cleaned = cleaned
      .replace(/^(?:(?:Tentu(?: saja)?|Baik(?:lah)?|Halo|Hai)[\s,!.-]+(?:(?:saya|kami) akan (?:membantu|menjelaskan|menjawab|memproses|berikan)[^.\n]*[.,!\n]+\s*)+)/i, '')
      .replace(/^(?:Berikut (?:adalah|merupakan|ini) (?:hasil|jawaban|analisis|kalkulasi|solusi|penjelasan)[^:\n]*:?\s*)+/i, '')
      .replace(/^(?:Berdasarkan (?:analisis|data|perhitungan|eksekusi|permintaan|informasi) (?:di atas|yang telah dilakukan|mesin|Anda)[^:\n]*:?\s*)+/i, '');

    // 4. Normalisasi spasi berlebih
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

    return cleaned;
  }
}

export const globalFinishingEngine = FinishingSynthesisEngine.getInstance();
