import React, { useState } from 'react';
import { TrackSubmission, UserAccountState } from '../types/scofen';
import { Radio, Play, Pause, Disc, Lock, ShieldCheck, Flame, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

interface BillboardStreamProps {
  tracks: TrackSubmission[];
  userState: UserAccountState;
  onSubscribeToggle: () => void;
  onSelectTrackForPlay: (track: TrackSubmission) => void;
  onSimulateStreamPlay: (track: TrackSubmission) => void;
  currentTrack: TrackSubmission | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const BillboardStream: React.FC<BillboardStreamProps> = ({
  tracks,
  userState,
  onSubscribeToggle,
  onSelectTrackForPlay,
  onSimulateStreamPlay,
  currentTrack,
  isPlaying,
  onTogglePlay,
}) => {
  // Filter top 1% commercial viability assets (composite score >= 88.0)
  const billboardQueue = tracks
    .filter((t) => t.isBillboardQualified || t.compositeScore >= 88.0)
    .sort((a, b) => b.compositeScore - a.compositeScore);

  const [streamSimSuccess, setStreamSimSuccess] = useState<string | null>(null);

  const handleSimulateStream = (track: TrackSubmission) => {
    onSimulateStreamPlay(track);
    setStreamSimSuccess(`Simulated 500 Broadcast Plays for "${track.title}". Residuals split: 70% Musician / 20% Host-Rater / 10% Platform.`);
    setTimeout(() => setStreamSimSuccess(null), 4000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Pillar 4 • Demand Side Monetization & Residuals
              </span>
              <span className="text-xs font-mono text-zinc-500">$5.99/mo Premium Billboard Feed</span>
            </div>
            <h1 className="text-xl font-mono font-bold text-zinc-100 mt-1">
              Top 1% Commercial Billboard Audio Broadcast
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
              Demand-side subscribers unlock an unfiltered, real-time dynamic audio queue fed exclusively by the top-tier
              of verified leaderboard tracking assets. Playbacks accumulate 70/20/10 residual royalties.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-zinc-950 p-3 rounded border border-zinc-800/80">
            <div className="text-right">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Subscription Status</div>
              <div className={`text-base font-mono font-bold ${userState.isSubscriber ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {userState.isSubscriber ? 'ACTIVE ($5.99/mo)' : 'INACTIVE'}
              </div>
            </div>
            <button
              onClick={onSubscribeToggle}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold border transition-all ${
                userState.isSubscriber
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
              }`}
            >
              {userState.isSubscriber ? 'Manage / Unsub' : 'Subscribe $5.99'}
            </button>
          </div>
        </div>
      </div>

      {streamSimSuccess && (
        <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 p-3 rounded">
          {streamSimSuccess}
        </div>
      )}

      {/* Main Broadcast Queue & Live Metrology */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Billboard Live Queue */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h2 className="text-sm font-mono font-semibold text-zinc-200 flex items-center space-x-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>Live Top 1% Dynamic Stream Queue ({billboardQueue.length} Assets Qualified)</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Score &gt;= 88.00
            </span>
          </div>

          {!userState.isSubscriber ? (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded p-8 text-center space-y-5">
              <div className="h-[100px] max-w-md mx-auto rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 p-2.5 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <img
                  src="/assets/aistudio/image_e3f3963a_63143619.jpg"
                  alt="Scofen Billboard Broadcast"
                  className="h-full w-auto object-contain rounded"
                />
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">Premium Billboard Broadcast Gated</h3>
                <p className="text-xs text-zinc-400 mt-1.5 max-w-md mx-auto">
                  Subscribe to the $5.99/month Billboard feed to stream real-time top-tier curated assets and trigger
                  musician residual distributions.
                </p>
              </div>
              <button
                onClick={onSubscribeToggle}
                className="px-5 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all inline-flex items-center space-x-2"
              >
                <span>Unlock Billboard Access ($5.99/mo)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {billboardQueue.map((track, index) => {
                const isSelected = currentTrack?.id === track.id;
                const isTrackPlaying = isSelected && isPlaying;
                return (
                  <div
                    key={track.id}
                    className={`bg-zinc-900/60 border rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'border-emerald-500/50 bg-emerald-950/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="font-mono text-xs font-bold text-zinc-500 w-5 text-center pt-2">
                        #{index + 1}
                      </div>

                      <button
                        onClick={() => {
                          if (isSelected) {
                            onTogglePlay();
                          } else {
                            onSelectTrackForPlay(track);
                          }
                        }}
                        className={`w-10 h-10 rounded flex items-center justify-center shrink-0 border transition-all ${
                          isTrackPlaying
                            ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                            : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {isTrackPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-zinc-100">{track.title}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            SCORE {track.compositeScore.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                          {track.artistName} • Preset: <span className="text-zinc-300">{track.audioPreset}</span>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-1 flex items-center space-x-3">
                          <span>Plays: {track.streamCount.toLocaleString()}</span>
                          <span>•</span>
                          <span>Residuals: ${track.totalResidualEarned.toFixed(2)} USD</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                      <button
                        onClick={() => handleSimulateStream(track)}
                        title="Simulate 500 listener plays to trigger 70/20/10 residual distribution"
                        className="px-2.5 py-1.5 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[10px] font-mono flex items-center space-x-1 transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Simulate Stream Plays</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Residual Royalty Loop Metrology */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-4">
            <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center space-x-1.5 border-b border-zinc-800 pb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Residual Royalty Economic Loop</span>
            </h3>

            <p className="text-[11px] text-zinc-400">
              Each qualified stream on the Billboard broadcast automatically disburses accrued royalties through an immutable mathematical split.
            </p>

            <div className="space-y-3">
              <div className="bg-zinc-950 p-3 rounded border border-zinc-800 space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">Musician Direct Cut</span>
                  <span className="text-cyan-400 font-bold">70%</span>
                </div>
                <div className="text-[10px] text-zinc-500">
                  Surfaces independent creators directly into commercial viability without label debt.
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded border border-zinc-800 space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">Host / Rater Pool</span>
                  <span className="text-amber-400 font-bold">20%</span>
                </div>
                <div className="text-[10px] text-zinc-500">
                  Rewards gatekeepers and certified evaluators whose filtration surfaced the asset.
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded border border-zinc-800 space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">Scofen Platform Ledger</span>
                  <span className="text-emerald-400 font-bold">10%</span>
                </div>
                <div className="text-[10px] text-zinc-500">
                  Perpetual protocol reserve funding low-latency streaming infrastructure.
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 p-3 rounded border border-zinc-800/80 text-[10px] font-mono text-zinc-500">
              Demand Sub Margin: <strong className="text-zinc-200">100% Platform ($5.99/mo)</strong>
              <br />
              Streaming Royalty Base: <strong className="text-zinc-200">$0.05 / play</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
