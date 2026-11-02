import { User, Board, BoardCriterion, Submission, SubmissionScore, Follow, LedgerEntry, StreamingAccessResult } from '../types/schema';

// Helper for generating UUIDs
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class ScofenDatabase {
  private users: Map<string, User> = new Map();
  private boards: Map<string, Board> = new Map();
  private criteria: Map<string, BoardCriterion> = new Map();
  private submissions: Map<string, Submission> = new Map();
  private submissionScores: Map<string, SubmissionScore> = new Map(); // key: submission_id:criterion_id
  private follows: Set<string> = new Set(); // set of "follower_id:following_id"
  private ledger: Map<string, LedgerEntry> = new Map();

  constructor() {
    this.seedInitialData();
  }

  // ==========================================
  // SEED INITIAL PRODUCTION SAMPLE DATA
  // ==========================================
  private seedInitialData() {
    // 1. Users
    const u1: User = {
      id: '11111111-1111-4111-8111-111111111111',
      first_name: 'Kaelen',
      last_name: 'Vance',
      email: 'scofen2015@gmail.com',
      bio: 'Executive Sound Curator & Host at Vanguard Audio Labs. Filtering for uncompromising transients and dynamic headroom.',
      is_subscriber: true,
      created_at: new Date('2026-10-15T10:00:00Z').toISOString(),
    };
    const u2: User = {
      id: '22222222-2222-4222-8222-222222222222',
      first_name: 'Solana',
      last_name: 'Grey',
      email: 'solana.grey@scofen.network',
      bio: 'Neo-Soul vocalist & analog modular producer. Exploring micro-tonal harmonies.',
      is_subscriber: false,
      created_at: new Date('2026-10-16T11:30:00Z').toISOString(),
    };
    const u3: User = {
      id: '33333333-3333-4333-8333-333333333333',
      first_name: 'Marcus',
      last_name: 'Thorne',
      email: 'mthorne@noirpublishing.io',
      bio: 'Commercial sync supervisor for television & film. Rigorous criteria calibration.',
      is_subscriber: true,
      created_at: new Date('2026-10-17T09:15:00Z').toISOString(),
    };
    const u4: User = {
      id: '44444444-4444-4444-8444-444444444444',
      first_name: 'Devin',
      last_name: 'Cross',
      email: 'dcross@ghostbyte.cc',
      bio: 'Low-end sub-bass specialist and drill beatmaker.',
      is_subscriber: false,
      created_at: new Date('2026-10-18T14:45:00Z').toISOString(),
    };

    [u1, u2, u3, u4].forEach((u) => this.users.set(u.id, u));

    // Follows
    this.addFollow(u2.id, u1.id);
    this.addFollow(u4.id, u1.id);
    this.addFollow(u1.id, u3.id);

    // 2. Boards & Criteria
    const b1: Board = {
      id: 'b1111111-1111-4111-8111-111111111111',
      host_id: u1.id,
      title: 'Apex Metro: Cyber-Club Sonic Gauntlet',
      entry_fee: 45.0,
      genre: 'Cyberpunk & Club Synthwave',
      cover_gradient: 'from-emerald-600 via-teal-800 to-zinc-950',
      created_at: new Date('2026-10-20T12:00:00Z').toISOString(),
    };
    this.boards.set(b1.id, b1);

    const c1_1: BoardCriterion = { id: 'c1-1', board_id: b1.id, criterion_name: 'Vocal Precision (VP)', weight: 25 };
    const c1_2: BoardCriterion = { id: 'c1-2', board_id: b1.id, criterion_name: 'Production Quality (PQ)', weight: 35 };
    const c1_3: BoardCriterion = { id: 'c1-3', board_id: b1.id, criterion_name: 'Performance / Hook (PH)', weight: 25 };
    const c1_4: BoardCriterion = { id: 'c1-4', board_id: b1.id, criterion_name: 'Sonic Arrangement (SA)', weight: 15 };
    [c1_1, c1_2, c1_3, c1_4].forEach((c) => this.criteria.set(c.id, c));

    const b2: Board = {
      id: 'b2222222-2222-4222-8222-222222222222',
      host_id: u3.id,
      title: 'Noir Sync Invitational: Modern Soul Stems',
      entry_fee: 65.0,
      genre: 'Analog Neo-Soul & R&B',
      cover_gradient: 'from-purple-700 via-indigo-900 to-zinc-950',
      created_at: new Date('2026-10-22T14:00:00Z').toISOString(),
    };
    this.boards.set(b2.id, b2);

    const c2_1: BoardCriterion = { id: 'c2-1', board_id: b2.id, criterion_name: 'Emotive Dynamic Delivery', weight: 40 };
    const c2_2: BoardCriterion = { id: 'c2-2', board_id: b2.id, criterion_name: 'Acoustic Rhodes Fidelity', weight: 30 };
    const c2_3: BoardCriterion = { id: 'c2-3', board_id: b2.id, criterion_name: 'Sync Placement Readiness', weight: 30 };
    [c2_1, c2_2, c2_3].forEach((c) => this.criteria.set(c.id, c));

    // 3. Submissions
    const s1: Submission = {
      id: 's1111111-1111-4111-8111-111111111111',
      board_id: b1.id,
      owner_id: u2.id,
      track_title: 'Neural Overdrive (Sub-Grid Mix)',
      audio_url: '/audio/cyber_bass.wav',
      preview_url: '/audio/cyber_bass_preview_60s.wav',
      payment_status: 'confirmed',
      final_score: 94.6,
      genre: 'Synthwave / Club',
      cover_gradient: 'from-emerald-500 to-cyan-900',
      bpm: 128,
      created_at: new Date('2026-10-23T16:20:00Z').toISOString(),
      audio_preset: 'cyber_bass',
      duration_seconds: 184,
    };
    this.submissions.set(s1.id, s1);

    // Scores for s1
    this.setRawScoreInternal(s1.id, c1_1.id, 92);
    this.setRawScoreInternal(s1.id, c1_2.id, 98);
    this.setRawScoreInternal(s1.id, c1_3.id, 95);
    this.setRawScoreInternal(s1.id, c1_4.id, 91);
    this.recalculateFinalScore(s1.id);

    // Ledger entry for s1
    this.recordLedgerEntry(s1.id, b1.id, u2.id, b1.host_id, b1.entry_fee);

    const s2: Submission = {
      id: 's2222222-2222-4222-8222-222222222222',
      board_id: b2.id,
      owner_id: u2.id,
      track_title: 'Midnight Velvet Reverie',
      audio_url: '/audio/analog_soul.wav',
      preview_url: '/audio/analog_soul_preview_60s.wav',
      payment_status: 'confirmed',
      final_score: 91.8,
      genre: 'Neo-Soul / Lo-Fi',
      cover_gradient: 'from-purple-600 to-rose-900',
      bpm: 92,
      created_at: new Date('2026-10-24T18:00:00Z').toISOString(),
      audio_preset: 'analog_soul',
      duration_seconds: 215,
    };
    this.submissions.set(s2.id, s2);
    this.setRawScoreInternal(s2.id, c2_1.id, 95);
    this.setRawScoreInternal(s2.id, c2_2.id, 90);
    this.setRawScoreInternal(s2.id, c2_3.id, 89);
    this.recalculateFinalScore(s2.id);
    this.recordLedgerEntry(s2.id, b2.id, u2.id, b2.host_id, b2.entry_fee);

    const s3: Submission = {
      id: 's3333333-3333-4333-8333-333333333333',
      board_id: b1.id,
      owner_id: u4.id,
      track_title: 'Kinetic Shiver (Zero-Kelvin 808)',
      audio_url: '/audio/hyper_drill.wav',
      preview_url: '/audio/hyper_drill_preview_60s.wav',
      payment_status: 'confirmed',
      final_score: 87.5,
      genre: 'Hyper Drill / Trap',
      cover_gradient: 'from-amber-600 to-rose-950',
      bpm: 142,
      created_at: new Date('2026-10-25T11:00:00Z').toISOString(),
      audio_preset: 'hyper_drill',
      duration_seconds: 168,
    };
    this.submissions.set(s3.id, s3);
    this.setRawScoreInternal(s3.id, c1_1.id, 82);
    this.setRawScoreInternal(s3.id, c1_2.id, 92);
    this.setRawScoreInternal(s3.id, c1_3.id, 89);
    this.setRawScoreInternal(s3.id, c1_4.id, 84);
    this.recalculateFinalScore(s3.id);
    this.recordLedgerEntry(s3.id, b1.id, u4.id, b1.host_id, b1.entry_fee);

    // Unpaid pending submission example
    const s4: Submission = {
      id: 's4444444-4444-4444-8444-444444444444',
      board_id: b1.id,
      owner_id: u4.id,
      track_title: 'Unprocessed Rough Bounce (Draft)',
      audio_url: '/audio/modular_hook.wav',
      preview_url: '/audio/modular_hook_preview_60s.wav',
      payment_status: 'pending',
      final_score: 0.0,
      genre: 'Modular Synthwave',
      cover_gradient: 'from-blue-600 to-indigo-950',
      bpm: 120,
      created_at: new Date('2026-10-28T09:00:00Z').toISOString(),
      audio_preset: 'modular_hook',
      duration_seconds: 195,
    };
    this.submissions.set(s4.id, s4);
  }

  // ==========================================
  // 1. USER AUTHENTICATION & PROFILES
  // ==========================================
  public signup(first_name: string, last_name: string, email: string, bio: string | null = null): User {
    const existing = Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error(`User with email "${email}" already registered.`);
    }

    const newUser: User = {
      id: generateUUID(),
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      bio: bio ? bio.trim() : null,
      is_subscriber: false,
      created_at: new Date().toISOString(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  public login(email: string): User {
    const user = Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error(`No account found matching email "${email}".`);
    }
    return user;
  }

  public getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  public updateUserBio(userId: string, bio: string): User {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    user.bio = bio;
    this.users.set(userId, user);
    return user;
  }

  public toggleSubscriber(userId: string): User {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    user.is_subscriber = !user.is_subscriber;
    this.users.set(userId, user);
    return user;
  }

  /**
   * User Profile comprehensive relational query:
   * Returns:
   * 1) all Boards hosted by this specific user
   * 2) all audio tracks submitted by this specific user across the platform
   */
  public getUserProfileData(userId: string): {
    user: User;
    hostedBoards: Board[];
    submittedTracks: Submission[];
    followersCount: number;
    followingCount: number;
  } {
    const user = this.users.get(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    // 1) Hosted Boards with criteria & submission counts
    const hostedBoards = Array.from(this.boards.values())
      .filter((b) => b.host_id === userId)
      .map((b) => this.hydrateBoard(b));

    // 2) Submitted Tracks across the platform with board title & scores
    const submittedTracks = Array.from(this.submissions.values())
      .filter((s) => s.owner_id === userId)
      .map((s) => this.hydrateSubmission(s))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Follower counts
    let followersCount = 0;
    let followingCount = 0;
    this.follows.forEach((pair) => {
      const [follower, following] = pair.split(':');
      if (following === userId) followersCount++;
      if (follower === userId) followingCount++;
    });

    return {
      user,
      hostedBoards,
      submittedTracks,
      followersCount,
      followingCount,
    };
  }

  // ==========================================
  // 2. HOST BOARD MANAGEMENT & SCORING ENGINE
  // ==========================================
  public createBoard(
    host_id: string,
    title: string,
    entry_fee: number,
    criteriaList: { criterion_name: string; weight: number }[]
  ): Board {
    const host = this.users.get(host_id);
    if (!host) throw new Error('Host user not found');
    if (entry_fee < 0) throw new Error('Entry fee cannot be negative');

    const newBoard: Board = {
      id: generateUUID(),
      host_id,
      title: title.trim(),
      entry_fee: Number(entry_fee.toFixed(2)),
      created_at: new Date().toISOString(),
    };
    this.boards.set(newBoard.id, newBoard);

    // Insert criteria
    for (const c of criteriaList) {
      if (c.weight < 0 || c.weight > 100) {
        throw new Error(`Weight for "${c.criterion_name}" must be between 0 and 100`);
      }
      const crit: BoardCriterion = {
        id: generateUUID(),
        board_id: newBoard.id,
        criterion_name: c.criterion_name.trim(),
        weight: c.weight,
      };
      this.criteria.set(crit.id, crit);
    }

    return this.hydrateBoard(newBoard);
  }

  public getBoard(boardId: string): Board | undefined {
    const b = this.boards.get(boardId);
    return b ? this.hydrateBoard(b) : undefined;
  }

  public getAllBoards(): Board[] {
    return Array.from(this.boards.values())
      .map((b) => this.hydrateBoard(b))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getBoardCriteria(boardId: string): BoardCriterion[] {
    return Array.from(this.criteria.values()).filter((c) => c.board_id === boardId);
  }

  /**
   * Automated Database recalculation:
   * Formula: SUM(raw_score * criteria_weight) / SUM(criteria_weight)
   * Scaled from 0 to 100.
   */
  public recalculateFinalScore(submissionId: string): number {
    const sub = this.submissions.get(submissionId);
    if (!sub) throw new Error(`Submission ${submissionId} not found`);

    const boardCriteria = this.getBoardCriteria(sub.board_id);
    if (boardCriteria.length === 0) {
      sub.final_score = 0.0;
      this.submissions.set(sub.id, sub);
      return 0.0;
    }

    let sumWeightedScore = 0;
    let sumWeight = 0;

    for (const criterion of boardCriteria) {
      const scoreKey = `${sub.id}:${criterion.id}`;
      const scoreObj = this.submissionScores.get(scoreKey);
      const rawScore = scoreObj ? scoreObj.raw_score : 0;

      sumWeightedScore += rawScore * criterion.weight;
      sumWeight += criterion.weight;
    }

    const finalScore = sumWeight > 0 ? Number((sumWeightedScore / sumWeight).toFixed(2)) : 0.0;
    sub.final_score = Math.min(100.0, Math.max(0.0, finalScore));
    this.submissions.set(sub.id, sub);
    return sub.final_score;
  }

  public setSubmissionScore(submissionId: string, criterionId: string, raw_score: number): {
    scoreRecord: SubmissionScore;
    recalculatedFinalScore: number;
  } {
    if (raw_score < 0 || raw_score > 100) {
      throw new Error('Raw score must be between 0 and 100');
    }

    const sub = this.submissions.get(submissionId);
    if (!sub) throw new Error('Submission not found');

    const crit = this.criteria.get(criterionId);
    if (!crit || crit.board_id !== sub.board_id) {
      throw new Error('Invalid criterion for this board');
    }

    const key = `${submissionId}:${criterionId}`;
    let scoreObj = this.submissionScores.get(key);
    if (!scoreObj) {
      scoreObj = {
        id: generateUUID(),
        submission_id: submissionId,
        criterion_id: criterionId,
        raw_score,
      };
    } else {
      scoreObj.raw_score = raw_score;
    }
    this.submissionScores.set(key, scoreObj);

    // Instant automated recalculation trigger!
    const recalculatedFinalScore = this.recalculateFinalScore(submissionId);

    return {
      scoreRecord: scoreObj,
      recalculatedFinalScore,
    };
  }

  private setRawScoreInternal(submissionId: string, criterionId: string, raw_score: number) {
    const key = `${submissionId}:${criterionId}`;
    this.submissionScores.set(key, {
      id: generateUUID(),
      submission_id: submissionId,
      criterion_id: criterionId,
      raw_score,
    });
  }

  // ==========================================
  // 3. SUBMISSION & FINANCIAL ROUTING (70/30)
  // ==========================================
  public createSubmission(
    board_id: string,
    owner_id: string,
    track_title: string,
    audio_preset: string = 'cyber_bass'
  ): Submission {
    const board = this.boards.get(board_id);
    if (!board) throw new Error('Board not found');
    const owner = this.users.get(owner_id);
    if (!owner) throw new Error('Musician owner not found');

    const newSub: Submission = {
      id: generateUUID(),
      board_id,
      owner_id,
      track_title: track_title.trim(),
      audio_url: `/audio/${audio_preset}.wav`,
      preview_url: `/audio/${audio_preset}_preview_60s.wav`,
      payment_status: board.entry_fee === 0 ? 'confirmed' : 'pending',
      final_score: 0.0,
      created_at: new Date().toISOString(),
      audio_preset,
      duration_seconds: 195,
    };

    this.submissions.set(newSub.id, newSub);

    // If zero entry fee, auto-confirm
    if (board.entry_fee === 0) {
      this.recordLedgerEntry(newSub.id, board.id, owner_id, board.host_id, 0);
    }

    return this.hydrateSubmission(newSub);
  }

  /**
   * Checkout Execution Function:
   * Maps 70/30 fee distribution:
   * 70% to Board Host / 30% retained directly by platform.
   * Flips payment_status from 'pending' to 'confirmed'.
   */
  public processCheckout(submissionId: string, payerId: string): {
    submission: Submission;
    ledgerEntry: LedgerEntry;
  } {
    const sub = this.submissions.get(submissionId);
    if (!sub) throw new Error('Submission not found');
    if (sub.payment_status === 'confirmed') {
      throw new Error('Submission entry fee is already confirmed');
    }

    const board = this.boards.get(sub.board_id);
    if (!board) throw new Error('Associated board not found');

    // Confirm payment status
    sub.payment_status = 'confirmed';
    this.submissions.set(sub.id, sub);

    // 70/30 Automated Ledger Execution
    const ledgerEntry = this.recordLedgerEntry(sub.id, board.id, payerId, board.host_id, board.entry_fee);

    return {
      submission: this.hydrateSubmission(sub),
      ledgerEntry,
    };
  }

  private recordLedgerEntry(
    submission_id: string,
    board_id: string,
    payer_id: string,
    host_id: string,
    entry_fee: number
  ): LedgerEntry {
    const host_cut = Number((entry_fee * 0.70).toFixed(2));
    const platform_cut = Number((entry_fee * 0.30).toFixed(2));

    const entry: LedgerEntry = {
      id: generateUUID(),
      submission_id,
      board_id,
      payer_id,
      host_id,
      entry_fee,
      host_cut,
      platform_cut,
      created_at: new Date().toISOString(),
    };
    this.ledger.set(entry.id, entry);
    return entry;
  }

  public getLedger(): LedgerEntry[] {
    return Array.from(this.ledger.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // ==========================================
  // 4. DUAL-LAYER STREAMING & GATEKEEPING
  // ==========================================
  /**
   * Enforce strict asset security at the storage/streaming router layer:
   * Full-length music track streaming access permitted exclusively to:
   * (a) Board Host
   * (b) Track Owner
   * (c) $5.99/mo Subscribers (is_subscriber == true)
   *
   * Non-subscribers & public users strictly bounded by 60-second limit on preview_url.
   */
  public evaluateStreamingAccess(submissionId: string, requesterId: string | null): StreamingAccessResult {
    const sub = this.submissions.get(submissionId);
    if (!sub) throw new Error(`Submission ${submissionId} not found`);

    const board = this.boards.get(sub.board_id);
    const requester = requesterId ? this.users.get(requesterId) : null;

    let is_authorized_full = false;
    let authorization_reason: StreamingAccessResult['authorization_reason'] = 'PUBLIC_PREVIEW_ONLY';

    if (requester) {
      if (board && board.host_id === requester.id) {
        is_authorized_full = true;
        authorization_reason = 'BOARD_HOST';
      } else if (sub.owner_id === requester.id) {
        is_authorized_full = true;
        authorization_reason = 'TRACK_OWNER';
      } else if (requester.is_subscriber) {
        is_authorized_full = true;
        authorization_reason = 'PREMIUM_SUBSCRIBER';
      }
    }

    return {
      submission_id: sub.id,
      track_title: sub.track_title,
      stream_type: is_authorized_full ? 'FULL_TRACK' : '60_SECOND_PREVIEW',
      url: is_authorized_full ? sub.audio_url : sub.preview_url,
      is_authorized_full,
      authorization_reason,
      preview_limit_seconds: is_authorized_full ? null : 60,
    };
  }

  // ==========================================
  // 5. SOCIAL CURATION & DISCOVERY FEEDS
  // ==========================================
  public toggleFollow(followerId: string, followingId: string): boolean {
    if (followerId === followingId) throw new Error('Cannot follow yourself');
    const pair = `${followerId}:${followingId}`;
    if (this.follows.has(pair)) {
      this.follows.delete(pair);
      return false; // unfollowed
    } else {
      this.follows.add(pair);
      return true; // followed
    }
  }

  public addFollow(followerId: string, followingId: string) {
    if (followerId !== followingId) {
      this.follows.add(`${followerId}:${followingId}`);
    }
  }

  public isFollowing(followerId: string, followingId: string): boolean {
    return this.follows.has(`${followerId}:${followingId}`);
  }

  /**
   * Prioritized Curation Discovery Feed:
   * Assembles a tailored feed showcasing the top-ranking/winning tracks across all active boards.
   * Dynamic sorting:
   * - "newest"
   * - "score" (highest final_score first)
   * - "range" (final score within minScore and maxScore)
   */
  public getDiscoveryFeed(options: {
    sort?: 'newest' | 'score' | 'range';
    minScore?: number;
    maxScore?: number;
    followedOnly?: boolean;
    currentUserId?: string;
  }): Submission[] {
    const { sort = 'score', minScore = 0, maxScore = 100, followedOnly = false, currentUserId } = options;

    let list = Array.from(this.submissions.values()).filter((s) => s.payment_status === 'confirmed');

    if (followedOnly && currentUserId) {
      list = list.filter((s) => {
        const board = this.boards.get(s.board_id);
        const isFollowedOwner = this.isFollowing(currentUserId, s.owner_id);
        const isFollowedHost = board ? this.isFollowing(currentUserId, board.host_id) : false;
        return isFollowedOwner || isFollowedHost;
      });
    }

    if (minScore > 0 || maxScore < 100) {
      list = list.filter((s) => s.final_score >= minScore && s.final_score <= maxScore);
    }

    if (sort === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      // Default to highest score first (winning tracks)
      list.sort((a, b) => b.final_score - a.final_score);
    }

    return list.map((s) => this.hydrateSubmission(s));
  }

  public getBoardSubmissions(boardId: string): Submission[] {
    return Array.from(this.submissions.values())
      .filter((s) => s.board_id === boardId)
      .map((s) => this.hydrateSubmission(s))
      .sort((a, b) => b.final_score - a.final_score);
  }

  // Hydration helpers
  private hydrateBoard(b: Board): Board {
    const host = this.users.get(b.host_id);
    const criteria = this.getBoardCriteria(b.id);
    const submissions_count = Array.from(this.submissions.values()).filter((s) => s.board_id === b.id).length;
    return {
      ...b,
      host,
      criteria,
      submissions_count,
    };
  }

  private hydrateSubmission(s: Submission): Submission {
    const owner = this.users.get(s.owner_id);
    const board = this.boards.get(s.board_id);
    const boardCriteria = this.getBoardCriteria(s.board_id);

    const scores: SubmissionScore[] = boardCriteria.map((c) => {
      const scoreKey = `${s.id}:${c.id}`;
      const scoreObj = this.submissionScores.get(scoreKey);
      return {
        id: scoreObj ? scoreObj.id : `score-${s.id}-${c.id}`,
        submission_id: s.id,
        criterion_id: c.id,
        raw_score: scoreObj ? scoreObj.raw_score : 0,
        criterion_name: c.criterion_name,
        criterion_weight: c.weight,
      };
    });

    return {
      ...s,
      owner,
      board: board ? this.hydrateBoard(board) : undefined,
      scores,
    };
  }
}

export const dbStore = new ScofenDatabase();
