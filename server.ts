import 'dotenv/config';
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { dbStore } from './src/services/dbStore.ts';
import { integrationsService } from './src/server/integrationsService.ts';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // ==========================================
  // RESTFUL API ROUTES
  // ==========================================

  // 1. Auth & User Endpoints
  app.post('/api/auth/signup', (req: Request, res: Response) => {
    try {
      const { first_name, last_name, email, bio } = req.body;
      if (!first_name || !last_name || !email) {
        return res.status(400).json({ error: 'first_name, last_name, and email are required' });
      }
      const user = dbStore.signup(first_name, last_name, email, bio);
      return res.status(201).json(user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      return res.status(400).json({ error: message });
    }
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'email is required' });
      }
      const user = dbStore.login(email);
      return res.json(user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return res.status(404).json({ error: message });
    }
  });

  app.get('/api/users', (req: Request, res: Response) => {
    return res.json(dbStore.getAllUsers());
  });

  app.get('/api/users/:id', (req: Request, res: Response) => {
    try {
      const profileData = dbStore.getUserProfileData(req.params.id);
      return res.json(profileData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'User not found';
      return res.status(404).json({ error: message });
    }
  });

  app.put('/api/users/:id/subscribe', (req: Request, res: Response) => {
    try {
      const user = dbStore.toggleSubscriber(req.params.id);
      return res.json({
        user,
        message: user.is_subscriber
          ? 'Unlocked complete full-length audio streaming network ($5.99/mo active).'
          : 'Reverted to standard tier (60-second public previews enforced).',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Subscription update failed';
      return res.status(400).json({ error: message });
    }
  });

  app.post('/api/users/:id/follow', (req: Request, res: Response) => {
    try {
      const { follower_id } = req.body;
      if (!follower_id) {
        return res.status(400).json({ error: 'follower_id required' });
      }
      const isFollowing = dbStore.toggleFollow(follower_id, req.params.id);
      return res.json({ is_following: isFollowing });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Follow toggle failed';
      return res.status(400).json({ error: message });
    }
  });

  // 2. Board Management & Criteria
  app.post('/api/boards', (req: Request, res: Response) => {
    try {
      const { host_id, title, entry_fee, criteria } = req.body;
      if (!host_id || !title || criteria === undefined) {
        return res.status(400).json({ error: 'host_id, title, and criteria array required' });
      }
      if (!Array.isArray(criteria) || criteria.length === 0) {
        return res.status(400).json({ error: 'Board must define at least one criterion with weight 0-100' });
      }
      const board = dbStore.createBoard(host_id, title, Number(entry_fee || 0), criteria);
      return res.status(201).json(board);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Board creation failed';
      return res.status(400).json({ error: message });
    }
  });

  app.get('/api/boards', (req: Request, res: Response) => {
    return res.json(dbStore.getAllBoards());
  });

  app.get('/api/boards/:id', (req: Request, res: Response) => {
    const board = dbStore.getBoard(req.params.id);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const submissions = dbStore.getBoardSubmissions(board.id);
    return res.json({ board, submissions });
  });

  // 3. Submissions & Checkout Routing
  app.post('/api/boards/:boardId/submissions', (req: Request, res: Response) => {
    try {
      const { owner_id, track_title, audio_preset } = req.body;
      if (!owner_id || !track_title) {
        return res.status(400).json({ error: 'owner_id and track_title are required' });
      }
      const submission = dbStore.createSubmission(req.params.boardId, owner_id, track_title, audio_preset);
      return res.status(201).json(submission);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      return res.status(400).json({ error: message });
    }
  });

  app.post('/api/submissions/:id/checkout', (req: Request, res: Response) => {
    try {
      const { payer_id } = req.body;
      if (!payer_id) {
        return res.status(400).json({ error: 'payer_id is required' });
      }
      const result = dbStore.processCheckout(req.params.id, payer_id);
      return res.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Checkout failed';
      return res.status(400).json({ error: message });
    }
  });

  // 4. Scoring Engine & Automated Calculation
  app.post('/api/submissions/:id/scores', (req: Request, res: Response) => {
    try {
      const { criterion_id, raw_score } = req.body;
      if (!criterion_id || raw_score === undefined) {
        return res.status(400).json({ error: 'criterion_id and raw_score (0-100) are required' });
      }
      const result = dbStore.setSubmissionScore(req.params.id, criterion_id, Number(raw_score));
      return res.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Scoring failed';
      return res.status(400).json({ error: message });
    }
  });

  // 5. Dual-Layer Audio Streaming & Gatekeeping
  app.get('/api/streaming/:submissionId', (req: Request, res: Response) => {
    try {
      const requesterId = req.query.requester_id as string || null;
      const accessResult = dbStore.evaluateStreamingAccess(req.params.submissionId, requesterId);
      return res.json(accessResult);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Streaming evaluation failed';
      return res.status(404).json({ error: message });
    }
  });

  // 6. Curation Discovery Feed
  app.get('/api/feed', (req: Request, res: Response) => {
    const sort = (req.query.sort as 'newest' | 'score' | 'range') || 'score';
    const minScore = req.query.minScore ? Number(req.query.minScore) : 0;
    const maxScore = req.query.maxScore ? Number(req.query.maxScore) : 100;
    const followedOnly = req.query.followedOnly === 'true';
    const currentUserId = req.query.currentUserId as string || undefined;

    const feed = dbStore.getDiscoveryFeed({
      sort,
      minScore,
      maxScore,
      followedOnly,
      currentUserId,
    });
    return res.json(feed);
  });

  // 7. Platform Ledger Audit
  app.get('/api/ledger', (req: Request, res: Response) => {
    return res.json(dbStore.getLedger());
  });

  // 8. Stripe & Resend Integrations Operations Centre
  app.get('/api/integrations/status', (_req: Request, res: Response) => {
    return res.json(integrationsService.getStatus());
  });

  app.post('/api/integrations/reload', (_req: Request, res: Response) => {
    const result = integrationsService.reloadEnv();
    return res.json(result);
  });

  app.post('/api/integrations/stripe/checkout', async (req: Request, res: Response) => {
    try {
      const result = await integrationsService.createStripeCheckout(req.body);
      return res.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Stripe checkout failed';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/integrations/stripe/webhook-test', async (req: Request, res: Response) => {
    try {
      const { eventType, payload } = req.body;
      const result = await integrationsService.simulateStripeWebhook(eventType || 'checkout.session.completed', payload);
      return res.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Webhook simulation failed';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/integrations/resend/send', async (req: Request, res: Response) => {
    try {
      const { to, templateId, subject, customHtml, data } = req.body;
      if (!to) {
        return res.status(400).json({ error: 'Recipient "to" email address is required' });
      }
      const result = await integrationsService.sendResendEmail({
        to,
        templateId: templateId || 'submission_received',
        subject,
        customHtml,
        data,
      });
      return res.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Email dispatch failed';
      return res.status(500).json({ error: message });
    }
  });

  app.get('/api/integrations/logs', (_req: Request, res: Response) => {
    return res.json(integrationsService.getAuditLogs());
  });

  app.delete('/api/integrations/logs', (_req: Request, res: Response) => {
    return res.json(integrationsService.clearAuditLogs());
  });

  // Mount Vite development middlewares
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      allowedHosts: true,
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Scofen Engine] Running on port ${PORT}`);
  });
}

startServer();
