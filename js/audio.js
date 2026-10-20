// Web Audio: separate gain buses for music, SFX and voice. All sounds are
// synthesized on-device (no files, no network). Voice uses the device's own
// speech engine, preferring offline (localService) voices.
let ac = null, master, bus = {};
let muted = false;
try { muted = localStorage.getItem('ezbake.muted') === '1'; } catch (e) {}
const VOL = { music: 0.05, sfx: 0.35, voice: 0.9 };
let musicTimer = null;

export const isMuted = () => muted;

export function unlock() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.8; master.connect(ac.destination);
    for (const k of ['music', 'sfx', 'voice']) { bus[k] = ac.createGain(); bus[k].gain.value = VOL[k]; bus[k].connect(master); }
  }
  if (ac.state === 'suspended') ac.resume();
  if (!musicTimer) startMusic();
}

export function setMuted(m) {
  muted = m;
  try { localStorage.setItem('ezbake.muted', m ? '1' : '0'); } catch (e) {}
  if (master) master.gain.setTargetAtTime(m ? 0 : 0.8, ac.currentTime, 0.05);
  if (m && window.speechSynthesis) speechSynthesis.cancel();
}

function tone(freq, dur, { type = 'sine', vol = 1, to = null, at = 0, out = 'sfx' } = {}) {
  if (!ac || muted) return;
  const t = ac.currentTime + at;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bus[out]); o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur, { vol = 0.5, freq = 1200, q = 1, at = 0, sweep = null } = {}) {
  if (!ac || muted) return;
  const t = ac.currentTime + at;
  const len = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(); src.buffer = buf;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
  if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
  const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(bus.sfx); src.start(t);
}

const SFX = {
  ding: () => { tone(1320, 0.6, { vol: 0.5 }); tone(1980, 0.5, { vol: 0.2, at: 0.01 }); },
  chime: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.35, { vol: 0.35, at: i * 0.08 })),
  pop: () => tone(600, 0.12, { to: 1200, vol: 0.5 }),
  boing: () => tone(300, 0.25, { to: 600, vol: 0.4, type: 'triangle' }),
  crack: () => noise(0.08, { vol: 0.8, freq: 2500, q: 2 }),
  plop: () => tone(500, 0.18, { to: 140, vol: 0.6 }),
  pour: () => noise(0.7, { vol: 0.35, freq: 900, q: 0.7, sweep: 500 }),
  fwip: () => noise(0.2, { vol: 0.5, freq: 600, q: 1.5, sweep: 3000 }),
  clink: () => { tone(1800, 0.25, { vol: 0.3 }); tone(2400, 0.2, { vol: 0.2, at: 0.03 }); },
  tick: () => tone(1100, 0.04, { vol: 0.25, type: 'square' }),
  rattle: () => { for (let i = 0; i < 4; i++) noise(0.04, { vol: 0.3, freq: 3500, q: 3, at: i * 0.05 }); },
  click: () => { noise(0.05, { vol: 0.6, freq: 4000, q: 1 }); tone(1500, 0.05, { vol: 0.2, at: 0.06 }); },
  squish: () => noise(0.25, { vol: 0.25, freq: 400, q: 2, sweep: 250 }),
  stamp: () => tone(220, 0.15, { to: 110, vol: 0.5, type: 'triangle' }),
  cheer: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, { vol: 0.3, at: i * 0.07, type: 'triangle' })),
  sparkle: () => [1568, 2093, 2637].forEach((f, i) => tone(f, 0.2, { vol: 0.12, at: i * 0.05 }))
};
const last = {};
export function sfx(name, minGap = 0) {
  const now = performance.now();
  if (minGap && last[name] && now - last[name] < minGap) return;
  last[name] = now;
  try { SFX[name] && SFX[name](); } catch (e) {}
}

// Gentle music: soft pentatonic music-box notes on the music bus.
function startMusic() {
  const notes = [523, 587, 659, 784, 880, 784, 659, 587];
  let i = 0;
  musicTimer = setInterval(() => {
    if (!ac || muted || document.hidden) return;
    tone(notes[i % notes.length], 1.1, { vol: 0.6, out: 'music' });
    if (i % 4 === 0) tone(notes[i % notes.length] / 2, 1.6, { vol: 0.4, out: 'music' });
    i++;
  }, 650);
}

let voice = null;
function pickVoice() {
  const vs = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  const en = vs.filter(v => /^en/i.test(v.lang));
  voice = en.find(v => v.localService) || vs.find(v => v.localService) || null;
}
if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

// Spoken voice cues are off for now (Dougie's call); flip to true to bring them back.
const VOICE_ON = false;

export function speak(text) {
  if (!VOICE_ON || muted || !text || !window.speechSynthesis) return false;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.rate = 1.0; u.pitch = 1.35; u.volume = VOL.voice;
    // duck the music under the voice so cues stay clear
    u.onstart = () => bus.music && bus.music.gain.setTargetAtTime(VOL.music * 0.3, ac.currentTime, 0.1);
    u.onend = u.onerror = () => bus.music && bus.music.gain.setTargetAtTime(VOL.music, ac.currentTime, 0.3);
    speechSynthesis.speak(u);
    return true;
  } catch (e) { return false; }
}
