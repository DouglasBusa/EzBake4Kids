import { el, place, artButton, sparkles, wait, reducedMotion, onTap } from '../ui.js';
import { mkCanvas, iconCanvas, drawScene, drawMomo, drawPip, drawBiscuit, heartPath } from '../draw.js';
import { artNode } from '../assets.js';
import { sfx, speak } from '../audio.js';

const KEY = 'ezbake.gallery', CAP = 30;
export function loadGallery() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; } }
export function saveCreation(C) {
  try {
    const list = loadGallery();
    list.push({ ...JSON.parse(JSON.stringify(C)), createdAt: C.createdAt || Date.now() });
    while (list.length > CAP) list.shift(); // oldest dropped first, no prompt
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch (e) { return false; } // storage full/unavailable: fail silently
}

// Polaroid with the scene; returns { frame, open() }
export function polaroid(root, C, x, y, w, h) {
  const frame = el('div', 'polaroid', root, { role: 'img', 'aria-label': 'Your creation' });
  place(frame, x, y, w, h);
  frame.appendChild(artNode('fx-polaroid-frame', () => { const d = document.createElement('div'); d.className = 'polaroid-ph'; return d; }, w, h));
  // photo window per Artie's frame: 40,44 320x328 of 400x480
  const px = w * 40 / 400, py = h * 44 / 480, pw = w * 320 / 400, ph = h * 328 / 480;
  const closed = mkCanvas(pw, ph, 'scene'), open = mkCanvas(pw, ph, 'scene');
  drawScene(closed.ctx, C, pw, ph, { open: false }); drawScene(open.ctx, C, pw, ph, { open: true });
  for (const c of [open, closed]) { frame.appendChild(c); place(c, px, py); }
  return { frame, reveal() { closed.classList.add('lift'); } };
}

export function create(api) {
  let timers = [], saved = false;
  const T = (f, ms) => timers.push(setTimeout(f, ms));
  return {
    customCue: true,
    enter(root, C) {
      C.createdAt = C.createdAt || Date.now();
      const flash = el('div', 'flash tmp', document.getElementById('fx'));
      const P = polaroid(root, C, 352, 40, 320, 384);
      P.frame.classList.add('drop-in');
      const cast = [[drawMomo, 70, 260, 230], [drawPip, 760, 300, 150], [drawBiscuit, 880, 320, 140]];
      cast.forEach(([fn, x, y, s], i) => { const d = el('div', 'cast-hop d' + i, root, { 'aria-hidden': 'true' }); place(d, x, y, s, s); d.appendChild(iconCanvas(s, (c, cx, cy, sz) => fn(c, cx, cy, sz, 'cheer'))); });
      const conf = mkCanvas(1024, 576, 'confetti'); root.appendChild(conf); place(conf, 0, 0);
      T(() => { P.reveal(); sfx('pop'); }, 700);
      T(() => { sfx('click'); flash.classList.add('go'); speak('Ta-da! Look what you made!'); api.say('Ta-da!', { bubbleOnly: true }); }, 1300);
      T(() => { sfx('cheer'); confetti(conf); }, 1500);
      T(() => showButtons(root, C), 3600);
      this.flash = flash;
    },
    exit() { timers.forEach(clearTimeout); this.flash && this.flash.remove(); cancelAnimationFrame(confRaf); }
  };
  function showButtons(root, C) {
    const bar = el('div', 'end-buttons', root); place(bar, 0, 452, 1024, 120);
    const mk = (id, label, x, draw, fn) => { const b = artButton(bar, { id, label, size: 110, cls: 'pop-in', draw }); place(b, x, 4, 110, 110); onTap(b, fn); return b; };
    const ring = col => (c, x, y, s) => { c.beginPath(); c.arc(x, y, s * 0.44, 0, Math.PI * 2); c.fillStyle = col; c.fill(); c.lineWidth = 4; c.strokeStyle = '#6B4A3A'; c.stroke(); };
    const save = mk('btn-save', 'Save', 252, ring('#FF9C9C'), () => {
      if (!saved) { saveCreation(C); saved = true; }
      sfx('chime'); hearts(save); speak('Saved!');
    });
    save.id = 'saveBtn';
    mk('btn-play-again', 'Play again', 457, ring('#7CCF8A'), () => { sfx('ding'); api.resetCreation(); api.go('STEP1_CHOOSE'); }).id = 'againBtn';
    mk('btn-gallery', 'My treats', 662, ring('#CDB8F0'), () => { sfx('pop'); api.go('GALLERY'); }).id = 'galleryBtn';
  }
  function hearts(btn) {
    const r = btn.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const h = el('div', 'tmp heart-up', document.getElementById('fx'));
      h.appendChild(iconCanvas(40, (c, x, y, s) => { heartPath(c, x, y, s * 0.9); c.fillStyle = '#FF7F7F'; c.fill(); }));
      place(h, 280 + Math.random() * 60, 440, 40, 40); h.style.animationDelay = i * 0.08 + 's';
      setTimeout(() => h.remove(), 1400);
    }
  }
}
let confRaf = 0;
function confetti(cv) {
  if (reducedMotion()) { cv.classList.add('soft'); sparkles(512, 240, 6, 0); return; } // soft fade instead
  const cols = ['#F7A8C0', '#FFE98A', '#B8E8D2', '#A9D8F5', '#CDB8F0', '#FF7F7F'];
  const ps = Array.from({ length: 120 }, () => ({ x: Math.random() * 1024, y: -20 - Math.random() * 300, vy: 1.5 + Math.random() * 2.5, vx: (Math.random() - 0.5) * 1.5, r: Math.random() * 6, c: cols[Math.floor(Math.random() * 6)], a: Math.random() * 6 }));
  const t0 = performance.now();
  const step = t => {
    const c = cv.ctx; cv.clear();
    ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.a += 0.05; c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.fillStyle = p.c; c.fillRect(-5, -3, 10, 6); c.restore(); });
    if (t - t0 < 4500) confRaf = requestAnimationFrame(step); else cv.clear();
  };
  confRaf = requestAnimationFrame(step);
}
