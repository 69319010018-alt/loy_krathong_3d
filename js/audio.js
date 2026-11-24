/**
 * audio.js - Web Audio API Procedural Sound Engine
 * Synthesizes traditional Thai festive music ("เพลงวันลอยกระทง"),
 * fireworks, ambient night sounds, water, temple gongs, and festival SFX.
 * Zero external audio files required!
 */

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isPlayingMusic = false;
    this.musicTimer = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.ambientGain = null;
    this.isInitialized = false;

    // Classic Loy Krathong Melody Notes (Pentatonic: C, D, E, G, A or Thai scale)
    // "วันเพ็ญเดือนสิบสอง น้ำนองเต็มตลิ่ง เราทั้งหลายชายหญิง สนุกกันจริงวันลอยกระทง..."
    // Note frequencies in Hz
    const N = {
      G3: 196.00, A3: 220.00, C4: 261.63, D4: 293.66, E4: 329.63,
      G4: 392.00, A4: 440.00, C5: 523.25, D5: 587.33, E5: 659.25,
      G5: 783.99, A5: 880.00, REST: 0
    };

    // Note sequence [note, duration in 16th beats]
    this.melody = [
      // วัน-เพ็ญ-เดือน-สิบ-สอง
      [N.G4, 2], [N.A4, 2], [N.C5, 2], [N.D5, 2], [N.E5, 4],
      // น้ำ-นอง-เต็ม-ตลิ่ง
      [N.D5, 2], [N.C5, 2], [N.A4, 2], [N.G4, 6],
      // เรา-ทั้ง-หลาย-ชาย-หญิง
      [N.G4, 2], [N.A4, 2], [N.C5, 2], [N.D5, 2], [N.E5, 4],
      // สนุก-กัน-จริง-วัน-ลอย-กระทง
      [N.D5, 2], [N.E5, 2], [N.D5, 2], [N.C5, 2], [N.A4, 2], [N.C5, 4],

      // ลอย ลอย กระทง (1)
      [N.E5, 3], [N.E5, 1], [N.E5, 2], [N.D5, 2], [N.C5, 4],
      // ลอย ลอย กระทง (2)
      [N.D5, 3], [N.D5, 1], [N.D5, 2], [N.C5, 2], [N.A4, 4],

      // ลอยกระทงกันแล้ว ขอเชิญน้องแก้วออกมารำวง
      [N.G4, 2], [N.A4, 2], [N.C5, 2], [N.D5, 2], [N.E5, 2], [N.D5, 2], [N.C5, 2], [N.A4, 2],
      // รำวงวันลอยกระทง
      [N.G4, 2], [N.A4, 2], [N.C5, 2], [N.D5, 2], [N.E5, 4],
      // รำวงวันลอยกระทง
      [N.D5, 2], [N.E5, 2], [N.D5, 2], [N.C5, 2], [N.A4, 2], [N.C5, 6],
      // บุญจะส่งให้เราสุขใจ
      [N.D5, 2], [N.E5, 2], [N.D5, 2], [N.C5, 2], [N.A4, 2], [N.G4, 2], [N.A4, 4], [N.C5, 4]
    ];
    this.currentMelodyStep = 0;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);

      // Music Channel
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.35;
      this.musicGain.connect(this.masterGain);

      // SFX Channel
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.5;
      this.sfxGain.connect(this.masterGain);

      // Ambient Channel
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0.25;
      this.ambientGain.connect(this.masterGain);

      this.isInitialized = true;
      this.startAmbient();
      this.startMusic();
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    if (!this.isInitialized) {
      this.init();
      return false;
    }
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  // ==========================================
  // THAI RANAT & KHONG WONG SYNTHESIZER
  // ==========================================
  playRanatNote(freq, time, duration) {
    if (!this.ctx || freq <= 0 || this.isMuted) return;

    // Ranat Ek has sharp wooden percussive attack + bright resonant wooden overtone
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);

    // 2nd harmonic overtone for resonant wooden timbre
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.76, time);

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.value = 0.3;
    osc2.connect(osc2Gain);
    osc2Gain.connect(gainNode);

    osc1.connect(gainNode);
    gainNode.connect(this.musicGain);

    // Fast mallet attack, wooden decay
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.4, time + 0.008);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.95);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);

    // Gentle Thai percussion (Ching/Klong) every few beats
    if (Math.random() < 0.4) {
      this.playChing(time + 0.05);
    }
  }

  playChing(time) {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2480, time);
    osc.connect(gain);
    gain.connect(this.musicGain);

    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.6);

    osc.start(time);
    osc.stop(time + 0.6);
  }

  startMusic() {
    if (!this.ctx || this.isPlayingMusic) return;
    this.isPlayingMusic = true;
    this.currentMelodyStep = 0;

    const tempo = 125; // BPM
    const beat16th = (60 / tempo) / 4;

    const stepMusic = () => {
      if (!this.isPlayingMusic || !this.ctx) return;
      const [freq, durationUnits] = this.melody[this.currentMelodyStep];
      const duration = durationUnits * beat16th;
      const now = this.ctx.currentTime;

      if (freq > 0) {
        this.playRanatNote(freq, now, duration);
      }

      this.currentMelodyStep = (this.currentMelodyStep + 1) % this.melody.length;
      this.musicTimer = setTimeout(stepMusic, duration * 1000);
    };

    stepMusic();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) clearTimeout(this.musicTimer);
  }

  // ==========================================
  // AMBIENT SOUND (Night crickets & River flow)
  // ==========================================
  startAmbient() {
    if (!this.ctx) return;

    // 1. River water noise generator
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02; // Pink noise
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const waterNoise = this.ctx.createBufferSource();
    waterNoise.buffer = noiseBuffer;
    waterNoise.loop = true;

    const waterFilter = this.ctx.createBiquadFilter();
    waterFilter.type = 'lowpass';
    waterFilter.frequency.value = 420;

    const waterGain = this.ctx.createGain();
    waterGain.gain.value = 0.12;

    waterNoise.connect(waterFilter);
    waterFilter.connect(waterGain);
    waterGain.connect(this.ambientGain);
    waterNoise.start();

    // 2. Night cricket chirps loop
    const cricketLoop = () => {
      if (!this.ctx) return;
      if (!this.isMuted && Math.random() < 0.7) {
        this.playCricket();
      }
      setTimeout(cricketLoop, 2000 + Math.random() * 3000);
    };
    cricketLoop();
  }

  playCricket() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(4600 + Math.random() * 400, t);
      gain.gain.setValueAtTime(0.015, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.ambientGain);
      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  // ==========================================
  // SOUND EFFECTS (SFX)
  // ==========================================

  // Fireworks: Launch whistle + Boom explosion + Sparkle crackle
  playFirework() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // 1. Whistle up
    const whistle = this.ctx.createOscillator();
    const whistleGain = this.ctx.createGain();
    whistle.type = 'sawtooth';
    whistle.frequency.setValueAtTime(300, now);
    whistle.frequency.exponentialRampToValueAtTime(1400, now + 0.7);

    whistleGain.gain.setValueAtTime(0.08, now);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    whistle.connect(whistleGain);
    whistleGain.connect(this.sfxGain);
    whistle.start(now);
    whistle.stop(now + 0.7);

    // 2. Boom explosion after 0.7s
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const boomTime = this.ctx.currentTime;

      // Deep boom
      const boomOsc = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      boomOsc.type = 'sine';
      boomOsc.frequency.setValueAtTime(150, boomTime);
      boomOsc.frequency.exponentialRampToValueAtTime(30, boomTime + 1.2);

      boomGain.gain.setValueAtTime(0.6, boomTime);
      boomGain.gain.exponentialRampToValueAtTime(0.001, boomTime + 1.2);

      boomOsc.connect(boomGain);
      boomGain.connect(this.sfxGain);
      boomOsc.start(boomTime);
      boomOsc.stop(boomTime + 1.2);

      // Crackles
      for (let i = 0; i < 8; i++) {
        const ct = boomTime + 0.15 + Math.random() * 0.8;
        const popOsc = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        popOsc.type = 'square';
        popOsc.frequency.setValueAtTime(600 + Math.random() * 1200, ct);
        popGain.gain.setValueAtTime(0.05, ct);
        popGain.gain.exponentialRampToValueAtTime(0.0001, ct + 0.04);
        popOsc.connect(popGain);
        popGain.connect(this.sfxGain);
        popOsc.start(ct);
        popOsc.stop(ct + 0.04);
      }
    }, 700);
  }

  // Temple Prayer Gong chime
  playTempleGong() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Resonant deep bell
    const freqs = [110, 225, 336, 448, 672];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      const amp = 0.25 / (idx + 1);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 3.5);
    });
  }

  // Water splash when krathong touches the river
  playWaterSplash() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Balloon pop sound
  playBalloonPop() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Coin or fortune sticks jingle
  playCoinClink() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    [1300, 1800, 2400].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.04;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  // Bamboo sticks clatter
  playBambooShake() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const t = now + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + Math.random() * 150, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.04);
    }
  }
}
