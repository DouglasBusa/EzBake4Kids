// Small DOM helpers shared by every screen.
import { artNode } from './assets.js';
import { iconCanvas } from './draw.js';

export function el(tag, cls, parent, attrs = {}) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'style') Object.assign(e.style, v);
    else if (k === 'text') e.textContent = v;
    else e.setAttribute(k, v);
  }
  if (parent) parent.appendChild(e);
  return e;
}
// Place an element at logical stage coordinates (stage is 1024x576).
export function place(e, x, y, w, h) {
  Object.assign(e.style, { position: 'absolute', left: x + 'px', top: y + 'px' });
  if (w != null) e.style.width = w + 'px';
  if (h != null) e.style.height = h + 'px';
  return e;
}
// Big button with art (by id) or placeholder icon.
export function artButton(parent, { id, label, size = 96, draw, cls = '' }) {
  const b = el('button', 'btn ' + cls, parent, { 'aria-label': label, type: 'button' });
  b.style.width = b.style.height = size + 'px';
  b.appendChild(artNode(id, () => iconCanvas(size, draw || ((c, x, y, s) => { c.beginPath(); c.arc(x, y, s * 0.4, 0, Math.PI * 2); c.fillStyle = '#F7A8C0'; c.fill(); })), size, size));
  return b;
}
export const stageEl = () => document.getElementById('stage');
let scale = 1;
export const setScale = s => { scale = s; };
export const getScale = () => scale;
// Pointer event -> logical stage coords
export function toLocal(e) {
  const r = stageEl().getBoundingClientRect();
  return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
}
// Element rect in logical stage coords
export function rectOf(node) {
  const r = node.getBoundingClientRect(), s = stageEl().getBoundingClientRect();
  return { x: (r.left - s.left) / scale, y: (r.top - s.top) / scale, w: r.width / scale, h: r.height / scale,
    get cx() { return this.x + this.w / 2; }, get cy() { return this.y + this.h / 2; } };
}
// Rect expanded around its center (drop zones are 1.5x)
export function grow(r, k = 1.5) {
  const w = r.w * k, h = r.h * k;
  return { x: r.cx - w / 2, y: r.cy - h / 2, w, h, cx: r.cx, cy: r.cy };
}
export const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export const reducedMotion = () => document.body.classList.contains('rm');

// Generic drag: makes a floating ghost from makeGhost() that follows the pointer.
// onDrop(ghostRect, point) returns true if accepted; otherwise the ghost floats back to `from`.
export function startDrag(e, { makeGhost, size = 110, onMove, onDrop, from }) {
  e.preventDefault();
  const layer = document.getElementById('fx');
  const g = el('div', 'ghost', layer);
  g.appendChild(makeGhost());
  place(g, 0, 0, size, size);
  const p0 = toLocal(e);
  const set = p => { g.style.transform = `translate(${p.x - size / 2}px, ${p.y - size / 2}px) scale(1.08)`; };
  set(p0);
  const id = e.pointerId;
  const move = ev => { if (ev.pointerId !== id) return; const p = toLocal(ev); set(p); onMove && onMove(p, ghostRect(p)); };
  const ghostRect = p => ({ x: p.x - size / 2, y: p.y - size / 2, w: size, h: size, cx: p.x, cy: p.y });
  const up = ev => {
    if (ev.pointerId !== id) return;
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
    const p = toLocal(ev);
    const ok = onDrop ? onDrop(ghostRect(p), p, g) : false;
    if (ok === 'keep') return; // caller animates the ghost itself
    if (ok) { g.remove(); return; }
    // float gently back, no failure sound
    if (from) {
      g.classList.add('floatback');
      g.style.transform = `translate(${from.cx - size / 2}px, ${from.cy - size / 2}px) scale(1)`;
      setTimeout(() => g.remove(), 450);
    } else g.remove();
  };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  return g;
}

// Sparkle burst at logical (x,y)
export function sparkles(x, y, n = 8, spread = 70) {
  const layer = document.getElementById('fx');
  const rm = reducedMotion();
  for (let i = 0; i < (rm ? 3 : n); i++) {
    const s = el('div', 'spark', layer);
    const a = Math.random() * Math.PI * 2, d = spread * (0.4 + Math.random() * 0.6);
    place(s, x - 12, y - 12, 24, 24);
    s.style.setProperty('--dx', (rm ? 0 : Math.cos(a) * d) + 'px');
    s.style.setProperty('--dy', (rm ? 0 : Math.sin(a) * d) + 'px');
    s.style.background = ['#FFE98A', '#F7A8C0', '#A9D8F5', '#CDB8F0', '#FFFFFF'][i % 5];
    setTimeout(() => s.remove(), 900);
  }
}
export const wait = ms => new Promise(r => setTimeout(r, ms));

// Reliable tap for kids: fires on pointerup over the same element (works with
// touch, mouse and pen, even right after a drag), plus keyboard activation.
export function onTap(node, fn) {
  let down = null;
  node.addEventListener('pointerdown', e => { down = { id: e.pointerId, x: e.clientX, y: e.clientY }; });
  node.addEventListener('pointerup', e => {
    if (!down || down.id !== e.pointerId) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    down = null;
    const r = node.getBoundingClientRect();
    const inside = e.clientX >= r.left - 20 && e.clientX <= r.right + 20 && e.clientY >= r.top - 20 && e.clientY <= r.bottom + 20;
    if (inside && moved < 40) fn(e);
  });
  node.addEventListener('pointercancel', () => { down = null; });
  node.addEventListener('click', e => { if (e.detail === 0) fn(e); }); // Enter / Space
}

// One-shot effect art from Artie (fx-*) with a CSS fallback; reduced motion = soft fade.
export function fxArt(id, x, y, size, ms = 900, fallbackCls = 'fx-ph') {
  const layer = document.getElementById('fx');
  const d = el('div', 'tmp fx-art', layer, { 'aria-hidden': 'true' });
  place(d, x - size / 2, y - size / 2, size, size);
  d.appendChild(artNode(id, () => el('div', fallbackCls), size, size));
  d.style.animationDuration = ms + 'ms';
  setTimeout(() => d.remove(), ms);
  return d;
}
