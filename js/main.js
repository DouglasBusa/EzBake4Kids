// EzBake4Kids: app shell + screen state machine.
import { loadManifest, preloadAll, artNode, hasArt } from './assets.js';
import { unlock, sfx, speak, isMuted, setMuted } from './audio.js';
import { CUES, PRAISE } from './data.js';
import { el, place, setScale, rectOf, sparkles, wait, onTap } from './ui.js';
import { setStageScale, iconCanvas, drawMomo, starPath } from './draw.js';
import * as Home from './steps/home.js';
import * as Choose from './steps/choose.js';
import * as Ingredients from './steps/ingredients.js';
import * as Liners from './steps/liners.js';
import * as Color from './steps/color.js';
import * as Bake from './steps/bake.js';
import * as Decorate from './steps/decorate.js';
import * as Plate from './steps/plate.js';
import * as Carrier from './steps/carrier.js';
import * as CarrierDecor from './steps/carrierDecor.js';
import * as ShowOff from './steps/showoff.js';
import * as Gallery from './steps/gallery.js';

const SCREENS = {
  HOME: Home, STEP1_CHOOSE: Choose, STEP2_INGREDIENTS: Ingredients, STEP3_LINERS: Liners,
  STEP4_COLOR: Color, STEP5_BAKE: Bake, STEP6_DECORATE: Decorate, STEP7_PLATE: Plate,
  STEP8_CARRIER: Carrier, STEP9_DECORATE_CARRIER: CarrierDecor, SHOWOFF: ShowOff, GALLERY: Gallery
};
const STEPS = ['STEP1_CHOOSE', 'STEP2_INGREDIENTS', 'STEP3_LINERS', 'STEP4_COLOR', 'STEP5_BAKE', 'STEP6_DECORATE', 'STEP7_PLATE', 'STEP8_CARRIER', 'STEP9_DECORATE_CARRIER'];
const TRAIL_ART = ['trail-01-choose', 'trail-02-ingredients', 'trail-03-liners', 'trail-04-batter', 'trail-05-bake', 'trail-06-decorate', 'trail-07-plate', 'trail-08-carrier', 'trail-09-decorate-carrier'];
const BG = {
  HOME: 'bg-home', STEP1_CHOOSE: 'bg-kitchen-counter', STEP2_INGREDIENTS: 'bg-kitchen-counter', STEP3_LINERS: 'bg-kitchen-counter',
  STEP4_COLOR: 'bg-kitchen-counter', STEP5_BAKE: 'bg-oven-wall', STEP6_DECORATE: 'bg-decorating-table', STEP7_PLATE: 'bg-dining-table',
  STEP8_CARRIER: 'bg-picnic-park', STEP9_DECORATE_CARRIER: 'bg-picnic-park', SHOWOFF: 'bg-show-off-stage', GALLERY: 'bg-gallery'
};

// ---- the single creation state object ----
export function newCreation() {
  return { recipe: null, ingredientsDone: false, liner: null, linedCups: 0, color: null, bakeResult: null,
    decorations: [], plate: null, carrier: null, carrierDecor: [], createdAt: null };
}
const app = { screen: null, mod: null, inst: null, C: newCreation(), done: false, lastProgress: 0, hintShown: false, assisted: false };
window.__ezbake = app; // handy for tests

export function nextOf(s) {
  if (s === 'HOME') return 'STEP1_CHOOSE';
  if (s === 'STEP2_INGREDIENTS') return app.C.recipe === 'cupcakes' ? 'STEP3_LINERS' : 'STEP4_COLOR';
  if (s === 'STEP9_DECORATE_CARRIER') return 'SHOWOFF';
  const i = STEPS.indexOf(s);
  return STEPS[i + 1];
}
export function prevOf(s) {
  if (s === 'STEP1_CHOOSE') return 'HOME';
  if (s === 'STEP4_COLOR') return app.C.recipe === 'cupcakes' ? 'STEP3_LINERS' : 'STEP2_INGREDIENTS';
  const i = STEPS.indexOf(s);
  return i > 0 ? STEPS[i - 1] : 'HOME';
}
const visibleSteps = () => STEPS.filter(s => s !== 'STEP3_LINERS' || app.C.recipe === 'cupcakes' || app.C.recipe === null);

