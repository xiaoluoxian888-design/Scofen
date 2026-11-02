export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  bio: string | null;
  is_subscriber: boolean; // $5.99/mo streaming unlock status
  created_at: string;
}

export interface Board {
  id: string;
  host_id: string;
  title: string;
  entry_fee: number;
  created_at: string;
  genre?: string;
  cover_gradient?: string;
  // Relational joins
  host?: User;
  criteria?: BoardCriterion[];
  submissions_count?: number;
}

export interface BoardCriterion {
  id: string;
  board_id: string;
  criterion_name: string;
  weight: number; // 0-100
}

export interface Submission {
  id: string;
  board_id: string;
  owner_id: string;
  track_title: string;
  audio_url: string;      // Full premium audio track
  preview_url: string;    // 60-second public preview clip
  payment_status: 'pending' | 'confirmed';
  final_score: number;    // 0.00 - 100.00
  created_at: string;
  genre?: string;
  cover_gradient?: string;
  bpm?: number;
  // Relational joins
  owner?: User;
  board?: Board;
  scores?: SubmissionScore[];
  audio_preset?: string;
  duration_seconds?: number;
}

export interface SubmissionScore {
  id: string;
  submission_id: string;
  criterion_id: string;
  raw_score: number; // 0-100
  criterion_name?: string;
  criterion_weight?: number;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at?: string;
}

export interface LedgerEntry {
  id: string;
  submission_id: string;
  board_id: string;
  payer_id: string;
  host_id: string;
  entry_fee: number;
  host_cut: number;     // 70%
  platform_cut: number; // 30%
  created_at: string;
}

export interface StreamingAccessResult {
  submission_id: string;
  track_title: string;
  stream_type: 'FULL_TRACK' | '60_SECOND_PREVIEW';
  url: string;
  is_authorized_full: boolean;
  authorization_reason: 'BOARD_HOST' | 'TRACK_OWNER' | 'PREMIUM_SUBSCRIBER' | 'PUBLIC_PREVIEW_ONLY';
  preview_limit_seconds: number | null;
}
