import React, { useState, useEffect } from 'react';
import { User, Board, Submission } from '../types/schema';
import { apiClient } from '../services/apiClient';
import { 
  User as UserIcon, 
  Calendar, 
  Mail, 
  Award, 
  LayoutGrid, 
  Disc, 
  CheckCircle2, 
  Clock, 
  Play, 
  UserCheck, 
  UserPlus, 
  DollarSign, 
  Lock, 
  Unlock,
  Radio,
  Music,
  Headphones,
  Sparkles
} from 'lucide-react';

interface UserProfileViewProps {
  viewUserId: string;
  currentUserId: string;
  onPlayTrack: (submission: Submission) => void;
  onOpenBoard: (boardId: string) => void;
  onCheckoutPendingTrack: (submission: Submission) => void;
  onToggleSubscription: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  viewUserId,
  currentUserId,
  onPlayTrack,
  onOpenBoard,
  onCheckoutPendingTrack,
  onToggleSubscription,
}) => {
  const [profileData, setProfileData] = useState<{
    user: User;
    hostedBoards: Board[];
    submittedTracks: Submission[];
    followersCount: number;
    followingCount: number;
  } | null>(null);

  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const isSelf = viewUserId === currentUserId;

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getUserProfile(viewUserId);
      setProfileData(data);
      if (!isSelf) {
        setIsFollowing(data.followersCount > 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [viewUserId, currentUserId]);

  const handleToggleFollow = async () => {
    if (isSelf) return;
    try {
      const nextFollowingState = await apiClient.toggleFollow(currentUserId, viewUserId);
      setIsFollowing(nextFollowingState);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !profileData) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-16 text-center text-xs text-zinc-500">
        Loading artist profile...
      </div>
    );
  }

  const { user, hostedBoards, submittedTracks, followersCount, followingCount } = profileData;

  return (
    <div className="space-y-8 pb-16">
      {/* Artist Profile Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-5">
            {/* Avatar with musical glow */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-700 to-zinc-900 p-0.5 shadow-xl flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-3xl bg-zinc-950 flex items-center justify-center text-2xl font-bold text-emerald-400">
                {user.first_name[0]}{user.last_name[0]}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {user.first_name} {user.last_name}
                </h1>
                {user.is_subscriber && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                    <Radio className="w-2.5 h-2.5" />
                    <span>$5.99 VIP PASS</span>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3 text-xs text-zinc-400">
                <span>{user.email}</span>
                <span>•</span>
                <span>Active Member</span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed pt-1">
                {user.bio || 'Independent artist and curator on the Scofen discovery network.'}
              </p>
            </div>
          </div>

          {/* Follow Stats & Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-zinc-800">
            <div className="flex items-center space-x-6 text-xs">
              <div className="text-left md:text-right">
                <div className="text-lg font-extrabold text-white">{followersCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Followers</div>
              </div>
              <div className="text-left md:text-right">
                <div className="text-lg font-extrabold text-white">{followingCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Following</div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              {!isSelf && (
                <button
                  onClick={handleToggleFollow}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md ${
                    isFollowing
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>{isFollowing ? 'Following' : 'Follow Artist'}</span>
                </button>
              )}

              {isSelf && (
                <button
                  onClick={onToggleSubscription}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md ${
                    user.is_subscriber
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {user.is_subscriber ? (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>$5.99 Pass Active</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock Unlimited ($5.99/mo)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TWO SEPARATED RELATIONAL LISTS (REQUIRED BY SPECIFICATION) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LIST 1: ALL BOARDS HOSTED BY THIS SPECIFIC USER */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Disc className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Boards Curated by {user.first_name} ({hostedBoards.length})
              </h2>
            </div>
            <span className="text-xs text-zinc-500">Curator Rooms</span>
          </div>

          {hostedBoards.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 text-center text-xs text-zinc-500">
              No curator boards hosted by this artist yet.
            </div>
          ) : (
            <div className="space-y-3">
              {hostedBoards.map((b) => (
                <div
                  key={b.id}
                  className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 hover:border-zinc-700 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 
                        onClick={() => onOpenBoard(b.id)}
                        className="text-sm font-semibold text-white hover:text-emerald-400 cursor-pointer"
                      >
                        {b.title}
                      </h3>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Created {new Date(b.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      ${b.entry_fee.toFixed(2)} Entry
                    </span>
                  </div>

                  {/* Criteria Tags */}
                  {b.criteria && b.criteria.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {b.criteria.map((crit) => (
                        <span
                          key={crit.id}
                          className="text-[10px] px-2.5 py-0.5 rounded-lg bg-zinc-950 text-zinc-300 border border-zinc-800"
                        >
                          {crit.criterion_name} ({crit.weight}%)
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800/60">
                    <span className="text-zinc-400">
                      Submissions: <strong className="text-zinc-200">{b.submissions_count || 0}</strong>
                    </span>
                    <button
                      onClick={() => onOpenBoard(b.id)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1"
                    >
                      <span>Open Curator Room →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LIST 2: ALL AUDIO TRACKS SUBMITTED BY THIS USER ACROSS PLATFORM */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Music className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Discography & Submitted Tracks ({submittedTracks.length})
              </h2>
            </div>
            <span className="text-xs text-zinc-500">Cross-Platform Tracks</span>
          </div>

          {submittedTracks.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 text-center text-xs text-zinc-500">
              No audio tracks submitted across the platform yet.
            </div>
          ) : (
            <div className="space-y-3">
              {submittedTracks.map((sub) => {
                const isPaid = sub.payment_status === 'confirmed';
                return (
                  <div
                    key={sub.id}
                    className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 hover:border-zinc-700 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3.5">
                        <button
                          onClick={() => onPlayTrack(sub)}
                          className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 flex items-center justify-center text-zinc-300 hover:text-emerald-400 transition-colors shrink-0 shadow-sm"
                          title="Play Track"
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </button>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-semibold text-white">
                              {sub.track_title}
                            </h3>
                            {isPaid ? (
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/40 flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>CONFIRMED</span>
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/40 flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>PENDING PAYMENT</span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400 mt-1">
                            Curator Room: <strong className="text-zinc-200">{sub.board?.title || 'Active Board'}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Curator Score</div>
                        <div className={`text-base font-bold ${sub.final_score >= 88 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                          {sub.final_score > 0 ? `${sub.final_score.toFixed(1)} / 100` : 'Pending'}
                        </div>
                      </div>
                    </div>

                    {/* Criteria score pills if graded */}
                    {sub.scores && sub.scores.length > 0 && isPaid && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[10px]">
                        {sub.scores.map((sc) => (
                          <div key={sc.id} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex justify-between">
                            <span className="text-zinc-400 truncate max-w-[80px]">{sc.criterion_name}</span>
                            <span className="text-emerald-400 font-bold">{sc.raw_score}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pending Checkout CTA */}
                    {!isPaid && (
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                        <span className="text-xs text-amber-300 font-medium">
                          Entry fee unpaid. Unlock curator judging.
                        </span>
                        <button
                          onClick={() => onCheckoutPendingTrack(sub)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center space-x-1"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Confirm Entry (${sub.board?.entry_fee.toFixed(2) || '0.00'})</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
