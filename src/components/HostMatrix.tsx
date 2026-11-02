import React, { useState } from 'react';
import { Contest, CriteriaVector, DiagnosticQuestion, UserAccountState } from '../types/scofen';
import { DIAGNOSTIC_QUESTIONS } from '../data/mockData';
import { normalizeVector } from '../services/mathEngine';
import { Sliders, ShieldCheck, CheckCircle2, ArrowRight, DollarSign, Activity, Sparkles } from 'lucide-react';

interface HostMatrixProps {
  contests: Contest[];
  userState: UserAccountState;
  onDeployContest: (newContest: Contest) => void;
}

export const HostMatrix: React.FC<HostMatrixProps> = ({
  contests,
  userState,
  onDeployContest,
}) => {
  // Questionnaire state: selected option index for each of the 3 questions
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([0, 1, 0]);

  // Host contest form state
  const [contestTitle, setContestTitle] = useState('Sub-Bass Apex Invitational: Cyber 808');
  const [genre, setGenre] = useState('Trap / Synthwave');
  const [entryFee, setEntryFee] = useState<number>(45);
  const [description, setDescription] = useState('Surfacing high-dynamic club tracking assets with zero-compromise low-end mono integrity.');
  const [deployedNotice, setDeployedNotice] = useState<string | null>(null);

  // Compute raw sum vector and then normalize
  const calculateCalibratedVector = (): CriteriaVector => {
    let raw = { vp: 0, pq: 0, ph: 0, sa: 0 };
    DIAGNOSTIC_QUESTIONS.forEach((q, qIndex) => {
      const optIndex = selectedAnswers[qIndex] ?? 0;
      const delta = q.options[optIndex].vectorDelta;
      raw.vp += delta.vp;
      raw.pq += delta.pq;
      raw.ph += delta.ph;
      raw.sa += delta.sa;
    });
    return normalizeVector(raw);
  };

  const calibratedVector = calculateCalibratedVector();

  // Financial breakdown calculation (70/30 Upfront Entry Fee Split)
  const hostCutPerEntry = Number((entryFee * 0.70).toFixed(2));
  const platformCutPerEntry = Number((entryFee * 0.30).toFixed(2));

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    const updated = [...selectedAnswers];
    updated[questionIndex] = optionIndex;
    setSelectedAnswers(updated);
  };

  const handleDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contestTitle.trim()) return;

    const newContest: Contest = {
      id: `cnt-${Date.now().toString(36)}`,
      title: contestTitle,
      hostId: userState.id,
      hostName: `${userState.name} (Gatekeeper)`,
      hostCredibilityWeight: 100.0,
      entryFee: Number(entryFee),
      totalSubmissions: 0,
      grossRevenue: 0,
      hostEarnings: 0,
      platformEarnings: 0,
      baselineWeights: calibratedVector,
      genre,
      status: 'active',
      createdAt: new Date().toISOString(),
      description,
    };

    onDeployContest(newContest);
    setDeployedNotice(`Contest "${contestTitle}" deployed with calibrated baseline vector.`);
    setTimeout(() => setDeployedNotice(null), 4000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Directive summary */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Pillar 1 & 2 • Host / Contest Matrix
              </span>
              <span className="text-xs font-mono text-zinc-500">Weight Authority: 100.0x</span>
            </div>
            <h1 className="text-xl font-mono font-bold text-zinc-100 mt-1">
              Host Filtration Calibration & Session Dispatch
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
              Host accounts calibrate their multi-criteria filtration vector via diagnostic bottleneck analysis,
              set economic entry friction, and automatically claim 70% of all upfront entry fees.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-zinc-950 p-3 rounded border border-zinc-800/80">
            <div className="text-right">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Host Settlement Balance</div>
              <div className="text-lg font-mono font-bold text-emerald-400">
                ${userState.wallets.hostBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 3-Question Diagnostic Questionnaire + Live Weight Vector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3-Question Diagnostic Questionnaire */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h2 className="text-sm font-mono font-semibold text-zinc-200 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>3-Question Diagnostic Calibration Questionnaire</span>
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">Translates operational bottlenecks</span>
          </div>

          <div className="space-y-4">
            {DIAGNOSTIC_QUESTIONS.map((q, qIndex) => (
              <div key={q.id} className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono font-bold text-zinc-200 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-300">
                      0{qIndex + 1}
                    </span>
                    <span>{q.question}</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400">{q.description}</p>

                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = selectedAnswers[qIndex] === optIndex;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handleOptionSelect(qIndex, optIndex)}
                        className={`w-full text-left p-2.5 rounded text-xs transition-all border flex items-start space-x-2.5 ${
                          isSelected
                            ? 'bg-emerald-950/20 border-emerald-500/50 text-zinc-100 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                            : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <div className="pt-0.5">
                          {isSelected ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-mono font-medium text-xs">{opt.label}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{opt.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Dynamic Normalized Baseline Vector & Contest Creator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Normalized Vector Display */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Baseline Weighting Vector (Sum = 100%)</span>
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Normalized
              </span>
            </div>

            <div className="space-y-3">
              {/* Vocal Precision (VP) */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-300">Vocal Precision (VP)</span>
                  <span className="text-emerald-400 font-bold">{(calibratedVector.vp * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded overflow-hidden border border-zinc-800">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${calibratedVector.vp * 100}%` }}
                  />
                </div>
              </div>

              {/* Production Quality (PQ) */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-300">Production Quality (PQ)</span>
                  <span className="text-cyan-400 font-bold">{(calibratedVector.pq * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded overflow-hidden border border-zinc-800">
                  <div
                    className="bg-cyan-500 h-full transition-all duration-300"
                    style={{ width: `${calibratedVector.pq * 100}%` }}
                  />
                </div>
              </div>

              {/* Performance/Hook (PH) */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-300">Performance / Hook (PH)</span>
                  <span className="text-amber-400 font-bold">{(calibratedVector.ph * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded overflow-hidden border border-zinc-800">
                  <div
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${calibratedVector.ph * 100}%` }}
                  />
                </div>
              </div>

              {/* Sonic Arrangement (SA) */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-300">Sonic Arrangement (SA)</span>
                  <span className="text-purple-400 font-bold">{(calibratedVector.sa * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded overflow-hidden border border-zinc-800">
                  <div
                    className="bg-purple-500 h-full transition-all duration-300"
                    style={{ width: `${calibratedVector.sa * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-zinc-500 bg-zinc-950 p-2.5 rounded border border-zinc-800">
              Vector: [{calibratedVector.vp.toFixed(2)}, {calibratedVector.pq.toFixed(2)}, {calibratedVector.ph.toFixed(2)}, {calibratedVector.sa.toFixed(2)}]
              <br />
              Sum: <span className="text-zinc-300">{(calibratedVector.vp + calibratedVector.pq + calibratedVector.ph + calibratedVector.sa).toFixed(2)} (100.0%)</span>
            </div>
          </div>

          {/* Contest Deployment Form */}
          <form onSubmit={handleDeploy} className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-4">
            <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center space-x-1.5 border-b border-zinc-800 pb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Deploy Contest Session</span>
            </h3>

            {deployedNotice && (
              <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded">
                {deployedNotice}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Contest Session Title</label>
              <input
                type="text"
                value={contestTitle}
                onChange={(e) => setContestTitle(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Genre / Acoustic Domain</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Entry Fee Slider & Financial Friction Split */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-mono text-zinc-400">Musician Upfront Entry Fee</label>
                <span className="text-xs font-mono font-bold text-emerald-400">${entryFee}.00 USD</span>
              </div>
              <input
                type="range"
                min="15"
                max="250"
                step="5"
                value={entryFee}
                onChange={(e) => setEntryFee(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded cursor-pointer"
              />

              {/* Instant 70/30 Split Projection */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-800/80">
                <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                  <div className="text-[10px] font-mono text-zinc-500">Host Pool (70%)</div>
                  <div className="text-xs font-mono font-bold text-emerald-400">+${hostCutPerEntry} / submission</div>
                </div>
                <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                  <div className="text-[10px] font-mono text-zinc-500">Scofen Treasury (30%)</div>
                  <div className="text-xs font-mono font-bold text-zinc-300">+${platformCutPerEntry} / submission</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Filtration Mandate</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <span>Deploy Session With Calibrated Vector</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Active Contests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h2 className="text-sm font-mono font-semibold text-zinc-200">
            Active Host Contest Sessions ({contests.length})
          </h2>
          <span className="text-[11px] font-mono text-zinc-500">Immutable 70/30 Upfront Settlement</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contests.map((c) => {
            const isOwner = c.hostId === userState.id;
            return (
              <div
                key={c.id}
                className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {c.genre}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ${c.entryFee}.00 Entry
                    </span>
                  </div>
                  <h3 className="text-sm font-mono font-bold text-zinc-100 mt-2">{c.title}</h3>
                  <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{c.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <div className="text-[10px] font-mono text-zinc-500 flex justify-between">
                    <span>Host: {c.hostName}</span>
                    {isOwner && <span className="text-emerald-400">You (100.0x)</span>}
                  </div>

                  {/* Weights summary badge */}
                  <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
                    <div className="bg-zinc-950 p-1 rounded border border-zinc-800">
                      VP: {(c.baselineWeights.vp * 100).toFixed(0)}%
                    </div>
                    <div className="bg-zinc-950 p-1 rounded border border-zinc-800">
                      PQ: {(c.baselineWeights.pq * 100).toFixed(0)}%
                    </div>
                    <div className="bg-zinc-950 p-1 rounded border border-zinc-800">
                      PH: {(c.baselineWeights.ph * 100).toFixed(0)}%
                    </div>
                    <div className="bg-zinc-950 p-1 rounded border border-zinc-800">
                      SA: {(c.baselineWeights.sa * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono pt-1 text-zinc-400">
                    <span>Submissions: <strong className="text-zinc-200">{c.totalSubmissions}</strong></span>
                    <span>Host Pool: <strong className="text-emerald-400">${c.hostEarnings.toFixed(2)}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
