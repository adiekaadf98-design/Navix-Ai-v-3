import { SavedDocument, ChatSession } from '../types';

const STORAGE_KEY = 'navix_saved_documents';

const INITIAL_DOCUMENTS: SavedDocument[] = [
  {
    id: 'doc-navix-architecture',
    title: 'Laporan Riset & Arsitektur Navix AI v3.5',
    content: `# Laporan Riset Navix AI v3.5: Arsitektur Orkestrator Kognitif

## 1. Ringkasan Eksekutif
Navix AI v3.5 mengintegrasikan pipa kognitif berlapis yang menggabungkan:
- **Evidence Engine**: Ekstraksi fakta empiris, parameter teknis, dan klaim logis dari masukan pengguna.
- **Deliberation Council**: Sidang multi-agen yang melibatkan peran Analis, Penguji Kritis, dan Sintesis Penalaran.
- **Enhanced Memory System**: Pengambilan konteks jangka panjang dan jejak pengetahuan berbasis vektor.
- **Anti-Hallucination Guardrails**: Verifikasi silang klaim terhadap sumber data terpercaya sebelum jawaban difinalisasi.

## 2. Metrik Kinerja Inferensi
- Penurunan halusinasi faktual hingga 92.4% pada pengujian multi-domain.
- Waktu latensi rata-rata 1.2 detik dengan streaming token responsif.
- Konsistensi struktur data JSON/CodeBlock mencapai 99.8%.

## 3. Rekomendasi Deployment
Deploy server Node.js terisolasi dengan proxy reverse Nginx dan rotasi kunci API dinamis.`,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    tags: ['Arsitektur', 'AI', 'Kognitif', 'Laporan'],
    source: 'editor'
  },
  {
    id: 'doc-smc-playbook',
    title: 'Trading Plan SMC & Liquidity Orderflow Playbook',
    content: `# Smart Money Concept (SMC) & Liquidity Playbook

## 1. Identifikasi Likuiditas
- **Buy-Side Liquidity (BSL)**: Terletak di atas swing high major dan equal highs (EQH).
- **Sell-Side Liquidity (SSL)**: Terletak di bawah swing low major dan equal lows (EQL).

## 2. Struktur Pasar & Konfirmasi
- **Change of Character (CHoCH)**: Sinyal awal pergeseran momentum tren.
- **Break of Structure (BOS)**: Konfirmasi kelanjutan tren setelah pengambilan likuiditas.
- **Fair Value Gap (FVG)**: Ketidakseimbangan harga 3-candle yang berfungsi sebagai magnet mitigasi order.

## 3. Aturan Eksekusi
1. Tunggu sweep likuiditas pada Higher Timeframe (HTF H1/H4).
2. Konfirmasi CHoCH + FVG pada Lower Timeframe (LTF M5/M15).
3. Entry pada retest 50% FVG atau Order Block (OB).
4. Risk-to-Reward minimum 1:3 dengan stop loss ketat di luar invalidation level.`,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ['Trading', 'SMC', 'Orderflow', 'Forex', 'Crypto'],
    source: 'editor'
  },
  {
    id: 'doc-guardrails-sop',
    title: 'SOP Prompt Engineering & Deliberasi Kognitif',
    content: `# SOP Prompt Engineering & Deliberasi Kognitif

## Prinsip Utama
1. **Empirical Grounding**: Tidak membuat klaim tanpa dukungan data nyata.
2. **Context Preservation**: Menjaga integritas riwayat sesi obrolan tanpa distorsi.
3. **Structured Outputs**: Memastikan blok dokumen, diagram trading, dan kode terformat rapi.

## Langkah Evaluasi
- Validasi parameter masukan
- Pengecekan kontradiksi logis
- Penerapan filter keamanan & batas kuota`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['SOP', 'Prompt', 'Deliberasi'],
    source: 'editor'
  }
];

export function getSavedDocuments(): SavedDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DOCUMENTS));
      return INITIAL_DOCUMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DOCUMENTS));
    return INITIAL_DOCUMENTS;
  } catch (e) {
    console.error('Failed to load saved documents:', e);
    return INITIAL_DOCUMENTS;
  }
}

export function saveDocument(doc: SavedDocument): void {
  try {
    const existing = getSavedDocuments();
    const index = existing.findIndex(d => d.id === doc.id);
    const updatedDoc = {
      ...doc,
      updatedAt: new Date().toISOString()
    };

    let updatedList: SavedDocument[];
    if (index >= 0) {
      updatedList = [...existing];
      updatedList[index] = updatedDoc;
    } else {
      updatedList = [updatedDoc, ...existing];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.error('Failed to save document:', e);
  }
}

export function deleteDocument(id: string): void {
  try {
    const existing = getSavedDocuments();
    const filtered = existing.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete document:', e);
  }
}

export function createNewDocument(title = 'Dokumen Baru', content = '# Dokumen Baru\n\nTulis isi dokumen Anda di sini...'): SavedDocument {
  const newDoc: SavedDocument = {
    id: `doc_${Date.now()}`,
    title,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Draft'],
    source: 'editor'
  };
  saveDocument(newDoc);
  return newDoc;
}

/**
 * Extracts documents generated inside chat messages (e.g. ```document ... ``` or DocumentData)
 */
export function extractDocumentsFromSessions(sessions: ChatSession[]): SavedDocument[] {
  const extracted: SavedDocument[] = [];
  const docRegex = /```(?:json)?\s*document\n([\s\S]*?)```/i;

  sessions.forEach(session => {
    session.messages.forEach(msg => {
      if (!msg.text) return;
      const match = msg.text.match(docRegex);
      if (match) {
        try {
          const parsed = JSON.parse(match[1]);
          if (parsed && (parsed.title || parsed.content)) {
            extracted.push({
              id: `chat_doc_${msg.id}`,
              title: parsed.title || `Dokumen Chat: ${session.title}`,
              content: parsed.content || '',
              createdAt: typeof msg.timestamp === 'string' ? msg.timestamp : (msg.timestamp?.toISOString() || new Date().toISOString()),
              updatedAt: typeof msg.timestamp === 'string' ? msg.timestamp : (msg.timestamp?.toISOString() || new Date().toISOString()),
              tags: ['Chat AI', 'Generated'],
              source: 'chat',
              sessionId: session.id
            });
          }
        } catch {
          // Ignore invalid JSON in block
        }
      }
    });
  });

  return extracted;
}