// ---- layout / scaling ----
const stage = document.getElementById('stage');
function fit() {
  const s = Math.min(window.innerWidth / 1024, window.innerHeight / 576);
  stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  setScale(s); setStageScale(s);
}
window.addEventListener('resize', fit); fit();
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
const applyRM = () => document.body.classList.toggle('rm', mq.matches);
applyRM(); mq.addEventListener && mq.addEventListener('change', applyRM);

// ---- backgrounds: best raster size for the viewport, webp then png then svg ----
const bgEl = document.getElementById('bg');
let bgToken = 0;
function setBackground(name) {
  const tok = ++bgToken;
  const big = window.innerWidth * (window.devicePixelRatio || 1) > 2000;
  const size = big ? '2560x1440' : '1920x1080';
  const tries = [`assets/art/backgrounds/webp/${name}-${size}.webp`, `assets/art/backgrounds/png/${name}-${size}.png`, `assets/art/backgrounds/svg/${name}.svg`];
  const attempt = i => {
    if (i >= tries.length) { bgEl.style.backgroundImage = ''; return; }
    const img = new Image();
    img.onload = () => { if (tok === bgToken) bgEl.style.backgroundImage = `url("${tries[i]}")`; };
    img.onerror = () => attempt(i + 1);
    img.src = tries[i];
  };
  bgEl.dataset.bg = name;
  attempt(0);
}

// ---- HUD ----
const hud = document.getElementById('hud');
const screenRoot = document.getElementById('screen');
const fx = document.getElementById('fx');
function hudButton(id, label, x, y, size, draw, handler) {
  const b = el('button', 'btn hud-btn', hud, { 'aria-label': label, type: 'button' });
  place(b, x, y, size, size);
  b.appendChild(artNode(id, () => iconCanvas(size, draw), size, size));
  onTap(b, handler);
  return b;
}
const circle = (c, x, y, s, col) => { c.beginPath(); c.arc(x, y, s * 0.46, 0, Math.PI * 2); c.fillStyle = col; c.fill(); c.lineWidth = s * 0.04; c.strokeStyle = '#6B4A3A'; c.stroke(); };
const arrow = (c, x, y, s, dir) => { c.beginPath(); c.moveTo(x - dir * s * 0.18, y - s * 0.2); c.lineTo(x + dir * s * 0.16, y); c.lineTo(x - dir * s * 0.18, y + s * 0.2); c.lineWidth = s * 0.1; c.lineCap = c.lineJoin = 'round'; c.strokeStyle = '#fff'; c.stroke(); };
const backBtn = hudButton('btn-back', 'Back', 16, 8, 96, (c, x, y, s) => { circle(c, x, y, s, '#A9D8F5'); arrow(c, x, y, s, -1); }, () => { sfx('pop'); go(prevOf(app.screen), { back: true }); });
const speakerBtn = hudButton('btn-speaker', 'Hear it again', 792, 8, 96, (c, x, y, s) => { circle(c, x, y, s, '#FFE98A'); c.fillStyle = '#6B4A3A'; c.fillRect(x - s * 0.2, y - s * 0.08, s * 0.12, s * 0.16); c.beginPath(); c.moveTo(x - s * 0.1, y - s * 0.08); c.lineTo(x + s * 0.06, y - s * 0.2); c.lineTo(x + s * 0.06, y + s * 0.2); c.lineTo(x - s * 0.1, y + s * 0.08); c.fill(); c.lineWidth = s * 0.04; c.strokeStyle = '#6B4A3A'; c.beginPath(); c.arc(x + s * 0.08, y, s * 0.14, -0.8, 0.8); c.stroke(); }, () => { unlock(); playCue(true); });
const muteBtn = el('button', 'btn hud-btn mute', hud, { type: 'button' });
place(muteBtn, 912, 8, 96, 96);
function drawMute() {
  muteBtn.innerHTML = '';
  muteBtn.setAttribute('aria-label', isMuted() ? 'Sound on' : 'Sound off');
  muteBtn.appendChild(iconCanvas(96, (c, x, y, s) => {
    circle(c, x, y, s, isMuted() ? '#E6E0DA' : '#B8E8D2');
    c.fillStyle = '#6B4A3A'; [-0.16, 0, 0.16].forEach((dx, i) => { c.beginPath(); c.ellipse(x + dx * s, y + s * 0.12, s * 0.06, s * 0.045, 0, 0, Math.PI * 2); c.fill(); c.fillRect(x + dx * s + s * 0.05, y - s * 0.18, s * 0.025, s * 0.3); });
    if (isMuted()) { c.strokeStyle = '#FF7F7F'; c.lineWidth = s * 0.08; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - s * 0.26, y - s * 0.26); c.lineTo(x + s * 0.26, y + s * 0.26); c.stroke(); }
  }));
}
drawMute();
onTap(muteBtn, () => { unlock(); setMuted(!isMuted()); drawMute(); if (!isMuted()) sfx('pop'); });
const momoBox = el('div', 'momo-guide', hud, { 'aria-hidden': 'true' });
place(momoBox, 124, 8, 96, 96);
const momoCanvas = iconCanvas(96, (c, x, y, s) => drawMomo(c, x, y, s * 0.95, 'idle'));
momoBox.appendChild(momoCanvas);
const bubble = el('div', 'bubble', hud, { 'aria-live': 'polite' });
const trail = el('div', 'trail', hud, { 'aria-hidden': 'true' });
place(trail, 228, 20, 556, 72);
const nextBtn = hudButton('btn-next', 'Next', 896, 456, 112, (c, x, y, s) => { circle(c, x, y, s, '#7CCF8A'); arrow(c, x, y, s, 1); }, () => onNext());
nextBtn.classList.add('next');
const hand = el('div', 'hint-hand', fx, { 'aria-hidden': 'true' });
hand.appendChild(artNode('hint-hand', () => iconCanvas(96, (c, x, y, s) => {
  c.beginPath(); c.ellipse(x, y + s * 0.12, s * 0.2, s * 0.24, 0, 0, Math.PI * 2); c.fillStyle = '#FFE2CC'; c.fill(); c.strokeStyle = '#6B4A3A'; c.lineWidth = 3; c.stroke();
  c.beginPath(); c.roundRect(x - s * 0.06, y - s * 0.4, s * 0.12, s * 0.4, s * 0.06); c.fill(); c.stroke();
}), 96, 96));

