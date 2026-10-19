import { el, place, artButton, rectOf, sparkles, toLocal, startDrag, onTap } from '../ui.js';
import { FROSTINGS, SPRINKLES, TOPPERS } from '../data.js';
import { mkCanvas, iconCanvas, drawTreat, decorGeom, drawTopper, drawSprinkle } from '../draw.js';
import { artNode } from '../assets.js';
import { sfx, speak } from '../audio.js';

const CV = { x: 272, y: 108, w: 360, h: 360 };

export function create(api) {
  let root, C, cv, guideCv, mode = 'frost', frost = FROSTINGS[1], spr = SPRINKLES[0], page = 0;
  let panel, moreBtn, tabs = {}, opts = [], drawing = null, shaking = null, shaker = null, lastSpark = 0;
  const offs = [];
  const on = (t, ev, fn) => { t.addEventListener(ev, fn); offs.push(() => t.removeEventListener(ev, fn)); };
  const geom = () => C.recipe === 'cupcakes' ? decorGeom('cupcakes', 180, 205, 330) : decorGeom('cookies', 180, 180, 340);
  function redraw() {
    cv.clear();
    if (C.recipe === 'cupcakes') drawTreat(cv.ctx, C, 0, 180, 205, 330); else drawTreat(cv.ctx, C, 0, 180, 180, 340);
  }
  // dotted swirl guide, normalized coordinates
  const GUIDE = [];
  for (let t = 0; t <= 1; t += 0.01) { const a = t * Math.PI * 5, r = 0.85 - t * 0.75; GUIDE.push([Math.cos(a) * r, Math.sin(a) * r * 0.85]); }
  function drawGuide() {
    guideCv.clear();
    if (mode !== 'frost') return;
    const g = geom(), c = guideCv.ctx;
    c.fillStyle = 'rgba(255,255,255,.9)'; c.strokeStyle = 'rgba(107,74,58,.5)'; c.lineWidth = 1.5;
    GUIDE.forEach((p, i) => { if (i % 3) return; c.beginPath(); c.arc(g.cx + p[0] * g.R, g.cy + p[1] * g.R, 4, 0, Math.PI * 2); c.fill(); c.stroke(); });
  }
  const norm = p => { const g = geom(); return [(p.x - CV.x - g.cx) / g.R, (p.y - CV.y - g.cy) / g.R]; };
  const guideDist = n => Math.min(...GUIDE.map(q => Math.hypot(q[0] - n[0], q[1] - n[1]))) * geom().R;
  const changed = () => { redraw(); api.progress(); if (C.decorations.length) api.complete({ quiet: true }); };

  function setMode(m) {
    mode = m; page = 0; sfx('pop');
    Object.entries(tabs).forEach(([k, b]) => b.classList.toggle('selected', k === m));
    renderOptions(); drawGuide(); api.progress();
    if (m === 'sprinkle' && C.decorations.length === 0) {} // wait for a shake
  }
  function optionList() { return mode === 'frost' ? FROSTINGS : mode === 'sprinkle' ? SPRINKLES : TOPPERS; }
  function renderOptions() {
    opts.forEach(o => o.remove()); opts = [];
    const list = optionList();
    const pages = Math.ceil(list.length / 6);
    if (page >= pages) page = 0;
    list.slice(page * 6, page * 6 + 6).forEach((it, i) => {
      const b = artButton(panel, { id: it.art, label: it.name, size: 96, cls: 'opt', draw: (c, x, y, s) => drawOption(c, it, x, y, s) });
      place(b, (i % 2) * 120, Math.floor(i / 2) * 116, 96, 96);
      b.dataset.opt = it.id;
      if ((mode === 'frost' && it === frost) || (mode === 'sprinkle' && it === spr)) b.classList.add('selected');
      if (mode === 'topper') b.addEventListener('pointerdown', e => dragTopper(e, it.id, rectOf(b)));
      else onTap(b, () => {
        if (mode === 'frost') frost = it; else { spr = it; burst(); }
        sfx('pop'); speak(it.name); renderOptions(); api.progress();
      });
      opts.push(b);
    });
    moreBtn.style.display = pages > 1 ? '' : 'none';
  }
  function drawOption(c, it, x, y, s) {
    if (mode === 'frost') { c.lineCap = 'round'; c.lineWidth = s * 0.22; c.strokeStyle = it.hex === 'rainbow' ? '#F7A8C0' : it.hex; c.beginPath(); for (let a = 0; a < 9; a += 0.3) c.lineTo(x - s * 0.3 + a * s * 0.07, y + Math.sin(a * 1.4) * s * 0.12); c.stroke(); }
    else if (mode === 'sprinkle') { for (let i = 0; i < 9; i++) drawSprinkle(c, it.id, x + Math.cos(i * 2.4) * s * 0.25, y + Math.sin(i * 2.4) * s * 0.25, s * 0.09, i, i); }
    else drawTopper(c, it.id, x, y, s * 0.8);
  }
  // sprinkles fall over the treat; they only stick on its surface (clipped when drawn)
  function addSprinkles(entry, cx, cy, n, spread) {
    for (let i = 0; i < n; i++) {
      const x = cx + (Math.random() - 0.5) * spread, y = cy + (Math.random() - 0.5) * spread;
      if (Math.hypot(x, y) <= 1.0) entry.dots.push([x, y, Math.random() * Math.PI, Math.floor(Math.random() * 7)]);
    }
  }
  function burst() {
    const entry = { type: 'sprinkles', kind: spr.id, dots: [] };
    addSprinkles(entry, 0, 0, 40, 1.9);
    C.decorations.push(entry); sfx('rattle'); changed();
  }
  function dragTopper(e, id, fromRect) {
    api.progress();
    startDrag(e, {
      size: 96, from: fromRect,
      makeGhost: () => iconCanvas(96, (c, x, y, s) => drawTopper(c, id, x, y, s * 0.9)),
      onDrop: (gr, p) => {
        const n = norm(p);
        if (Math.hypot(n[0], n[1]) <= 1.5) { // wide zone; snap onto the treat
          const d = Math.hypot(n[0], n[1]), k = d > 0.8 ? 0.8 / d : 1;
          C.decorations.push({ type: 'topper', id, x: n[0] * k, y: n[1] * k });
          sfx('pop'); sparkles(p.x, p.y, 5, 40); changed(); return true;
        }
        sfx('boing', 0); changed(); return false; // back to the tray
      }
    });
  }
  function down(e) {
    const p = toLocal(e);
    if (p.x < CV.x - 40 || p.x > CV.x + CV.w + 40 || p.y < CV.y - 20 || p.y > CV.y + CV.h) return;
    const n = norm(p);
    // grab a placed topper to move it (any mode)
    for (let i = C.decorations.length - 1; i >= 0; i--) {
      const d = C.decorations[i];
      if (d.type === 'topper' && Math.hypot(d.x - n[0], d.y - n[1]) < 0.3) {
        C.decorations.splice(i, 1); redraw();
        const g = geom();
        dragTopper(e, d.id, { cx: CV.x + g.cx + d.x * g.R, cy: CV.y + g.cy + d.y * g.R, x: 0, y: 0, w: 0, h: 0 });
        // released off the treat -> it goes back to the tray (removed); on the treat -> re-placed
        return;
      }
    }
    if (mode === 'frost') {
      e.preventDefault();
      drawing = { id: e.pointerId, s: { type: 'stroke', color: frost.hex, points: [n], onGuide: false } };
      C.decorations.push(drawing.s); sfx('squish'); changed();
    } else if (mode === 'sprinkle') {
      shaking = { id: e.pointerId, entry: { type: 'sprinkles', kind: spr.id, dots: [] } };
      C.decorations.push(shaking.entry);
      showShaker(p); shake(p);
    }
  }
  function move(e) {
    const p = toLocal(e);
    if (drawing && e.pointerId === drawing.id) {
      const n = norm(p), pts = drawing.s.points, lp = pts[pts.length - 1];
      if (Math.hypot(n[0] - lp[0], n[1] - lp[1]) > 0.025) {
        pts.push(n); redraw(); api.progress();
        if (guideDist(n) <= 40) { drawing.s.onGuide = true; const t = performance.now(); if (t - lastSpark > 120) { lastSpark = t; sparkles(p.x, p.y, 3, 30); sfx('sparkle', 400); } }
      }
    } else if (shaking && e.pointerId === shaking.id) { showShaker(p); shake(p); }
  }
  function up(e) {
    if (drawing && e.pointerId === drawing.id) drawing = null;
    if (shaking && e.pointerId === shaking.id) { shaking = null; if (shaker) shaker.style.display = 'none'; }
  }
  function shake(p) {
    const n = norm({ x: p.x, y: p.y + 50 });
    addSprinkles(shaking.entry, n[0], n[1], 4, 0.6);
    sfx('rattle', 180); changed();
  }
  function showShaker(p) {
    if (!shaker) {
      shaker = el('div', 'tmp shaker', document.getElementById('fx'), { 'aria-hidden': 'true' });
      shaker.appendChild(artNode('tool-sprinkle-shaker', () => iconCanvas(90, (c, x, y, s) => { c.beginPath(); c.roundRect(x - s * 0.2, y - s * 0.3, s * 0.4, s * 0.6, 10); c.fillStyle = '#FFF4E0'; c.fill(); c.strokeStyle = '#6B4A3A'; c.lineWidth = 3; c.stroke(); c.fillStyle = '#F7A8C0'; c.fillRect(x - s * 0.2, y - s * 0.3, s * 0.4, s * 0.15); }), 90, 90));
      place(shaker, 0, 0, 90, 90);
    }
    shaker.style.display = '';
    shaker.style.transform = `translate(${p.x - 45}px, ${p.y - 80}px) rotate(160deg)`;
  }

  return {
    skill: true,
    praise: 'So pretty!',
    enter(r, c) {
      root = r; C = c;
      C.decorations = C.decorations || [];
      const plate = el('div', 'deco-spot', root, { 'aria-hidden': 'true' }); place(plate, CV.x - 10, CV.y + 250, CV.w + 20, 110);
      cv = mkCanvas(CV.w, CV.h, 'deco-canvas'); root.appendChild(cv); place(cv, CV.x, CV.y);
      cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Your treat');
      guideCv = mkCanvas(CV.w, CV.h, 'guide'); root.appendChild(guideCv); place(guideCv, CV.x, CV.y);
      const T = [['frost', 'tool-piping-bag', 'Frosting'], ['sprinkle', 'tool-sprinkle-shaker', 'Sprinkles'], ['topper', 'topper-cherry', 'Toppers']];
      T.forEach(([m, art, label], i) => {
        const b = artButton(root, { id: art, label, size: 96, cls: 'tab', draw: (c, x, y, s) => { c.beginPath(); c.arc(x, y, s * 0.42, 0, Math.PI * 2); c.fillStyle = ['#F7A8C0', '#A9D8F5', '#FF9C9C'][i]; c.fill(); } });
        place(b, 24, 112 + i * 120, 96, 96);
        onTap(b, () => { if (mode === m && m === 'sprinkle') burst(); else setMode(m); });
        tabs[m] = b;
      });
      panel = el('div', 'opt-panel', root); place(panel, 792, 112, 216, 336);
      moreBtn = el('button', 'btn more', root, { type: 'button', 'aria-label': 'More' }); place(moreBtn, 792, 470, 96, 96);
      moreBtn.appendChild(iconCanvas(96, (c, x, y, s) => { c.fillStyle = '#6B4A3A'; [-0.2, 0, 0.2].forEach(d => { c.beginPath(); c.arc(x + d * s, y, s * 0.06, 0, Math.PI * 2); c.fill(); }); }));
      onTap(moreBtn, () => { page++; sfx('pop'); renderOptions(); api.progress(); });
      const undo = artButton(root, { id: 'btn-undo', label: 'Oops, undo', size: 96, cls: 'tool', draw: (c, x, y, s) => { c.beginPath(); c.arc(x, y, s * 0.44, 0, Math.PI * 2); c.fillStyle = '#FFE98A'; c.fill(); c.lineWidth = s * 0.08; c.strokeStyle = '#6B4A3A'; c.beginPath(); c.arc(x, y + 4, s * 0.2, Math.PI * 1.1, Math.PI * 2.4); c.stroke(); } });
      place(undo, 334, 476, 96, 96);
      onTap(undo, () => { C.decorations.pop(); sfx('pop'); changed(); });
      const clear = artButton(root, { id: 'btn-clear', label: 'Clear all', size: 96, cls: 'tool', draw: (c, x, y, s) => { c.beginPath(); c.arc(x, y, s * 0.44, 0, Math.PI * 2); c.fillStyle = '#B8E8D2'; c.fill(); c.fillStyle = '#E0B07A'; c.fillRect(x - s * 0.04, y - s * 0.3, s * 0.08, s * 0.35); c.beginPath(); c.moveTo(x - s * 0.2, y + s * 0.3); c.lineTo(x + s * 0.2, y + s * 0.3); c.lineTo(x + s * 0.1, y + s * 0.05); c.lineTo(x - s * 0.1, y + s * 0.05); c.fill(); } });
      place(clear, 474, 476, 96, 96);
      onTap(clear, () => { C.decorations.length = 0; sfx('fwip'); changed(); });
      this.undo = undo;
      on(root, 'pointerdown', down); on(window, 'pointermove', move); on(window, 'pointerup', up); on(window, 'pointercancel', up);
      setMode('frost'); redraw();
    },
    isComplete() { return C.decorations.length > 0; },
    autoComplete() {
      C.decorations.push({ type: 'stroke', color: frost.hex, points: GUIDE.filter((_, i) => i % 2 === 0).map(p => [...p]), onGuide: true });
      const entry = { type: 'sprinkles', kind: spr.id, dots: [] }; addSprinkles(entry, 0, 0, 30, 1.9); C.decorations.push(entry);
      redraw(); const r = rectOf(cv); sparkles(r.cx, r.cy, 14, 150); api.complete();
    },
    hintTarget() { return mode === 'topper' ? opts[0] : cv; },
    exit() { offs.forEach(f => f()); if (shaker) shaker.remove(); }
  };
}
