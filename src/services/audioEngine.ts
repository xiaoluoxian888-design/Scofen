/**
 * High-velocity procedural WebAudio engine for Scofen platform.
 * Synthesizes dynamic rhythmic audio textures and exposes real-time FFT frequency data for visualizers.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentPreset: string = 'cyber_bass';
  private timer: number | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private step: number = 0;
  private bpm: number = 124;
  private onTimeUpdateCallback: ((seconds: number) => void) | null = null;
  private playbackTime: number = 0;
  private timeTicker: number | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public play(preset: string = 'cyber_bass', onTimeUpdate?: (seconds: number) => void) {
    this.init();
    if (this.isPlaying && this.currentPreset === preset) return;
    this.stop();

    this.currentPreset = preset;
    this.isPlaying = true;
    this.step = 0;
    this.playbackTime = 0;
    this.onTimeUpdateCallback = onTimeUpdate || null;

    if (preset === 'cyber_bass') this.bpm = 128;
    else if (preset === 'analog_soul') this.bpm = 92;
    else if (preset === 'hyper_drill') this.bpm = 142;
    else if (preset === 'ambient_void') this.bpm = 70;
    else this.bpm = 120;

    const intervalMs = (60 / this.bpm / 4) * 1000; // 16th notes

    this.timer = window.setInterval(() => {
      this.tick();
    }, intervalMs);

    this.timeTicker = window.setInterval(() => {
      this.playbackTime += 0.25;
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.playbackTime);
      }
    }, 250);
  }

  public stop() {
    this.isPlaying = false;
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.timeTicker !== null) {
      clearInterval(this.timeTicker);
      this.timeTicker = null;
    }
    this.playbackTime = 0;
  }

  public pause() {
    this.isPlaying = false;
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.timeTicker !== null) {
      clearInterval(this.timeTicker);
      this.timeTicker = null;
    }
  }

  public resume(onTimeUpdate?: (seconds: number) => void) {
    if (!this.isPlaying) {
      this.play(this.currentPreset, onTimeUpdate);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentPreset(): string {
    return this.currentPreset;
  }

  private tick() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const currentStep = this.step % 16;

    // Pattern generator based on preset
    switch (this.currentPreset) {
      case 'cyber_bass':
        // Kick on 0, 4, 8, 12
        if (currentStep % 4 === 0) this.triggerKick(t);
        // Snare / Clap on 4, 12
        if (currentStep === 4 || currentStep === 12) this.triggerSnare(t);
        // Hihat on all 16ths
        this.triggerHihat(t, currentStep % 2 === 0 ? 0.08 : 0.04);
        // Bassline on syncopated 16ths
        if ([0, 3, 6, 8, 10, 14].includes(currentStep)) {
          const notes = [55, 55, 65.4, 49, 55, 73.4];
          this.triggerBass(t, notes[currentStep % notes.length], 0.2);
        }
        break;

      case 'analog_soul':
        // Warm chords and laid back groove
        if (currentStep === 0 || currentStep === 6 || currentStep === 10) this.triggerKick(t, 0.4);
        if (currentStep === 4 || currentStep === 12) this.triggerSnare(t, 0.3);
        if (currentStep % 2 === 0) this.triggerHihat(t, 0.03);
        if (currentStep === 0 || currentStep === 8) {
          const chord = currentStep === 0 ? [220, 261.63, 329.63] : [196, 246.94, 293.66];
          chord.forEach(freq => this.triggerPolyChord(t, freq, 0.8));
        }
        break;

      case 'hyper_drill':
        // Rapid 808 slides & skittering hats
        if (currentStep === 0 || currentStep === 7 || currentStep === 10) this.triggerSub808(t);
        if (currentStep === 6 || currentStep === 14) this.triggerSnare(t, 0.6);
        this.triggerHihat(t, 0.06);
        if (currentStep % 3 === 0) this.triggerLead(t, 440 + (currentStep * 40));
        break;

      case 'ambient_void':
        // Ethereal drone textures
        if (currentStep === 0) {
          this.triggerPolyChord(t, 130.81, 2.0); // C3
          this.triggerPolyChord(t, 196.00, 2.0); // G3
        }
        if (currentStep === 8) {
          this.triggerPolyChord(t, 174.61, 2.0); // F3
        }
        if (currentStep % 4 === 2) this.triggerHihat(t, 0.02);
        break;

      case 'modular_hook':
      default:
        // Arpeggiated sequence
        if (currentStep % 4 === 0) this.triggerKick(t);
        if (currentStep === 4 || currentStep === 12) this.triggerSnare(t);
        const arpFreqs = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 440.00, 587.33];
        this.triggerLead(t, arpFreqs[currentStep % arpFreqs.length], 0.15);
        break;
    }

    this.step++;
  }

  private triggerKick(time: number, gainVal: number = 0.7) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.15);
    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  private triggerSnare(time: number, gainVal: number = 0.5) {
    if (!this.ctx || !this.masterGain) return;
    // Tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.1);
    oscGain.gain.setValueAtTime(gainVal * 0.4, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.1);

    // Noise buffer
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(gainVal * 0.5, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.15);
  }

  private triggerHihat(time: number, gainVal: number = 0.05) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.04);
  }

  private triggerBass(time: number, freq: number, dur: number = 0.2) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.Q.setValueAtTime(4, time);
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + dur);
  }

  private triggerSub808(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.4);
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.45);
  }

  private triggerLead(time: number, freq: number, dur: number = 0.12) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + dur);
  }

  private triggerPolyChord(time: number, freq: number, dur: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, time);
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + dur);
  }
}

export const audioEngine = new AudioEngine();
