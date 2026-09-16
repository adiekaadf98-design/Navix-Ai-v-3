import { logger } from '../utils/logger';

export class BackendThinkingEngine {
  
  async analyzeIntent(message: string): Promise<string> {
    logger.info(`ThinkingEngine: Analyzing intent for: ${message.substring(0, 50)}...`);
    const q = message.toLowerCase();
    if (/(btc|eth|xau|gold|emas|forex|eurusd|gbpusd|trading|buy|sell|support|resistance|snr|rbs|sbr)/.test(q)) return 'trading';
    if (/(gambar|image|foto|visual|buat gambar)/.test(q)) return 'image';
    if (/(video|animasi|t2v|i2v)/.test(q)) return 'video';
    if (/(kode|coding|program|bug|debug|typescript|javascript|python)/.test(q)) return 'coding';
    if (/(dokumen|pdf|laporan|file)/.test(q)) return 'document';
    if (/(cari|search|riset|research|sumber)/.test(q)) return 'research';
    return 'general_chat';
  }

  async planSteps(intent: string, goal: string) {
    logger.info(`ThinkingEngine: Planning steps for intent ${intent}`);
    const steps = [{ step: 1, action: `route:${intent}`, status: 'pending' }, { step: 2, action: 'execute_selected_capability', status: 'pending' }];
    return steps;
  }
}

export const thinkingEngine = new BackendThinkingEngine();
