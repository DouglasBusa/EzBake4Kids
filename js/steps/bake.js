import { mapPt, fxArt, el, place, artButton, rectOf, sparkles, toLocal, wait, onTap } from '../ui.js';
import { CUTTERS } from '../data.js';
import { mkCanvas, iconCanvas, drawCupcake, drawCookie, shapePath, treatCanvas, batterFill } from '../draw.js';
import { artNode } from '../assets.js';
import { sfx } from '../audio.js';
import { CUPS, drawTin } from './liners.js';

const MIN = 0.5, MAX = 1.0;

export function create(api) {
  let root, C, sub = null, area, fills = [], cupEls = [], holding = -1, raf = 0, shapes = [], cutter = null;
  const TRAY_P = { x: 190, y: 690 };
  let trayEl = null;
  let cutterBtns = {}, dough, slots = [], oven, dial, ovenImg, windowBox, timers = [], ended = false;
  const T = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const offs = [];
  const on = (t, ev, fn) => { t.addEventListener(ev, fn); offs.push(() => t.removeEventListener(ev, fn)); };

  // ---------------- FILL (cupcakes) ----------------
  function drawCup(i) {
    const c = cupEls[i].cv; c.clear();
    drawCupcake(c.ctx, 60, 64, 112, { liner: C.liner || 'dots', color: C.color || 'vanilla', fill: fills[i], baked: false });
    cupEls[i].el.classList.toggle('fluffy', fills[i] >= MAX);
  }
  function startFill() {
    sub = 'FILL';
    api.setCue('Hold on a cup to fill it!', 'Press and hold a cup!');
    area = el('div', 'sub', root); area.style.inset = '0'; area.style.position = 'absolute';
    drawTin(area);
    fills = fills.length ? fills : [0, 0, 0, 0, 0, 0];
    cupEls = CUPS.map((p, i) => {
      const d = el('div', 'cup fillcup', area, { role: 'button', 'aria-label': 'Fill cup ' + (i + 1) });
      place(d, p.cx - 60, p.cy - 66, 120, 128);
      const cv = mkCanvas(120, 128); d.appendChild(cv);
      return { el: d, cv };
    });
    cupEls.forEach((_, i) => drawCup(i));
    const bag = el('div', 'piping tmp', document.getElementById('fx'), { 'aria-hidden': 'true' });
    bag.appendChild(artNode('tool-piping-bag', () => iconCanvas(110, (c, x, y, s) => { c.beginPath(); c.moveTo(x - s * 0.3, y - s * 0.4); c.lineTo(x + s * 0.3, y - s * 0.4); c.lineTo(x, y + s * 0.4); c.closePath(); c.fillStyle = '#FFF4E0'; c.fill(); c.strokeStyle = '#6B4A3A'; c.lineWidth = 3; c.stroke(); }), 110, 110));
    place(bag, 0, 0, 110, 110); bag.style.display = 'none';
    let last = 0;
    const tick = t => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
      if (holding < 0) return;
      api.progress();
      if (fills[holding] < MAX) { fills[holding] = Math.min(MAX, fills[holding] + dt * 0.6); drawCup(holding); sfx('squish', 300); }
    };
    raf = requestAnimationFrame(tick);
    on(root, 'pointerdown', e => {
      if (sub !== 'FILL') return;
      const p = toLocal(e);
      let best = -1, bd = 95; // generous hold zone around each cup
      CUPS.forEach((c0, i) => { const c = mapPt(c0.cx, c0.cy); const d = Math.hypot(c.x - p.x, c.y - p.y); if (d < bd) { bd = d; best = i; } });
      if (best < 0) return;
      holding = best; e.preventDefault();
      bag.style.display = ''; { const m = mapPt(CUPS[best].cx, CUPS[best].cy); bag.style.transform = `translate(${m.x - 40}px, ${m.y - 150}px)`; }
    });
    const release = () => {
      if (holding < 0) return;
      const i = holding; holding = -1; bag.style.display = 'none';
      if (fills[i] < MIN) topUp(i); else checkFilled();
    };
    on(window, 'pointerup', release); on(window, 'pointercancel', release);
  }
  function topUp(i) { // released early: gently top up to the minimum by itself
    const step = () => { if (ended) return; fills[i] = Math.min(MIN, fills[i] + 0.03); drawCup(i); if (fills[i] < MIN) T(step, 30); else checkFilled(); };
    step();
  }
  function checkFilled() {
    if (sub !== 'FILL' || holding >= 0) return;
    if (fills.every(f => f >= MIN)) { sub = 'FILLED'; sfx('sparkle'); cupEls.forEach(c => { const r = rectOf(c.el); sparkles(r.cx, r.cy, 4, 40); }); T(() => toOven(), 800); }
  }

  // ---------------- CUT (cookies) ----------------
  function drawDough() {
    const c = dough.cv; c.clear();
    c.ctx.beginPath(); c.ctx.roundRect(10, 10, 380, 280, 60);
    c.ctx.fillStyle = batterFill(c.ctx, C.color || 'vanilla', 0, 0, 400, 300); c.ctx.fill();
    c.ctx.lineWidth = 5; c.ctx.strokeStyle = 'rgba(107,74,58,.45)'; c.ctx.stroke();
  }
  function startCut() {
    sub = 'CUT';
    api.setCue('Tap a cutter, then tap the dough!', 'Tap the dough!');
    area = el('div', 'sub', root); area.style.cssText = 'position:absolute;inset:0';
    dough = el('div', 'dough', area, { role: 'button', 'aria-label': 'Cookie dough' });
    place(dough, 150, 140, 400, 300);
    dough.cv = mkCanvas(400, 300); dough.appendChild(dough.cv); drawDough();
    const tray = el('div', 'tray', area, { 'aria-hidden': 'true' });
    place(tray, 600, 150, 400, 300, TRAY_P);
    tray.appendChild(artNode('tray-cookie', () => iconCanvas(400, c => { c.beginPath(); c.roundRect(4, 54, 392, 292, 30); c.fillStyle = '#C9D6E0'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#7d8f9c'; c.stroke(); }), 400, 300));
    // slot centers relative to the tray
    slots = [0, 1, 2, 3, 4, 5].map(i => ({ rx: 70 + (i % 3) * 130, ry: 90 + Math.floor(i / 3) * 120 }));
    trayEl = tray;
    shapes.forEach((s, i) => putOnTray(s, i));
    CUTTERS.forEach((ct, i) => {
      const b = artButton(area, { id: ct.art, label: ct.name, size: 96, cls: 'cutter', draw: (c, x, y, s) => { shapePath(c, ct.id, x, y, s * 0.8); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#A9D8F5'; c.stroke(); } });
      place(b, 24, 112 + i * 116, 96, 96);
      onTap(b, () => { cutter = ct.id; sfx('pop'); api.speak(ct.name); api.progress(); Object.entries(cutterBtns).forEach(([k, x]) => x.classList.toggle('selected', k === cutter)); });
      cutterBtns[ct.id] = b;
    });
    on(root, 'pointerdown', e => {
      if (sub !== 'CUT') return;
      const p = toLocal(e), r = rectOf(dough);
      const pad = r.w * 0.25; // wide zone
      if (p.x > r.x - pad && p.x < r.x + r.w + pad && p.y > r.y - pad && p.y < r.y + r.h + pad) stamp(Math.max(r.x + 60, Math.min(r.x + r.w - 60, p.x)), Math.max(r.y + 60, Math.min(r.y + r.h - 60, p.y)));
    });
  }
  async function stamp(x, y) {
    if (shapes.length >= 6) return;
    const shape = cutter || CUTTERS[shapes.length % 4].id; // no cutter picked yet? we pick one for you
    const i = shapes.length; shapes.push(shape);
    api.progress(); sfx('stamp');
    const f = el('div', 'tmp flyer', document.getElementById('fx'));
    f.appendChild(iconCanvas(110, (c, cx, cy, s) => drawCookie(c, cx, cy, s, { shape, color: C.color || 'vanilla', baked: false })));
    place(f, x - 55, y - 55, 110, 110);
    await wait(250);
    const s = slots[i], tr = rectOf(trayEl);
    f.style.transform = `translate(${tr.x + s.rx - x}px, ${tr.y + s.ry - y}px)`;
    await wait(400); f.remove();
    if (ended) return;
    putOnTray(shape, i); sfx('boing');
    if (shapes.length === 6) { sub = 'CUTDONE'; sfx('sparkle'); T(() => toOven(), 800); }
  }
  function putOnTray(shape, i) {
    const s = slots[i];
    const d = el('div', 'onTray', trayEl, { 'aria-hidden': 'true' }); place(d, s.rx - 55, s.ry - 55, 110, 110);
    d.appendChild(iconCanvas(110, (c, cx, cy, sz) => drawCookie(c, cx, cy, sz, { shape, color: C.color || 'vanilla', baked: false })));
  }

  // ---------------- OVEN ----------------
  function setOvenArt(state) {
    ovenImg.innerHTML = '';
    const id = { closed: 'oven-door-closed', glow: 'oven-window-glow', open: 'oven-door-open' }[state];
    ovenImg.appendChild(artNode(id, () => iconCanvas(420, (c, x, y, s) => {
      c.beginPath(); c.roundRect(20, 30, 380, 370, 40); c.fillStyle = '#F7A8C0'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#a0607a'; c.stroke();
      c.beginPath(); c.roundRect(40, 50, 340, 60, 20); c.fillStyle = '#FBD3DE'; c.fill();
      if (state === 'open') { c.beginPath(); c.roundRect(60, 130, 300, 240, 30); c.fillStyle = '#6B4A3A'; c.fill(); }
      else { c.beginPath(); c.roundRect(70, 140, 280, 200, 30); c.fillStyle = state === 'glow' ? '#FFD27A' : '#7a5a6a'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#a0607a'; c.stroke(); }
    }), 420, 420));
  }
  function itemsCanvas(baked) {
    const cv = mkCanvas(220, 120);
    for (let i = 0; i < 6; i++) {
      const x = 40 + (i % 3) * 70, y = 34 + Math.floor(i / 3) * 52;
      if (C.recipe === 'cupcakes') drawCupcake(cv.ctx, x, y, 60, { liner: C.liner || 'dots', color: C.color || 'vanilla', fill: fills[i] ?? 0.8, baked });
      else drawCookie(cv.ctx, x, y, 58, { shape: shapes[i] || 'heart', color: C.color || 'vanilla', baked });
    }
    return cv;
  }
  function toOven() {
    if (ended) return;
    area && area.remove();
    sub = 'OVEN_START';
    api.setCue('Tap the big dial to bake!', 'Tap the dial!');
    area = el('div', 'sub', root); area.style.cssText = 'position:absolute;inset:0';
    oven = el('button', 'oven', area, { type: 'button', 'aria-label': 'Oven door' });
    place(oven, 300, 70, 420, 420);
    ovenImg = el('div', 'oven-img', oven); setOvenArt('closed');
    windowBox = el('div', 'oven-window', oven, { 'aria-hidden': 'true' });
    windowBox.appendChild(itemsCanvas(false));
    dial = artButton(area, { id: 'oven-dial', label: 'Oven dial', size: 150, cls: 'dial pulse', draw: (c, x, y, s) => { c.beginPath(); c.arc(x, y, s * 0.44, 0, Math.PI * 2); c.fillStyle = '#FFE98A'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#6B4A3A'; c.stroke(); c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - s * 0.34); c.stroke(); } });
    place(dial, 790, 200, 150, 150);
    onTap(dial, startBaking);
    onTap(oven, () => { if (sub === 'DING') openOven(); });
  }
  function startBaking() {
    if (sub !== 'OVEN_START') return;
    sub = 'BAKING'; api.progress();
    api.setCue('Watch it bake!');
    dial.classList.remove('pulse'); dial.classList.add('turning');
    setOvenArt('glow'); oven.classList.add('glowing'); windowBox.classList.add('rising');
    for (let s = 0; s < 5; s++) T(() => { sfx('tick'); api.progress(); const r = rectOf(windowBox); sparkles(r.cx, r.cy, 4, 70); }, s * 1000);
    T(ding, 5000);
  }
  function ding() {
    sub = 'DING'; sfx('ding');
    windowBox.innerHTML = ''; windowBox.appendChild(itemsCanvas(true));
    oven.classList.add('wiggle'); dial.classList.remove('turning');
    api.setCue('Ding! Tap the oven door!', 'Tap the oven!');
    T(() => { if (sub === 'DING') openOven(); }, 3000); // opens on its own
  }
  function openOven() {
    if (sub === 'OPEN' || ended) return;
    sub = 'OPEN';
    C.bakeResult = C.recipe === 'cupcakes' ? { fills: fills.map(f => Math.max(MIN, f)) } : { shapes: shapes.slice(0, 6) };
    sfx('pop'); oven.classList.remove('wiggle', 'glowing');
    setOvenArt('open'); windowBox.remove();
    { const r = rectOf(oven); fxArt('fx-steam', r.cx, r.y + 120, 200, 1600); }
    showResult();
    api.say('Perfectly golden!');
    api.complete();
  }
  function showResult() {
    const res = el('div', 'bake-result', root, { role: 'img', 'aria-label': 'Baked treats' });
    place(res, 730, 130, 285, 300, { x: 250, y: 700 });
    for (let i = 0; i < 6; i++) {
      const t = treatCanvas(C, i, 90); res.appendChild(t);
      t.style.position = 'absolute'; t.style.left = (i % 3) * 95 + 'px'; t.style.top = 20 + Math.floor(i / 3) * 110 + 'px';
      t.classList.add('pop-in'); t.style.animationDelay = i * 0.08 + 's';
    }
    const r = rectOf(res); sparkles(r.cx, r.cy, 14, 160);
    if (dial) dial.style.display = 'none';
  }

  return {
    skill: true,
    customCue: true,
    enter(r, c) {
      root = r; C = c;
      if (C.bakeResult) {
        fills = C.bakeResult.fills || []; shapes = C.bakeResult.shapes || [];
        sub = 'OPEN';
        toOven(); sub = 'OPEN'; setOvenArt('open'); windowBox.remove(); dial.remove(); dial = null;
        showResult(); api.setCue('Yummy! Your treats are baked!');
        return;
      }
      if (C.recipe === 'cookies') startCut(); else startFill();
    },
    isComplete() { return !!C.bakeResult; },
    autoComplete() {
      if (C.recipe === 'cupcakes') { fills = [0, 1, 2, 3, 4, 5].map(i => Math.max(MIN, fills[i] || 0.8)); }
      else { while (shapes.length < 6) shapes.push(CUTTERS[shapes.length % 4].id); }
      timers.forEach(clearTimeout);
      if (sub === 'FILL' || sub === 'CUT' || sub === 'FILLED' || sub === 'CUTDONE') toOven();
      openOven();
    },
    hintTarget() {
      if (sub === 'FILL') return cupEls[fills.findIndex(f => f < MIN)]?.el || cupEls[0].el;
      if (sub === 'CUT') return cutter ? dough : cutterBtns.heart;
      if (sub === 'OVEN_START') return dial;
      return oven;
    },
    exit() { ended = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout); offs.forEach(f => f()); }
  };
}
