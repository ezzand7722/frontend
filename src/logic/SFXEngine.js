// Web Audio API Warzone Horn ("TOOOT TOOOOT TOOOOT") & Female Voice Alarm
let audioCtx = null;
let alarmInterval = null;
let voiceInterval = null;
let isAlarmRunning = false;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Finds a woman's voice across all platforms (Windows Zira, macOS Samantha, Google US/UK Female, etc.)
 */
function getFemaleVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const femaleKeywords = [
    'female', 'zira', 'samantha', 'victoria', 'karen', 
    'susan', 'hazel', 'catherine', 'helena', 'jenny', 
    'aria', 'sarah', 'eva', 'serena', 'google uk english female'
  ];
  for (const kw of femaleKeywords) {
    const found = voices.find(v => v.name.toLowerCase().includes(kw));
    if (found) return found;
  }
  return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
}

// Pre-load voices on browser ready
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    getFemaleVoice();
  };
}

/**
 * Plays a loud, heavy Warzone Siren / Defense Horn: "TOOOT! TOOOOT! TOOOOT!"
 * Uses multi-oscillator synthesis (Sub-bass + Sawtooth + Square) with filter resonance.
 */
function playWarzoneHornBurst() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Three heavy horn blasts: TOOOT (0.35s) - pause (0.12s) - TOOOT (0.35s) - pause (0.12s) - TOOOOT (0.55s)
  const blasts = [
    { start: 0.00, dur: 0.35, freqStart: 460, freqEnd: 500 },
    { start: 0.46, dur: 0.35, freqStart: 460, freqEnd: 500 },
    { start: 0.92, dur: 0.55, freqStart: 460, freqEnd: 540 },
  ];

  blasts.forEach(({ start, dur, freqStart, freqEnd }) => {
    try {
      const t0 = now + start;
      const t1 = t0 + dur;

      // 1. Fundamental Sawtooth horn
      const oscSaw = ctx.createOscillator();
      oscSaw.type = 'sawtooth';
      oscSaw.frequency.setValueAtTime(freqStart, t0);
      oscSaw.frequency.exponentialRampToValueAtTime(freqEnd, t1);

      // 2. Square harmonic (fifth above for aggressive horn edge)
      const oscSquare = ctx.createOscillator();
      oscSquare.type = 'square';
      oscSquare.frequency.setValueAtTime(freqStart * 1.5, t0);
      oscSquare.frequency.exponentialRampToValueAtTime(freqEnd * 1.5, t1);

      // 3. Sub-bass rumble (sub octave 0.5x for massive chest punch)
      const oscSub = ctx.createOscillator();
      oscSub.type = 'triangle';
      oscSub.frequency.setValueAtTime(freqStart * 0.5, t0);
      oscSub.frequency.exponentialRampToValueAtTime(freqEnd * 0.5, t1);

      // Resonant Lowpass Filter (shapes the acoustic horn body)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, t0);
      filter.Q.setValueAtTime(4.0, t0);

      // Master Gain for this blast (LOUD: 0.85)
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.85, t0 + 0.04);
      gain.gain.setValueAtTime(0.85, t1 - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t1);

      // Routing
      oscSaw.connect(filter);
      oscSquare.connect(filter);
      oscSub.connect(gain);
      filter.connect(gain);
      gain.connect(ctx.destination);

      // Trigger
      oscSaw.start(t0);
      oscSquare.start(t0);
      oscSub.start(t0);

      oscSaw.stop(t1 + 0.02);
      oscSquare.stop(t1 + 0.02);
      oscSub.stop(t1 + 0.02);
    } catch (e) {
      console.warn('[SFX] Warzone horn synthesis error:', e);
    }
  });
}

/**
 * Speaks "DANGER! DANGER!" in a clear, authoritative woman's voice.
 */
export function playDangerVoice(text = "Danger! Danger! Attack detected!") {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-US';
    msg.rate = 1.05;
    msg.pitch = 1.35; // Distinctive woman's pitch
    msg.volume = 1.0; // Max volume

    const femaleVoice = getFemaleVoice();
    if (femaleVoice) {
      msg.voice = femaleVoice;
    }

    window.speechSynthesis.speak(msg);
  } catch (e) {
    console.warn('[SFX] SpeechSynthesis error:', e);
  }
}

/**
 * Starts a CONTINUOUS loud Warzone horn ("TOOOT TOOOOT TOOOOT") and female voice alarm loop
 * that will NOT stop until stopContinuousAlarm() is explicitly called (when user clicks [✕]).
 */
export function startContinuousAlarm(voiceText = "Danger! Danger! Attack detected!") {
  if (isAlarmRunning) return;
  isAlarmRunning = true;

  // 1. Immediate first Warzone Horn burst ("TOOOT TOOOOT TOOOOT")
  playWarzoneHornBurst();

  // 2. Woman's voice speaks "Danger! Danger!" right as horn finishes first blast
  setTimeout(() => {
    if (isAlarmRunning) playDangerVoice(voiceText);
  }, 1600);

  // 3. Repeat the Warzone Horn blast every 3.8 seconds continuously
  alarmInterval = setInterval(() => {
    if (!isAlarmRunning) return;
    playWarzoneHornBurst();
  }, 3800);

  // 4. Repeat Woman's Danger voice alert every 4.2 seconds
  voiceInterval = setInterval(() => {
    if (!isAlarmRunning) return;
    playDangerVoice(voiceText);
  }, 4200);
}

/**
 * Stops the continuous alarm immediately.
 */
export function stopContinuousAlarm() {
  isAlarmRunning = false;

  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }

  if (voiceInterval) {
    clearInterval(voiceInterval);
    voiceInterval = null;
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Backward compatibility helpers
 */
export function playBeepBeep(count = 3) {
  playWarzoneHornBurst();
}

export function playAttackAlertSound(customText) {
  startContinuousAlarm(customText);
}

class CinematicSFX {
  constructor() {
    this.alarm = new Audio('https://actions.google.com/sounds/v1/alarms/mechanical_clock_ringing_loop.ogg');
    this.typeSound = new Audio('https://actions.google.com/sounds/v1/scifi/beep_scifi_short.ogg');
    this.alarm.loop = true;
  }

  playAlarm() {
    startContinuousAlarm();
  }

  stopAll() {
    stopContinuousAlarm();
    this.alarm.pause();
  }

  playType() {
    const s = this.typeSound.cloneNode();
    s.volume = 0.2;
    s.play().catch(() => {});
  }
}

export const sfx = new CinematicSFX();
export const playAlarm = () => startContinuousAlarm();
export const stopAlarm = () => stopContinuousAlarm();