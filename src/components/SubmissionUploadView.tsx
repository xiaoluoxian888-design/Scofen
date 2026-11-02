import React, { useState } from 'react';
import { Board, Submission, User } from '../types/schema';
import { apiClient } from '../services/apiClient';
import { 
  Upload, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Play, 
  Disc, 
  Music, 
  Sparkles, 
  ShieldCheck,
  Radio
} from 'lucide-react';

interface SubmissionUploadViewProps {
  boards: Board[];
  currentUser: User;
  onTrackCreated: () => void;
  onPlayTrack: (submission: Submission) => void;
  onCheckoutPending: (submission: Submission) => void;
  mySubmissions: Submission[];
}

export const SubmissionUploadView: React.FC<SubmissionUploadViewProps> = ({
  boards,
  currentUser,
  onTrackCreated,
  onPlayTrack,
  onCheckoutPending,
  mySubmissions,
}) => {
  const [selectedBoardId, setSelectedBoardId] = useState<string>(boards[0]?.id || '');
  const [trackTitle, setTrackTitle] = useState('Velocity Shiver (Hyper-Drill Mix)');
  const [selectedPreset, setSelectedPreset] = useState<string>('cyber_bass');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedBoard = boards.find((b) => b.id === selectedBoardId) || boards[0];

  const presets = [
    { id: 'cyber_bass', name: 'Cyber Sub-Bass 128 BPM', genre: 'Industrial / Club', desc: 'Punchy transient side-chain compression' },
    { id: 'analog_soul', name: 'Analog Rhodes Soul 92 BPM', genre: 'Neo-Soul / Lo-Fi', desc: 'Warm acoustic dynamic chords' },
    { id: 'hyper_drill', name: 'Hyper Drill 808 Glide 142 BPM', genre: 'Drill / Trap', desc: 'Rapid hats and subterranean slides' },
    { id: 'modular_hook', name: 'Modular Arpeggiator Lead', genre: 'Synthwave', desc: 'Melodic commercial hook stickiness' },
    { id: 'ambient_void', name: 'Quantum Spatial Void', genre: 'Cinematic / Sync', desc: 'Sync cinematic drone textures' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle.trim() || !selectedBoard) return;

    setLoading(true);
    try {
      const sub = await apiClient.createSubmission(selectedBoard.id, currentUser.id, trackTitle, selectedPreset);
      setStatusMessage(
        sub.payment_status === 'confirmed'
          ? `Track "${trackTitle}" submitted successfully!`
          : `Track "${trackTitle}" entered! Complete checkout to confirm entry fee ($${selectedBoard.entry_fee.toFixed(2)}).`
      );
      onTrackCreated();
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              Artist Studio Drop
            </span>
            <span className="text-xs text-zinc-400">Direct-to-Curator Audition</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Release Your Music
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Drop your audio tracks directly to active curator boards. Submissions undergo rigorous scoring
            across vocal, production, hook, and arrangement dimensions, surfacing the top 1% to global charts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Upload Studio Form */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Track Details & Audio Preset</span>
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium">
                Release Studio
              </span>
            </div>

            {statusMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center space-x-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Select Curator Board</label>
              <select
                value={selectedBoardId}
                onChange={(e) => setSelectedBoardId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} (${b.entry_fee.toFixed(2)} Entry Fee)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Song / Track Title</label>
              <input
                type="text"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">Synthesized Audio Preset</label>
              <div className="space-y-2">
                {presets.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPreset(p.id)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                      selectedPreset === p.id
                        ? 'bg-cyan-950/20 border-cyan-500/50 text-white shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-200">{p.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-cyan-400">
                        {p.genre}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-1">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Entry Fee Breakdown */}
            {selectedBoard && (
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-xs space-y-1.5">
                <div className="flex justify-between text-zinc-200 font-semibold">
                  <span>Entry Fee:</span>
                  <span className="text-emerald-400 font-bold">${selectedBoard.entry_fee.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-zinc-500 text-[11px]">
                  <span>70% to Curator Host:</span>
                  <span>${(selectedBoard.entry_fee * 0.7).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 text-[11px]">
                  <span>30% to Scofen Platform:</span>
                  <span>${(selectedBoard.entry_fee * 0.3).toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)]"
            >
              <Upload className="w-4 h-4" />
              <span>{loading ? 'Submitting Track...' : 'Submit Track to Curator'}</span>
            </button>
          </form>
        </div>

        {/* Right: Submissions Portfolio & Checkout Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Disc className="w-4 h-4 text-cyan-400" />
              <span>Your Track Submissions ({mySubmissions.length})</span>
            </h2>
            <span className="text-xs text-zinc-400">Release Portfolio</span>
          </div>

          <div className="space-y-3">
            {mySubmissions.length === 0 ? (
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-10 text-center text-xs text-zinc-500">
                You haven't submitted any tracks yet. Choose a curator board above to release your music.
              </div>
            ) : (
              mySubmissions.map((sub) => {
                const isConfirmed = sub.payment_status === 'confirmed';
                return (
                  <div
                    key={sub.id}
                    className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 space-y-3 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3.5">
                        <button
                          onClick={() => onPlayTrack(sub)}
                          className="w-11 h-11 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 flex items-center justify-center text-zinc-400 hover:text-cyan-400 shrink-0 shadow-sm"
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </button>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-white">{sub.track_title}</span>
                            {isConfirmed ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/40 flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>CONFIRMED</span>
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/40 flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>PENDING ENTRY FEE</span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400 mt-1">
                            Curator Board: <strong className="text-zinc-200">{sub.board?.title || 'Active Board'}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Curator Score</div>
                        <div className="text-base font-bold text-emerald-400">
                          {sub.final_score.toFixed(1)} / 100
                        </div>
                      </div>
                    </div>

                    {/* Pending payment callout */}
                    {!isConfirmed ? (
                      <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-amber-200">
                          Ready for review. Confirm the entry fee to unlock curator judging.
                        </div>
                        <button
                          onClick={() => onCheckoutPending(sub)}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center justify-center space-x-1 shrink-0 shadow-md"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Pay Entry Fee (${(sub.board?.entry_fee || 0).toFixed(2)})</span>
                        </button>
                      </div>
                    ) : (
                      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>70/30 Fee Distribution Settled</span>
                        </span>
                        <span className="text-zinc-300 text-[11px]">Ready for Discovery Charts</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
