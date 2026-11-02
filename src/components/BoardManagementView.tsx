import React, { useState } from 'react';
import { Board, Submission, User } from '../types/schema';
import { apiClient } from '../services/apiClient';
import { 
  Disc, 
  Plus, 
  Sliders, 
  Play, 
  CheckCircle2, 
  DollarSign, 
  Trash2, 
  X, 
  Sparkles, 
  Award,
  Layers,
  Music,
  Radio,
  SlidersHorizontal
} from 'lucide-react';

interface BoardManagementViewProps {
  boards: Board[];
  currentUser: User;
  onRefreshBoards: () => void;
  onPlayTrack: (submission: Submission) => void;
  selectedBoardId?: string | null;
}

export const BoardManagementView: React.FC<BoardManagementViewProps> = ({
  boards,
  currentUser,
  onRefreshBoards,
  onPlayTrack,
  selectedBoardId: initialSelectedBoardId,
}) => {
  const [activeBoardId, setActiveBoardId] = useState<string>(initialSelectedBoardId || boards[0]?.id || '');
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);

  // New Board Form
  const [newTitle, setNewTitle] = useState('Apex Metro: Future Club & Synthwave');
  const [newGenre, setNewGenre] = useState('Electronic / Synthwave');
  const [newFee, setNewFee] = useState<number>(45.0);
  const [newCriteria, setNewCriteria] = useState<{ criterion_name: string; weight: number }[]>([
    { criterion_name: 'Vocal Precision', weight: 25 },
    { criterion_name: 'Production Quality', weight: 35 },
    { criterion_name: 'Hook Stickiness', weight: 25 },
    { criterion_name: 'Arrangement & Flow', weight: 15 },
  ]);

  // Scoring console state
  const [scoringSubmissionId, setScoringSubmissionId] = useState<string | null>(null);
  const [rawScoreInputs, setRawScoreInputs] = useState<Record<string, number>>({});
  const [scoringNotice, setScoringNotice] = useState<string | null>(null);

  // Board details
  const [boardDetail, setBoardDetail] = useState<{ board: Board; submissions: Submission[] } | null>(null);
  const [loadingBoard, setLoadingBoard] = useState(false);

  const fetchBoardDetail = async (id: string) => {
    setLoadingBoard(true);
    try {
      const data = await apiClient.getBoard(id);
      setBoardDetail(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBoard(false);
    }
  };

  React.useEffect(() => {
    if (activeBoardId) {
      fetchBoardDetail(activeBoardId);
    }
  }, [activeBoardId]);

  const handleAddCriterion = () => {
    setNewCriteria([...newCriteria, { criterion_name: 'New Custom Dimension', weight: 20 }]);
  };

  const handleRemoveCriterion = (index: number) => {
    if (newCriteria.length <= 1) return;
    setNewCriteria(newCriteria.filter((_, i) => i !== index));
  };

  const handleUpdateCriterion = (index: number, field: 'criterion_name' | 'weight', value: string | number) => {
    const updated = [...newCriteria];
    if (field === 'weight') {
      updated[index].weight = Number(value);
    } else {
      updated[index].criterion_name = String(value);
    }
    setNewCriteria(updated);
  };

  const handleCreateBoardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await apiClient.createBoard(currentUser.id, newTitle, newFee, newCriteria);
      setIsCreatingBoard(false);
      onRefreshBoards();
      setActiveBoardId(created.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to launch board');
    }
  };

  const handleOpenScoring = (sub: Submission) => {
    setScoringSubmissionId(sub.id);
    const initialInputs: Record<string, number> = {};
    if (sub.scores) {
      sub.scores.forEach((sc) => {
        initialInputs[sc.criterion_id] = sc.raw_score;
      });
    }
    setRawScoreInputs(initialInputs);
  };

  // Instant calculation whenever host adjusts raw score
  const handleScoreChange = async (criterionId: string, val: number) => {
    if (!scoringSubmissionId) return;
    const clamped = Math.max(0, Math.min(100, val));
    const nextInputs = { ...rawScoreInputs, [criterionId]: clamped };
    setRawScoreInputs(nextInputs);

    try {
      const result = await apiClient.setSubmissionScore(scoringSubmissionId, criterionId, clamped);
      setScoringNotice(`Track Score Recalculated: ${result.recalculatedFinalScore.toFixed(1)} / 100`);

      if (activeBoardId) {
        fetchBoardDetail(activeBoardId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeBoard = boardDetail?.board || boards.find((b) => b.id === activeBoardId);
  const isHost = activeBoard?.host_id === currentUser.id;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                A&R Curator Rooms
              </span>
              <span className="text-xs text-zinc-400">Custom Scoring Dimensions & Direct Submissions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Curator Boards & Judging Deck
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Curators host submission rooms, set entry fees, and calibrate multi-dimensional scoring weights.
              As hosts grade tracks across production and performance parameters, scores calculate automatically.
            </p>
          </div>

          <button
            onClick={() => setIsCreatingBoard(true)}
            className="px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center space-x-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Curator Board</span>
          </button>
        </div>
      </div>

      {/* Create Board Modal */}
      {isCreatingBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreatingBoard(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Disc className="w-5 h-5 text-emerald-400" />
                <span>Launch New Curator Board</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Configure your audition guidelines, submission friction, and weighted evaluation criteria.
              </p>
            </div>

            <form onSubmit={handleCreateBoardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Board / Contest Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Modern Soul Invitational"
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-300">Artist Entry Fee</label>
                  <span className="text-sm font-bold text-emerald-400">${newFee.toFixed(2)} USD</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="250"
                  step="5"
                  value={newFee}
                  onChange={(e) => setNewFee(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-full cursor-pointer"
                />
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-900 text-xs text-zinc-400">
                  <div className="bg-zinc-900 p-2.5 rounded-xl">
                    Host Payout (70%): <strong className="text-emerald-400">+${(newFee * 0.7).toFixed(2)}</strong>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-xl">
                    Platform Retention (30%): <strong className="text-zinc-300">+${(newFee * 0.3).toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Criteria list */}
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">
                    Curator Criteria & Mathematical Weights (0–100)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCriterion}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Dimension</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newCriteria.map((c, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                      <input
                        type="text"
                        value={c.criterion_name}
                        onChange={(e) => handleUpdateCriterion(idx, 'criterion_name', e.target.value)}
                        placeholder="Dimension name"
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <div className="flex items-center space-x-1.5 w-24">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={c.weight}
                          onChange={(e) => handleUpdateCriterion(idx, 'weight', parseInt(e.target.value, 10) || 0)}
                          className="w-14 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                        />
                        <span className="text-xs text-zinc-500">wt%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterion(idx)}
                        disabled={newCriteria.length <= 1}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg transition-colors"
              >
                Launch Curator Board
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Boards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Boards List */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
            Active Curator Boards ({boards.length})
          </h2>

          <div className="space-y-2.5">
            {boards.map((b) => {
              const isSelected = b.id === activeBoardId;
              const isUserHost = b.host_id === currentUser.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setActiveBoardId(b.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                      : 'bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-white leading-snug">
                      {b.title}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                      ${b.entry_fee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mt-2">
                    <span>Host: {b.host ? `${b.host.first_name} ${b.host.last_name}` : 'Curator'}</span>
                    {isUserHost && <span className="text-amber-400 font-bold text-[11px]">Your Board</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Board Studio & Submissions Deck */}
        <div className="lg:col-span-8 space-y-6">
          {activeBoard && (
            <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 space-y-6">
              {/* Board Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-white">{activeBoard.title}</h2>
                    {isHost && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        CURATOR HOST
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Curated by <strong className="text-zinc-200">{activeBoard.host?.first_name} {activeBoard.host?.last_name}</strong> • Upfront Entry: <strong className="text-emerald-400">${activeBoard.entry_fee.toFixed(2)} USD</strong>
                  </div>
                </div>
              </div>

              {/* Criteria Weight Allocation Cards */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center space-x-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Curator Evaluation Dimensions</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {activeBoard.criteria?.map((c) => (
                    <div key={c.id} className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800/90">
                      <div className="text-xs font-semibold text-zinc-200 truncate">
                        {c.criterion_name}
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1.5">
                        <span className="text-zinc-500 text-[11px]">Weight</span>
                        <span className="text-emerald-400 font-bold">{c.weight}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submissions Section */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Track Submissions ({boardDetail?.submissions.length || 0})
                  </h3>
                  <span className="text-xs text-zinc-500">
                    {isHost ? 'Curator grading unlocked' : 'Submissions locked to public evaluation'}
                  </span>
                </div>

                {scoringNotice && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center space-x-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{scoringNotice}</span>
                  </div>
                )}

                {loadingBoard ? (
                  <div className="text-center py-10 text-xs text-zinc-500">Loading submissions...</div>
                ) : boardDetail?.submissions.length === 0 ? (
                  <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800/80 text-center text-xs text-zinc-500">
                    No submissions entered for this board yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {boardDetail?.submissions.map((sub) => {
                      const isScoringActive = scoringSubmissionId === sub.id;
                      const isPaid = sub.payment_status === 'confirmed';

                      return (
                        <div
                          key={sub.id}
                          className={`bg-zinc-950 rounded-2xl border p-4 transition-all ${
                            isScoringActive ? 'border-emerald-500/60 shadow-lg shadow-emerald-950/30' : 'border-zinc-800/80'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-3.5">
                              <button
                                onClick={() => onPlayTrack(sub)}
                                className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 flex items-center justify-center text-zinc-300 hover:text-emerald-400 shrink-0 shadow-sm"
                              >
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              </button>
                              <div>
                                <div className="text-sm font-semibold text-white flex items-center space-x-2">
                                  <span>{sub.track_title}</span>
                                  {isPaid ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                                      PAID
                                    </span>
                                  ) : (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                                      PENDING
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-zinc-400 mt-0.5">
                                  By {sub.owner ? `${sub.owner.first_name} ${sub.owner.last_name}` : 'Artist'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 justify-between sm:justify-end">
                              <div className="text-right">
                                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Score</div>
                                <div className="text-lg font-bold text-emerald-400">
                                  {sub.final_score.toFixed(1)}
                                </div>
                              </div>

                              {isHost && isPaid && (
                                <button
                                  onClick={() => handleOpenScoring(sub)}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                                    isScoringActive
                                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700'
                                  }`}
                                >
                                  {isScoringActive ? 'Editing Grades' : 'Grade Track'}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Mixing Desk Grade Sliders for Host */}
                          {isScoringActive && isHost && activeBoard.criteria && (
                            <div className="mt-4 pt-4 border-t border-zinc-850 space-y-4 bg-zinc-900/60 p-4 rounded-xl">
                              <div className="flex items-center justify-between text-xs text-zinc-200">
                                <span className="font-bold flex items-center space-x-1.5">
                                  <Sliders className="w-4 h-4 text-emerald-400" />
                                  <span>Curator Mixing Desk (Calculates Final Score Instantly)</span>
                                </span>
                                <span className="text-xs text-emerald-400 font-bold">
                                  Live Sync
                                </span>
                              </div>

                              <div className="space-y-3">
                                {activeBoard.criteria.map((c) => {
                                  const currentVal = rawScoreInputs[c.id] ?? 0;
                                  return (
                                    <div key={c.id} className="space-y-1.5">
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="text-zinc-300 font-medium">{c.criterion_name} ({c.weight}%)</span>
                                        <span className="text-emerald-400 font-bold text-sm">{currentVal} / 100</span>
                                      </div>
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={currentVal}
                                        onChange={(e) => handleScoreChange(c.id, parseInt(e.target.value, 10))}
                                        className="w-full accent-emerald-500 bg-zinc-800 h-2 rounded-full cursor-pointer"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
