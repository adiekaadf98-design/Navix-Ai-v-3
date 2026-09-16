import { logger } from '../utils/logger';

export class VerificationEngine {
  async verifyOutput(draft: string, originalMessage: string, aiClient: any): Promise<{ text: string, passed: boolean }> {
    try {
      if (!draft || draft.trim() === '') return { text: draft, passed: true };
      // Don't verify if it's purely a media block
      if (draft.includes('```media') || draft.includes('```json media')) {
          return { text: draft, passed: true };
      }

      logger.info("[VerificationEngine] Starting secondary verification pass...");
      const verificationPrompt = `You are the Navix AI Verification Engine. Review the following DRAFT response against the ORIGINAL USER MESSAGE.
      
ORIGINAL USER MESSAGE:
${originalMessage}

DRAFT RESPONSE:
${draft}

TASK:
1. Does the draft accurately answer the user's message?
2. Are there any obvious hallucinations, severe factual errors, or inappropriate content?
3. Is there any broken markdown or unclosed JSON tags?

If the draft is fundamentally flawed, hallucinated, or unsafe, rewrite it to be accurate and safe. 
If the draft is good, return the EXACT original draft response word-for-word, without any introductory commentary like "The draft is good". ONLY output the final verified response.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.1-flash-lite', // Fast verification model
        contents: [{ role: 'user', parts: [{ text: verificationPrompt }] }],
        config: { temperature: 0.1 } // Low temp for factual checking
      });

      const verifiedText = response.text;
      // Exact match means it passed without modification
      const passed = verifiedText.trim() === draft.trim(); 
      if (!passed) {
        logger.warn("[VerificationEngine] Intervened and modified the draft for accuracy/safety.");
      } else {
        logger.info("[VerificationEngine] Draft passed verification.");
      }
      return { text: verifiedText || draft, passed };

    } catch (e) {
      logger.error("[VerificationEngine] Verification failed, returning original draft.", e);
      return { text: draft, passed: false };
    }
  }
}

export const navixVerificationEngine = new VerificationEngine();
