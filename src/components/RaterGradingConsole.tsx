import React, { useState } from 'react';
import { Contest, CriteriaVector, TrackEvaluation, TrackSubmission, UserAccountState } from '../types/scofen';
import { calculateCriteriaScore, computeAsymmetricCompositeScore } from '../services/mathEngine';
import { Award, ShieldAlert, CheckCircle2, Play, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

interface RaterGradingConsoleProps {
  tracks: TrackSubmission[];
  contests: Contest[];
  userState: UserAccountState;
  onAddEvaluation: (trackId: string, evaluation: TrackEvaluation) => void;
  onSimulateBotAttack: (trackId: string, botCount: number) => void;
  onSelectTrackForPlay: (track: TrackSubmission) => void;
  currentTrackId?: string;
  isPlaying?: boolean;
}

export const RaterGradingConsole: React.FC<RaterGradingConsoleProps> = ({
  tracks,
  contests,
  userState,
  onAddEvaluation,
  onSimulateBotAttack,
  onSelectTrackForPlay,
  currentTrackId,
  isPlaying,
}) => {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(tracks[0]?.id || '');
  const [evaluatorRole, setEvaluatorRole] = useState<'gatekeeper' | 'certified_rater' | 'public_sandbox'>('gatekeeper');
  const [scores, setScores] = useState<CriteriaVector>({ vp: 92, pq: 95, ph: 94, sa: 90 });
  const [feedback, setFeedback] = useState('Pristine high-end clarity; sub-frequencies properly mono-summed.');
  const [evalNotice, setEvalNotice] = useState<string | null>(null);

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId) || tracks[0];
  const contest = contests.find((c) => c.id === selectedTrack?.contestId) || contests[0];

  // Weight mapping for chosen role
  const getWeightForRole = (role: 'gatekeeper' | 'certified_rater' | 'public_sandbox'): number => {
    switch (role) {
      case 'gatekeeper':
        return 100.0;
      case 'certified_rater':
        return userState.credibilityIndex > 1 ? userState.credibilityIndex : 15.0;
      case 'public_sandbox':
        return 1.0;
    }
  };

  const currentWeight = getWeightForRole(evaluatorRole);

  // Preview score calculation against contest baseline
  const baseline = contest ? contest.baselineWeights : { vp: 0.25, pq: 0.25, ph: 0.25, sa: 0.25 };
  const rawSingleScore = calculateCriteriaScore(scores, baseline);

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrack) return;

    const newEval: TrackEvaluation = {
      id: `ev-${Date.now().toString(36)}`,
      trackId: selectedTrack.id,
      evaluatorId: userState.id,
      evaluatorName: evaluatorRole === 'gatekeeper' ? `${userState.name} (Gatekeeper)` : evaluatorRole === 'certified_rater' ? 'Certified Rater Index #14' : 'Sandbox Public User',
      role: evaluatorRole,
      weight: currentWeight,
      scores,
      compositeScore: rawSingleScore,
      timestamp: new Date().toISOString(),
      feedback: feedback.trim() || undefined,
    };

    onAddEvaluation(selectedTrack.id, newEval);
    setEvalNotice(`Evaluation submitted with authority weight ${currentWeight.toFixed(1)}x.`);
    setTimeout(() => setEvalNotice(null), 4000);
  };

  // Bot attack calculation stats for selected track
  const botEvals = selectedTrack?.evaluations.filter((e) => e.role === 'public_sandbox') || [];
  const gatekeeperEvals = selectedTrack?.evaluations.filter((e) => e.role === 'gatekeeper') || [];
  const certifiedEvals = selectedTrack?.evaluations.filter((e) => e.role === 'certified_rater') || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Pillar 3 • Dynamic Scoring & Asymmetric Weight Protocol
              </span>
              <span className="text-xs font-mono text-zinc-500">Track Score = Σ(Score_i × Weight_i) / Σ(Weight_i)</span>
            </div>
            <h1 className="text-xl font-mono font-bold text-zinc-100 mt-1">
              Multi-Criteria Grading Console & Sybil Resistance
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
              Gatekeepers command a 100.0x weight. Unverified public noise is throttled to 1.0x, ensuring bot raids
              and spam campaigns cannot distort the integrity of the top 1% commercial queue.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-zinc-950 p-3 rounded border border-zinc-800/80">
            <div className="text-right">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Credibility Weight Index</div>
              <div className="text-lg font-mono font-bold text-amber-400">
                {currentWeight.toFixed(1)}x
              </div>
            </div>
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Multi-Criteria Grading Terminal */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleSubmitEvaluation} className="bg-zinc-900/60 border border-zinc-800 rounded p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h2 className="text-sm font-mono font-semibold text-zinc-200 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Precision Multi-Criteria Grading Terminal</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                Pillar 3 Engine
              </span>
            </div>

            {evalNotice && (
              <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded">
                {evalNotice}
              </div>
            )}

            {/* Target Track & Audition */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Select Track for Evaluation</label>
              <div className="flex gap-2">
                <select
                  value={selectedTrackId}
                  onChange={(e) => setSelectedTrackId(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} — {t.artistName} (Score: {t.compositeScore.toFixed(1)})
                    </option>
                  ))}
                </select>
                {selectedTrack && (
                  <button
                    type="button"
                    onClick={() => onSelectTrackForPlay(selectedTrack)}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700 text-xs font-mono flex items-center space-x-1"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Audition</span>
                  </button>
                )}
              </div>
            </div>

            {/* Authority Weight Tier Selection */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-2">Evaluator Authority Authority</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEvaluatorRole('gatekeeper')}
                  className={`p-2.5 rounded border text-left transition-all ${
                    evaluatorRole === 'gatekeeper'
                      ? 'bg-amber-950/20 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-mono font-bold flex items-center justify-between">
                    <span>Gatekeeper</span>
                    <span className="text-amber-400">100.0x</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">Host/Verified authority</div>
                </button>

                <button
                  type="button"
                  onClick={() => setEvaluatorRole('certified_rater')}
                  className={`p-2.5 rounded border text-left transition-all ${
                    evaluatorRole === 'certified_rater'
                      ? 'bg-amber-950/20 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-mono font-bold flex items-center justify-between">
                    <span>Certified Rater</span>
                    <span className="text-cyan-400">15.0x</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">Earned credibility index</div>
                </button>

                <button
                  type="button"
                  onClick={() => setEvaluatorRole('public_sandbox')}
                  className={`p-2.5 rounded border text-left transition-all ${
                    evaluatorRole === 'public_sandbox'
                      ? 'bg-amber-950/20 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-mono font-bold flex items-center justify-between">
                    <span>Public / Sandbox</span>
                    <span className="text-zinc-500">1.0x</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">Statistical background noise</div>
                </button>
              </div>
            </div>

            {/* 4 Precision Sliders */}
            <div className="space-y-4 pt-2 border-t border-zinc-800/80">
              {/* Vocal Precision */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1">
                  <span className="text-zinc-300">Vocal Precision (VP)</span>
                  <span className="text-emerald-400 font-bold">{scores.vp} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.vp}
                  onChange={(e) => setScores({ ...scores, vp: parseInt(e.target.value, 10) })}
                  className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              {/* Production Quality */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1">
                  <span className="text-zinc-300">Production Quality (PQ)</span>
                  <span className="text-cyan-400 font-bold">{scores.pq} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.pq}
                  onChange={(e) => setScores({ ...scores, pq: parseInt(e.target.value, 10) })}
                  className="w-full accent-cyan-500 bg-zinc-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              {/* Performance/Hook */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1">
                  <span className="text-zinc-300">Performance / Hook (PH)</span>
                  <span className="text-amber-400 font-bold">{scores.ph} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.ph}
                  onChange={(e) => setScores({ ...scores, ph: parseInt(e.target.value, 10) })}
                  className="w-full accent-amber-500 bg-zinc-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              {/* Sonic Arrangement */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1">
                  <span className="text-zinc-300">Sonic Arrangement (SA)</span>
                  <span className="text-purple-400 font-bold">{scores.sa} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.sa}
                  onChange={(e) => setScores({ ...scores, sa: parseInt(e.target.value, 10) })}
                  className="w-full accent-purple-500 bg-zinc-800 h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Live calculation banner */}
            <div className="bg-zinc-950 p-3 rounded border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Single Evaluation Weighted Score</div>
                <div className="text-xs font-mono text-zinc-300">
                  Against Contest Baseline [{contest?.baselineWeights.vp.toFixed(2)}, {contest?.baselineWeights.pq.toFixed(2)}, {contest?.baselineWeights.ph.toFixed(2)}, {contest?.baselineWeights.sa.toFixed(2)}]
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-mono font-bold text-amber-400">{rawSingleScore.toFixed(1)}</span>
                <span className="text-xs font-mono text-zinc-500"> / 100</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Acoustic Feedback / Verification Notes</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              <span>Submit Evaluation (Weight: {currentWeight.toFixed(1)}x)</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right: Asymmetric Weight Breakdown & Bot Attack Simulator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Track Current Aggregated Status */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Asymmetric Weight Distribution</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">
                {selectedTrack?.evaluations.length} total votes
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500">Gatekeeper (100x)</div>
                <div className="text-sm font-bold text-amber-400">{gatekeeperEvals.length}</div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500">Certified (15x)</div>
                <div className="text-sm font-bold text-cyan-400">{certifiedEvals.length}</div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500">Sandbox (1x)</div>
                <div className="text-sm font-bold text-zinc-400">{botEvals.length}</div>
              </div>
            </div>

            <div className="bg-zinc-950 p-3 rounded border border-zinc-800 space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">Current Composite Track Score:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {selectedTrack?.compositeScore.toFixed(2)} / 100
                </span>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                <span>Top 1% Billboard Threshold:</span>
                <span className="text-zinc-300">&gt;= 88.00</span>
              </div>
            </div>
          </div>

          {/* Interactive Bot Attack / Sybil Resistance Simulator */}
          <div className="bg-zinc-900/60 border border-rose-900/40 rounded p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-900/40 pb-2">
              <h3 className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Bot Attack / Sybil Stress-Test Simulator</span>
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Pillar 3 Validation
              </span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Execute a simulated malicious sybil swarm attempting to tank the track with zero-star (10/100) votes.
              Watch how the mathematical Asymmetric Weight Protocol absorbs the spam without degrading the Gatekeeper baseline.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onSimulateBotAttack(selectedTrack.id, 10)}
                className="py-2 px-3 rounded bg-zinc-950 hover:bg-rose-950/30 border border-zinc-800 hover:border-rose-700/50 text-xs font-mono text-zinc-200 transition-colors"
              >
                +10 Spam Bots
              </button>
              <button
                type="button"
                onClick={() => onSimulateBotAttack(selectedTrack.id, 50)}
                className="py-2 px-3 rounded bg-zinc-950 hover:bg-rose-950/30 border border-zinc-800 hover:border-rose-700/50 text-xs font-mono text-zinc-200 transition-colors"
              >
                +50 Spam Bots
              </button>
              <button
                type="button"
                onClick={() => onSimulateBotAttack(selectedTrack.id, 100)}
                className="py-2 px-3 rounded bg-zinc-950 hover:bg-rose-950/30 border border-zinc-800 hover:border-rose-700/50 text-xs font-mono text-zinc-200 transition-colors"
              >
                +100 Spam Bots
              </button>
            </div>

            {botEvals.length > 0 && (
              <div className="bg-zinc-950 p-3 rounded border border-zinc-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Simulated Spam Vectors Ingested:</span>
                  <span className="text-rose-400 font-bold">{botEvals.length} votes @ 1.0x</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Gatekeeper Defense Weight:</span>
                  <span className="text-amber-400 font-bold">100.0x per Host</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Noise Absorption Efficiency:</span>
                  <span className="text-emerald-400 font-bold">
                    {computeAsymmetricCompositeScore(selectedTrack.evaluations, baseline).noiseAbsorbedPercent}% absorbed
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
