import React, { useEffect, useRef, useState } from 'react';
import { Submission, User } from '../types/schema';
import { audioEngine } from '../services/audioEngine';
import { 
  Play, 
  Pause, 
  Volume2, 
  Lock, 
  Unlock, 
  Sparkles,
  Radio,
  Music,
  Disc
} from 'lucide-react';

interface DualLayerAudioPlayerProps {
  currentTrack: Submission | null;
  currentUser: User;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onToggleSubscription: () => void;
}

export const DualLayerAudioPlayer: React.FC<DualLayerAudioPlayerProps> = ({
  currentTrack,
  currentUser,
  isPlaying,
  onTogglePlay,
  onToggleSubscription,
}) => {
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const [limitReached, setLimitReached] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const isOwner = currentTrack ? currentTrack.owner_id === currentUser.id : false;
  const isHost = currentTrack?.board ? currentTrack.board.host_id === currentUser.id : false;
  const isSubscriber = currentUser.is_subscriber;
  const isFullStreamAuthorized = isOwner || isHost || isSubscriber;

  const previewLimit = 60; // 60 seconds strict limit for non-subscribers
  const fullDuration = currentTrack?.duration_seconds || 180;
  const effectiveMaxDuration = isFullStreamAuthorized ? fullDuration : previewLimit;

  useEffect(() => {
    setLimitReached(false);
    setPlaybackSeconds(0);
  }, [currentTrack?.id]);

  useEffect(() => {
    if (isPlaying && currentTrack) {
      const preset = currentTrack.audio_preset || 'cyber_bass';
      audioEngine.play(preset, (sec) => {
        setPlaybackSeconds(sec);

        if (!isFullStreamAuthorized && sec >= previewLimit) {
          audioEngine.pause();
          setLimitReached(true);
          if (isPlaying) {
            onTogglePlay();
          }
        }
      });
    } else {
      audioEngine.pause();
    }
  }, [isPlaying, currentTrack, isFullStreamAuthorized]);

  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  // Real-time canvas FFT visualizer with Jade Green music frequency gradient
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderWave = () => {
      const analyser = audioEngine.getAnalyser();
      if (analyser && isPlaying) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          // Jade green aesthetic hue ~ 155
          const hue = 152 + (i / bufferLength) * 25;
          ctx.fillStyle = `hsl(${hue}, 80%, ${dataArray[i] > 180 ? '60%' : '45%'})`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }

      animationFrameId.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.min(100, (playbackSeconds / effectiveMaxDuration) * 100);

  return (
    <>
      {/* 60s Preview Cutoff Modal */}
      {limitReached && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                60-Second Free Preview Finished
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                You're listening on the public preview tier. Full-length music streaming is unlocked for Board Hosts,
                Track Creators, and active $5.99/mo Subscribers.
              </p>
            </div>

            <div className="bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800 text-xs text-zinc-300">
              Support independent music creators and unlock uninterrupted streaming across all tracks.
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setLimitReached(false)}
                className="flex-1 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold border border-zinc-800"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setLimitReached(false);
                  onToggleSubscription();
                }}
                className="flex-1 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Unlock Unlimited ($5.99)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Docked Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-lg px-4 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Track Info with 25% bigger artwork */}
          <div className="flex items-center space-x-3.5 w-full md:w-1/4">
            <div className="w-[50px] h-[50px] rounded-xl bg-gradient-to-br from-emerald-600 via-teal-800 to-zinc-950 border border-zinc-800 flex items-center justify-center relative overflow-hidden shrink-0 shadow-md">
              <img
                src="/assets/aistudio/image_e3f3963a_63143619.jpg"
                alt="Scofen Music"
                className={`w-full h-full object-cover transition-all duration-300 ${
                  isPlaying ? 'scale-105 opacity-100' : 'opacity-85'
                }`}
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none border border-emerald-500/40" />
              )}
            </div>

            <div className="truncate">
              <div className="text-xs sm:text-sm font-semibold text-white truncate flex items-center space-x-2">
                <span>{currentTrack ? currentTrack.track_title : 'Select a Track'}</span>
                {currentTrack && currentTrack.final_score >= 88.0 && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                    TOP 1%
                  </span>
                )}
              </div>
              <div className="text-xs text-zinc-400 truncate flex items-center space-x-1.5 mt-0.5">
                <span>{currentTrack?.owner ? `${currentTrack.owner.first_name} ${currentTrack.owner.last_name}` : 'Scofen Discovery'}</span>
                <span>•</span>
                <span className={isFullStreamAuthorized ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                  {isFullStreamAuthorized ? 'Full Stream' : '60s Preview'}
                </span>
              </div>
            </div>
          </div>

          {/* Transport & Frequency Visualizer */}
          <div className="flex flex-col items-center w-full md:w-2/4 max-w-xl">
            <div className="flex items-center space-x-4 mb-1.5">
              <button
                onClick={onTogglePlay}
                disabled={!currentTrack}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  !currentTrack
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    : isPlaying
                    ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:bg-emerald-400 scale-105'
                    : 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-md'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              {/* Real-time FFT Visualizer */}
              <div className="w-44 sm:w-60 h-7 bg-zinc-900/90 rounded-lg border border-zinc-800/80 px-1 py-0.5 flex items-center shadow-inner">
                <canvas ref={canvasRef} width={256} height={24} className="w-full h-full" />
              </div>

              {/* Time display */}
              <div className="text-xs text-zinc-400 shrink-0 font-medium flex items-center space-x-1">
                <span>{formatTime(playbackSeconds)} / {formatTime(effectiveMaxDuration)}</span>
                {!isFullStreamAuthorized && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    60S CAP
                  </span>
                )}
              </div>
            </div>

            {/* Track Progress Slider */}
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  isFullStreamAuthorized ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Right: Audio Stream Authority & Volume */}
          <div className="hidden md:flex items-center justify-end space-x-4 w-1/4">
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Playback Status</div>
              <div className="text-xs font-semibold flex items-center justify-end space-x-1">
                {isFullStreamAuthorized ? (
                  <span className="text-emerald-400 flex items-center space-x-1 font-medium">
                    <Unlock className="w-3 h-3" />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center space-x-1 font-medium">
                    <Lock className="w-3 h-3" />
                    <span>60s Limit</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-zinc-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-18 accent-emerald-500 bg-zinc-800 h-1 rounded-full cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
