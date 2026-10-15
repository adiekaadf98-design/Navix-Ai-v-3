# NAVIX PRO AI — Audit Kinerja Menyeluruh & Implementasi Finishing Synthesis Engine

Rencana peningkatan arsitektural dan optimasi menyeluruh untuk seluruh mesin di balik layar NAVIX PRO AI: mulai dari **Dewan Deliberasi (AI Debat: Horizon, Veritas, Apex, Sovereign)**, **API Key Rotator & Model Router**, **PILGUN (Pilihan Guna) & GitHub Open-Source Skills Hub**, hingga pembuatan mesin baru **FinishingSynthesisEngine** untuk menghasilkan jawaban realistis, tajam, luwes (*non-stiff*), dan berkekuatan penuh tanpa merusak standar fidelitas data institusional NAVIX.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan Terkonfirmasi dari Evaluasi & Arahan Pengguna:**
> - **Cakupan Audit**: Seluruh rantai mesin di balik layar dievaluasi secara end-to-end (User Input ➔ AI Debat ➔ Intent Analyzer ➔ Pilgun Router ➔ Multi-Engine Execution ➔ Quality Gate ➔ Finishing Engine ➔ User Delivery).
> - **Penyebab Utama Respon Kaku & Formulaik**:
>   1. Nilai *temperature* hardcoded `0.1` di endpoint chat backend yang memaksa model merespon secara kaku dan berulang-ulang seperti mesin birokratis.
>   2. Ketiadaan lapisan *Finishing Engine* spesifik yang bertugas menyelaraskan bahasa teknis mesin ke dalam prosa yang luwes, natural, dan berwibawa (*human-expert nuance*) tanpa mengorbankan angka empiris.
>   3. Teks pengantar dan direktif sistem yang terlalu kaku dan sering bocor atau memicu gaya bicara mekanis.
> - **Mandat Arsitektur Mutlak**: Dilarang menggabungkan mesin menjadi monolit (black-box). Seluruh komputasi tetap wajib dijalankan oleh mesin spesialis. Model AI murni bertindak sebagai pengarah instruksi dan penyusun kalimat akhir berbasis hasil kalkulasi nyata.

---

## 1. Overview & Core Concept

- **Apa yang Dibangun & Ditingkatkan**:
  1. **Pembuatan FinishingSynthesisEngine (`src/services/FinishingSynthesisEngine.ts`)**:
     Mesin baru yang bertindak sebagai jembatan cerdas antara keluaran empiris mesin (trading, code, math, research, multimedia, docling) dengan AI Response Formatter. Mesin ini mengeliminasi gaya bahasa kaku ("Berdasarkan data mesin...", "Sebagai AI..."), menyelaraskan intonasi sesuai konteks, memperkaya kedalaman analisis, serta memastikan 100% data terhitung tersaji secara presisi dan elegan.
  2. **Optimalisasi AI Debat & Deliberation Council**:
     Memperjelas mandat agen deliberasi (Horizon dekonstruksi maksud, Veritas anti-halusinasi data, Apex seleksi mesin, Sovereign mandat eksekutif) agar menghasilkan direktif finishing yang kontekstual.
  3. **Penyesuaian Adaptif API Key Router & Chat Temperature**:
     Menerapkan suhu (*temperature*) dinamis berbasis domain (0.15–0.25 untuk kalkulasi presisi & sinyal trading; 0.65–0.70 untuk penalaran konseptual, penulisan kreatif, strategi, dan dialog interaktif) sehingga jawaban mengalir realistis, tajam, dan tidak kaku.
  4. **Penguatan Pilgun (Pilihan Guna) & GitHub Skills M2M Handoff**:
     Memastikan output dari setiap tahapan mesin tersalurkan secara utuh ke tahap berikutnya tanpa pemotongan data (*zero data loss*).

- **Nilai Utama**:
  - **Realisme & Keluwesan**: Jawaban mengalir laksana analisis pakar senior institusional yang luwes, kontekstual, dan tajam.
  - **Fidelitas Empiris 100%**: Tidak ada angka, harga, level Stop Loss, Take Profit, atau hasil kalkulasi matematika yang diubah atau dikarang.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Natural Input & Contextual Intent**: Pengguna memasukkan instruksi dalam bahasa apa pun (santai, teknis, atau kompleks).
2. **Invisible Deliberation & Smart Dispatching**: Dewan Deliberasi membedah maksud pengguna di balik layar, memilih mesin terbaik via PILGUN (Core Engine vs Open-Source GitHub vs MCP).
3. **Step-by-Step Machine Execution**: Mesin-mesin spesialis menjalankan komputasi nyata (latensi riil, feed pasar aktual, parsing dokumen asli).
4. **Finishing Engine Synthesis**: Hasil mentah mesin disaring oleh Finishing Engine untuk menentukan nada bicara, kedalaman uraian, dan struktur sajian yang realistis.
5. **Polished Institutional Response**: Pengguna menerima jawaban komprehensif, tidak kaku, siap aksi, lengkap dengan artefak visual, sinyal trading institucional, atau kode yang teruji.

### Visual Identity & Theme
- **Aesthetic Direction**: *Institutional High-Density Dark Theme* berstandar terminal intelijen kuantitatif.
- **Color Tokens**:
  - Latar Belakang: Neutral Dark Slate (`#0A0F1D` / `#0F172A`)
  - Permukaan Komponen: Slate Surface Hairline (`#1E293B`, border `rgba(255,255,255,0.08)`)
  - Aksen Fungsional: Biru Kobalt (`#2563EB`), Emerald Verifikasi (`#059669`), dan Amber Strategi (`#D97706`).
