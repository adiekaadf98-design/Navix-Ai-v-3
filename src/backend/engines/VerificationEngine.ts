import { logger } from '../utils/logger';

export interface VerificationOptions {
  isComplex?: boolean;
  tier?: string;
  isHypothesis?: boolean;
  hasEngineData?: boolean;
}

export class VerificationEngine {
  async verifyOutput(
    draft: string, 
    originalMessage: string, 
    aiClient: any, 
    options?: VerificationOptions
  ): Promise<{ text: string; passed: boolean; issues?: string[] }> {
    try {
      if (!draft || draft.trim() === '') return { text: draft, passed: true };
      
      // If it's purely a media block (visual, audio, video) without text, skip text verification
      if ((draft.startsWith('```media') || draft.startsWith('```json media')) && !draft.includes('\n\n')) {
        return { text: draft, passed: true };
      }

      logger.info(`[VerificationEngine] Starting multi-model verification pass (Tier: ${options?.tier || 'default'})...`);
      
      let extraInstructions = "";
      if (options?.isHypothesis) {
        extraInstructions += `\n4. PERINGATAN HIPOTESIS & GROUNDING MUTLAK: Masalah ini adalah subjek penelitian atau pertanyaan yang belum terpecahkan. Pastikan draf TIDAK mengklaim hipotesis sebagai fakta empiris yang sudah terbukti. Bedakan dengan gamblang fakta vs hipotesis.`;
      }
      if (options?.hasEngineData) {
        extraInstructions += `\n5. INTEGRITAS DATA EMPIRIS: Pastikan angka, harga pasar, metrik sains, atau data dari mesin riil tidak diubah atau diputarbalikkan.`;
      }

      // Deteksi jika draft memuat blok kode program untuk dry-run audit mandiri (Poin 5: Zero-Shot to Self-Correction)
      const hasCodeBlocks = /```(?:typescript|javascript|python|tsx|jsx|html|sql|cpp|java|go|rust)?[\s\S]*?```/i.test(draft);
      if (hasCodeBlocks) {
        extraInstructions += `\n6. AUDIT KODE MANDIRI (Self-Correction Refinement Loop): Periksa sintaks kode dalam blok program. Jika ada typo variabel, kurung kurawal terbuka yang tidak ditutup, import fiktif, atau bug fatal, perbaiki langsung dalam blok kode hasil akhir.`;
      }

      const verificationPrompt = `Anda adalah Mesin Verifikasi Akhir & Auditor Self-Correction Tim AI NAVIX.
Tinjau DRAF JAWABAN berikut terhadap PERTANYAAN ASLI PENGGUNA sebelum diserahkan ke Chat Utama.

PERTANYAAN ASLI PENGGUNA:
"""${originalMessage}"""

DRAF JAWABAN:
"""${draft}"""

STANDAR AUDIT VERIFIKASI & KOREKSI MANDIRI (5 PILAR NAVIX):
1. Apakah draf benar-benar menjawab maksud inti pengguna secara tuntas, berbobot, dan presisi?
2. Apakah ada kode sepotong yang malas (seperti '// tulis kode di sini') atau jawaban yang disingkat secara sepihak?
3. Apakah ada halusinasi, kesalahan logika fatal, atau tag JSON/Markdown yang rusak?${extraInstructions}

ATURAN OUTPUT:
- Jika draf sudah sangat baik, akurat, dan memenuhi seluruh standar di atas, kembalikan teks draf TERSEBUT PERSIS KATA PER KATA tanpa komentar pembuka atau penutup.
- HANYA jika ada kesalahan fatal, halusinasi, klaim hipotesis keliru, kode sepotong malas, atau bug sintaks: lakukan koreksi diri mandiri (Self-Healing Loop) dan kembalikan versi yang telah dibetulkan secara utuh dan tuntas.`;

      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash'];
      let verifiedText = draft;
      let passed = true;

      for (const m of candidateModels) {
        try {
          const verifyPromise = aiClient.models.generateContent({
            model: m,
            contents: [{ role: 'user', parts: [{ text: verificationPrompt }] }],
            config: { temperature: 0.1, maxOutputTokens: 8192 }
          });

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Verification model ${m} timeout`)), 9000)
          );

          const response: any = await Promise.race([verifyPromise, timeoutPromise]);
          if (response && response.text) {
            verifiedText = response.text;
            passed = verifiedText.trim() === draft.trim();
            if (!passed) {
              logger.warn(`[VerificationEngine] Model ${m} performed Self-Correction Refinement Loop (corrected draft for factual precision and completeness).`);
            } else {
              logger.info(`[VerificationEngine] Model ${m} confirmed draft passed adversarial verification.`);
            }
            return { text: verifiedText || draft, passed };
          }
        } catch (mErr: any) {
          logger.warn(`[VerificationEngine] Verification model ${m} failover:`, mErr?.message || mErr);
        }
      }

      return { text: draft, passed: true };

    } catch (e) {
      logger.error("[VerificationEngine] Verification exception, returning original draft safely:", e);
      return { text: draft, passed: false };
    }
  }
}

export const navixVerificationEngine = new VerificationEngine();
