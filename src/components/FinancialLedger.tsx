import React, { useState } from 'react';
import { LedgerTransaction, UserAccountState } from '../types/scofen';
import { Receipt, DollarSign, TrendingUp, ShieldCheck, ArrowDownRight, Filter } from 'lucide-react';

interface FinancialLedgerProps {
  transactions: LedgerTransaction[];
  userState: UserAccountState;
}

export const FinancialLedger: React.FC<FinancialLedgerProps> = ({
  transactions,
  userState,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  // Calculate ledger gross aggregate totals
  const totalGross = transactions.reduce((acc, t) => acc + t.grossAmount, 0);
  const totalPlatformCut = transactions.reduce((acc, t) => acc + t.platformCut, 0);
  const totalHostCut = transactions.reduce((acc, t) => acc + t.hostCut, 0);
  const totalMusicianCut = transactions.reduce((acc, t) => acc + t.musicianCut, 0);
  const totalRaterCut = transactions.reduce((acc, t) => acc + t.raterCut, 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Pillar 1 & 4 • Financial Ledger
              </span>
              <span className="text-xs font-mono text-zinc-500">Dual-Stream Ledger Settlement</span>
            </div>
            <h1 className="text-xl font-mono font-bold text-zinc-100 mt-1">
              Decentralized Financial Friction & Residual Ledger
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
              Automatic database-level accounting enforcing the 70/30 upfront entry fee split, 100% demand-side subscription
              margins, and the 70/20/10 long-term streaming residual loop.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-zinc-950 p-3 rounded border border-zinc-800/80">
            <div className="text-right">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Gross Platform Handled</div>
              <div className="text-lg font-mono font-bold text-emerald-400">
                ${totalGross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Balance Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scofen Platform Treasury */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-500">Scofen Treasury Ledger</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              30% Entry + 10% Stream
            </span>
          </div>
          <div className="text-xl font-mono font-bold text-emerald-400">
            ${userState.wallets.scofenTreasuryBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            Cumulative Cut: ${totalPlatformCut.toFixed(2)}
          </div>
        </div>

        {/* Host Accounts Settlement */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-500">Host Settlement Pool</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
              70% Upfront Entry
            </span>
          </div>
          <div className="text-xl font-mono font-bold text-amber-400">
            ${userState.wallets.hostBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            Cumulative Host Cut: ${totalHostCut.toFixed(2)}
          </div>
        </div>

        {/* Musician Direct Royalties */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-500">Musician Direct Residuals</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
              70% Streaming Residual
            </span>
          </div>
          <div className="text-xl font-mono font-bold text-cyan-400">
            ${userState.wallets.musicianBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            Cumulative Artist Cut: ${totalMusicianCut.toFixed(2)}
          </div>
        </div>

        {/* Certified Raters Dividend */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-500">Rater Credibility Dividends</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
              Index-Weighted Payout
            </span>
          </div>
          <div className="text-xl font-mono font-bold text-purple-400">
            ${userState.wallets.raterBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            Cumulative Dividend: ${totalRaterCut.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-2">
          <h2 className="text-sm font-mono font-semibold text-zinc-200 flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>Immutable Ledger Transactions ({filteredTransactions.length})</span>
          </h2>

          {/* Filter pills */}
          <div className="flex items-center space-x-1.5 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            {(['ALL', 'ENTRY_FEE_SPLIT', 'STREAMING_RESIDUAL', 'SUBSCRIPTION_MARGIN'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-1 rounded text-[10px] transition-colors border ${
                  filterType === type
                    ? 'bg-zinc-800 text-emerald-400 border-emerald-500/40'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {type.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Protocol Event</th>
                <th className="py-2.5 px-3">Gross</th>
                <th className="py-2.5 px-3">Host Cut (70%)</th>
                <th className="py-2.5 px-3">Platform Cut</th>
                <th className="py-2.5 px-3">Musician Cut</th>
                <th className="py-2.5 px-3">Rater Cut</th>
                <th className="py-2.5 px-3">Ledger Memo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-2 px-3 text-zinc-500 whitespace-nowrap text-[11px]">
                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] uppercase border ${
                        tx.type === 'ENTRY_FEE_SPLIT'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : tx.type === 'STREAMING_RESIDUAL'
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-semibold text-zinc-100 whitespace-nowrap">
                    ${tx.grossAmount.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-amber-400 whitespace-nowrap">
                    {tx.hostCut > 0 ? `+$${tx.hostCut.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-2 px-3 text-emerald-400 whitespace-nowrap">
                    {tx.platformCut > 0 ? `+$${tx.platformCut.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-2 px-3 text-cyan-400 whitespace-nowrap">
                    {tx.musicianCut > 0 ? `+$${tx.musicianCut.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-2 px-3 text-purple-400 whitespace-nowrap">
                    {tx.raterCut > 0 ? `+$${tx.raterCut.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-2 px-3 text-zinc-400 text-[11px] max-w-xs truncate">
                    {tx.description}
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