- **Zero-Pill Discipline**:
  - Telemetri dan metadata disajikan bersih dengan pemisah tipografis (`·`, `/`) tanpa capsule badge bertumpuk.
  - Tab status mesin menggunakan segmented toggle yang tenang dan fungsional.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Pembuatan FinishingSynthesisEngine Khusus vs Mengubah Seluruh Kode Engine Lama
- **Pendekatan Terpilih**: Menambahkan `FinishingSynthesisEngine.ts` sebagai mesin finishing resmi dan menyambungkannya ke `Orchestrator.ts` dan `server.ts`.
- **Alasan**: Menghindari perombakan destruktif pada mesin-mesin inti (`MathEngine`, `SignalEngine`, `TradingEngine`) yang sudah bekerja dengan benar. Finishing Engine bertindak sebagai lapisan penyempurna gaya (*stylistic & semantic refinement layer*) yang menjaga integritas data mesin.

### Decision 2: Suhu (*Temperature*) Adaptif vs Suhu Tetap (0.1)
- **Pendekatan Terpilih**: Suhu dinamis ditentukan otomatis oleh kategori tugas:
  - *Sinyal Trading / Matematika Ketat*: `0.2` (presisi deterministik maksimal).
  - *Coding & Analisis Arsitektur*: `0.35` (keseimbangan sintaksis presisi dan penjelasan arsitektur).
  - *Penelitian, Diskusi Kuantitatif, Analisis Strategis, Dialog Umum*: `0.65` (fleksibel, realistis, tajam, dan tidak kaku).
- **Alasan**: Hardcoded `0.1` adalah penyebab utama respons terasa kaku, dingin, dan seperti robot mekanis.

### Decision 3: Eliminasi Teks Boilerplate & Pseudo-Technical Jargon
- **Pendekatan Terpilih**: Filter pembersihan respons yang lebih cerdas untuk membuang teks template birokratis tanpa memotong penjelasan substansial atau blok kode/sinyal.

---

## 4. Technical Architecture & Data Strategy

### ASCII Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          USER PROMPT / TASK                            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             DEWAN DELIBERASI & TASK INTENT ANALYZER (AI DEBAT)         │
│  - Horizon: Intent Deconstruction & Anti-Laziness Directives           │
│  - Veritas: Adversarial Fact-Checking & Empirical Grounding            │
│  - Apex: Machine Routing Arbitrator & Open-Source Evaluator            │
│  - Sovereign: Executive Synthesis Mandate & Finishing Directives       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              PILGUN (PILIHAN GUNA) & SKILLS ROUTER (M2M)               │
│  - NAVIX Core Engines: SignalEngine, MathEngine, DocEngine, dll.       │
│  - GitHub Open-Source: CCXT, TA-Lib, Fooocus, Docling, Crawl4AI        │
│  - MCP Skills Hub: 35+ Integrated Server Tools                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     STEP-BY-STEP ENGINE EXECUTION                      │
│            Tahap 1 (Mesin A) ➔ Tahap 2 (Mesin B) ➔ Tahap 3             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               QUALITY GATE & VERIFICATION ENGINE (VERITAS)             │
│        Audit Byte Size, Faktual, Finite Numbers, No Placeholders       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Verified Empirical Payload)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               ⚡ BARU: FINISHING SYNTHESIS ENGINE ⚡                     │
│  - Menghilangkan frasa kaku / boilerplate mekanis                      │
│  - Mengadaptasi intonasi: Otoritatif, Realistis, Tajam, Luwes          │
│  - Menyesuaikan Temperature Dinamis (0.2 s/d 0.68)                     │
│  - Mengikat 100% data terhitung ke dalam narasi bervalue tinggi        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   AI RESPONSE FORMATTER & USER DELIVERY                │
│    Prosa Luwes & Realistis  │  JSON Signal  │  Media Cards  │  Tables  │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & File Work Plan

1. **`src/services/FinishingSynthesisEngine.ts` (Mesin Baru)**:
   - Menganalisis payload hasil komputasi mesin.
   - Menyusun direktif penyajian bahasa alami (*Natural Presentation Directives*).
   - Menghitung suhu optimal (`recommendedTemperature`) dan format penyajian ideal.
   - Menyediakan pembersih nada kaku (*anti-stiffness tone filter*).

2. **`src/services/Orchestrator.ts` (Penyambungan & Penguatan)**:
   - Mengintegrasikan `FinishingSynthesisEngine` sebelum panggilan chat backend.
   - Meneruskan `finishingDirectives` dan `recommendedTemperature` ke `/api/chat`.
   - Mengoptimalkan data handoff antar mesin pada mode pipeline.

3. **`server.ts` (Backend API Chat & Temperature Routing)**:
   - Menerima `temperature` dinamis dari request (tidak lagi dipatok mati pada `0.1`).
   - Menyempurnakan `systemInstruction` agar AI menyajikan jawaban langsung secara komprehensif tanpa kalimat pengantar kosong atau gaya robotik.

4. **`src/services/council/DeliberationCouncilEngine.ts` (Penguatan Deliberasi)**:
   - Memastikan Sovereign merumuskan *Finishing Tone* yang tajam dan fleksibel sesuai niat pengguna.

5. **Verifikasi & Pengujian Mutu**:
   - Menjalankan `compile_applet` dan `lint_applet` untuk menjamin nol regresi.
   - Menguji permintaan multi-domain (trading, matematika, koding, analisis umum) untuk memverifikasi hilangnya kekakuan dan bertambahnya ketajaman jawaban.
