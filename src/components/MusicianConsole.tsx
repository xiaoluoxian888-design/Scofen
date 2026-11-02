import React, { useState } from 'react';
import { Contest, TrackSubmission, UserAccountState } from '../types/scofen';
import { audioEngine } from '../services/audioEngine';
import { Disc3, Upload, Play, CheckCircle2, TrendingUp, DollarSign, Radio, Sparkles } from 'lucide-react';

interface MusicianConsoleProps {
  contests: Contest[];
  tracks: TrackSubmission[];
  userState: UserAccountState;
  onTrackSubmit: (newTrack: TrackSubmission, contest: Contest) => void;
  onSelectTrackForPlay: (track: TrackSubmission) => void;
  currentTrackId?: string;
  isPlaying?: boolean;
}

export const MusicianConsole: React.FC<MusicianConsoleProps> = ({
  contests,
  tracks,
  userState,
  onTrackSubmit,
  onSelectTrackForPlay,
  currentTrackId,
  isPlaying,
}) => {
  const [trackTitle, setTrackTitle] = useState('Sub-Zero Resonance');
  const [artistName, setArtistName] = useState(userState.name);
  const [selectedContestId, setSelectedContestId] = useState<string>(contests[0]?.id || '');
  const [selectedPreset, setSelectedPreset] = useState<TrackSubmission['audioPreset']>('cyber_bass');
  const [previewingPreset, setPreviewingPreset] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedContest = contests.find((c) => c.id === selectedContestId) || contests[0];

  const handlePreviewPreset = (preset: TrackSubmission['audioPreset']) => {
    if (previewingPreset === preset) {
      audioEngine.stop();
      setPreviewingPreset(null);
    } else {
      audioEngine.play(preset);
      setPreviewingPreset(preset);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle.trim() || !selectedContest) return;

    if (previewingPreset) {
      audioEngine.stop();
      setPreviewingPreset(null);
    }

    const newTrack: TrackSubmission = {
      id: `trk-${Date.now().toString(36)}`,
      contestId: selectedContest.id,
      contestTitle: selectedContest.title,
      title: trackTitle,
      artistId: userState.id,
      artistName: artistName || 'Anonymous Independent Asset',
      audioPreset: selectedPreset,
      durationSeconds: 192,
      entryFeePaid: selectedContest.entryFee,
      submittedAt: new Date().toISOString(),
      compositeScore: 0, // Unrated initially, awaiting evaluation
      criteriaAverage: { vp: 0, pq: 0, ph: 0, sa: 0 },
      evaluations: [],
      streamCount: 0,
      totalResidualEarned: 0,
      isBillboardQualified: false,
    };

    onTrackSubmit(newTrack, selectedContest);
    setStatusMessage(`Tracking Asset "${trackTitle}" submitted. Upfront friction ($${selectedContest.entryFee}) settled (70% Host / 30% Platform).`);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const presets: { id: TrackSubmission['audioPreset']; name: string; genre: string }[] = [
    { id: 'cyber_bass', name: 'Cyber Sub-Bass 128 BPM', genre: 'Industrial / Club' },
    { id: 'analog_soul', name: 'Analog Fender Rhodes 92 BPM', genre: 'Neo-Soul / Lo-Fi' },
    { id: 'hyper_drill', name: 'Hyper Drill 808 Glide 142 BPM', genre: 'Drill / Trap' },
    { id: 'ambient_void', name: 'Quantum Drone & Spatial Void', genre: 'Cinematic / Sync' },
    { id: 'modular_hook', name: 'Modular Arpeggiator Lead', genre: 'Synthwave' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Overview Banner */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Pillar 1 & 4 • Musician Ingestion & Residual Stream
              </span>
              <span className="text-xs font-mono text-zinc-500">Financial Friction Filter</span>
            </div>
            <h1 className="text-xl font-mono font-bold text-zinc-100 mt-1">
              Tracking Asset Submission & Royalty Earnings
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
              Independent musicians submit audio assets through host friction gates. Once verified into the top 1% Billboard
              tier, assets stream dynamically to paid subscribers, generating 70% residual royalties to the artist.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-zinc-950 p-3 rounded border border-zinc-800/80">
            <div className="text-right">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Musician Residual Wallet</div>
              <div className="text-lg font-mono font-bold text-cyan-400">
                ${userState.wallets.musicianBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Submission Terminal */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleSubmit} className="bg-zinc-900/60 border border-zinc-800 rounded p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h2 className="text-sm font-mono font-semibold text-zinc-200 flex items-center space-x-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Asset Ingestion Terminal</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                Friction Gate
              </span>
            </div>

            {statusMessage && (
              <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 p-3 rounded">
                {statusMessage}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Track / Asset Title</label>
              <input
                type="text"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Artist / Producer Alias</label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Target Contest Selection */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Target Contest Session</label>
              <select
                value={selectedContestId}
                onChange={(e) => setSelectedContestId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
              >
                {contests.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} (${c.entryFee}.00 Fee • {c.genre})
                  </option>
                ))}
              </select>
            </div>

            {/* Audio Stem Preset Selection */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-zinc-400">
                Synthesized Stem Preset (Audio Engine)
              </label>
              <div className="space-y-1.5">
                {presets.map((p) => {
                  const isSelected = selectedPreset === p.id;
                  const isAudioRunning = previewingPreset === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPreset(p.id)}
                      className={`p-2 rounded text-xs border flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-950/20 border-cyan-500/50 text-zinc-100'
                          : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="font-mono font-medium text-xs">{p.name}</div>
                        <div className="text-[10px] text-zinc-500">{p.genre}</div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewPreset(p.id);
                        }}
                        className={`p-1.5 rounded border text-[10px] font-mono flex items-center space-x-1 ${
                          isAudioRunning
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        <Play className="w-3 h-3" />
                        <span>{isAudioRunning ? 'Stop' : 'Audition'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Friction settlement prompt */}
            {selectedContest && (
              <div className="bg-zinc-950 p-3 rounded border border-zinc-800 text-[11px] font-mono space-y-1 text-zinc-400">
                <div className="flex justify-between text-zinc-200">
                  <span>Upfront Entry Friction:</span>
                  <span className="text-cyan-400 font-bold">${selectedContest.entryFee}.00 USD</span>
                </div>
                <div className="flex justify-between text-zinc-500 text-[10px]">
                  <span>Automatic Host Settlement (70%):</span>
                  <span>${(selectedContest.entryFee * 0.7).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 text-[10px]">
                  <span>Scofen Platform Ledger (30%):</span>
                  <span>${(selectedContest.entryFee * 0.3).toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              <span>Commit Entry Fee & Ingest Asset</span>
              <DollarSign className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Musician Tracks Portfolio & Royalty Stream */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h2 className="text-sm font-mono font-semibold text-zinc-200 flex items-center space-x-2">
              <Disc3 className="w-4 h-4 text-cyan-400" />
              <span>Ingested Tracking Assets ({tracks.length})</span>
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">Live Residual Royalty Tracking</span>
          </div>

          <div className="space-y-3">
            {tracks.map((t, idx) => {
              const isCurrentPlaying = currentTrackId === t.id && isPlaying;
              return (
                <div
                  key={t.id}
                  className="bg-zinc-900/60 border border-zinc-800 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => onSelectTrackForPlay(t)}
                      className={`w-10 h-10 rounded flex items-center justify-center shrink-0 border transition-all ${
                        isCurrentPlaying
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-zinc-100">{t.title}</span>
                        {t.isBillboardQualified ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                            <Radio className="w-2.5 h-2.5" />
                            <span>BILLBOARD TOP 1%</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                            EVALUATION
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        {t.artistName} • Contest: <span className="text-zinc-300">{t.contestTitle}</span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-1 flex items-center space-x-3">
                        <span>Friction Paid: ${t.entryFeePaid.toFixed(2)}</span>
                        <span>•</span>
                        <span>Evaluations: {t.evaluations.length}</span>
                        <span>•</span>
                        <span>Streams: {t.streamCount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800">
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Composite Score</div>
                      <div className={`text-base font-mono font-bold ${t.compositeScore >= 88 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {t.compositeScore > 0 ? `${t.compositeScore.toFixed(1)} / 100` : 'Pending'}
                      </div>
                    </div>
                    <div className="text-right sm:mt-1">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">70% Residuals Accrued</div>
                      <div className="text-xs font-mono font-semibold text-cyan-400">
                        ${t.totalResidualEarned.toFixed(2)} USD
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
