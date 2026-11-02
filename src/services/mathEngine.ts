import { CriteriaVector, TrackEvaluation, TrackSubmission, LedgerTransaction } from '../types/scofen';

/**
 * Normalizes a raw 4-criteria vector so that sum(vp + pq + ph + sa) == 1.0 (100%).
 */
export function normalizeVector(v: CriteriaVector): CriteriaVector {
  const sum = v.vp + v.pq + v.ph + v.sa;
  if (sum === 0) {
    return { vp: 0.25, pq: 0.25, ph: 0.25, sa: 0.25 };
  }
  return {
    vp: Number((v.vp / sum).toFixed(4)),
    pq: Number((v.pq / sum).toFixed(4)),
    ph: Number((v.ph / sum).toFixed(4)),
    sa: Number((v.sa / sum).toFixed(4)),
  };
}

/**
 * Calculates a single evaluator's weighted criteria score against the contest baseline weights.
 */
export function calculateCriteriaScore(scores: CriteriaVector, baselineWeights: CriteriaVector): number {
  const norm = normalizeVector(baselineWeights);
  const composite = (scores.vp * norm.vp) + (scores.pq * norm.pq) + (scores.ph * norm.ph) + (scores.sa * norm.sa);
  return Number(composite.toFixed(2));
}

/**
 * The Asymmetric Weight Protocol:
 * Track Score = Sum(Score_i * Weight_i) / Sum(Weight_i)
 * 
 * Gatekeeper / Host Weight: 100.0
 * Certified Raters: 5.0 - 50.0 (dynamic Credibility Weight Index)
 * Public / Sandbox: 1.0 (statistical background noise)
 */
export function computeAsymmetricCompositeScore(
  evaluations: TrackEvaluation[],
  baselineWeights: CriteriaVector
): { compositeScore: number; totalWeight: number; noiseAbsorbedPercent: number } {
  if (!evaluations || evaluations.length === 0) {
    return { compositeScore: 0, totalWeight: 0, noiseAbsorbedPercent: 100 };
  }

  let weightedSum = 0;
  let totalWeight = 0;
  let publicNoiseWeight = 0;

  for (const evaluation of evaluations) {
    const singleScore = calculateCriteriaScore(evaluation.scores, baselineWeights);
    weightedSum += singleScore * evaluation.weight;
    totalWeight += evaluation.weight;
    if (evaluation.role === 'public_sandbox') {
      publicNoiseWeight += evaluation.weight;
    }
  }

  const compositeScore = totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(2)) : 0;
  // Calculate how much the public noise was suppressed relative to host weight
  const noiseAbsorbedPercent = totalWeight > 0
    ? Number((((totalWeight - publicNoiseWeight) / totalWeight) * 100).toFixed(1))
    : 100;

  return {
    compositeScore,
    totalWeight,
    noiseAbsorbedPercent,
  };
}

/**
 * Economic Split Ledger:
 * 1. Entry Fee Split: 70% Host / 30% Scofen Treasury
 */
export function splitEntryFee(
  entryFee: number,
  contestId: string,
  artistName: string
): { hostCut: number; platformCut: number; transaction: LedgerTransaction } {
  const hostCut = Number((entryFee * 0.70).toFixed(2));
  const platformCut = Number((entryFee * 0.30).toFixed(2));

  const transaction: LedgerTransaction = {
    id: `tx-entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    type: 'ENTRY_FEE_SPLIT',
    grossAmount: entryFee,
    hostCut,
    platformCut,
    musicianCut: 0,
    raterCut: 0,
    referenceId: contestId,
    description: `Entry Fee Protocol [70/30 Split] — Submission by ${artistName}`,
  };

  return { hostCut, platformCut, transaction };
}

/**
 * Residual Stream Split:
 * Per stream unit ($0.05 simulated residual value per stream):
 * 70% to Musician / 20% to Host-Rater Pool / 10% to Scofen Platform
 */
export function splitStreamingResidual(
  streamCountDelta: number,
  track: TrackSubmission,
  raterCount: number = 3
): { musicianCut: number; hostCut: number; raterCut: number; platformCut: number; transaction: LedgerTransaction } {
  const grossRatePerStream = 0.05; // $0.05 per qualified billboard stream
  const grossAmount = Number((streamCountDelta * grossRatePerStream).toFixed(4));

  const musicianCut = Number((grossAmount * 0.70).toFixed(4));
  const hostRaterPool = Number((grossAmount * 0.20).toFixed(4));
  const platformCut = Number((grossAmount * 0.10).toFixed(4));

  // Host takes 60% of hostRaterPool, active raters share 40%
  const hostCut = Number((hostRaterPool * 0.60).toFixed(4));
  const raterCut = Number((hostRaterPool * 0.40).toFixed(4));

  const transaction: LedgerTransaction = {
    id: `tx-stream-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    type: 'STREAMING_RESIDUAL',
    grossAmount,
    hostCut,
    platformCut,
    musicianCut,
    raterCut,
    referenceId: track.id,
    description: `Billboard Residual [70/20/10 Split] — ${track.title} (+${streamCountDelta} plays)`,
  };

  return { musicianCut, hostCut, raterCut, platformCut, transaction };
}

/**
 * Premium Subscription Margin:
 * $5.99/month Billboard Broadcast subscription -> 100% Platform Margin
 */
export function processBillboardSubscription(userId: string): LedgerTransaction {
  return {
    id: `tx-sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    type: 'SUBSCRIPTION_MARGIN',
    grossAmount: 5.99,
    hostCut: 0,
    platformCut: 5.99,
    musicianCut: 0,
    raterCut: 0,
    referenceId: userId,
    description: `Demand Side Monetization [100% Margin] — $5.99 Billboard Broadcast Access`,
  };
}
