/**
 * Production-ready Database Schemas (PostgreSQL DDL), Redis Structures,
 * and Python Scoring Engine Script for the Scofen Multi-Criteria Protocol.
 */

export const POSTGRES_SCHEMA = `-- ==============================================================================
-- SCOFEN CORE SCHEMA: Decentralized Multi-Criteria Sorting & Trust Ledger
-- Engine: PostgreSQL 16+
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Contextual Single-User Accounts (Dynamic roles, no rigid splitting)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    credibility_weight_index NUMERIC(5,2) DEFAULT 1.00 CHECK (credibility_weight_index >= 1.00),
    is_premium_broadcast BOOLEAN DEFAULT FALSE,
    wallet_balance NUMERIC(14,4) DEFAULT 0.0000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Contest Matrix (Host-defined baseline weighting vector & entry friction)
CREATE TABLE contests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    entry_fee NUMERIC(10,2) NOT NULL CHECK (entry_fee >= 0.00),
    -- Baseline Weighting Vector (Sum enforced to 1.0000 in application/trigger)
    weight_vp NUMERIC(5,4) NOT NULL, -- Vocal Precision
    weight_pq NUMERIC(5,4) NOT NULL, -- Production Quality
    weight_ph NUMERIC(5,4) NOT NULL, -- Performance / Hook
    weight_sa NUMERIC(5,4) NOT NULL, -- Sonic Arrangement
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EVALUATING', 'SETTLED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_baseline_sum CHECK (ROUND(weight_vp + weight_pq + weight_ph + weight_sa, 2) = 1.00)
);

-- 3. Submissions (Tracks / Commercial Assets)
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    asset_uri VARCHAR(512) NOT NULL,
    entry_fee_paid NUMERIC(10,2) NOT NULL,
    composite_score NUMERIC(5,2) DEFAULT 0.00,
    stream_count BIGINT DEFAULT 0,
    is_billboard_qualified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Asymmetric Evaluations (Host: 100.0, Certified Rater: 5.0-50.0, Public: 1.0)
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    evaluator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    evaluator_role VARCHAR(20) NOT NULL CHECK (evaluator_role IN ('GATEKEEPER', 'CERTIFIED_RATER', 'PUBLIC_SANDBOX')),
    applied_weight NUMERIC(6,2) NOT NULL DEFAULT 1.00,
    score_vp NUMERIC(4,1) NOT NULL CHECK (score_vp BETWEEN 0 AND 100),
    score_pq NUMERIC(4,1) NOT NULL CHECK (score_pq BETWEEN 0 AND 100),
    score_ph NUMERIC(4,1) NOT NULL CHECK (score_ph BETWEEN 0 AND 100),
    score_sa NUMERIC(4,1) NOT NULL CHECK (score_sa BETWEEN 0 AND 100),
    weighted_composite NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_submission_evaluator UNIQUE (submission_id, evaluator_id)
);

-- 5. Immutable Ledger (70/30 Entry Fees & 70/20/10 Residual Splits)
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('ENTRY_FEE_SPLIT', 'STREAMING_RESIDUAL', 'SUBSCRIPTION_MARGIN')),
    reference_id UUID NOT NULL,
    gross_amount NUMERIC(14,4) NOT NULL,
    host_cut NUMERIC(14,4) DEFAULT 0.0000,
    platform_cut NUMERIC(14,4) DEFAULT 0.0000,
    musician_cut NUMERIC(14,4) DEFAULT 0.0000,
    rater_cut NUMERIC(14,4) DEFAULT 0.0000,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_eval_submission ON evaluations(submission_id);
CREATE INDEX idx_submissions_score ON submissions(contest_id, composite_score DESC);
CREATE INDEX idx_ledger_ref ON ledger_entries(reference_id);
`;

export const REDIS_STRUCTURES = `# ==============================================================================
# SCOFEN HIGH-VELOCITY IN-MEMORY ARCHITECTURE (Redis 7.2+)
# Real-Time Leaderboard Sorting, Bot Throttling, and Atomic Balances
# ==============================================================================

# 1. Atomic Contest Leaderboard (Sorted Set for Instant O(log N) Ranking)
# Key: scofen:contest:{contest_id}:leaderboard
# Member: submission_id | Score: composite_score (0.00 - 100.00)
ZADD scofen:contest:cnt-01:leaderboard 94.60 "trk-01"
ZADD scofen:contest:cnt-01:leaderboard 82.50 "trk-04"
ZADD scofen:contest:cnt-01:leaderboard 74.20 "trk-05"

# Query Top 1% Billboard Candidates (e.g. Rank 0 to 9)
ZREVRANGEBYSCORE scofen:contest:cnt-01:leaderboard +inf 88.00 WITHSCORES

# 2. Demand-Side Billboard Live Audio Queue (Real-Time Stream Feed)
# Key: scofen:billboard:stream_queue (List / Stream)
LPUSH scofen:billboard:stream_queue "trk-01" "trk-02" "trk-03"

# 3. Dynamic Rater Rate-Limiting & Sybil Resistance
# Sandbox Public Votes Throttled via Redis Sliding Window (1 req / 60s per IP)
SET scofen:ratelimit:sandbox:{user_ip} 1 EX 60 NX

# 4. Atomic Financial Settlement Balance (HSET)
# Atomic increment on fee splits without row-level lock contention
HINCRBYFLOAT scofen:wallets:host:usr-node-alpha-01 balance 31.50
HINCRBYFLOAT scofen:wallets:treasury:scofen balance 13.50
`;

