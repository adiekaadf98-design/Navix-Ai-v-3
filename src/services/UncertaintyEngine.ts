import { KnowledgeClaim } from './KnowledgeLab';

export interface UncertaintyMetrics {
  evidenceCoverage: number; // 0.0 to 1.0
  evidenceQuality: number; // 0.0 to 1.0
  independentVerification: boolean;
  contradictionRisk: number; // 0.0 to 1.0
  freshness: number; // 0.0 to 1.0
  compositeUncertainty: number; // 0.0 (certain) to 1.0 (completely uncertain)
  knowledgeState: 'STABLE' | 'VOLATILE' | 'DECAYING';
  isActionable: boolean;
}

export class UncertaintyEngine {
  public measureUncertainty(claim: KnowledgeClaim): UncertaintyMetrics {
    if (!claim) {
      return {
        evidenceCoverage: 0,
        evidenceQuality: 0,
        independentVerification: false,
        contradictionRisk: 1.0,
        freshness: 0,
        compositeUncertainty: 1.0,
        knowledgeState: 'VOLATILE',
        isActionable: false
      };
    }

    // Freshness decay over 90 days
    const ageDays = (Date.now() - (claim.verifiedAt || claim.createdAt)) / (1000 * 60 * 60 * 24);
    const freshness = Math.max(0, Number((1 - (ageDays / 90)).toFixed(2)));

    // Contradiction risk
    const contradictionRisk = claim.contradictions && claim.contradictions.length > 0
      ? 0.85
      : (claim.status === 'UNCERTAIN' ? 0.55 : (claim.status === 'CONFLICTED' ? 0.90 : 0.05));

    // Evidence quality
    let evidenceQuality = 0.5;
    if (claim.confidence === 'HIGH') evidenceQuality = 0.95;
    if (claim.confidence === 'LOW') evidenceQuality = 0.25;

    // Evidence coverage based on length and concept breadth
    const evidenceLength = claim.evidence ? claim.evidence.length : 0;
    const conceptBonus = (claim.relatedConcepts?.length || 0) * 0.05;
    const evidenceCoverage = Math.min(1.0, Number((Math.min(evidenceLength / 120, 0.8) + conceptBonus).toFixed(2)));

    const independentVerification = claim.status === 'TRUSTED' || (claim.status === 'SUPPORTED' && evidenceQuality >= 0.8);

    const knowledgeState: 'STABLE' | 'VOLATILE' | 'DECAYING' = 
      freshness < 0.3 ? 'DECAYING' : (contradictionRisk > 0.5 ? 'VOLATILE' : 'STABLE');

    // Composite uncertainty calculation: higher contradiction/decay -> higher uncertainty; higher quality/coverage -> lower uncertainty
    const positiveConfidence = (evidenceQuality * 0.4) + (evidenceCoverage * 0.3) + (freshness * 0.3);
    const riskFactor = contradictionRisk * 0.5;
    const compositeUncertainty = Math.max(0, Math.min(1.0, Number((1 - positiveConfidence + riskFactor).toFixed(2))));

    const isActionable = compositeUncertainty < 0.45 && contradictionRisk < 0.4;

    return {
      evidenceCoverage,
      evidenceQuality,
      independentVerification,
      contradictionRisk,
      freshness,
      compositeUncertainty,
      knowledgeState,
      isActionable
    };
  }

  public evaluateClaimSet(claims: KnowledgeClaim[]): {
    averageUncertainty: number;
    actionableClaimsRatio: number;
    stableCount: number;
    volatileCount: number;
    decayingCount: number;
  } {
    if (!claims || claims.length === 0) {
      return { averageUncertainty: 1.0, actionableClaimsRatio: 0, stableCount: 0, volatileCount: 0, decayingCount: 0 };
    }

    let sumUncertainty = 0;
    let actionableCount = 0;
    let stable = 0;
    let volatile = 0;
    let decaying = 0;

    for (const c of claims) {
      const m = this.measureUncertainty(c);
      sumUncertainty += m.compositeUncertainty;
      if (m.isActionable) actionableCount++;
      if (m.knowledgeState === 'STABLE') stable++;
      else if (m.knowledgeState === 'VOLATILE') volatile++;
      else decaying++;
    }

    return {
      averageUncertainty: Number((sumUncertainty / claims.length).toFixed(2)),
      actionableClaimsRatio: Number((actionableCount / claims.length).toFixed(2)),
      stableCount: stable,
      volatileCount: volatile,
      decayingCount: decaying
    };
  }
}

export const globalUncertaintyEngine = new UncertaintyEngine();
