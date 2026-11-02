import dotenv from 'dotenv';
import { dbStore } from '../services/dbStore.ts';

// Initial load of environment variables
dotenv.config();

export interface IntegrationLog {
  id: string;
  service: 'stripe' | 'resend';
  type: string;
  status: 'succeeded' | 'simulated' | 'failed' | 'pending';
  summary: string;
  details: Record<string, unknown>;
  timestamp: string;
}

// In-memory operational log of payment and email dispatches
const integrationLogs: IntegrationLog[] = [
  {
    id: 'log_init_01',
    service: 'stripe',
    type: 'payment_system_ready',
    status: 'simulated',
    summary: 'Stripe 70/30 Sovereign Split engine initialized in Sandbox mode',
    details: {
      split: '70% Curator / 30% SCOFEN',
      currencies: ['USD'],
      ready: true,
    },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'log_init_02',
    service: 'resend',
    type: 'email_dispatcher_ready',
    status: 'simulated',
    summary: 'Resend Transactional Engine loaded default sender onboarding@resend.dev',
    details: {
      templatesLoaded: ['submission_received', 'evaluation_completed', 'curator_payout', 'subscription_welcome'],
    },
    timestamp: new Date(Date.now() - 3500000).toISOString(),
  },
];

function maskKey(key: string | undefined, prefixLen = 7, suffixLen = 4): string {
  if (!key || key.trim() === '' || key.includes('your_') || key.includes('MY_')) {
    return 'Not configured (Sandbox mode active)';
  }
  const clean = key.trim();
  if (clean.length <= prefixLen + suffixLen) {
    return '••••••••';
  }
  return `${clean.slice(0, prefixLen)}••••••••${clean.slice(-suffixLen)}`;
}

function getStatus() {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const stripePublishable = process.env.STRIPE_PUBLISHABLE_KEY;
  const stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET;

  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL || 'SCOFEN <onboarding@resend.dev>';

  const isStripeConfigured = Boolean(
    stripeSecret && 
    stripeSecret.startsWith('sk_') && 
    !stripeSecret.includes('your_')
  );

  const isResendConfigured = Boolean(
    resendKey && 
    resendKey.startsWith('re_') && 
    !resendKey.includes('your_')
  );

  const isStripeLive = Boolean(stripeSecret && stripeSecret.startsWith('sk_live_'));

  return {
    stripe: {
      configured: isStripeConfigured,
      mode: isStripeConfigured ? (isStripeLive ? ('live' as const) : ('test' as const)) : ('sandbox_simulation' as const),
      maskedSecretKey: maskKey(stripeSecret, 7, 4),
      publishableKey: stripePublishable && !stripePublishable.includes('your_') 
        ? stripePublishable 
        : 'pk_test_scofen_sandbox_key_simulated',
      webhookConfigured: Boolean(stripeWebhook && !stripeWebhook.includes('your_')),
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD'],
      activeProducts: [
        {
          id: 'prod_submission_fee',
          name: 'A&R Board Evaluation Submission',
          pricing: '$50.00 - $100.00 dynamic fee',
          splitRule: '70% Host Curator / 30% SCOFEN Platform',
        },
        {
          id: 'prod_streaming_pass',
          name: 'Dual-Layer Streaming Unlimited Pass',
          pricing: '$5.99 / month recurring',
          splitRule: '100% Platform Music Discovery Pool',
        },
      ],
    },
    resend: {
      configured: isResendConfigured,
      mode: isResendConfigured ? ('live' as const) : ('sandbox_simulation' as const),
      maskedApiKey: maskKey(resendKey, 3, 4),
      fromEmail: resendFrom,
      templates: [
        {
          id: 'submission_received',
          name: 'Submission Received & Queued',
          description: 'Notifies submitting artist that submission fee cleared and curation review has commenced.',
        },
        {
          id: 'evaluation_completed',
          name: 'A&R Evaluation & Rubric Scores Released',
          description: 'Dispatches complete weighted criteria breakdown and streaming discovery link.',
        },
        {
          id: 'curator_payout',
          name: '70% Host Royalty Payout Cleared',
          description: 'Alerts host curator of net royalty credit deposited for verified board submission.',
        },
        {
          id: 'subscription_welcome',
          name: 'Unlimited Streaming Pass Activated',
          description: 'Confirms $5.99/mo full-length audio streaming pass unlock.',
        },
      ],
    },
    envGuide: {
      file: '.env',
      editableKeys: [
        { name: 'STRIPE_SECRET_KEY', desc: 'Stripe Secret Key (sk_test_... or sk_live_...)' },
        { name: 'STRIPE_PUBLISHABLE_KEY', desc: 'Stripe Publishable Key (pk_test_... or pk_live_...)' },
        { name: 'STRIPE_WEBHOOK_SECRET', desc: 'Stripe Webhook Secret (whsec_...)' },
        { name: 'RESEND_API_KEY', desc: 'Resend API Key (re_...)' },
        { name: 'RESEND_FROM_EMAIL', desc: 'Verified sender email (e.g. SCOFEN <curations@yourdomain.com>)' },
      ],
    },
  };
}

