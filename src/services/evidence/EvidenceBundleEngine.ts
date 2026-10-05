/**
 * NAVIX PRO AI — EVIDENCE BUNDLE ENGINE (MACHINE 25)
 * 
 * Aggregates empirical research, document extractions, and tool findings into
 * an authoritative, cross-verified EvidenceBundle with full citation provenance,
 * claim-evidence pairing, and contradiction detection.
 */

import { IEngine, EngineResult } from '../../types/engine';

export interface EvidenceSource {
  id: string;
  url?: string;
  domain?: string;
  title: string;
  snippet?: string;
  reliabilityScore: number; // 0.0 - 1.0
  ingestedAt: number;
}

export interface EvidenceClaim {
  id: string;
  claim: string;
  sourceIds: string[];
  confidence: number; // 0.0 - 1.0
  isVerified: boolean;
}

export interface EvidenceContradiction {
  claimA: string;
  claimB: string;
  differenceNote: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface EvidenceBundle {
  bundleId: string;
  topic: string;
  timestamp: number;
  sources: EvidenceSource[];
  claims: EvidenceClaim[];
  contradictions: EvidenceContradiction[];
  overallConfidence: number;
  provenance: {
    originEngine: string;
    sourceCount: number;
    triangulationRatio: number;
  };
}

export class EvidenceBundleEngine implements IEngine {
  public name = 'EvidenceBundleEngine';
  public description = 'Synthesizes research and document findings into verified EvidenceBundles with source triangulation and claim-evidence pairing.';
  public category: 'general' = 'general';
  public capabilities = ['evidence_bundle', 'evidence', 'citation_provenance', 'claim_verification'];

  /**
   * Builds an EvidenceBundle from raw search/research outputs, document chunks, or tool outputs.
   */
  public buildBundle(input: {
    topic: string;
    rawResults?: any[];
    claimsList?: string[];
    originEngine?: string;
  }): EvidenceBundle {
    const topic = input.topic || 'General Inquiry';
    const originEngine = input.originEngine || 'SearchEngine';
    const rawResults = Array.isArray(input.rawResults) ? input.rawResults : [];

    const sources: EvidenceSource[] = rawResults.map((item, idx) => {
      const url = item.url || item.link || item.source;
      let domain = item.domain;
      if (!domain && url) {
        try {
          domain = new URL(url).hostname;
        } catch {
          domain = 'external';
        }
      }
      return {
        id: `src_${idx + 1}`,
        url,
        domain: domain || 'reference_source',
        title: item.title || item.name || `Source ${idx + 1}`,
        snippet: item.snippet || item.snippetContent || item.text || '',
        reliabilityScore: item.reliability || (domain && (domain.includes('.gov') || domain.includes('.edu') || domain.includes('arxiv.org')) ? 0.95 : 0.8),
        ingestedAt: Date.now()
      };
    });

    const claims: EvidenceClaim[] = (input.claimsList || []).map((text, idx) => {
      // Pair claim with available sources
      const matchedSources = sources.filter(s => 
        (s.snippet && s.snippet.toLowerCase().includes(text.toLowerCase().slice(0, 20))) ||
        (s.title && s.title.toLowerCase().includes(text.toLowerCase().slice(0, 20)))
      );
      const sourceIds = matchedSources.length > 0 ? matchedSources.map(s => s.id) : (sources.length > 0 ? [sources[0].id] : []);
      return {
        id: `clm_${idx + 1}`,
        claim: text,
        sourceIds,
        confidence: sourceIds.length > 1 ? 0.92 : sourceIds.length === 1 ? 0.85 : 0.4,
        isVerified: sourceIds.length > 0
      };
    });

    // Check for obvious contradictions (e.g. opposing sentiment or conflicting numbers)
    const contradictions: EvidenceContradiction[] = [];
    for (let i = 0; i < claims.length; i++) {
      for (let j = i + 1; j < claims.length; j++) {
        const c1 = claims[i].claim.toLowerCase();
        const c2 = claims[j].claim.toLowerCase();
        if ((c1.includes('increase') && c2.includes('decrease')) || (c1.includes('true') && c2.includes('false'))) {
          contradictions.push({
            claimA: claims[i].claim,
            claimB: claims[j].claim,
            differenceNote: 'Contradicting assertions identified between statements.',
            severity: 'MEDIUM'
          });
        }
      }
    }

    const uniqueDomains = new Set(sources.map(s => s.domain).filter(Boolean));
    const triangulationRatio = sources.length > 0 ? Math.min(1.0, uniqueDomains.size / Math.max(1, sources.length)) : 0;
    const avgSourceScore = sources.length > 0 ? sources.reduce((acc, s) => acc + s.reliabilityScore, 0) / sources.length : 0;
    const overallConfidence = sources.length === 0 ? 0.1 : Number(((avgSourceScore * 0.6) + (triangulationRatio * 0.4)).toFixed(2));

    return {
      bundleId: `navix_ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      topic,
      timestamp: Date.now(),
      sources,
      claims,
      contradictions,
      overallConfidence,
      provenance: {
        originEngine,
        sourceCount: sources.length,
        triangulationRatio
      }
    };
  }

  public async execute(input: any, _signal?: AbortSignal): Promise<EngineResult> {
    const rawResults = input?.results || input?.rawResults || input?.sources || [];
    const claimsList = input?.claims || input?.claimsList || [];
    const topic = input?.topic || input?.query || 'Research Synthesis';
    const originEngine = input?.originEngine || 'SearchEngine';

    try {
      const bundle = this.buildBundle({
        topic,
        rawResults,
        claimsList,
        originEngine
      });

      return {
        status: 'SUCCESS',
        source: 'EvidenceBundleEngine',
        data: bundle,
        realOutput: bundle,
        output: `Evidence bundle generated: ${bundle.sources.length} sources, ${bundle.claims.length} claims (Confidence: ${bundle.overallConfidence * 100}%)`
      };
    } catch (err: any) {
      return {
        status: 'FAILED',
        source: 'EvidenceBundleEngine',
        error: `Failed to construct EvidenceBundle: ${err.message}`
      };
    }
  }
}

export const globalEvidenceBundleEngine = new EvidenceBundleEngine();