export const PYTHON_SCORING_SCRIPT = `"""
Scofen Dynamic Multi-Criteria Sorting Engine & Asymmetric Weight Protocol
Production Python 3.12+ Reference Implementation
Zero dependencies outside standard library (or numpy/scipy when vectorized).
"""
from dataclasses import dataclass
from typing import List, Dict, Tuple

@dataclass(frozen=True)
class CriteriaVector:
    vp: float  # Vocal Precision / Dimension 1
    pq: float  # Production Quality / Dimension 2
    ph: float  # Performance & Hook / Dimension 3
    sa: float  # Sonic Arrangement / Dimension 4

    def normalize(self) -> "CriteriaVector":
        total = self.vp + self.pq + self.ph + self.sa
        if total == 0:
            return CriteriaVector(0.25, 0.25, 0.25, 0.25)
        return CriteriaVector(
            vp=round(self.vp / total, 4),
            pq=round(self.pq / total, 4),
            ph=round(self.ph / total, 4),
            sa=round(self.sa / total, 4)
        )

@dataclass
class EvaluationVote:
    evaluator_id: str
    weight: float        # Host=100.0, Certified=15.0-50.0, Public Sandbox=1.0
    scores: CriteriaVector

class ScofenEngine:
    """
    Computes deterministic multi-criteria asset rankings with mathematical
    resistance against bot sybil manipulation.
    """
    
    @staticmethod
    def calculate_single_score(scores: CriteriaVector, baseline: CriteriaVector) -> float:
        norm = baseline.normalize()
        return (
            scores.vp * norm.vp +
            scores.pq * norm.pq +
            scores.ph * norm.ph +
            scores.sa * norm.sa
        )

    @classmethod
    def compute_asymmetric_aggregate(
        cls, 
        evaluations: List[EvaluationVote], 
        baseline: CriteriaVector
    ) -> Tuple[float, float, float]:
        """
        Track Score = Sum(Score_i * Weight_i) / Sum(Weight_i)
        Returns: (composite_score, total_weight, public_noise_absorption_pct)
        """
        if not evaluations:
            return 0.0, 0.0, 100.0

        weighted_sum = 0.0
        total_weight = 0.0
        public_noise_weight = 0.0

        for vote in evaluations:
            single_score = cls.calculate_single_score(vote.scores, baseline)
            weighted_sum += single_score * vote.weight
            total_weight += vote.weight
            if vote.weight <= 1.0:
                public_noise_weight += vote.weight

        composite = round(weighted_sum / total_weight, 2)
        absorption = round(((total_weight - public_noise_weight) / total_weight) * 100, 2)
        return composite, total_weight, absorption

    @staticmethod
    def split_entry_fee(fee: float) -> Dict[str, float]:
        """70% to Host / 30% to Platform Treasury"""
        return {
            "host_pool": round(fee * 0.70, 2),
            "platform_treasury": round(fee * 0.30, 2)
        }

    @staticmethod
    def split_streaming_residual(plays: int, rate_per_play: float = 0.05) -> Dict[str, float]:
        """70% Musician / 20% Host-Rater Pool / 10% Platform Treasury"""
        gross = plays * rate_per_play
        return {
            "gross": round(gross, 4),
            "musician": round(gross * 0.70, 4),
            "host_rater_pool": round(gross * 0.20, 4),
            "platform_treasury": round(gross * 0.10, 4)
        }

if __name__ == "__main__":
    baseline = CriteriaVector(vp=25, pq=35, ph=25, sa=15)
    
    votes = [
        # Gatekeeper / Host
        EvaluationVote(evaluator_id="host_01", weight=100.0, scores=CriteriaVector(95, 96, 92, 90)),
        # Certified Rater with high credibility index
        EvaluationVote(evaluator_id="rater_22", weight=15.0, scores=CriteriaVector(90, 92, 90, 88)),
    ]
    # Add 50 hostile spam bot votes at sandbox weight 1.0 trying to downvote to zero
    for i in range(50):
        votes.append(EvaluationVote(evaluator_id=f"bot_{i}", weight=1.0, scores=CriteriaVector(10, 10, 10, 10)))

    score, total_w, noise_res = ScofenEngine.compute_asymmetric_aggregate(votes, baseline)
    print(f"Aggregated Score under 50-bot raid: {score}/100 | Total Weight: {total_w} | Noise Resistance: {noise_res}%")
`;
