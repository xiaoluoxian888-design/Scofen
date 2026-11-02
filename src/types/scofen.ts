export type UserRole = 'host' | 'musician' | 'rater' | 'subscriber' | 'architect';

export interface CriteriaVector {
  vp: number; // Vocal Precision
  pq: number; // Production Quality
  ph: number; // Performance / Hook
  sa: number; // Sonic Arrangement
}

export interface DiagnosticQuestion {
  id: string;
  question: string;
  description: string;
  options: {
    label: string;
    description: string;
    vectorDelta: CriteriaVector;
  }[];
}

export interface Contest {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  hostCredibilityWeight: number;
  entryFee: number;
  totalSubmissions: number;
  grossRevenue: number;
  hostEarnings: number;
  platformEarnings: number;
  baselineWeights: CriteriaVector;
  genre: string;
  status: 'active' | 'evaluating' | 'settled';
  createdAt: string;
  description: string;
}

export interface TrackEvaluation {
  id: string;
  trackId: string;
  evaluatorId: string;
  evaluatorName: string;
  role: 'gatekeeper' | 'certified_rater' | 'public_sandbox';
  weight: number; // 100.0, 15.0, 1.0
  scores: CriteriaVector;
  compositeScore: number;
  timestamp: string;
  feedback?: string;
}

export interface TrackSubmission {
  id: string;
  contestId: string;
  contestTitle: string;
  title: string;
  artistId: string;
  artistName: string;
  audioPreset: 'cyber_bass' | 'analog_soul' | 'hyper_drill' | 'ambient_void' | 'modular_hook';
  durationSeconds: number;
  entryFeePaid: number;
  submittedAt: string;
  compositeScore: number;
  criteriaAverage: CriteriaVector;
  evaluations: TrackEvaluation[];
  streamCount: number;
  totalResidualEarned: number;
  isBillboardQualified: boolean; // Top 1% threshold
  rank?: number;
}

export interface LedgerTransaction {
  id: string;
  timestamp: string;
  type: 'ENTRY_FEE_SPLIT' | 'STREAMING_RESIDUAL' | 'SUBSCRIPTION_MARGIN' | 'RATER_DIVIDEND';
  grossAmount: number;
  hostCut: number;      // e.g. 70% of entry fee or 20% residual pool
  platformCut: number;  // 30% of entry fee or 10% residual or 100% sub
  musicianCut: number;  // 70% of streaming residuals
  raterCut: number;
  referenceId: string;
  description: string;
}

export interface UserAccountState {
  id: string;
  name: string;
  email: string;
  activeContext: UserRole;
  isSubscriber: boolean; // $5.99/mo Billboard Broadcast
  credibilityIndex: number; // Rater credibility weight (1.0 to 100.0)
  wallets: {
    musicianBalance: number;
    hostBalance: number;
    raterBalance: number;
    scofenTreasuryBalance: number;
  };
}
