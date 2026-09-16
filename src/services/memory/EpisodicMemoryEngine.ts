/**
 * NAVIX AI — EPISODIC MEMORY & KNOWLEDGE GRAPH ENGINE
 * 
 * Synthesizes long-term user trading style, preferred technical setups (SMC, SNR, Scalp),
 * codebase tech stack choices, and decision logs into an indexed memory matrix.
 */

export interface EpisodicMemoryNode {
  id: string;
  category: 'TRADING_STRATEGY' | 'RISK_TOLERANCE' | 'PREFERRED_TECH' | 'DEVELOPER_HABIT' | 'ANALYTICS_PATTERN' | 'MULTIMEDIA_PREFERENCE' | 'DOCUMENT_STYLE' | 'SECURITY_POSTURE';
  key: string;
  value: any;
  confidenceScore: number; // 0.0 - 1.0
  observationsCount: number;
  lastUpdated: string;
  relatedEntities: string[];
}

export interface UserNavixProfile {
  primaryTradingStyle: 'SMC_ICT' | 'CLASSIC_SNR' | 'SCALPER' | 'SWING_TREND' | 'HYBRID';
  preferredTimeframes: string[];
  favoriteSymbols: string[];
  maxDrawdownRiskPct: number;
  averageRiskRewardTarget: number;
  preferredCodingLanguages: string[];
  preferredVisualStyles: string[];
  documentSummaryFormat: 'EXECUTIVE_BULLETS' | 'DEEP_ANALYTIC' | 'HIERARCHICAL';
  securityZeroTrustEnabled: boolean;
  customRules: string[];
}

export type UserTradingProfile = UserNavixProfile;

export class EpisodicMemoryEngine {
  private memoryStore: Map<string, EpisodicMemoryNode> = new Map();
  private storageKey = 'navix_episodic_memory_matrix_v1';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          Object.entries(parsed).forEach(([k, v]) => {
            this.memoryStore.set(k, v as EpisodicMemoryNode);
          });
        }
      }
    } catch (e) {
      console.warn('[EpisodicMemory] Could not load stored memories', e);
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const obj: Record<string, any> = {};
        this.memoryStore.forEach((val, key) => {
          obj[key] = val;
        });
        window.localStorage.setItem(this.storageKey, JSON.stringify(obj));
      }
    } catch (e) {
      console.warn('[EpisodicMemory] Could not persist memories', e);
    }
  }

  /**
   * Records an observed behavioral signal or user preference.
   */
  public recordObservation(
    category: EpisodicMemoryNode['category'],
    key: string,
    value: any,
    relatedEntities: string[] = []
  ): void {
    const existing = this.memoryStore.get(key);
    if (existing) {
      existing.observationsCount += 1;
      existing.value = value;
      existing.confidenceScore = Math.min(1.0, existing.confidenceScore + 0.15);
      existing.lastUpdated = new Date().toISOString();
      existing.relatedEntities = Array.from(new Set([...existing.relatedEntities, ...relatedEntities]));
      this.memoryStore.set(key, existing);
    } else {
      this.memoryStore.set(key, {
        id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        category,
        key,
        value,
        confidenceScore: 0.5,
        observationsCount: 1,
        lastUpdated: new Date().toISOString(),
        relatedEntities
      });
    }
    this.saveToStorage();
  }

  /**
   * Generates a synthesized context prompt injection for LLM without blowing up token usage.
   */
  public generateMemoryContextSummary(): string {
    const topMemories = Array.from(this.memoryStore.values())
      .filter(m => m.confidenceScore >= 0.4)
      .slice(0, 10);

    if (topMemories.length === 0) {
      return 'User Profile: Standard Navix AI Trader & Builder.';
    }

    const bulletPoints = topMemories.map(m => {
      const valStr = typeof m.value === 'object' ? JSON.stringify(m.value) : String(m.value);
      return `- [${m.category}] ${m.key}: ${valStr} (Confidence: ${(m.confidenceScore * 100).toFixed(0)}%)`;
    });

    return `[NAVIX DEEP EPISODIC MEMORY SYNTHESIS]:\n${bulletPoints.join('\n')}`;
  }

  public getSynthesizedUserProfile(): UserNavixProfile {
    const styleMem = this.memoryStore.get('trading_style')?.value || 'HYBRID';
    const tfMem = this.memoryStore.get('preferred_timeframes')?.value || ['15m', '1h', '4h'];
    const symMem = this.memoryStore.get('favorite_symbols')?.value || ['XAUUSD', 'BTCUSDT', 'EURUSD'];
    const riskMem = Number(this.memoryStore.get('max_risk_pct')?.value || 2.0);
    const rrMem = Number(this.memoryStore.get('preferred_rr_ratio')?.value || 2.5);
    const techMem = this.memoryStore.get('tech_stack')?.value || ['TypeScript', 'React', 'Tailwind', 'Python'];
    const visualMem = this.memoryStore.get('visual_styles')?.value || ['Photorealistic', 'Cinematic HDR', 'Vector Minimal'];
    const docMem = this.memoryStore.get('document_format')?.value || 'EXECUTIVE_BULLETS';
    const zeroTrustMem = Boolean(this.memoryStore.get('zero_trust_enabled')?.value ?? true);

    return {
      primaryTradingStyle: styleMem,
      preferredTimeframes: tfMem,
      favoriteSymbols: symMem,
      maxDrawdownRiskPct: riskMem,
      averageRiskRewardTarget: rrMem,
      preferredCodingLanguages: techMem,
      preferredVisualStyles: visualMem,
      documentSummaryFormat: docMem,
      securityZeroTrustEnabled: zeroTrustMem,
      customRules: [
        'Always verify Order Block / FVG confluence before high-risk execution',
        'Maintain minimum 1:2 Risk to Reward',
        'Zero-trust sanitization and code execution sandboxing'
      ]
    };
  }

  public getAllNodes(): EpisodicMemoryNode[] {
    return Array.from(this.memoryStore.values());
  }

  public clearMemories(): void {
    this.memoryStore.clear();
    this.saveToStorage();
  }
}

export const episodicMemory = new EpisodicMemoryEngine();
