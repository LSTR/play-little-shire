// Tiny synthesized sound effects (WebAudio) — no audio assets needed.
let ctx = null;
let soundOn = localStorage.getItem('lme-sound') !== 'off';

export function isSoundOn() {
  return soundOn;
}

export function toggleSound() {
  soundOn = !soundOn;
  localStorage.setItem('lme-sound', soundOn ? 'on' : 'off');
  return soundOn;
}

function beep(freq, dur, type = 'sine', vol = 0.16, delay = 0) {
  if (!soundOn) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  } catch (e) {
    /* audio unavailable — play silently */
  }
}

export const sfx = {
  click() { beep(520, 0.08, 'triangle', 0.14); },
  flip() { beep(340, 0.07, 'sine', 0.12); },
  match() { beep(523, 0.1, 'triangle', 0.18); beep(784, 0.16, 'triangle', 0.18, 0.09); },
  miss() { beep(196, 0.18, 'sine', 0.1); },
  pop() { beep(880, 0.06, 'triangle', 0.14); },
  lock() { beep(140, 0.12, 'square', 0.05); },
  win() { [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.22, 'triangle', 0.16, i * 0.13)); },
  roar() { beep(95, 0.35, 'sawtooth', 0.2); beep(70, 0.45, 'sawtooth', 0.15, 0.06); },
};
