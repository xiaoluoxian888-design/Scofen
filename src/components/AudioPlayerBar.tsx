import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import { TrackSubmission } from '../types/scofen';
import { Play, Pause, Volume2, Disc, Activity } from 'lucide-react';

interface AudioPlayerBarProps {
  currentTrack: TrackSubmission | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onTrackEnd?: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
}) => {
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying && currentTrack) {
      audioEngine.play(currentTrack.audioPreset, (sec) => {
        setPlaybackSeconds(sec);
      });
    } else {
      audioEngine.pause();
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  // Real-time canvas visualizer
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
          // Gradient from emerald to cyan
          const hue = 150 + (i / bufferLength) * 40;
          ctx.fillStyle = `hsl(${hue}, 80%, ${dataArray[i] > 180 ? '70%' : '50%'})`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }
      } else {
        // Idle visualization line
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

  const duration = currentTrack ? currentTrack.durationSeconds : 180;
  const progressPercent = Math.min(100, (playbackSeconds / duration) * 100);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Track Info */}
        <div className="flex items-center space-x-3 w-full md:w-1/4">
          <div className="w-[50px] h-[50px] rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center relative overflow-hidden shrink-0 shadow-sm">
            <img
              src="/assets/aistudio/image_e3f3963a_63143619.jpg"
              alt="Scofen Asset"
              className={`w-full h-full object-cover transition-all ${
                isPlaying ? 'scale-105 opacity-100' : 'opacity-80'
              }`}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none border border-emerald-500/40" />
            )}
          </div>
          <div className="truncate">
            <div className="text-xs font-mono font-medium text-zinc-100 truncate flex items-center space-x-2">
              <span>{currentTrack ? currentTrack.title : 'No Track Selected'}</span>
              {currentTrack?.isBillboardQualified && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  TOP 1%
                </span>
              )}
            </div>
            <div className="text-[11px] font-mono text-zinc-500 truncate">
              {currentTrack ? `${currentTrack.artistName} • [${currentTrack.audioPreset}]` : 'Select a track to evaluate'}
            </div>
          </div>
        </div>

        {/* Transport & Waveform */}
        <div className="flex flex-col items-center w-full md:w-2/4 max-w-xl">
          <div className="flex items-center space-x-4 mb-1">
            <button
              onClick={onTogglePlay}
              disabled={!currentTrack}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                !currentTrack
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  : isPlaying
                  ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400'
                  : 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* FFT Visualizer Canvas */}
            <div className="w-48 sm:w-64 h-7 bg-zinc-900/80 rounded border border-zinc-800/80 px-1 py-0.5 flex items-center">
              <canvas ref={canvasRef} width={256} height={24} className="w-full h-full" />
            </div>

            <div className="text-[11px] font-mono text-zinc-400 shrink-0">
              {formatTime(playbackSeconds)} / {formatTime(duration)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Volume & Criteria metrics */}
        <div className="hidden md:flex items-center justify-end space-x-4 w-1/4">
          {currentTrack && (
            <div className="text-right">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Composite Score</div>
              <div className="text-sm font-mono font-bold text-emerald-400">
                {currentTrack.compositeScore.toFixed(1)} / 100
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-emerald-500 bg-zinc-800 h-1 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
