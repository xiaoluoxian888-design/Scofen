import React, { useState, useEffect } from 'react';
import { Submission, User } from '../types/schema';
import { apiClient } from '../services/apiClient';
import { 
  Flame, 
  Play, 
  Pause, 
  Lock, 
  Unlock, 
  SlidersHorizontal, 
  UserPlus, 
  UserCheck, 
  Music, 
  Disc, 
  Sparkles, 
  Radio, 
  Heart,
  Headphones,
  Sliders
} from 'lucide-react';

interface DiscoveryFeedViewProps {
  currentUser: User;
  onPlayTrack: (submission: Submission) => void;
  currentTrackId?: string;
  isPlaying?: boolean;
  onToggleSubscription: () => void;
  onOpenUserProfile: (userId: string) => void;
}

export const DiscoveryFeedView: React.FC<DiscoveryFeedViewProps> = ({
  currentUser,
  onPlayTrack,
  currentTrackId,
  isPlaying,
  onToggleSubscription,
  onOpenUserProfile,
}) => {
  const [feed, setFeed] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Sorting & filter options
  const [sortOption, setSortOption] = useState<'score' | 'newest' | 'range'>('score');
  const [minScore, setMinScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [followedOnly, setFollowedOnly] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const items = await apiClient.getFeed({
        sort: sortOption,
        minScore: sortOption === 'range' ? minScore : 0,
        maxScore: sortOption === 'range' ? maxScore : 100,
        followedOnly,
        currentUserId: currentUser.id,
      });
      setFeed(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [sortOption, minScore, maxScore, followedOnly, currentUser.id]);

  const handleToggleFollow = async (artistId: string) => {
    if (artistId === currentUser.id) return;
    try {
      const nextState = await apiClient.toggleFollow(currentUser.id, artistId);
      setFollowingMap((prev) => ({ ...prev, [artistId]: nextState }));
      if (followedOnly) {
        fetchFeed();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFeed = feed.filter((item) => {
    if (selectedGenre === 'All') return true;
    return item.genre?.toLowerCase().includes(selectedGenre.toLowerCase());
  });

  const featuredTrack = feed[0];

  const genres = ['All', 'Synthwave', 'Neo-Soul', 'Drill', 'Club', 'Ambient'];

  return (
    <div className="space-y-8 pb-16">
      {/* Featured Artist Spotlight Hero Banner */}
      {featuredTrack && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/80 shadow-2xl p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center space-x-5">
              {/* Vinyl cover album artwork */}
              <div 
                onClick={() => onPlayTrack(featuredTrack)}
                className="relative group cursor-pointer shrink-0"
              >
                <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br ${featuredTrack.cover_gradient || 'from-emerald-600 to-teal-900'} p-3 shadow-xl flex flex-col justify-between overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-300`}>
                  <div className="flex justify-between items-center text-white/70">
                    <Music className="w-5 h-5 text-emerald-300" />
                    <span className="text-[10px] font-mono uppercase bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {featuredTrack.bpm || 128} BPM
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-emerald-300 uppercase tracking-wider">Top Chart Winner</div>
                    <div className="text-xs font-bold text-white truncate">{featuredTrack.track_title}</div>
                  </div>
                </div>

                {/* Centered Hover Play Button */}
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-lg">
                    {currentTrackId === featuredTrack.id && isPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Featured Track Metadata */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>#1 Trending Independent Sound</span>
                  </span>
                  <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
                    {featuredTrack.genre || 'Electronic'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {featuredTrack.track_title}
                </h1>

                <div className="flex items-center space-x-3 text-sm text-zinc-300">
                  <span 
                    onClick={() => featuredTrack.owner && onOpenUserProfile(featuredTrack.owner.id)}
                    className="font-medium hover:text-emerald-400 cursor-pointer text-white underline underline-offset-4 decoration-zinc-700"
                  >
                    {featuredTrack.owner ? `${featuredTrack.owner.first_name} ${featuredTrack.owner.last_name}` : 'Artist'}
                  </span>
                  <span>•</span>
                  <span className="text-zinc-400 text-xs">
                    Curated on <strong className="text-zinc-200">{featuredTrack.board?.title}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-3 pt-1">
                  <div className="flex items-center space-x-1 text-xs text-emerald-400 font-bold bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
                    <span>Curator Rating:</span>
                    <span className="text-sm">{featuredTrack.final_score.toFixed(1)}</span>
                    <span className="text-emerald-500/70 font-normal">/ 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Play CTA & Stream authorization status */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0">
              <button
                onClick={() => onPlayTrack(featuredTrack)}
                className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center space-x-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all transform hover:scale-105"
              >
                {currentTrackId === featuredTrack.id && isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause Track</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Listen Now</span>
                  </>
                )}
              </button>

              <div className="text-right">
                <span className="text-[11px] text-zinc-400 flex items-center space-x-1">
                  {currentUser.is_subscriber ? (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">Full Stream Unlocked</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>60s Free Preview</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Music Genre Pills & Discovery Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        {/* Genre Tags */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                selectedGenre === g
                  ? 'bg-zinc-100 text-zinc-950 font-bold shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850 border border-zinc-800/80'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Dynamic Sorting Options */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-full border border-zinc-800 text-xs">
            <button
              onClick={() => setSortOption('score')}
              className={`px-3 py-1 rounded-full transition-all font-medium ${
                sortOption === 'score' ? 'bg-zinc-800 text-emerald-400 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Top Charts
            </button>
            <button
              onClick={() => setSortOption('newest')}
              className={`px-3 py-1 rounded-full transition-all font-medium ${
                sortOption === 'newest' ? 'bg-zinc-800 text-emerald-400 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              New Releases
            </button>
            <button
              onClick={() => setSortOption('range')}
              className={`px-3 py-1 rounded-full transition-all font-medium ${
                sortOption === 'range' ? 'bg-zinc-800 text-emerald-400 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Score Filter
            </button>
          </div>

          <button
            onClick={() => setFollowedOnly(!followedOnly)}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors border flex items-center space-x-1.5 font-medium ${
              followedOnly
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${followedOnly ? 'fill-emerald-400 text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Followed Only</span>
          </button>
        </div>
      </div>

      {/* Score Range Filter Drawer */}
      {sortOption === 'range' && (
        <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-2/3">
            <span className="text-xs text-zinc-300 font-medium whitespace-nowrap">
              Curator Rating Range: <strong className="text-emerald-400 font-bold">{minScore}</strong> to <strong className="text-emerald-400 font-bold">{maxScore}</strong>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-full cursor-pointer"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="w-full accent-teal-400 bg-zinc-800 h-1.5 rounded-full cursor-pointer"
            />
          </div>
          <span className="text-xs text-zinc-400">
            Filtering top-tier assets ($min \le score \le max$)
          </span>
        </div>
      )}

      {/* Track List - Modern Music Streaming Charts Layout */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16 text-xs text-zinc-500">
            Loading charts...
          </div>
        ) : filteredFeed.length === 0 ? (
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-12 text-center text-xs text-zinc-400">
            No tracks found matching current filter. Adjust score sliders or select "All" genres.
          </div>
        ) : (
          filteredFeed.map((track, idx) => {
            const isCurrentPlaying = currentTrackId === track.id && isPlaying;
            const isOwner = track.owner_id === currentUser.id;
            const isHost = track.board?.host_id === currentUser.id;
            const isFullStreamAllowed = currentUser.is_subscriber || isOwner || isHost;
            const isFollowed = followingMap[track.owner_id] || false;

            return (
              <div
                key={track.id}
                className={`group rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-4 transition-all duration-200 border ${
                  isCurrentPlaying
                    ? 'bg-zinc-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    : 'bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/70 hover:border-zinc-700/80'
                }`}
              >
                {/* Left: Rank, Album Art, Play Button, Title & Artist */}
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  {/* Rank number */}
                  <span className={`w-6 text-center text-sm font-bold shrink-0 ${
                    idx === 0 ? 'text-amber-400 text-base' : idx === 1 ? 'text-zinc-200' : idx === 2 ? 'text-amber-600' : 'text-zinc-500'
                  }`}>
                    {idx + 1}
                  </span>

                  {/* Album Cover Thumbnail */}
                  <div 
                    onClick={() => onPlayTrack(track)}
                    className="relative cursor-pointer shrink-0"
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${track.cover_gradient || 'from-emerald-700 to-zinc-900'} flex items-center justify-center shadow-md p-1.5 overflow-hidden border border-white/10 group-hover:scale-105 transition-transform`}>
                      <Disc className={`w-6 h-6 text-white/80 ${isCurrentPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
                    </div>

                    {/* Hover Play Button */}
                    <div className={`absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center transition-opacity ${
                      isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-md">
                        {isCurrentPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Track Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-sm font-semibold truncate ${isCurrentPlaying ? 'text-emerald-400' : 'text-zinc-100'}`}>
                        {track.track_title}
                      </h3>
                      {track.final_score >= 88.0 && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 hidden sm:inline shrink-0">
                          TOP 1%
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-zinc-400 mt-0.5 truncate">
                      <span 
                        onClick={() => track.owner && onOpenUserProfile(track.owner.id)}
                        className="hover:text-emerald-400 cursor-pointer font-medium text-zinc-300 truncate"
                      >
                        {track.owner ? `${track.owner.first_name} ${track.owner.last_name}` : 'Artist'}
                      </span>
                      <span>•</span>
                      <span className="truncate hidden sm:inline text-zinc-400">
                        {track.board?.title}
                      </span>
                      {track.genre && (
                        <>
                          <span className="hidden md:inline">•</span>
                          <span className="text-[11px] text-zinc-500 hidden md:inline">{track.genre}</span>
                        </>
                      )}
                    </div>

                    {/* Criteria Mini Scores */}
                    {track.scores && track.scores.length > 0 && (
                      <div className="hidden lg:flex items-center space-x-1.5 mt-1.5">
                        {track.scores.map((sc) => (
                          <span key={sc.id} className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-950/70 border border-zinc-800 text-zinc-400">
                            {sc.criterion_name}: <strong className="text-zinc-200">{sc.raw_score}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Curator Score, Gatekeeper Badge, and Social Follow */}
                <div className="flex items-center space-x-4 shrink-0">
                  {/* Final Score Badge */}
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Curator Score</div>
                    <div className="text-base sm:text-lg font-bold text-emerald-400">
                      {track.final_score.toFixed(1)}
                    </div>
                  </div>

                  {/* Dual-layer Gatekeeping indicator */}
                  <div className="hidden sm:block">
                    {isFullStreamAllowed ? (
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1 font-medium">
                        <Unlock className="w-3 h-3" />
                        <span>Full</span>
                      </span>
                    ) : (
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center space-x-1 font-medium">
                        <Lock className="w-3 h-3" />
                        <span>60s Preview</span>
                      </span>
                    )}
                  </div>

                  {/* Follow Artist Button */}
                  {!isOwner && (
                    <button
                      onClick={() => handleToggleFollow(track.owner_id)}
                      className={`p-2 rounded-full border transition-colors ${
                        isFollowed 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 border-zinc-700'
                      }`}
                      title={isFollowed ? 'Following Artist' : 'Follow Artist'}
                    >
                      {isFollowed ? <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> : <UserPlus className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
