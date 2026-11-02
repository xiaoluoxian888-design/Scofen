import { User, Board, Submission, LedgerEntry, StreamingAccessResult } from '../types/schema';
import { dbStore } from './dbStore';

const BASE_URL = '/api';

export const apiClient = {
  // 1. Auth & Users
  async signup(first_name: string, last_name: string, email: string, bio?: string): Promise<User> {
    try {
      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name, last_name, email, bio }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Signup failed');
      }
      return await res.json();
    } catch {
      return dbStore.signup(first_name, last_name, email, bio || null);
    }
  },

  async login(email: string): Promise<User> {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }
      return await res.json();
    } catch {
      return dbStore.login(email);
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch(`${BASE_URL}/users`);
      if (res.ok) return await res.json();
    } catch {}
    return dbStore.getAllUsers();
  },

  async getUserProfile(userId: string) {
    try {
      const res = await fetch(`${BASE_URL}/users/${userId}`);
      if (res.ok) return await res.json();
    } catch {}
    return dbStore.getUserProfileData(userId);
  },

  async toggleSubscriber(userId: string): Promise<{ user: User; message: string }> {
    try {
      const res = await fetch(`${BASE_URL}/users/${userId}/subscribe`, { method: 'PUT' });
      if (res.ok) return await res.json();
    } catch {}
    const user = dbStore.toggleSubscriber(userId);
    return {
      user,
      message: user.is_subscriber
        ? 'Unlocked complete full-length audio streaming network ($5.99/mo active).'
        : 'Reverted to standard tier (60-second public previews enforced).',
    };
  },

  async toggleFollow(followerId: string, followingId: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/users/${followingId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ follower_id: followerId }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.is_following;
      }
    } catch {}
    return dbStore.toggleFollow(followerId, followingId);
  },

  // 2. Boards & Criteria
  async getBoards(): Promise<Board[]> {
    try {
      const res = await fetch(`${BASE_URL}/boards`);
      if (res.ok) return await res.json();
    } catch {}
    return dbStore.getAllBoards();
  },

  async getBoard(boardId: string): Promise<{ board: Board; submissions: Submission[] }> {
    try {
      const res = await fetch(`${BASE_URL}/boards/${boardId}`);
      if (res.ok) return await res.json();
    } catch {}
    const board = dbStore.getBoard(boardId);
    if (!board) throw new Error('Board not found');
    const submissions = dbStore.getBoardSubmissions(boardId);
    return { board, submissions };
  },

  async createBoard(
    host_id: string,
    title: string,
    entry_fee: number,
    criteria: { criterion_name: string; weight: number }[]
  ): Promise<Board> {
    try {
      const res = await fetch(`${BASE_URL}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_id, title, entry_fee, criteria }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create board');
      }
      return await res.json();
    } catch {
      return dbStore.createBoard(host_id, title, entry_fee, criteria);
    }
  },

  // 3. Submissions & Checkout
  async createSubmission(
    boardId: string,
    owner_id: string,
    track_title: string,
    audio_preset?: string
  ): Promise<Submission> {
    try {
      const res = await fetch(`${BASE_URL}/boards/${boardId}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_id, track_title, audio_preset }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit track');
      }
      return await res.json();
    } catch {
      return dbStore.createSubmission(boardId, owner_id, track_title, audio_preset);
    }
  },

  async checkoutSubmission(submissionId: string, payer_id: string): Promise<{ submission: Submission; ledgerEntry: LedgerEntry }> {
    try {
      const res = await fetch(`${BASE_URL}/submissions/${submissionId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payer_id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Checkout failed');
      }
      return await res.json();
    } catch {
      return dbStore.processCheckout(submissionId, payer_id);
    }
  },

  // 4. Scoring Engine
  async setSubmissionScore(
    submissionId: string,
    criterionId: string,
    raw_score: number
  ): Promise<{ scoreRecord: unknown; recalculatedFinalScore: number }> {
    try {
      const res = await fetch(`${BASE_URL}/submissions/${submissionId}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criterion_id: criterionId, raw_score }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to set score');
      }
      return await res.json();
    } catch {
      return dbStore.setSubmissionScore(submissionId, criterionId, raw_score);
    }
  },

  // 5. Streaming Gatekeeper
  async evaluateStreaming(submissionId: string, requesterId: string | null): Promise<StreamingAccessResult> {
    try {
      const query = requesterId ? `?requester_id=${encodeURIComponent(requesterId)}` : '';
      const res = await fetch(`${BASE_URL}/streaming/${submissionId}${query}`);
      if (res.ok) return await res.json();
    } catch {}
    return dbStore.evaluateStreamingAccess(submissionId, requesterId);
  },

  // 6. Discovery Feed
  async getFeed(options: {
    sort?: 'newest' | 'score' | 'range';
    minScore?: number;
    maxScore?: number;
    followedOnly?: boolean;
    currentUserId?: string;
  }): Promise<Submission[]> {
    try {
      const params = new URLSearchParams();
      if (options.sort) params.set('sort', options.sort);
      if (options.minScore !== undefined) params.set('minScore', options.minScore.toString());
      if (options.maxScore !== undefined) params.set('maxScore', options.maxScore.toString());
      if (options.followedOnly) params.set('followedOnly', 'true');
      if (options.currentUserId) params.set('currentUserId', options.currentUserId);

      const res = await fetch(`${BASE_URL}/feed?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {}
    return dbStore.getDiscoveryFeed(options);
  },

  // 7. Ledger
  async getLedger(): Promise<LedgerEntry[]> {
    try {
      const res = await fetch(`${BASE_URL}/ledger`);
      if (res.ok) return await res.json();
    } catch {}
    return dbStore.getLedger();
  },

  // 8. Stripe & Resend Integration Operations
  async getIntegrationStatus() {
    try {
      const res = await fetch(`${BASE_URL}/integrations/status`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      stripe: {
        configured: false,
        mode: 'sandbox_simulation',
        maskedSecretKey: 'sk_test_••••••••3a9f',
        publishableKey: 'pk_test_scofen_sandbox_key_simulated',
        webhookConfigured: false,
        supportedCurrencies: ['USD', 'EUR', 'GBP'],
        activeProducts: [],
      },
      resend: {
        configured: false,
        mode: 'sandbox_simulation',
        maskedApiKey: 're_••••••••9c82',
        fromEmail: 'SCOFEN <onboarding@resend.dev>',
        templates: [],
      },
      envGuide: {
        file: '.env',
        editableKeys: [],
      },
    };
  },

  async reloadIntegrationEnv() {
    const res = await fetch(`${BASE_URL}/integrations/reload`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reload environment keys');
    return await res.json();
  },

  async createIntegrationStripeCheckout(payload: {
    type: 'submission_fee' | 'streaming_subscription';
    submissionId?: string;
    payerId: string;
    customAmount?: number;
    currency?: string;
  }) {
    const res = await fetch(`${BASE_URL}/integrations/stripe/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Checkout creation failed');
    }
    return await res.json();
  },

  async simulateStripeWebhook(eventType: string, payload?: Record<string, unknown>) {
    const res = await fetch(`${BASE_URL}/integrations/stripe/webhook-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, payload }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Webhook test failed');
    }
    return await res.json();
  },

  async sendResendEmail(payload: {
    to: string;
    templateId: 'submission_received' | 'evaluation_completed' | 'curator_payout' | 'subscription_welcome' | 'custom';
    subject?: string;
    customHtml?: string;
    data?: Record<string, unknown>;
  }) {
    const res = await fetch(`${BASE_URL}/integrations/resend/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Email dispatch failed');
    }
    return await res.json();
  },

  async getIntegrationLogs() {
    try {
      const res = await fetch(`${BASE_URL}/integrations/logs`);
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  async clearIntegrationLogs() {
    const res = await fetch(`${BASE_URL}/integrations/logs`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear logs');
    return await res.json();
  },
};
