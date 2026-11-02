import React, { useState } from 'react';
import { Submission, User } from '../types/schema';
import { apiClient } from '../services/apiClient';
import { X, DollarSign, ShieldCheck, CheckCircle2, Music, Sparkles } from 'lucide-react';

interface CheckoutModalProps {
  submission: Submission | null;
  currentUser: User;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  submission,
  currentUser,
  onClose,
  onPaymentSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!submission) return null;

  const entryFee = submission.board?.entry_fee || 0;
  const hostCut = Number((entryFee * 0.70).toFixed(2));
  const platformCut = Number((entryFee * 0.30).toFixed(2));

  const handleExecutePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.checkoutSubmission(submission.id, currentUser.id);
      onPaymentSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-zinc-850 pb-3">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Music className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">
              Curator Audition Checkout
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Settling the audition fee unfreezes your track for curator scoring and charts.
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-2xl text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-400">Track:</span>
            <span className="text-white font-semibold truncate max-w-[200px]">{submission.track_title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Curator Board:</span>
            <span className="text-zinc-200">{submission.board?.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Host Curator:</span>
            <span className="text-emerald-400 font-medium">
              {submission.board?.host ? `${submission.board.host.first_name} ${submission.board.host.last_name}` : 'Curator'}
            </span>
          </div>
        </div>

        {/* 70/30 Fee Distribution */}
        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-2.5 text-xs">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
            Transparent 70/30 Fee Allocation
          </div>
          <div className="flex justify-between items-center text-zinc-300">
            <span>Curator Host Allocation (70%):</span>
            <span className="text-emerald-400 font-bold">${hostCut.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between items-center text-zinc-300">
            <span>Scofen Platform Pool (30%):</span>
            <span className="text-cyan-400 font-bold">${platformCut.toFixed(2)} USD</span>
          </div>
          <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-white font-bold text-sm">
            <span>Total Entry Fee:</span>
            <span className="text-emerald-400 text-base">${entryFee.toFixed(2)} USD</span>
          </div>
        </div>

        <button
          onClick={handleExecutePayment}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{loading ? 'Processing Transaction...' : `Confirm & Pay $${entryFee.toFixed(2)} Entry Fee`}</span>
        </button>
      </div>
    </div>
  );
};
