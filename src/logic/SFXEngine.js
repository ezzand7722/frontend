// Web Audio API Continuous Loud Beep & Voice Alarm Generator
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
 * Plays a single burst of loud emergency dual-frequency beeps.
 */
function playLoudBeepBurst() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const beeps = [
    { freq: 1100, time: 0.0, dur: 0.12 },
    { freq: 1450, time: 0.14, dur: 0.12 },
    { freq: 1100, time: 0.28, dur: 0.12 },
    { freq: 1600, time: 0.42, dur: 0.16 },
  ];

  beeps.forEach(({ freq, time, dur }) => {
    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, now + time);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(freq * 1.5, now + time);

      // Loud volume (0.75)
      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.75, now + time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now + time);
      osc2.start(now + time);
      osc1.stop(now + time + dur + 0.02);
      osc2.stop(now + time + dur + 0.02);
    } catch (e) {
      console.warn('[SFX] Beep synthesis error:', e);
    }
  });
}

/**
 * Speaks "DANGER! DANGER!" loudly and clearly.
 */
export function playDangerVoice(text = "Danger! Danger! Attack detected!") {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-US';
    msg.rate = 1.1;
    msg.pitch = 1.3;
    msg.volume = 1.0; // Max volume

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => 
      v.name.includes('Female') || 
      v.name.includes('Zira') || 
      v.name.includes('Google US English') ||
      v.lang === 'en-US'
    );
    if (voice) msg.voice = voice;

    window.speechSynthesis.speak(msg);
  } catch (e) {
    console.warn('[SFX] SpeechSynthesis error:', e);
  }
}

/**
 * Starts a CONTINUOUS loud beep and voice alarm loop that does NOT stop
 * until stopContinuousAlarm() is explicitly called (e.g. when user clicks X).
 */
export function startContinuousAlarm(voiceText = "Danger! Danger! Attack detected!") {
  if (isAlarmRunning) return;
  isAlarmRunning = true;

  // Immediate first burst
  playLoudBeepBurst();
  setTimeout(() => {
    if (isAlarmRunning) playDangerVoice(voiceText);
  }, 250);

  // Beep every 900ms continuously
  alarmInterval = setInterval(() => {
    if (!isAlarmRunning) return;
    playLoudBeepBurst();
  }, 900);

  // Repeat Danger voice alert every 4.5 seconds
  voiceInterval = setInterval(() => {
    if (!isAlarmRunning) return;
    playDangerVoice(voiceText);
  }, 4500);
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
 * One-shot helper for backward compatibility
 */
export function playBeepBeep(count = 3) {
  playLoudBeepBurst();
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