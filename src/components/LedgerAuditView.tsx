import React from 'react';
import { LedgerEntry } from '../types/schema';
import { Receipt, DollarSign, TrendingUp, ShieldCheck, ArrowUpRight, Music2 } from 'lucide-react';

interface LedgerAuditViewProps {
  entries: LedgerEntry[];
  onOpenIntegrations?: () => void;
}

export const LedgerAuditView: React.FC<LedgerAuditViewProps> = ({ entries, onOpenIntegrations }) => {
  const totalGross = entries.reduce((acc, e) => acc + e.entry_fee, 0);
  const totalHostCut = entries.reduce((acc, e) => acc + e.host_cut, 0);
  const totalPlatformCut = entries.reduce((acc, e) => acc + e.platform_cut, 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Transparent Revenue Split
              </span>
              <span className="text-xs text-zinc-400">70% Curator Payout / 30% Platform Pool</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Music Royalties & Payout Ledger
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Every audition entry fee automatically executes an immutable 70/30 distribution.
              70% goes straight to the Board Curator, and 30% funds discovery infrastructure.
            </p>
          </div>

          {onOpenIntegrations && (
            <button
              onClick={onOpenIntegrations}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/80 text-xs font-semibold text-white transition-all hover:border-emerald-500/50 cursor-pointer self-start md:self-center"
            >
              <span>Stripe & Resend Centre</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 space-y-2 shadow-sm">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Gross Entry Volume</div>
          <div className="text-3xl font-extrabold text-white">
            ${totalGross.toFixed(2)} <span className="text-xs font-normal text-zinc-500">USD</span>
          </div>
          <div className="text-xs text-zinc-500">Total audition fees processed</div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 space-y-2 shadow-sm">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Curator Payouts (70%)</div>
          <div className="text-3xl font-extrabold text-emerald-400">
            ${totalHostCut.toFixed(2)} <span className="text-xs font-normal text-emerald-500/60">USD</span>
          </div>
          <div className="text-xs text-zinc-500">Disbursed directly to room curators</div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 space-y-2 shadow-sm">
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Platform Treasury (30%)</div>
          <div className="text-3xl font-extrabold text-cyan-400">
            ${totalPlatformCut.toFixed(2)} <span className="text-xs font-normal text-cyan-500/60">USD</span>
          </div>
          <div className="text-xs text-zinc-500">Powers low-latency audio network</div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>Audited Settlement Transactions ({entries.length})</span>
          </h2>
          <span className="text-xs text-zinc-500">Live Double-Entry Ledgers</span>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 text-[11px] font-semibold uppercase">
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Entry Fee</th>
                <th className="py-3 px-4">Curator Cut (70%)</th>
                <th className="py-3 px-4">Platform (30%)</th>
                <th className="py-3 px-4">Submission Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-zinc-850/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-zinc-200 whitespace-nowrap">
                    {entry.id.substring(0, 14)}...
                  </td>
                  <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    ${entry.entry_fee.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-emerald-400 whitespace-nowrap font-bold">
                    +${entry.host_cut.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-cyan-400 whitespace-nowrap font-bold">
                    +${entry.platform_cut.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-500 text-[11px] whitespace-nowrap">
                    {entry.submission_id.substring(0, 16)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