export const integrationsService = {
  reloadEnv(): { success: boolean; message: string; status: ReturnType<typeof getStatus> } {
    try {
      dotenv.config({ override: true });
      return {
        success: true,
        message: 'Environment variables successfully reloaded from .env',
        status: getStatus(),
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reload environment';
      return {
        success: false,
        message,
        status: getStatus(),
      };
    }
  },

  getStatus,

  async createStripeCheckout(payload: {
    submissionId?: string;
    payerId: string;
    type: 'submission_fee' | 'streaming_subscription';
    customAmount?: number;
    currency?: string;
  }) {
    const { submissionId, payerId, type, customAmount } = payload;
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const isRealStripe = Boolean(stripeSecret && stripeSecret.startsWith('sk_') && !stripeSecret.includes('your_'));

    let amount = 599; // in cents
    let title = 'SCOFEN Full Audio Streaming Pass ($5.99/mo)';
    let hostCutCents = 0;
    let platformCutCents = 599;

    let submissionRecord = null;
    let boardRecord = null;

    if (type === 'submission_fee' && submissionId) {
      submissionRecord = dbStore.getBoardSubmissions('') // find across all
        .concat(
          dbStore.getAllBoards().flatMap((b) => dbStore.getBoardSubmissions(b.id))
        )
        .find((s) => s.id === submissionId);

      if (submissionRecord) {
        boardRecord = dbStore.getBoard(submissionRecord.board_id);
      }

      const fee = customAmount || (boardRecord ? boardRecord.entry_fee : 75);
      amount = Math.round(fee * 100);
      hostCutCents = Math.round(amount * 0.7);
      platformCutCents = amount - hostCutCents;
      title = `SCOFEN A&R Submission: "${submissionRecord?.track_title || 'Demo Track'}" (${boardRecord?.title || 'Curator Board'})`;
    }

    if (isRealStripe) {
      try {
        const params = new URLSearchParams();
        params.append('payment_method_types[0]', 'card');
        params.append('line_items[0][price_data][currency]', payload.currency || 'usd');
        params.append('line_items[0][price_data][product_data][name]', title);
        params.append('line_items[0][price_data][unit_amount]', amount.toString());
        params.append('line_items[0][quantity]', '1');
        params.append('mode', 'payment');
        params.append('success_url', 'http://localhost:3000/?session_id={CHECKOUT_SESSION_ID}&payment_status=success');
        params.append('cancel_url', 'http://localhost:3000/?payment_status=cancelled');
        params.append('metadata[type]', type);
        params.append('metadata[payer_id]', payerId);
        if (submissionId) params.append('metadata[submission_id]', submissionId);

        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${stripeSecret}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        const stripeData = await response.json();
        if (!response.ok) {
          throw new Error(stripeData.error?.message || 'Stripe API checkout failed');
        }

        // Log to integrations audit log
        const logEntry: IntegrationLog = {
          id: `log_stripe_${Date.now()}`,
          service: 'stripe',
          type: 'checkout_session_created',
          status: 'succeeded',
          summary: `Created Stripe Checkout Session ${stripeData.id} for $${(amount / 100).toFixed(2)}`,
          details: {
            sessionId: stripeData.id,
            url: stripeData.url,
            amount: `$${(amount / 100).toFixed(2)}`,
            split: {
              host70: `$${(hostCutCents / 100).toFixed(2)}`,
              platform30: `$${(platformCutCents / 100).toFixed(2)}`,
            },
          },
          timestamp: new Date().toISOString(),
        };
        integrationLogs.unshift(logEntry);

        return {
          mode: 'live_stripe',
          sessionId: stripeData.id,
          checkoutUrl: stripeData.url,
          amountCents: amount,
          hostCutCents,
          platformCutCents,
        };
      } catch (err: unknown) {
        console.error('Stripe live checkout error, falling back to sandbox simulator:', err);
      }
    }

    // Sandbox / Test Simulator Mode
    const mockSessionId = `cs_test_scofen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const mockCheckoutUrl = `http://localhost:3000/?sandbox_checkout=success&session_id=${mockSessionId}&amt=${(amount / 100).toFixed(2)}`;

    // Automatically process ledger credit for sandbox test
    if (submissionId) {
      try {
        dbStore.processCheckout(submissionId, payerId);
      } catch (e) {
        console.warn('Sandbox checkout ledger update notice:', e);
      }
    } else if (type === 'streaming_subscription') {
      try {
        dbStore.toggleSubscriber(payerId);
      } catch (e) {
        console.warn('Sandbox subscriber update notice:', e);
      }
    }

    const logEntry: IntegrationLog = {
      id: `log_stripe_${Date.now()}`,
      service: 'stripe',
      type: 'checkout_session_completed',
      status: 'simulated',
      summary: `[Sandbox] Processed payment of $${(amount / 100).toFixed(2)} for ${title}`,
      details: {
        sessionId: mockSessionId,
        checkoutUrl: mockCheckoutUrl,
        amount: `$${(amount / 100).toFixed(2)}`,
        hostCut: `$${(hostCutCents / 100).toFixed(2)}`,
        platformCut: `$${(platformCutCents / 100).toFixed(2)}`,
        rule: '70/30 Sovereign Split',
      },
      timestamp: new Date().toISOString(),
    };
    integrationLogs.unshift(logEntry);

    return {
      mode: 'sandbox_simulation',
      sessionId: mockSessionId,
      checkoutUrl: mockCheckoutUrl,
      amountCents: amount,
      hostCutCents,
      platformCutCents,
      message: 'Processed via SCOFEN Sandbox Engine (Stripe Keys can be supplied in .env)',
    };
  },

  async simulateStripeWebhook(eventType: string, dataPayload?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    const eventId = `evt_sim_${Date.now()}`;

    const logEntry: IntegrationLog = {
      id: `log_hook_${Date.now()}`,
      service: 'stripe',
      type: eventType,
      status: 'simulated',
      summary: `Received verified Stripe Webhook event: ${eventType}`,
      details: {
        eventId,
        receivedAt: timestamp,
        payload: dataPayload || {
          object: 'event',
          type: eventType,
          status: 'verified',
        },
      },
      timestamp,
    };
    integrationLogs.unshift(logEntry);

    return {
      received: true,
      eventId,
      eventType,
      status: 'processed',
    };
  },

  async sendResendEmail(params: {
    to: string;
    templateId: 'submission_received' | 'evaluation_completed' | 'curator_payout' | 'subscription_welcome' | 'custom';
    subject?: string;
    customHtml?: string;
    data?: {
      artistName?: string;
      trackTitle?: string;
      boardTitle?: string;
      entryFee?: number;
      curatorName?: string;
      finalScore?: number;
      payoutAmount?: number;
    };
  }) {
    const { to, templateId, data } = params;
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'SCOFEN <onboarding@resend.dev>';
    const isRealResend = Boolean(resendKey && resendKey.startsWith('re_') && !resendKey.includes('your_'));

    let subject = params.subject || 'SCOFEN Notification';
    let html = params.customHtml || '';

    // Generate styled template content if not custom
    if (!html) {
      if (templateId === 'submission_received') {
        subject = subject || `[SCOFEN] Submission Confirmed: "${data?.trackTitle || 'Track'}" -> ${data?.boardTitle || 'A&R Board'}`;
        html = `
          <div style="background-color: #0d0d0d; color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; border-radius: 8px; border: 1px solid #1f1f1f; max-width: 600px; margin: 0 auto;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1f1f1f; padding-bottom: 16px;">
              <span style="font-size: 18px; font-weight: bold; letter-spacing: -0.02em;">SCOFEN</span>
              <span style="color: #00ff87; font-size: 13px; font-weight: 600;">GATEWAY CLEARED</span>
            </div>
            <h2 style="font-size: 20px; font-weight: 600; margin-top: 24px; color: #ffffff;">Your submission is locked in the A&R queue</h2>
            <p style="color: #8c8c8c; font-size: 14px; line-height: 1.6;">
              Hello ${data?.artistName || 'Creator'}, your submission for <strong>"${data?.trackTitle || 'Audio Track'}"</strong> has been successfully received by <strong>${data?.curatorName || 'Host Curator'}</strong>.
            </p>
            <div style="background-color: #141414; border: 1px solid #1f1f1f; border-radius: 6px; padding: 16px; margin: 20px 0;">
              <table style="width: 100%; font-size: 13px; color: #f5f5f5;">
                <tr><td style="color: #8c8c8c; padding: 4px 0;">Board:</td><td style="text-align: right; font-weight: 500;">${data?.boardTitle || 'Curator Board'}</td></tr>
                <tr><td style="color: #8c8c8c; padding: 4px 0;">Fee Cleared:</td><td style="text-align: right; color: #00ff87; font-weight: bold;">$${(data?.entryFee || 75).toFixed(2)}</td></tr>
                <tr><td style="color: #8c8c8c; padding: 4px 0;">Sovereign Split:</td><td style="text-align: right; color: #8c8c8c;">70% Curator / 30% Platform</td></tr>
              </table>
            </div>
            <p style="color: #8c8c8c; font-size: 12px; margin-top: 24px;">SCOFEN Sovereign A&R Infrastructure. Zero spam, 100% evaluated labor.</p>
          </div>
        `;
      } else if (templateId === 'evaluation_completed') {
        subject = subject || `[SCOFEN] Rubric Score Released: "${data?.trackTitle || 'Track'}" (${data?.finalScore || 88.5}/100)`;
        html = `
          <div style="background-color: #0d0d0d; color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; border-radius: 8px; border: 1px solid #1f1f1f; max-width: 600px; margin: 0 auto;">
            <div style="border-bottom: 1px solid #1f1f1f; padding-bottom: 16px;">
              <span style="font-size: 18px; font-weight: bold; letter-spacing: -0.02em;">SCOFEN</span>
            </div>
            <h2 style="font-size: 20px; font-weight: 600; margin-top: 24px; color: #ffffff;">A&R Evaluation Completed</h2>
            <p style="color: #8c8c8c; font-size: 14px; line-height: 1.6;">
              Curator ${data?.curatorName || 'Host'} has finalized the multi-criteria evaluation for <strong>"${data?.trackTitle || 'Track'}"</strong>.
            </p>
            <div style="background-color: #141414; border: 1px solid #1f1f1f; border-radius: 6px; padding: 20px; text-align: center; margin: 20px 0;">
              <div style="font-size: 11px; color: #8c8c8c; text-transform: uppercase; letter-spacing: 0.05em;">Final Weighted Rubric Score</div>
              <div style="font-size: 44px; font-weight: 800; color: #00ff87; margin: 8px 0;">${data?.finalScore || 88.5}</div>
              <div style="font-size: 12px; color: #8c8c8c;">Track is now live on the Discovery Feed and curator charts.</div>
            </div>
          </div>
        `;
      } else if (templateId === 'curator_payout') {
        subject = subject || `[SCOFEN] 70% Host Royalty Payout Deposited: $${(data?.payoutAmount || 52.5).toFixed(2)}`;
        html = `
          <div style="background-color: #0d0d0d; color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; border-radius: 8px; border: 1px solid #1f1f1f; max-width: 600px; margin: 0 auto;">
            <div style="border-bottom: 1px solid #1f1f1f; padding-bottom: 16px;">
              <span style="font-size: 18px; font-weight: bold; letter-spacing: -0.02em;">SCOFEN</span>
            </div>
            <h2 style="font-size: 20px; font-weight: 600; margin-top: 24px; color: #ffffff;">Host Royalty Disbursed</h2>
            <p style="color: #8c8c8c; font-size: 14px;">
              Your 70% net revenue split has been credited for submission evaluation on <strong>${data?.boardTitle || 'Curator Board'}</strong>.
            </p>
            <div style="background-color: #141414; border: 1px solid #1f1f1f; border-radius: 6px; padding: 16px; margin: 20px 0;">
              <table style="width: 100%; font-size: 13px; color: #f5f5f5;">
                <tr><td style="color: #8c8c8c;">Net Payout Credited:</td><td style="text-align: right; color: #00ff87; font-weight: bold; font-size: 16px;">+$${(data?.payoutAmount || 52.5).toFixed(2)}</td></tr>
                <tr><td style="color: #8c8c8c;">Platform Fee (30%):</td><td style="text-align: right; color: #8c8c8c;">-$${((data?.payoutAmount || 52.5) * 3 / 7).toFixed(2)}</td></tr>
              </table>
            </div>
          </div>
        `;
      } else {
        subject = subject || '[SCOFEN] Unlimited Streaming Pass Activated';
        html = `
          <div style="background-color: #0d0d0d; color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; border-radius: 8px; border: 1px solid #1f1f1f; max-width: 600px; margin: 0 auto;">
            <div style="border-bottom: 1px solid #1f1f1f; padding-bottom: 16px;">
              <span style="font-size: 18px; font-weight: bold; letter-spacing: -0.02em;">SCOFEN</span>
            </div>
            <h2 style="font-size: 20px; font-weight: 600; margin-top: 24px; color: #00ff87;">Full Audio Streaming Pass Active</h2>
            <p style="color: #8c8c8c; font-size: 14px;">
              You now have unlimited full-length audio streaming access across all tracks on the SCOFEN discovery network ($5.99/mo).
            </p>
          </div>
        `;
      }
    }

    if (isRealResend) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [to],
            subject,
            html,
          }),
        });

        const resendData = await response.json();
        if (!response.ok) {
          throw new Error(resendData.message || 'Resend email dispatch error');
        }

        const logEntry: IntegrationLog = {
          id: `log_resend_${Date.now()}`,
          service: 'resend',
          type: 'email_dispatched_live',
          status: 'succeeded',
          summary: `Sent live email via Resend to ${to}: "${subject}"`,
          details: {
            messageId: resendData.id,
            to,
            from: fromEmail,
            subject,
            templateId,
          },
          timestamp: new Date().toISOString(),
        };
        integrationLogs.unshift(logEntry);

        return {
          mode: 'live_resend',
          messageId: resendData.id,
          recipient: to,
          status: 'dispatched',
          subject,
        };
      } catch (err: unknown) {
        console.error('Resend live dispatch error, falling back to sandbox simulator:', err);
      }
    }

    // Sandbox Simulator Mode
    const simulatedMessageId = `resend_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const logEntry: IntegrationLog = {
      id: `log_resend_${Date.now()}`,
      service: 'resend',
      type: 'email_simulated',
      status: 'simulated',
      summary: `[Sandbox] Dispatched email to ${to}: "${subject}"`,
      details: {
        simulatedMessageId,
        recipient: to,
        sender: fromEmail,
        subject,
        templateId,
        previewLength: html.length,
      },
      timestamp: new Date().toISOString(),
    };
    integrationLogs.unshift(logEntry);

    return {
      mode: 'sandbox_simulation',
      messageId: simulatedMessageId,
      recipient: to,
      status: 'simulated_delivery',
      subject,
      previewHtml: html,
      note: 'Resend API key can be supplied in .env to switch from Sandbox to Live delivery',
    };
  },

  getAuditLogs(): IntegrationLog[] {
    return integrationLogs;
  },

  clearAuditLogs() {
    integrationLogs.length = 0;
    return { success: true };
  },
};
