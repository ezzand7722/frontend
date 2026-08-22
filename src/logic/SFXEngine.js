// Web Audio API Beep Generator
let audioCtx = null;

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
 * Plays a double/triple high-tech alert "beep beep" sound using Web Audio API oscillators.
 */
export function playBeepBeep(count = 3) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  for (let i = 0; i < count; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(i % 2 === 0 ? 980 : 1240, now + i * 0.14);

    gain.gain.setValueAtTime(0, now + i * 0.14);
    gain.gain.linearRampToValueAtTime(0.25, now + i * 0.14 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.14);
    osc.stop(now + i * 0.14 + 0.12);
  }
}

/**
 * Speaks "DANGER! DANGER!" with synthesized cybersecurity alert speech.
 */
export function playDangerVoice(text = "Danger! Danger! Attack detected!") {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-US';
    msg.rate = 1.05;
    msg.pitch = 1.25;

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
 * Combines "beep beep" audio sound effect with "DANGER! DANGER!" voice.
 */
export function playAttackAlertSound(customText) {
  playBeepBeep(3);
  setTimeout(() => {
    playDangerVoice(customText || "Danger! Danger! Attack detected!");
  }, 220);
}

class CinematicSFX {
  constructor() {
    this.alarm = new Audio('https://actions.google.com/sounds/v1/alarms/mechanical_clock_ringing_loop.ogg');
    this.typeSound = new Audio('https://actions.google.com/sounds/v1/scifi/beep_scifi_short.ogg');
    this.alarm.loop = true;
  }

  announceAttack() {
    playDangerVoice("Danger! Danger! Attack detected on Dahua camera!");
  }

  playAlarm() {
    playBeepBeep(4);
    this.alarm.play().catch(() => {});
    this.announceAttack();
  }

  stopAll() {
    this.alarm.pause();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  playType() {
    const s = this.typeSound.cloneNode();
    s.volume = 0.2;
    s.play().catch(() => {});
  }
}

export const sfx = new CinematicSFX();

export const playAlarm = () => {
  playAttackAlertSound("Danger! Danger! Attack detected on Dahua camera!");
};

export const stopAlarm = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};