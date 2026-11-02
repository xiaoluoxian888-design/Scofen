import React, { useState, useEffect } from 'react';
import { User } from '../types/schema';
import { apiClient } from '../services/apiClient';
import { 
  CreditCard, 
  Mail, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Send, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Percent,
  Layers,
  ArrowRight,
  Clock,
  Trash2,
  FileCode2
} from 'lucide-react';

interface IntegrationStatus {
  stripe: {
    configured: boolean;
    mode: 'live' | 'test' | 'sandbox_simulation';
    maskedSecretKey: string;
    publishableKey: string;
    webhookConfigured: boolean;
    supportedCurrencies: string[];
    activeProducts: {
      id: string;
      name: string;
      pricing: string;
      splitRule: string;
    }[];
  };
  resend: {
    configured: boolean;
    mode: 'live' | 'sandbox_simulation';
    maskedApiKey: string;
    fromEmail: string;
    templates: {
      id: string;
      name: string;
      description: string;
    }[];
  };
  envGuide: {
    file: string;
    editableKeys: { name: string; desc: string }[];
  };
}

interface IntegrationLog {
  id: string;
  service: 'stripe' | 'resend';
  type: string;
  status: 'succeeded' | 'simulated' | 'failed' | 'pending';
  summary: string;
  details: Record<string, unknown>;
  timestamp: string;
}

interface StripeResendCentreProps {
  currentUser: User;
  onRefreshLedger?: () => void;
}