function renderTrail() {
  trail.innerHTML = '';
  const steps = visibleSteps();
  const cur = steps.indexOf(app.screen);
  steps.forEach((s, i) => {
    const d = el('div', 'trail-dot' + (i === cur ? ' current' : '') + (i < cur ? ' done' : ''), trail);
    const n = STEPS.indexOf(s);
    d.appendChild(artNode(TRAIL_ART[n], () => iconCanvas(48, (c, x, y, sz) => { c.beginPath(); c.arc(x, y, sz * 0.42, 0, Math.PI * 2); c.fillStyle = ['#F7A8C0', '#A9D8F5', '#CDB8F0', '#FFE98A', '#FFB36B', '#B8E8D2', '#FF9C9C', '#E0B07A', '#A9D8F5'][n]; c.fill(); c.fillStyle = '#6B4A3A'; c.font = `bold ${sz * 0.42}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n + 1), x, y + 1); }), 48, 48));
    if (i < cur) { const st = el('div', 'badge', d); st.appendChild(artNode('trail-done-badge', () => iconCanvas(26, (c, x, y, sz) => { starPath(c, x, y, sz); c.fillStyle = '#FFD84A'; c.fill(); c.strokeStyle = '#6B4A3A'; c.lineWidth = 1.5; c.stroke(); }), 26, 26)); }
  });
}

// ---- voice cue + bubble ----
let cueText = '';
function say(text, { bubbleOnly = false } = {}) {
  bubble.textContent = text;
  bubble.classList.remove('show'); void bubble.offsetWidth; bubble.classList.add('show');
  momoBox.classList.remove('talk'); void momoBox.offsetWidth; momoBox.classList.add('talk');
  if (!bubbleOnly) speak(text);
}
function playCue(replay) {
  if (!cueText) return;
  say(cueText);
  if (isMuted()) showHand(2600); // muted: an animated hand demonstrates instead
  if (replay) app.lastProgress = performance.now();
}

// ---- hint hand & auto-assist ----
let handTimer = null;
function showHand(ms) {
  const t = app.done ? nextBtn : app.inst && app.inst.hintTarget && app.inst.hintTarget();
  if (!t || !t.isConnected) return;
  const r = rectOf(t);
  place(hand, r.cx - 30, r.cy - 10, 96, 96);
  hand.classList.add('show');
  clearTimeout(handTimer);
  if (ms) handTimer = setTimeout(hideHand, ms);
}
function hideHand() { hand.classList.remove('show'); app.hintShown = false; }
setInterval(() => {
  if (!app.inst || app.screen === 'HOME' || app.screen === 'SHOWOFF' || app.screen === 'GALLERY') return;
  const idle = performance.now() - app.lastProgress;
  if (idle > 8000 && !app.hintShown) {
    app.hintShown = true; showHand();
    say(app.done ? 'Tap the green arrow!' : (app.inst.hint || CUES[app.screen].hint));
  }
  if (!app.done && app.inst.skill && idle > 20000 && !app.assisted) {
    app.assisted = true; hideHand();
    say("Let's do it together!");
    app.inst.autoComplete();
  }
}, 400);

// ---- step api given to each screen ----
function makeApi() {
  return {
    C: app.C,
    progress() { app.lastProgress = performance.now(); if (app.hintShown) hideHand(); app.assisted = false; },
    complete({ quiet = false } = {}) {
      if (app.done) return;
      app.done = true; app.lastProgress = performance.now(); hideHand();
      nextBtn.classList.add('show');
      if (!quiet) { sfx('chime'); const r = rectOf(nextBtn); sparkles(r.cx, r.cy, 6, 50); }
    },
    uncomplete() { app.done = false; nextBtn.classList.remove('show'); },
    isDone: () => app.done,
    say, sfx, speak,
    setCue(text, hint) { cueText = text; if (hint) app.inst.hint = hint; say(text); app.lastProgress = performance.now(); app.assisted = false; if (isMuted()) showHand(2600); },
    go, next: onNext, newCreation,
    resetCreation() { app.C = newCreation(); this.C = app.C; }
  };
}

async function onNext() {
  if (!app.done || app.leaving) return;
  app.leaving = true;
  const p = (app.inst && app.inst.praise) || PRAISE[Math.floor(Math.random() * PRAISE.length)];
  sfx('cheer');
  showPraise(p);
  speak(p);
  await wait(900);
  app.leaving = false;
  go(nextOf(app.screen));
}
const praiseEl = el('div', 'praise', fx, { 'aria-live': 'polite' });
function showPraise(text) {
  praiseEl.textContent = text;
  praiseEl.classList.remove('show'); void praiseEl.offsetWidth; praiseEl.classList.add('show');
  sparkles(512, 260, 14, 160);
}

// ---- the state machine ----
export function go(screen, { back = false } = {}) {
  if (!SCREENS[screen]) return;
  try { app.inst && app.inst.exit && app.inst.exit(); } catch (e) { console.warn(e); }
  screenRoot.innerHTML = '';
  fx.querySelectorAll('.ghost, .spark, .tmp').forEach(n => n.remove());
  hideHand();
  app.screen = screen; app.mod = SCREENS[screen]; app.done = false; app.hintShown = false; app.assisted = false;
  nextBtn.classList.remove('show');
  const inFlow = STEPS.includes(screen);
  document.body.dataset.screen = screen;
  hud.classList.toggle('in-flow', inFlow);
  backBtn.style.display = inFlow ? '' : 'none';
  trail.style.display = inFlow ? '' : 'none';
  momoBox.style.display = inFlow ? '' : 'none';
  if (inFlow) renderTrail();
  setBackground(BG[screen]);
  cueText = CUES[screen] ? CUES[screen].cue : '';
  const api = makeApi();
  app.inst = app.mod.create(api);
  app.inst.hint = app.inst.hint || (CUES[screen] && CUES[screen].hint);
  const view = el('div', 'view view-' + screen.toLowerCase(), screenRoot);
  app.inst.enter(view, app.C, api);
  app.lastProgress = performance.now();
  if (app.inst.isComplete && app.inst.isComplete()) api.complete({ quiet: true });
  if (!app.inst.customCue) playCue();
}

// ---- boot ----
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());
document.addEventListener('gesturestart', e => e.preventDefault());
window.addEventListener('pointerdown', () => unlock(), { once: false, passive: true });
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  // When an update takes over, reload once so players get the new version right away.
  let reloaded = false;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController && !reloaded) { reloaded = true; location.reload(); } });
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
loadManifest().then(() => preloadAll()).then(() => go(app.screen || 'HOME'));