export const StripeResendCentre: React.FC<StripeResendCentreProps> = ({ currentUser, onRefreshLedger }) => {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadNotice, setReloadNotice] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'stripe' | 'resend' | 'env_config' | 'logs'>('stripe');

  // Stripe Test State
  const [testAmount, setTestAmount] = useState<number>(75);
  const [testPaymentType, setTestPaymentType] = useState<'submission_fee' | 'streaming_subscription'>('submission_fee');
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  const [stripeResult, setStripeResult] = useState<any | null>(null);

  // Resend Test State
  const [recipientEmail, setRecipientEmail] = useState<string>(currentUser.email || 'artist@example.com');
  const [selectedTemplate, setSelectedTemplate] = useState<'submission_received' | 'evaluation_completed' | 'curator_payout' | 'subscription_welcome' | 'custom'>('submission_received');
  const [customSubject, setCustomSubject] = useState<string>('SCOFEN A&R Evaluation Result');
  const [customBody, setCustomBody] = useState<string>('Your music has been officially curated on SCOFEN.');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<any | null>(null);

  // Copy helpers
  const [copiedEnv, setCopiedEnv] = useState(false);

  const fetchStatusAndLogs = async () => {
    try {
      const [statusData, logsData] = await Promise.all([
        apiClient.getIntegrationStatus(),
        apiClient.getIntegrationLogs(),
      ]);
      setStatus(statusData);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to load integration data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndLogs();
  }, []);

  const handleReloadEnv = async () => {
    setIsReloading(true);
    setReloadNotice(null);
    try {
      const res = await apiClient.reloadIntegrationEnv();
      setStatus(res.status);
      setReloadNotice(res.message || 'Environment successfully reloaded.');
      const updatedLogs = await apiClient.getIntegrationLogs();
      setLogs(updatedLogs);
    } catch (err: any) {
      setReloadNotice(`Error: ${err.message}`);
    } finally {
      setIsReloading(false);
      setTimeout(() => setReloadNotice(null), 5000);
    }
  };

  const handleRunStripeTest = async () => {
    setIsProcessingStripe(true);
    setStripeResult(null);
    try {
      const result = await apiClient.createIntegrationStripeCheckout({
        type: testPaymentType,
        payerId: currentUser.id,
        customAmount: testPaymentType === 'submission_fee' ? testAmount : 5.99,
        currency: 'usd',
      });
      setStripeResult(result);
      if (onRefreshLedger) onRefreshLedger();
      const updatedLogs = await apiClient.getIntegrationLogs();
      setLogs(updatedLogs);
    } catch (err: any) {
      setStripeResult({ error: err.message });
    } finally {
      setIsProcessingStripe(false);
    }
  };

  const handleSimulateWebhook = async (eventType: string) => {
    try {
      await apiClient.simulateStripeWebhook(eventType, {
        object: 'event',
        type: eventType,
        data: {
          amount: testAmount * 100,
          currency: 'usd',
          user_id: currentUser.id,
        },
      });
      const updatedLogs = await apiClient.getIntegrationLogs();
      setLogs(updatedLogs);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingEmail(true);
    setEmailResult(null);
    try {
      const payload: any = {
        to: recipientEmail,
        templateId: selectedTemplate,
        subject: selectedTemplate === 'custom' ? customSubject : undefined,
        customHtml: selectedTemplate === 'custom' ? `<div style="padding:24px;background:#0d0d0d;color:#fff;font-family:sans-serif;"><h3>SCOFEN</h3><p>${customBody}</p></div>` : undefined,
        data: {
          artistName: `${currentUser.first_name} ${currentUser.last_name}`,
          trackTitle: 'Midnight In Tokyo (Club Mix)',
          boardTitle: 'Global Electronic & Tech A&R',
          entryFee: testAmount,
          curatorName: 'Elena Rostova (Metropolis Sync)',
          finalScore: 92.4,
          payoutAmount: Number((testAmount * 0.7).toFixed(2)),
        },
      };

      const result = await apiClient.sendResendEmail(payload);
      setEmailResult(result);
      const updatedLogs = await apiClient.getIntegrationLogs();
      setLogs(updatedLogs);
    } catch (err: any) {
      setEmailResult({ error: err.message });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      await apiClient.clearIntegrationLogs();
      setLogs([]);
    } catch (err) {
      console.error(err);
    }
  };

  const envFileTemplate = `# SCOFEN INTEGRATION ENVIRONMENT VARIABLES
# Edit these in your .env file in the application root directory

# Stripe Payment Gateway
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Resend Transactional Email Engine
RESEND_API_KEY="re_your_api_key_here"
RESEND_FROM_EMAIL="SCOFEN <onboarding@resend.dev>"`;

  const copyEnvToClipboard = () => {
    navigator.clipboard.writeText(envFileTemplate);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Operations & Finance Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Stripe & Resend Operations Centre
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Manage sovereign A&R 70/30 fee collection, automated curator royalty disbursements, and transactional email dispatches. API credentials are encrypted server-side and dynamically configurable.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleReloadEnv}
              disabled={isReloading}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/80 text-xs font-medium text-zinc-200 transition-all hover:border-emerald-500/50 disabled:opacity-50 cursor-pointer"
              title="Hot-reloads .env without restarting server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin text-emerald-400' : 'text-zinc-400'}`} />
              <span>{isReloading ? 'Reloading .env...' : 'Reload Environment'}</span>
            </button>
          </div>
        </div>

        {/* Reload notification toast */}
        {reloadNotice && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{reloadNotice}</span>
          </div>
        )}

        {/* Integration Status Badges */}
        {status && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800/80">
            {/* Stripe Gateway */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  Stripe Gateway
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                  status.stripe.mode === 'live' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : status.stripe.mode === 'test'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}>
                  {status.stripe.mode === 'live' ? 'Live Mode' : status.stripe.mode === 'test' ? 'Test Keys' : 'Sandbox Ready'}
                </span>
              </div>
              <div className="text-xs font-mono text-zinc-300 truncate" title={status.stripe.maskedSecretKey}>
                {status.stripe.maskedSecretKey}
              </div>
            </div>

            {/* Resend Engine */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  Resend Email
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                  status.resend.mode === 'live'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}>
                  {status.resend.mode === 'live' ? 'Live Connected' : 'Sandbox Ready'}
                </span>
              </div>
              <div className="text-xs font-mono text-zinc-300 truncate" title={status.resend.maskedApiKey}>
                {status.resend.maskedApiKey}
              </div>
            </div>

            {/* Sovereign Split Rule */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-emerald-400" />
                  Split Matrix
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Automated
                </span>
              </div>
              <div className="text-xs font-semibold text-white">
                70% Curator / 30% SCOFEN
              </div>
            </div>

            {/* Sender Identity */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  From Address
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
                  Verified
                </span>
              </div>
              <div className="text-xs text-zinc-300 font-mono truncate" title={status.resend.fromEmail}>
                {status.resend.fromEmail}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Operations Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-zinc-800/80 pb-3">
        <button
          onClick={() => setActiveSubTab('stripe')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeSubTab === 'stripe'
              ? 'bg-zinc-850 text-white font-semibold border border-emerald-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span>Stripe Payments & Checkout</span>
        </button>

        <button
          onClick={() => setActiveSubTab('resend')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeSubTab === 'resend'
              ? 'bg-zinc-850 text-white font-semibold border border-emerald-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Mail className="w-4 h-4 text-emerald-400" />
          <span>Resend Transactional Emails</span>
        </button>

        <button
          onClick={() => setActiveSubTab('env_config')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeSubTab === 'env_config'
              ? 'bg-zinc-850 text-white font-semibold border border-emerald-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <FileCode2 className="w-4 h-4 text-emerald-400" />
          <span>API Keys & Environment Guide</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeSubTab === 'logs'
              ? 'bg-zinc-850 text-white font-semibold border border-emerald-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Activity Audit Ledger ({logs.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: STRIPE PAYMENTS */}
      {activeSubTab === 'stripe' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Payment Runner (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Live Payment Execution & Simulation
              </h3>
              <p className="text-xs text-zinc-400 mb-6">
                Trigger real Stripe Checkout sessions or run simulated transactions to verify automated 70/30 host royalty accounting.
              </p>

              {/* Payment Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div 
                  onClick={() => setTestPaymentType('submission_fee')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    testPaymentType === 'submission_fee'
                      ? 'bg-zinc-850 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white">Curator Submission Fee</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      70/30 Split
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Artist pays host curator entry fee ($50 - $100). Host receives 70% net upon clearing.
                  </p>
                </div>

                <div 
                  onClick={() => setTestPaymentType('streaming_subscription')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    testPaymentType === 'streaming_subscription'
                      ? 'bg-zinc-850 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white">Full Stream Pass ($5.99/mo)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      Recurring
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Unlocks unlimited full-length audio playback beyond the 60-second public teaser.
                  </p>
                </div>
              </div>

              {/* Amount Configuration */}
              {testPaymentType === 'submission_fee' && (
                <div className="mb-6 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-zinc-300">
                      Submission Entry Fee (Host Autonomy)
                    </label>
                    <span className="text-base font-mono font-bold text-emerald-400">
                      ${testAmount.toFixed(2)} USD
                    </span>
                  </div>

                  <input 
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={testAmount}
                    onChange={(e) => setTestAmount(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />

                  <div className="flex justify-between text-[10px] text-zinc-400 mt-2 font-mono">
                    <span>$50 Min</span>
                    <span>$75 Baseline</span>
                    <span>$100 Max</span>
                  </div>

                  {/* Mathematical Split Breakdown Preview */}
                  <div className="mt-4 pt-4 border-t border-zinc-800/80 grid grid-cols-2 gap-4">
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      <div className="text-[10px] text-zinc-400 font-mono">Curator Cut (70%)</div>
                      <div className="text-sm font-mono font-bold text-white mt-0.5">
                        ${(testAmount * 0.7).toFixed(2)}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      <div className="text-[10px] text-zinc-400 font-mono">Platform Infrastructure (30%)</div>
                      <div className="text-sm font-mono font-bold text-zinc-300 mt-0.5">
                        ${(testAmount * 0.3).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Run Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleRunStripeTest}
                  disabled={isProcessingStripe}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isProcessingStripe
                      ? 'Creating Checkout Session...'
                      : testPaymentType === 'submission_fee'
                      ? `Execute Test Checkout ($${testAmount.toFixed(2)})`
                      : 'Execute $5.99 Streaming Unlock'}
                  </span>
                </button>

                <button
                  onClick={() => handleSimulateWebhook('checkout.session.completed')}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs text-zinc-200 transition-all font-mono"
                  title="Simulates an inbound verified webhook event from Stripe"
                >
                  Test Webhook Event
                </button>
              </div>

              {/* Result display */}
              {stripeResult && (
                <div className="mt-6 p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Checkout Session Created ({stripeResult.mode})
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {stripeResult.sessionId}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300">
                    {stripeResult.message || `Amount: $${(stripeResult.amountCents / 100).toFixed(2)} | Host Net: $${(stripeResult.hostCutCents / 100).toFixed(2)} (70%)`}
                  </p>

                  {stripeResult.checkoutUrl && (
                    <div className="pt-2 border-t border-zinc-800/80">
                      <a
                        href={stripeResult.checkoutUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-mono underline"
                      >
                        <span>Open Checkout URL in New Window</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Architecture Details */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 font-semibold">
                Sovereign Billing Mechanics
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
                <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <div className="font-semibold text-white mb-1">Self-Friction Gatekeeping</div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Unfiltered DM spam is eliminated. Independent creators pre-fund evaluation labor, creating an ungameable signal of serious artistic intent.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <div className="font-semibold text-white mb-1">Direct Split Routing</div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Stripe Transfer metadata or instant database ledger routing locks 70% directly to the host's accrued payout balance with zero manual calculations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Parameters (1 col) */}
          <div className="space-y-6">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-4 font-semibold">
                Active Stripe Products
              </h4>

              <div className="space-y-3">
                {status?.stripe.activeProducts.map((p) => (
                  <div key={p.id} className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                    <div className="text-xs font-semibold text-white mb-1">{p.name}</div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-emerald-400">{p.pricing}</span>
                      <span className="text-zinc-400">{p.splitRule}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 font-semibold">
                Webhook Listener Ready
              </h4>
              <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
                Configure your Stripe webhook URL in the Stripe Dashboard to automatically process incoming events:
              </p>
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-300 break-all">
                https://your-domain.com/api/integrations/stripe/webhook
              </div>
              <div className="mt-3 text-[10px] text-zinc-500 font-mono">
                Listening: checkout.session.completed, payment_intent.succeeded
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RESEND TRANSACTIONAL EMAILS */}
      {activeSubTab === 'resend' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Dispatcher (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                Resend Transactional Email Engine
              </h3>
              <p className="text-xs text-zinc-400 mb-6">
                Send curated notifications to artists and host curators. Live keys route through Resend API; sandbox mode verifies rendering and delivery simulation.
              </p>

              {/* Template Selector */}
              <div className="space-y-4 mb-6">
                <label className="text-xs font-medium text-zinc-300">
                  Select Transactional Notification Template
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedTemplate('submission_received')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'submission_received'
                        ? 'bg-zinc-850 border-emerald-500/50'
                        : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white mb-1">Submission Confirmed</div>
                    <p className="text-[11px] text-zinc-400">
                      Notifies artist that submission fee cleared and review queue is locked.
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedTemplate('evaluation_completed')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'evaluation_completed'
                        ? 'bg-zinc-850 border-emerald-500/50'
                        : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white mb-1">Rubric Score Released</div>
                    <p className="text-[11px] text-zinc-400">
                      Dispatches weighted criteria scores, feedback, and streaming discovery status.
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedTemplate('curator_payout')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'curator_payout'
                        ? 'bg-zinc-850 border-emerald-500/50'
                        : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white mb-1">Host Royalty Payout</div>
                    <p className="text-[11px] text-zinc-400">
                      Alerts host curator of 70% net royalty disbursement credited to balance.
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedTemplate('subscription_welcome')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'subscription_welcome'
                        ? 'bg-zinc-850 border-emerald-500/50'
                        : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white mb-1">Full Stream Pass Welcome</div>
                    <p className="text-[11px] text-zinc-400">
                      Confirms $5.99/mo full-length audio streaming pass unlock.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recipient Input */}
              <div className="mb-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="curator@agency.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Note: For testing with unverified domains, Resend allows sending to the email registered with your Resend account.
                  </span>
                </div>
              </div>

              {/* Dispatch Button */}
              <button
                onClick={handleSendTestEmail}
                disabled={isSendingEmail || !recipientEmail}
                className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSendingEmail ? 'Dispatching via Resend...' : 'Send Transactional Notification'}</span>
              </button>

              {/* Email dispatch result */}
              {emailResult && (
                <div className="mt-6 p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Email Dispatched ({emailResult.mode})
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {emailResult.messageId}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300">
                    Recipient: <strong className="text-white">{emailResult.recipient}</strong> — Subject: <em>{emailResult.subject}</em>
                  </p>

                  {emailResult.note && (
                    <div className="text-[11px] text-zinc-400 pt-1">
                      {emailResult.note}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Email Preview & Specs (1 col) */}
          <div className="space-y-6">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-3 font-semibold">
                Sender Identity & Deliverability
              </h4>
              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="flex justify-between py-1.5 border-b border-zinc-800">
                  <span className="text-zinc-400">From Name:</span>
                  <span className="font-semibold text-white">SCOFEN Sovereign A&R</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800">
                  <span className="text-zinc-400">Sender:</span>
                  <span className="font-mono text-zinc-200 truncate max-w-[150px]">{status?.resend.fromEmail}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800">
                  <span className="text-zinc-400">DKIM / SPF:</span>
                  <span className="text-emerald-400 font-mono">Enabled</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-400">Engine:</span>
                  <span className="font-mono text-zinc-300">{status?.resend.mode}</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 font-semibold">
                Automated Event Triggers
              </h4>
              <ul className="space-y-2 text-[11px] text-zinc-400">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span><strong>On Track Submit:</strong> Dispatches submission confirmation and links creator to board queue.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span><strong>On Score Finalize:</strong> Dispatches calculated rubric breakdown and discovery chart inclusion.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span><strong>On Payout Settle:</strong> Dispatches host net royalty credit statement.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EDITABLE API KEYS & CONFIGURATION GUIDE */}
      {activeSubTab === 'env_config' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-emerald-400" />
                  Dynamic Server-Side Key Configuration
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  API keys are stored strictly in server-side environment files (<code className="text-emerald-400 font-mono">.env</code>) and proxy routes (<code className="text-emerald-400 font-mono">/api/*</code>). Secret keys are never exposed in browser bundles.
                </p>
              </div>

              <button
                onClick={copyEnvToClipboard}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-medium text-zinc-200 transition-all cursor-pointer flex-shrink-0"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copiedEnv ? 'Copied .env template!' : 'Copy .env Template'}</span>
              </button>
            </div>

            {/* Code Block */}
            <div className="relative rounded-xl bg-black border border-zinc-800 p-4 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed shadow-inner">
              <pre>{envFileTemplate}</pre>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-zinc-800/80">
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <div className="text-[11px] font-mono text-emerald-400 font-bold mb-1">STEP 01</div>
                <div className="text-xs font-semibold text-white mb-1.5">Open or Create .env</div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  In your workspace root, create or edit the <code className="text-zinc-200 font-mono">.env</code> file (derived from <code className="text-zinc-200 font-mono">.env.example</code>).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <div className="text-[11px] font-mono text-emerald-400 font-bold mb-1">STEP 02</div>
                <div className="text-xs font-semibold text-white mb-1.5">Paste Stripe & Resend Keys</div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Add your live or test keys: <code className="text-zinc-200 font-mono">STRIPE_SECRET_KEY</code> and <code className="text-zinc-200 font-mono">RESEND_API_KEY</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <div className="text-[11px] font-mono text-emerald-400 font-bold mb-1">STEP 03</div>
                <div className="text-xs font-semibold text-white mb-1.5">Click "Reload Environment"</div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Click the reload button at the top of this hub. The server instantly hot-reloads keys without downtime or restart.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: ACTIVITY AUDIT LEDGER */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Integration Activity & Delivery Audit Trail
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time log of payment checkouts, webhook payloads, and transactional email dispatches.
              </p>
            </div>

            {logs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-rose-400 px-3 py-1.5 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Logs</span>
              </button>
            )}
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
            {logs.length === 0 ? (
              <div className="p-12 text-center text-xs font-mono text-zinc-500">
                No integration events recorded yet. Run a Stripe checkout or Resend email dispatch above.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/80">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-zinc-850/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          log.service === 'stripe'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        }`}>
                          {log.service}
                        </span>
                        <span className="text-xs font-semibold text-white">{log.summary}</span>
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] font-mono text-zinc-400">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          log.status === 'succeeded'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-zinc-300 bg-zinc-800'
                        }`}>
                          {log.status}
                        </span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Expandable JSON Details */}
                    <div className="mt-2 p-2.5 rounded-lg bg-black/60 border border-zinc-800/60 font-mono text-[10px] text-zinc-400 overflow-x-auto">
                      <pre>{JSON.stringify(log.details, null, 2)}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
