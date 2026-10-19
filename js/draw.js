// Placeholder art drawn with canvas. Every draw function first tries Artie's
// art by id (drawArt) and only draws a placeholder shape if it isn't there.
import { drawArt, artImage } from './assets.js';
import { LINERS, COLORS, RAINBOW, TOPPERS, STICKERS, PLATES, CARRIERS, FROSTINGS } from './data.js';

let stageScale = 1;
export const setStageScale = s => { stageScale = s; };

export function mkCanvas(w, h, cls) {
  const c = document.createElement('canvas');
  const r = Math.min(3, Math.max(1, (window.devicePixelRatio || 1) * stageScale));
  c.width = Math.round(w * r); c.height = Math.round(h * r);
  c.style.width = w + 'px'; c.style.height = h + 'px';
  if (cls) c.className = cls;
  const ctx = c.getContext('2d');
  ctx.scale(r, r);
  c.ctx = ctx; c.w = w; c.h = h;
  c.clear = () => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height); ctx.restore(); };
  return c;
}
// Small canvas with one icon drawn in it, used as a DOM placeholder.
export function iconCanvas(size, fn, cls) {
  const c = mkCanvas(size, size, cls || 'ph');
  fn(c.ctx, size / 2, size / 2, size);
  return c;
}

// ---------- color helpers ----------
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
const rgbToHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export function mix(a, b, t) { const A = hexToRgb(a), B = hexToRgb(b); return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
export const darken = (c, t = 0.35) => mix(c, '#6B4A3A', t);
export const lighten = (c, t = 0.5) => mix(c, '#FFFFFF', t);

function fillStroke(ctx, fill, s, line) {
  ctx.fillStyle = fill; ctx.fill();
  ctx.lineWidth = line ?? Math.max(1.5, s * 0.035); ctx.strokeStyle = typeof fill === 'string' ? darken(fill) : '#8a6a5a';
  ctx.lineJoin = 'round'; ctx.stroke();
}
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }

// ---------- basic shape paths (centered at x,y, box size s) ----------
export function heartPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.38);
  ctx.bezierCurveTo(x - s * 0.62, y - s * 0.02, x - s * 0.32, y - s * 0.55, x, y - s * 0.2);
  ctx.bezierCurveTo(x + s * 0.32, y - s * 0.55, x + s * 0.62, y - s * 0.02, x, y + s * 0.38);
  ctx.closePath();
}
export function starPath(ctx, x, y, s, pts = 5, inner = 0.45) {
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const r = (i % 2 ? inner : 1) * s * 0.5, a = -Math.PI / 2 + i * Math.PI / pts;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.98 + s * 0.03);
  }
  ctx.closePath();
}
export function flowerPath(ctx, x, y, s) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
    ctx.moveTo(x + Math.cos(a) * s * 0.26 + s * 0.2, y + Math.sin(a) * s * 0.26);
    ctx.arc(x + Math.cos(a) * s * 0.26, y + Math.sin(a) * s * 0.26, s * 0.2, 0, Math.PI * 2);
  }
}
export function bunnyPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.ellipse(x - s * 0.15, y - s * 0.22, s * 0.1, s * 0.24, -0.15, 0, Math.PI * 2);
  ctx.moveTo(x + s * 0.25, y - s * 0.22);
  ctx.ellipse(x + s * 0.15, y - s * 0.22, s * 0.1, s * 0.24, 0.15, 0, Math.PI * 2);
  ctx.moveTo(x + s * 0.32, y + s * 0.12);
  ctx.arc(x, y + s * 0.12, s * 0.32, 0, Math.PI * 2);
}
export function cloudPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.arc(x - s * 0.22, y + s * 0.06, s * 0.2, 0, Math.PI * 2);
  ctx.moveTo(x + s * 0.3, y - s * 0.04);
  ctx.arc(x + 0.02 * s, y - s * 0.06, s * 0.28, 0, Math.PI * 2);
  ctx.moveTo(x + s * 0.46, y + s * 0.08);
  ctx.arc(x + s * 0.26, y + s * 0.08, s * 0.2, 0, Math.PI * 2);
  ctx.moveTo(x - s * 0.3, y + s * 0.26);
  rrect(ctx, x - s * 0.4, y + s * 0.02, s * 0.84, s * 0.24, s * 0.12);
}
export function shapePath(ctx, shape, x, y, s) {
  if (shape === 'heart') heartPath(ctx, x, y, s);
  else if (shape === 'star') starPath(ctx, x, y, s * 1.05);
  else if (shape === 'flower') flowerPath(ctx, x, y, s);
  else if (shape === 'bunny') bunnyPath(ctx, x, y, s);
  else { ctx.beginPath(); ctx.arc(x, y, s * 0.45, 0, Math.PI * 2); }
}

function face(ctx, x, y, s, { sleepy = false, eyeGap = 0.16 } = {}) {
  ctx.fillStyle = '#6B4A3A'; ctx.strokeStyle = '#6B4A3A'; ctx.lineWidth = Math.max(1, s * 0.03); ctx.lineCap = 'round';
  for (const d of [-1, 1]) {
    ctx.beginPath();
    if (sleepy) { ctx.arc(x + d * s * eyeGap, y - s * 0.02, s * 0.05, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke(); }
    else { ctx.arc(x + d * s * eyeGap, y - s * 0.03, s * 0.045, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.fillStyle = 'rgba(255,127,127,0.45)';
  for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + d * s * (eyeGap + 0.09), y + s * 0.06, s * 0.06, s * 0.035, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.arc(x, y + s * 0.04, s * 0.05, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
}

// ---------- characters (original cast) ----------
export function drawMomo(ctx, x, y, s, pose = 'idle') {
  if (drawArt(ctx, 'character-momo-' + pose, x - s / 2, y - s / 2, s, s)) return;
  const cream = '#FFF4E0';
  // floppy ears hang down both sides (no bows)
  for (const d of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(x + d * s * 0.33, y + s * 0.02, s * 0.1, s * 0.24, d * 0.35, 0, Math.PI * 2);
    fillStroke(ctx, cream, s);
    ctx.beginPath(); ctx.ellipse(x + d * s * 0.33, y + s * 0.04, s * 0.05, s * 0.16, d * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#FBD3DE'; ctx.fill();
  }
  ctx.beginPath(); ctx.ellipse(x, y + s * 0.06, s * 0.3, s * 0.28, 0, 0, Math.PI * 2); fillStroke(ctx, cream, s);
  // strawberry beret
  ctx.beginPath(); ctx.ellipse(x, y - s * 0.2, s * 0.27, s * 0.11, -0.08, 0, Math.PI * 2); fillStroke(ctx, '#F7A8C0', s);
  ctx.fillStyle = '#FFF4E0';
  for (const [dx, dy] of [[-0.14, -0.2], [0, -0.24], [0.13, -0.19], [-0.05, -0.15], [0.07, -0.14]]) { ctx.beginPath(); ctx.ellipse(x + dx * s, y + dy * s, s * 0.014, s * 0.02, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.arc(x + s * 0.02, y - s * 0.31, s * 0.035, 0, Math.PI * 2); fillStroke(ctx, '#9EDDC0', s, s * 0.02);
  face(ctx, x, y + s * 0.08, s);
  if (pose === 'cheer' || pose === 'wave') {
    for (const d of pose === 'wave' ? [1] : [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + d * s * 0.36, y - s * 0.12, s * 0.07, s * 0.09, 0, 0, Math.PI * 2); fillStroke(ctx, cream, s); }
  }
}
export function drawPip(ctx, x, y, s) {
  if (drawArt(ctx, 'character-pip-idle', x - s / 2, y - s / 2, s, s)) return;
  ctx.beginPath(); ctx.ellipse(x, y + s * 0.05, s * 0.32, s * 0.3, 0, 0, Math.PI * 2); fillStroke(ctx, '#FFE98A', s);
  ctx.beginPath(); ctx.moveTo(x - s * 0.02, y - s * 0.24); ctx.quadraticCurveTo(x + s * 0.02, y - s * 0.38, x + s * 0.08, y - s * 0.26); fillStroke(ctx, '#FFE98A', s, s * 0.02);
  ctx.beginPath(); ctx.moveTo(x - s * 0.06, y + s * 0.08); ctx.lineTo(x + s * 0.06, y + s * 0.08); ctx.lineTo(x, y + s * 0.15); ctx.closePath(); fillStroke(ctx, '#FFB36B', s, s * 0.015);
  face(ctx, x, y + s * 0.0, s, { eyeGap: 0.13 });
  // mini whisk
  ctx.strokeStyle = '#8fa0b0'; ctx.lineWidth = s * 0.025; ctx.beginPath(); ctx.moveTo(x + s * 0.3, y + s * 0.2); ctx.lineTo(x + s * 0.42, y - s * 0.02); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x + s * 0.44, y - s * 0.1, s * 0.05, s * 0.09, 0.4, 0, Math.PI * 2); ctx.stroke();
}
export function drawBiscuit(ctx, x, y, s) {
  if (drawArt(ctx, 'character-biscuit-idle', x - s / 2, y - s / 2, s, s)) return;
  const car = '#E0A96D';
  for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + d * s * 0.3, y, s * 0.1, s * 0.2, d * 0.3, 0, Math.PI * 2); fillStroke(ctx, '#B9814B', s); }
  ctx.beginPath(); ctx.ellipse(x, y, s * 0.3, s * 0.28, 0, 0, Math.PI * 2); fillStroke(ctx, car, s);
  ctx.beginPath(); ctx.ellipse(x, y + s * 0.1, s * 0.12, s * 0.08, 0, 0, Math.PI * 2); ctx.fillStyle = '#F5D3A8'; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y + s * 0.06, s * 0.03, 0, Math.PI * 2); ctx.fillStyle = '#6B4A3A'; ctx.fill();
  face(ctx, x, y - s * 0.02, s, { sleepy: true, eyeGap: 0.13 });
  // gingham neckerchief
  ctx.beginPath(); ctx.moveTo(x - s * 0.22, y + s * 0.24); ctx.lineTo(x + s * 0.22, y + s * 0.24); ctx.lineTo(x, y + s * 0.42); ctx.closePath();
  fillStroke(ctx, '#FF9FB5', s, s * 0.02);
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = -3; i < 4; i++) { ctx.fillRect(x + i * s * 0.08, y + s * 0.22, s * 0.04, s * 0.22); ctx.fillRect(x - s * 0.25, y + s * 0.26 + (i + 3) * s * 0.06, s * 0.5, s * 0.03); }
  ctx.restore();
}

// ---------- misc small things ----------
export function drawThing(ctx, shape, x, y, s, color) {
  switch (shape) {
    case 'heart': heartPath(ctx, x, y, s * 0.9); fillStroke(ctx, color || '#FF7F7F', s); break;
    case 'star': starPath(ctx, x, y, s * 0.95); fillStroke(ctx, color || '#FFE98A', s); break;
    case 'flower': flowerPath(ctx, x, y, s * 0.9); fillStroke(ctx, color || '#F7A8C0', s);
      ctx.beginPath(); ctx.arc(x, y, s * 0.12, 0, Math.PI * 2); fillStroke(ctx, '#FFE98A', s); break;
    case 'cloud': cloudPath(ctx, x, y, s * 0.95); fillStroke(ctx, color || '#FFFFFF', s); break;
    case 'cherry':
      ctx.strokeStyle = '#5c8a4a'; ctx.lineWidth = s * 0.04; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - s * 0.14, y + s * 0.1); ctx.quadraticCurveTo(x - s * 0.05, y - s * 0.25, x + s * 0.08, y - s * 0.36); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + s * 0.16, y + s * 0.12); ctx.quadraticCurveTo(x + s * 0.12, y - s * 0.2, x + s * 0.08, y - s * 0.36); ctx.stroke();
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(x + d * s * 0.15, y + s * 0.18, s * 0.17, 0, Math.PI * 2); fillStroke(ctx, '#F0566A', s); }
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(x - s * 0.2, y + s * 0.12, s * 0.04, 0, Math.PI * 2); ctx.fill(); break;
    case 'strawberry':
      ctx.beginPath(); ctx.moveTo(x, y + s * 0.4); ctx.bezierCurveTo(x - s * 0.5, y + s * 0.05, x - s * 0.3, y - s * 0.3, x, y - s * 0.22); ctx.bezierCurveTo(x + s * 0.3, y - s * 0.3, x + s * 0.5, y + s * 0.05, x, y + s * 0.4);
      fillStroke(ctx, '#F25C6E', s);
      starPath(ctx, x, y - s * 0.27, s * 0.34, 5, 0.4); fillStroke(ctx, '#7cc46a', s, s * 0.02);
      ctx.fillStyle = '#FFE98A'; for (const [dx, dy] of [[-0.12, -0.02], [0.1, 0], [0, 0.12], [-0.08, 0.2], [0.09, 0.2], [0, -0.1]]) { ctx.beginPath(); ctx.ellipse(x + dx * s, y + dy * s, s * 0.018, s * 0.028, 0, 0, Math.PI * 2); ctx.fill(); } break;
    case 'blueberry': ctx.beginPath(); ctx.arc(x, y, s * 0.3, 0, Math.PI * 2); fillStroke(ctx, '#6F86D6', s);
      starPath(ctx, x, y - s * 0.12, s * 0.16, 5, 0.5); ctx.fillStyle = '#3f4f8f'; ctx.fill(); break;
    case 'choc': rrect(ctx, x - s * 0.28, y - s * 0.2, s * 0.56, s * 0.4, s * 0.06); fillStroke(ctx, '#7A4B32', s);
      ctx.strokeStyle = '#5b3524'; ctx.lineWidth = s * 0.02; ctx.beginPath(); ctx.moveTo(x, y - s * 0.2); ctx.lineTo(x, y + s * 0.2); ctx.moveTo(x - s * 0.28, y); ctx.lineTo(x + s * 0.28, y); ctx.stroke(); break;
    case 'candle': rrect(ctx, x - s * 0.08, y - s * 0.15, s * 0.16, s * 0.5, s * 0.04); fillStroke(ctx, '#A9D8F5', s);
      ctx.fillStyle = '#fff'; for (let i = 0; i < 3; i++) ctx.fillRect(x - s * 0.08, y - s * 0.08 + i * s * 0.15, s * 0.16, s * 0.04);
      ctx.beginPath(); ctx.moveTo(x, y - s * 0.42); ctx.quadraticCurveTo(x + s * 0.12, y - s * 0.26, x, y - s * 0.18); ctx.quadraticCurveTo(x - s * 0.12, y - s * 0.26, x, y - s * 0.42); fillStroke(ctx, '#FFC94A', s, s * 0.015); break;
    case 'apple': ctx.beginPath(); ctx.arc(x - s * 0.11, y + s * 0.06, s * 0.26, 0, Math.PI * 2); ctx.arc(x + s * 0.11, y + s * 0.06, s * 0.26, 0, Math.PI * 2); fillStroke(ctx, '#F0566A', s);
      ctx.beginPath(); ctx.ellipse(x + s * 0.1, y - s * 0.28, s * 0.1, s * 0.05, -0.5, 0, Math.PI * 2); fillStroke(ctx, '#7cc46a', s, s * 0.02); break;
    case 'orange': ctx.beginPath(); ctx.arc(x, y + s * 0.04, s * 0.34, 0, Math.PI * 2); fillStroke(ctx, '#FFB36B', s);
      ctx.beginPath(); ctx.ellipse(x + s * 0.06, y - s * 0.32, s * 0.1, s * 0.05, -0.4, 0, Math.PI * 2); fillStroke(ctx, '#7cc46a', s, s * 0.02); break;
    case 'rainbow': case 'rainbow2': {
      const cols = shape === 'rainbow' ? ['#FF7F7F', '#FFB36B', '#FFE98A', '#9EDDC0', '#A9D8F5', '#CDB8F0'] : RAINBOW;
      ctx.lineCap = 'butt';
      cols.forEach((c, i) => { ctx.beginPath(); ctx.strokeStyle = c; ctx.lineWidth = s * 0.06; ctx.arc(x, y + s * 0.22, s * (0.42 - i * 0.055), Math.PI, 0); ctx.stroke(); });
      cloudPath(ctx, x - s * 0.36, y + s * 0.2, s * 0.32); fillStroke(ctx, '#fff', s * 0.5); cloudPath(ctx, x + s * 0.36, y + s * 0.2, s * 0.32); fillStroke(ctx, '#fff', s * 0.5); break; }
    case 'candy': ctx.beginPath(); ctx.moveTo(x - s * 0.18, y); ctx.lineTo(x - s * 0.42, y - s * 0.16); ctx.lineTo(x - s * 0.42, y + s * 0.16); ctx.closePath(); fillStroke(ctx, '#CDB8F0', s);
      ctx.beginPath(); ctx.moveTo(x + s * 0.18, y); ctx.lineTo(x + s * 0.42, y - s * 0.16); ctx.lineTo(x + s * 0.42, y + s * 0.16); ctx.closePath(); fillStroke(ctx, '#CDB8F0', s);
      ctx.beginPath(); ctx.arc(x, y, s * 0.22, 0, Math.PI * 2); fillStroke(ctx, '#F7A8C0', s); break;
    case 'lollipop': ctx.fillStyle = '#fff'; rrect(ctx, x - s * 0.03, y, s * 0.06, s * 0.45, s * 0.03); fillStroke(ctx, '#ffffff', s, s * 0.02);
      ctx.beginPath(); ctx.arc(x, y - s * 0.1, s * 0.28, 0, Math.PI * 2); fillStroke(ctx, '#FF9FB5', s);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = s * 0.05; ctx.beginPath(); for (let a = 0; a < 10; a += 0.2) { const r = a * s * 0.025; ctx.lineTo(x + Math.cos(a) * r, y - s * 0.1 + Math.sin(a) * r); } ctx.stroke(); break;
    case 'donut': ctx.beginPath(); ctx.arc(x, y, s * 0.38, 0, Math.PI * 2); ctx.arc(x, y, s * 0.13, 0, Math.PI * 2, true); fillStroke(ctx, '#E0A96D', s);
      ctx.beginPath(); ctx.arc(x, y - s * 0.02, s * 0.33, 0, Math.PI * 2); ctx.arc(x, y - s * 0.02, s * 0.15, 0, Math.PI * 2, true); ctx.fillStyle = '#F7A8C0'; ctx.fill('evenodd'); break;
    case 'minicupcake': drawCupcake(ctx, x, y, s * 0.9, { liner: 'dots', color: 'strawberry', fill: 0.9, baked: true, frost: '#FFFFFF' }); break;
    case 'momo': drawMomo(ctx, x, y, s); break;
    case 'pip': drawPip(ctx, x, y, s); break;
    case 'biscuit': drawBiscuit(ctx, x, y, s); break;
    default: ctx.beginPath(); ctx.arc(x, y, s * 0.35, 0, Math.PI * 2); fillStroke(ctx, color || '#F7A8C0', s);
  }
}
export function drawTopper(ctx, id, x, y, s) {
  const t = TOPPERS.find(t => t.id === id); if (!t) return;
  if (drawArt(ctx, t.art, x - s / 2, y - s / 2, s, s)) return;
  drawThing(ctx, t.shape, x, y, s, t.color);
}
export function drawSticker(ctx, id, x, y, s) {
  const t = STICKERS.find(t => t.id === id); if (!t) return;
  if (drawArt(ctx, t.art, x - s / 2, y - s / 2, s, s)) return;
  ctx.save(); ctx.shadowColor = 'rgba(107,74,58,.25)'; ctx.shadowBlur = s * 0.06; ctx.shadowOffsetY = s * 0.02;
  drawThing(ctx, t.shape, x, y, s * 0.9, t.color); ctx.restore();
}

// ---------- ingredients ----------
export function drawIngredient(ctx, kind, x, y, s, state) {
  const id = kind === 'egg' ? (state === 'cracked' ? 'ingredient-egg-cracked' : state === 'shells' ? 'ingredient-egg-shell-halves' : 'ingredient-egg-whole') : ({ chips: 'ingredient-choc-chips' }[kind] || 'ingredient-' + kind);
  if (drawArt(ctx, id, x - s / 2, y - s / 2, s, s)) return;
  switch (kind) {
    case 'flour':
      ctx.beginPath(); ctx.moveTo(x - s * 0.3, y + s * 0.4); ctx.lineTo(x - s * 0.26, y - s * 0.28); ctx.quadraticCurveTo(x, y - s * 0.4, x + s * 0.26, y - s * 0.28); ctx.lineTo(x + s * 0.3, y + s * 0.4); ctx.closePath();
      fillStroke(ctx, '#FFF4E0', s); rrect(ctx, x - s * 0.28, y - s * 0.02, s * 0.56, s * 0.18, 4); ctx.fillStyle = '#A9D8F5'; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y + s * 0.07, s * 0.06, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
      cloudPath(ctx, x, y - s * 0.36, s * 0.3); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fill(); break;
    case 'sugar':
      ctx.beginPath(); ctx.moveTo(x - s * 0.34, y - s * 0.1); ctx.lineTo(x + s * 0.34, y - s * 0.1); ctx.lineTo(x + s * 0.24, y + s * 0.36); ctx.lineTo(x - s * 0.24, y + s * 0.36); ctx.closePath(); fillStroke(ctx, '#F7A8C0', s);
      for (const [dx, dy] of [[-0.14, -0.18], [0.04, -0.2], [0.18, -0.16], [-0.04, -0.3]]) { rrect(ctx, x + dx * s - s * 0.07, y + dy * s - s * 0.07, s * 0.14, s * 0.14, 3); fillStroke(ctx, '#ffffff', s, s * 0.02); }
      ctx.beginPath(); ctx.arc(x + s * 0.38, y + s * 0.1, s * 0.1, -Math.PI / 2, Math.PI / 2); ctx.lineWidth = s * 0.05; ctx.strokeStyle = darken('#F7A8C0'); ctx.stroke(); break;
    case 'milk':
      ctx.beginPath(); ctx.moveTo(x - s * 0.24, y - s * 0.2); ctx.lineTo(x - s * 0.34, y - s * 0.34); ctx.lineTo(x + s * 0.18, y - s * 0.34); ctx.lineTo(x + s * 0.24, y - s * 0.2); ctx.lineTo(x + s * 0.26, y + s * 0.4); ctx.lineTo(x - s * 0.26, y + s * 0.4); ctx.closePath(); fillStroke(ctx, '#FFFFFF', s);
      rrect(ctx, x - s * 0.26, y + s * 0.02, s * 0.52, s * 0.2, 2); ctx.fillStyle = '#A9D8F5'; ctx.fill();
      ctx.beginPath(); ctx.arc(x + s * 0.32, y + s * 0.08, s * 0.12, -Math.PI / 2, Math.PI / 2); ctx.lineWidth = s * 0.05; ctx.strokeStyle = '#9fb7c8'; ctx.stroke(); break;
    case 'butter':
      rrect(ctx, x - s * 0.36, y - s * 0.02, s * 0.72, s * 0.3, 6); fillStroke(ctx, '#FFF4E0', s);
      ctx.beginPath(); ctx.moveTo(x - s * 0.26, y - s * 0.02); ctx.lineTo(x - s * 0.18, y - s * 0.24); ctx.lineTo(x + s * 0.3, y - s * 0.24); ctx.lineTo(x + s * 0.26, y - s * 0.02); ctx.closePath(); fillStroke(ctx, '#FFE98A', s);
      rrect(ctx, x - s * 0.26, y - s * 0.02, s * 0.52, s * 0.18, 4); fillStroke(ctx, '#FFE98A', s); break;
    case 'chips':
      ctx.beginPath(); ctx.moveTo(x - s * 0.3, y - s * 0.3); ctx.lineTo(x + s * 0.3, y - s * 0.3); ctx.lineTo(x + s * 0.34, y + s * 0.4); ctx.lineTo(x - s * 0.34, y + s * 0.4); ctx.closePath(); fillStroke(ctx, '#B8E8D2', s);
      for (const [dx, dy] of [[-0.14, 0.02], [0.1, -0.06], [0, 0.18], [-0.16, 0.24], [0.16, 0.2]]) { ctx.beginPath(); ctx.moveTo(x + dx * s, y + dy * s - s * 0.08); ctx.quadraticCurveTo(x + dx * s + s * 0.08, y + dy * s + s * 0.04, x + dx * s, y + dy * s + s * 0.04); ctx.quadraticCurveTo(x + dx * s - s * 0.08, y + dy * s + s * 0.04, x + dx * s, y + dy * s - s * 0.08); fillStroke(ctx, '#7A4B32', s, s * 0.015); } break;
    case 'egg':
      ctx.beginPath(); ctx.ellipse(x, y, s * 0.26, s * 0.34, 0, 0, Math.PI * 2); fillStroke(ctx, '#FFF8EC', s);
      if (state === 'cracked') { ctx.strokeStyle = '#6B4A3A'; ctx.lineWidth = s * 0.025; ctx.beginPath(); ctx.moveTo(x - s * 0.26, y - s * 0.02); for (let i = 0; i < 6; i++) ctx.lineTo(x - s * 0.26 + (i + 1) * s * 0.087, y + (i % 2 ? -0.08 : 0.05) * s); ctx.stroke(); }
      else { face(ctx, x, y + s * 0.02, s * 0.8); } break;
  }
}

// ---------- liners ----------
export function linerFill(ctx, pattern, x, y, w, h) {
  const L = LINERS.find(l => l.id === pattern) || LINERS[0];
  ctx.save(); ctx.clip();
  if (L.id === 'gold') { const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#D9A93E'); g.addColorStop(0.45, '#FFF2B0'); g.addColorStop(1, '#C9952E'); ctx.fillStyle = g; }
  else ctx.fillStyle = L.base;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = L.ink; ctx.strokeStyle = L.ink;
  const u = Math.max(6, Math.min(w, h) / 4);
  if (L.id === 'dots') for (let i = 0; i * u < w + u; i++) for (let j = 0; j * u < h + u; j++) { ctx.beginPath(); ctx.arc(x + i * u + (j % 2) * u / 2, y + j * u, u * 0.18, 0, Math.PI * 2); ctx.fill(); }
  if (L.id === 'stripes') for (let i = 0; i * u < w + u; i++) ctx.fillRect(x + i * u, y, u * 0.45, h);
  if (L.id === 'hearts') for (let i = 0; i * u < w + u; i++) for (let j = 0; j * u < h + u; j++) { heartPath(ctx, x + i * u + (j % 2) * u / 2, y + j * u, u * 0.6); ctx.fill(); }
  if (L.id === 'stars') for (let i = 0; i * u < w + u; i++) for (let j = 0; j * u < h + u; j++) { starPath(ctx, x + i * u + (j % 2) * u / 2, y + j * u, u * 0.6); ctx.fill(); }
  if (L.id === 'gingham') { ctx.globalAlpha = 0.5; for (let i = 0; i * u < w + u; i++) ctx.fillRect(x + i * u, y, u / 2, h); for (let j = 0; j * u < h + u; j++) ctx.fillRect(x, y + j * u, w, u / 2); }
  if (L.id === 'gold') { ctx.globalAlpha = 0.35; for (let i = 0; i * u < w + u; i++) ctx.fillRect(x + i * u, y, u * 0.2, h); }
  ctx.restore();
}
export function drawLinerSwatch(ctx, pattern, x, y, s) {
  const L = LINERS.find(l => l.id === pattern);
  if (L && drawArt(ctx, L.art, x - s / 2, y - s / 2, s, s)) return;
  linerShape(ctx, x, y, s); linerFill(ctx, pattern, x - s / 2, y - s / 2, s, s);
  linerShape(ctx, x, y, s); ctx.lineWidth = s * 0.035; ctx.strokeStyle = '#6B4A3A'; ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1;
}
function linerShape(ctx, x, y, s) {
  ctx.beginPath(); ctx.moveTo(x - s * 0.4, y - s * 0.22); ctx.lineTo(x + s * 0.4, y - s * 0.22); ctx.lineTo(x + s * 0.28, y + s * 0.34); ctx.lineTo(x - s * 0.28, y + s * 0.34); ctx.closePath();
}

// ---------- batter colors ----------
export function batterFill(ctx, colorId, x, y, w, h, baked = false) {
  const C = COLORS.find(c => c.id === colorId) || COLORS[0];
  if (C.hex === 'rainbow') {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    RAINBOW.forEach((c, i) => g.addColorStop(i / (RAINBOW.length - 1), baked ? mix(c, '#E8B070', 0.15) : c));
    return g;
  }
  return baked ? mix(C.hex, '#E0A060', 0.22) : C.hex;
}
export function drawColorBlob(ctx, colorId, x, y, s) {
  const C = COLORS.find(c => c.id === colorId);
  if (C && drawArt(ctx, C.art, x - s / 2, y - s / 2, s, s)) return;
  ctx.beginPath(); ctx.moveTo(x, y - s * 0.42); ctx.bezierCurveTo(x + s * 0.28, y - s * 0.08, x + s * 0.36, y + s * 0.1, x + s * 0.3, y + s * 0.22);
  ctx.bezierCurveTo(x + s * 0.2, y + s * 0.44, x - s * 0.2, y + s * 0.44, x - s * 0.3, y + s * 0.22); ctx.bezierCurveTo(x - s * 0.36, y + s * 0.1, x - s * 0.28, y - s * 0.08, x, y - s * 0.42);
  const f = batterFill(ctx, colorId, x - s / 2, y - s / 2, s, s); fillStroke(ctx, f, s); if (typeof f !== 'string') { ctx.strokeStyle = '#8a6a5a'; ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(x - s * 0.1, y + s * 0.05, s * 0.05, s * 0.09, 0.3, 0, Math.PI * 2); ctx.fill();
}

// ---------- bowl ----------
// level 0..1, color: hex or null (cream), lumps 0..1, rainbow handled
export function drawBowl(ctx, x, y, w, h, { level = 0, colorId = null, base = '#FFF4E0', lumps = 0, swirl = 0, stirring = false, recipe = 'cupcakes' } = {}) {
  let id;
  if (colorId) id = `batter-${recipe === 'cookies' ? 'cookie' : 'cupcake'}-${colorId}-mixed`;
  else if (stirring) id = lumps > 0.4 ? 'batter-texture-lumpy' : 'batter-texture-smooth';
  else id = 'bowl-fill-' + [0, 25, 50, 75, 100][Math.round(Math.min(1, level) * 4)];
  if (drawArt(ctx, id, x - w / 2, y - h * 0.62, w, h * 1.12)) return;
  { ctx.beginPath(); ctx.ellipse(x, y - h * 0.22, w * 0.48, h * 0.16, 0, 0, Math.PI * 2); ctx.fillStyle = '#8fc8ea'; ctx.fill(); }
  if (level > 0) {
    const ly = y - h * 0.22 + (1 - level) * h * 0.3;
    const lw = w * (0.38 + 0.1 * level);
    ctx.beginPath(); ctx.ellipse(x, ly, lw, h * 0.13, 0, 0, Math.PI * 2);
    const fill = colorId ? batterFill(ctx, colorId, x - lw, ly - 20, lw * 2, 40) : base;
    ctx.fillStyle = fill; ctx.fill();
    if (swirl > 0) { ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3; ctx.beginPath(); for (let a = 0; a < 12; a += 0.15) { const r = a * lw / 12; ctx.lineTo(x + Math.cos(a + swirl) * r, ly + Math.sin(a + swirl) * r * 0.32); } ctx.stroke(); ctx.restore(); }
    if (lumps > 0.02) { ctx.fillStyle = `rgba(255,255,255,${0.9 * lumps})`; for (const [dx, dy, r] of [[-0.5, 0, 0.09], [-0.15, -0.3, 0.07], [0.25, 0.1, 0.1], [0.55, -0.2, 0.06], [0, 0.35, 0.08], [-0.35, 0.4, 0.05]]) { ctx.beginPath(); ctx.ellipse(x + dx * lw, ly + dy * h * 0.12, r * lw * lumps + 2, r * lw * 0.5 * lumps + 1, 0, 0, Math.PI * 2); ctx.fill(); } }
  }
  {
    ctx.beginPath(); ctx.moveTo(x - w * 0.48, y - h * 0.22); ctx.bezierCurveTo(x - w * 0.46, y + h * 0.45, x + w * 0.46, y + h * 0.45, x + w * 0.48, y - h * 0.22);
    ctx.ellipse(x, y - h * 0.22, w * 0.48, h * 0.16, 0, 0, Math.PI, false);
    fillStroke(ctx, '#A9D8F5', w * 0.5);
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(x - w * 0.28, y + h * 0.05, w * 0.04, h * 0.14, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; for (const dx of [-0.2, 0, 0.2]) { heartPath(ctx, x + dx * w, y + h * 0.18, w * 0.06); ctx.fill(); }
  }
}

// ---------- treats ----------
// Decor geometry: center & radius of the decorating area for an item drawn in box (x,y,s)
export function decorGeom(kind, x, y, s) {
  return kind === 'cupcakes' ? { cx: x, cy: y - s * 0.12, R: s * 0.36 } : { cx: x, cy: y, R: s * 0.38 };
}
function cupDomePath(ctx, x, y, s, fill) {
  const ry = s * (0.14 + 0.22 * Math.min(1.2, fill)), rx = s * (0.4 + 0.04 * Math.min(1, fill));
  ctx.beginPath(); ctx.moveTo(x - rx, y + s * 0.06);
  ctx.bezierCurveTo(x - rx * 1.05, y + s * 0.06 - ry * 1.2, x + rx * 1.05, y + s * 0.06 - ry * 1.2, x + rx, y + s * 0.06);
  ctx.quadraticCurveTo(x, y + s * 0.12, x - rx, y + s * 0.06); ctx.closePath();
}
// opts: { liner, color, fill (0..1), baked, decor: [], frost (simple frosting for stickers) }
export function drawCupcake(ctx, x, y, s, o = {}) {
  const fill = o.fill ?? 0.8;
  // liner
  ctx.beginPath(); ctx.moveTo(x - s * 0.4, y + s * 0.04); ctx.lineTo(x + s * 0.4, y + s * 0.04); ctx.lineTo(x + s * 0.28, y + s * 0.46); ctx.lineTo(x - s * 0.28, y + s * 0.46); ctx.closePath();
  const LA = null;
  // liner is drawn in code so the chosen pattern always matches the dome (liner art is used for swatches)
  if (o.liner) { linerFill(ctx, o.liner, x - s * 0.4, y, s * 0.8, s * 0.5); ctx.beginPath(); ctx.moveTo(x - s * 0.4, y + s * 0.04); ctx.lineTo(x + s * 0.4, y + s * 0.04); ctx.lineTo(x + s * 0.28, y + s * 0.46); ctx.lineTo(x - s * 0.28, y + s * 0.46); ctx.closePath(); }
  else { ctx.fillStyle = '#EDE4DA'; ctx.fill(); }
  if (!(LA && artImage(LA.art))) { ctx.lineWidth = s * 0.03; ctx.strokeStyle = 'rgba(107,74,58,.55)'; ctx.stroke(); }
  ctx.strokeStyle = 'rgba(107,74,58,.25)'; ctx.lineWidth = s * 0.015;
  if (!(LA && artImage(LA.art))) for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(x + i * s * 0.11, y + s * 0.06); ctx.lineTo(x + i * s * 0.08, y + s * 0.44); ctx.stroke(); }
  if (fill > 0.01 && o.color) {
    if (!o.baked) { // raw batter peeks above the liner
      ctx.save(); ctx.beginPath(); ctx.rect(x - s, y - s, s * 2, s * 1.05); ctx.clip();
      cupDomePath(ctx, x, y + s * 0.02, s, fill * 0.5); ctx.fillStyle = batterFill(ctx, o.color, x - s * 0.4, y - s * 0.3, s * 0.8, s * 0.4); ctx.fill(); ctx.restore();
    } else {
      cupDomePath(ctx, x, y, s, fill);
      const f = batterFill(ctx, o.color, x - s * 0.4, y - s * 0.4, s * 0.8, s * 0.5, true);
      ctx.fillStyle = f; ctx.fill(); ctx.lineWidth = s * 0.03; ctx.strokeStyle = typeof f === 'string' ? darken(f, 0.3) : '#b98a6a'; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(x - s * 0.18, y - s * 0.1 * fill, s * 0.08, s * 0.035, -0.4, 0, Math.PI * 2); ctx.fill();
      if (o.frost) { ctx.save(); cupDomePath(ctx, x, y, s, fill); ctx.clip(); ctx.strokeStyle = o.frost; ctx.lineWidth = s * 0.12; ctx.lineCap = 'round'; ctx.beginPath(); for (let a = 0; a < 14; a += 0.3) { const r = s * 0.32 * (1 - a / 16); ctx.lineTo(x + Math.cos(a) * r, y - s * 0.08 + Math.sin(a) * r * 0.5); } ctx.stroke(); ctx.restore(); }
      if (o.decor) { cupDomePath(ctx, x, y, s, Math.max(fill, 0.7)); drawDecor(ctx, o.decor, decorGeom('cupcakes', x, y, s)); }
    }
  }
}
export function drawCookie(ctx, x, y, s, o = {}) {
  const shape = o.shape || 'circle';
  shapePath(ctx, shape, x, y, s * 0.9);
  const f = batterFill(ctx, o.color || 'vanilla', x - s / 2, y - s / 2, s, s, o.baked !== false);
  ctx.fillStyle = f; ctx.fill(); ctx.lineWidth = s * 0.035; ctx.strokeStyle = typeof f === 'string' ? darken(f, 0.3) : '#b98a6a'; ctx.stroke();
  // choc chip dots
  ctx.fillStyle = 'rgba(122,75,50,.75)';
  for (const [dx, dy] of [[-0.12, -0.05], [0.12, 0.02], [0, 0.16], [-0.04, -0.18], [0.14, -0.16]]) { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, s * 0.025, 0, Math.PI * 2); ctx.fill(); }
  if (o.decor) { shapePath(ctx, shape, x, y, s * 0.9); drawDecor(ctx, o.decor, decorGeom('cookies', x, y, s)); }
}
// The current path is the clip for strokes/sprinkles; toppers draw unclipped.
export function drawDecor(ctx, decor, g) {
  const g0 = g;
  ctx.save(); ctx.clip();
  for (const d of decor) {
    if (d.type === 'stroke' && d.points.length) {
      const pts = d.points;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const rb = d.color === 'rainbow';
      let base = d.color;
      if (rb) { const g = ctx.createLinearGradient(g0.cx - g0.R, g0.cy - g0.R, g0.cx + g0.R, g0.cy + g0.R); RAINBOW.forEach((c, i) => g.addColorStop(i / 5, c)); base = g; }
      for (const [w, col] of [[0.2, rb ? '#d9b8c8' : darken(d.color, 0.12)], [0.16, base], [0.05, 'rgba(255,255,255,.55)']]) {
        ctx.beginPath(); ctx.lineWidth = g.R * w; ctx.strokeStyle = col;
        ctx.moveTo(g.cx + pts[0][0] * g.R, g.cy + pts[0][1] * g.R);
        if (pts.length === 1) ctx.lineTo(g.cx + pts[0][0] * g.R + 0.1, g.cy + pts[0][1] * g.R);
        for (const p of pts) ctx.lineTo(g.cx + p[0] * g.R, g.cy + p[1] * g.R);
        ctx.stroke();
      }
    } else if (d.type === 'sprinkles') {
      for (const p of d.dots) drawSprinkle(ctx, d.kind, g.cx + p[0] * g.R, g.cy + p[1] * g.R, g.R * 0.09, p[2], p[3]);
    }
  }
  ctx.restore();
  for (const d of decor) if (d.type === 'topper') drawTopper(ctx, d.id, g.cx + d.x * g.R, g.cy + d.y * g.R, g.R * 0.55);
}
const SPR_COLORS = ['#FF7F7F', '#FFE98A', '#9EDDC0', '#A9D8F5', '#CDB8F0', '#FFFFFF', '#F7A8C0'];
export function drawSprinkle(ctx, kind, x, y, s, rot, ci) {
  ctx.fillStyle = SPR_COLORS[ci % SPR_COLORS.length];
  if (kind === 'jimmies') { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); rrect(ctx, -s * 0.6, -s * 0.18, s * 1.2, s * 0.36, s * 0.18); ctx.fill(); ctx.restore(); }
  else if (kind === 'hearts') { heartPath(ctx, x, y, s * 1.3); ctx.fill(); }
  else if (kind === 'stars') { starPath(ctx, x, y, s * 1.4); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(x, y, s * 0.3, 0, Math.PI * 2); ctx.fill(); }
}
// Draw item i of a creation (after bake)
export function drawTreat(ctx, C, i, x, y, s) {
  const decor = C.decorations || [];
  if (C.recipe === 'cupcakes') {
    const fill = Math.max(0.5, C.bakeResult?.fills?.[i] ?? 0.8);
    drawCupcake(ctx, x, y, s, { liner: C.liner || 'dots', color: C.color || 'vanilla', fill, baked: true, decor });
  } else {
    const shape = C.bakeResult?.shapes?.[i] || 'heart';
    if (drawTintedCookie(ctx, shape, C.color || 'vanilla', x, y, s)) { shapePath(ctx, shape, x, y, s * 0.9); drawDecor(ctx, decor, decorGeom('cookies', x, y, s)); return; }
    drawCookie(ctx, x, y, s, { shape, color: C.color || 'vanilla', baked: true, decor });
  }
}
export function treatCanvas(C, i, s) {
  const c = mkCanvas(s, s, 'treat');
  drawTreat(c.ctx, C, i, s / 2, s / 2, s * 0.95);
  return c;
}

// ---------- plates ----------
export function drawPlate(ctx, id, x, y, w, h) {
  const P = PLATES.find(p => p.id === id);
  if (P && drawArt(ctx, P.art, x - w / 2, y - h / 2, w, h)) return;
  const s = Math.min(w, h * 1.3);
  ctx.save(); ctx.shadowColor = 'rgba(107,74,58,.2)'; ctx.shadowBlur = s * 0.04; ctx.shadowOffsetY = s * 0.02;
  if (id === 'round-pink') { ctx.beginPath(); ctx.ellipse(x, y, w * 0.48, h * 0.46, 0, 0, Math.PI * 2); fillStroke(ctx, '#F7A8C0', s); ctx.restore(); ctx.beginPath(); ctx.ellipse(x, y, w * 0.38, h * 0.36, 0, 0, Math.PI * 2); ctx.fillStyle = '#FBD3DE'; ctx.fill(); return; }
  if (id === 'scalloped-mint') { ctx.beginPath(); const n = 16; for (let i = 0; i <= n * 8; i++) { const a = i / (n * 8) * Math.PI * 2, r = 1 - 0.04 * Math.abs(Math.sin(a * n / 2)); ctx.lineTo(x + Math.cos(a) * w * 0.48 * r, y + Math.sin(a) * h * 0.46 * r); } fillStroke(ctx, '#B8E8D2', s); ctx.restore(); ctx.beginPath(); ctx.ellipse(x, y, w * 0.37, h * 0.35, 0, 0, Math.PI * 2); ctx.fillStyle = '#DDF5EA'; ctx.fill(); return; }
  if (id === 'heart') { ctx.save(); ctx.translate(x, y + h * 0.04); ctx.scale(w / s, h / s * 1.1); heartPath(ctx, 0, 0, s * 1.15); fillStroke(ctx, '#FF9C9C', s); ctx.restore(); ctx.restore(); return; }
  if (id === 'cloud') { ctx.save(); ctx.translate(x, y - h * 0.08); ctx.scale(w / s, h / s * 1.25); cloudPath(ctx, 0, 0, s); fillStroke(ctx, '#FFFFFF', s); ctx.restore(); ctx.restore(); return; }
  if (id === 'star') { ctx.save(); ctx.translate(x, y); ctx.scale(w / s, h / s * 1.25); starPath(ctx, 0, 0, s * 1.05, 5, 0.6); fillStroke(ctx, '#FFE98A', s); ctx.restore(); ctx.restore(); return; }
  // wooden board
  rrect(ctx, x - w * 0.44, y - h * 0.36, w * 0.88, h * 0.72, s * 0.1); fillStroke(ctx, '#D9A066', s);
  ctx.restore(); rrect(ctx, x + w * 0.4, y - h * 0.08, w * 0.1, h * 0.16, s * 0.04); fillStroke(ctx, '#D9A066', s);
  ctx.strokeStyle = 'rgba(107,74,58,.25)'; ctx.lineWidth = 2; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(x - w * 0.38, y + i * h * 0.12); ctx.lineTo(x + w * 0.36, y + i * h * 0.12); ctx.stroke(); }
}

// ---------- carriers ----------
const CARRIER_COLORS = { bento: '#F7A8C0', basket: '#E0B07A', tin: '#A9D8F5', bag: '#CDB8F0' };
// open: show interior; returns interior rect for arranging items {x,y,w,h}
export function drawCarrier(ctx, id, x, y, w, h, open) {
  const C = CARRIERS.find(c => c.id === id) || CARRIERS[0];
  const col = CARRIER_COLORS[C.id];
  const inner = { x: x - w * 0.36, y: y - h * 0.08, w: w * 0.72, h: h * 0.38 };
  if (drawArt(ctx, open ? C.artOpen : C.artClosed, x - w / 2, y - h / 2, w, h)) return inner;
  ctx.save(); ctx.shadowColor = 'rgba(107,74,58,.2)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
  if (C.id === 'bento') {
    if (open) { rrect(ctx, x - w * 0.42, y - h * 0.46, w * 0.84, h * 0.22, 18); fillStroke(ctx, lighten(col, 0.2), w * 0.5); }
    rrect(ctx, x - w * 0.44, y - (open ? h * 0.16 : h * 0.3), w * 0.88, open ? h * 0.62 : h * 0.76, 26); fillStroke(ctx, col, w * 0.5);
    ctx.restore();
    if (open) { rrect(ctx, x - w * 0.4, y - h * 0.12, w * 0.8, h * 0.54, 18); ctx.fillStyle = '#FFF4E0'; ctx.fill(); }
    else { ctx.fillStyle = 'rgba(255,255,255,.35)'; rrect(ctx, x - w * 0.44, y - h * 0.02, w * 0.88, h * 0.06, 0); ctx.fill(); }
  } else if (C.id === 'basket') {
    ctx.lineWidth = w * 0.03; ctx.strokeStyle = darken(col); ctx.beginPath(); ctx.ellipse(x, y - h * 0.1, w * 0.3, h * 0.42, 0, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - w * 0.44, y - h * 0.12); ctx.lineTo(x + w * 0.44, y - h * 0.12); ctx.lineTo(x + w * 0.36, y + h * 0.46); ctx.lineTo(x - w * 0.36, y + h * 0.46); ctx.closePath(); fillStroke(ctx, col, w * 0.5);
    ctx.restore(); ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(107,74,58,.3)'; ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x - w * 0.44, y - h * 0.04 + i * h * 0.1); ctx.lineTo(x + w * 0.44, y - h * 0.04 + i * h * 0.1); ctx.stroke(); }
    ctx.restore();
    if (!open) { rrect(ctx, x - w * 0.46, y - h * 0.18, w * 0.92, h * 0.12, 10); fillStroke(ctx, '#FF9FB5', w * 0.5); ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 0; i < 20; i++) ctx.fillRect(x - w * 0.46 + i * w * 0.05, y - h * 0.18, w * 0.025, h * 0.12); ctx.restore(); }
  } else if (C.id === 'tin') {
    if (open) { ctx.beginPath(); ctx.ellipse(x + w * 0.3, y - h * 0.32, w * 0.2, h * 0.12, 0.5, 0, Math.PI * 2); fillStroke(ctx, lighten(col, 0.2), w * 0.5); }
    rrect(ctx, x - w * 0.42, y - h * 0.16, w * 0.84, h * 0.6, 30); fillStroke(ctx, col, w * 0.5);
    ctx.restore();
    if (!open) { rrect(ctx, x - w * 0.45, y - h * 0.28, w * 0.9, h * 0.16, 24); fillStroke(ctx, lighten(col, 0.25), w * 0.5); }
    else { rrect(ctx, x - w * 0.38, y - h * 0.12, w * 0.76, h * 0.5, 22); ctx.fillStyle = '#FFF4E0'; ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,.5)'; for (let i = -3; i <= 3; i++) { starPath(ctx, x + i * w * 0.11, y + h * 0.38, w * 0.04); ctx.fill(); }
  } else { // gift bag
    if (!open) { ctx.lineWidth = w * 0.025; ctx.strokeStyle = darken(col); ctx.beginPath(); ctx.arc(x, y - h * 0.24, w * 0.14, Math.PI, 0); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x - w * 0.36, y - h * 0.24); ctx.lineTo(x + w * 0.36, y - h * 0.24); ctx.lineTo(x + w * 0.4, y + h * 0.46); ctx.lineTo(x - w * 0.4, y + h * 0.46); ctx.closePath(); fillStroke(ctx, col, w * 0.5);
    ctx.restore();
    if (open) { ctx.fillStyle = lighten(col, 0.4); ctx.beginPath(); ctx.moveTo(x - w * 0.36, y - h * 0.24); ctx.lineTo(x - w * 0.2, y - h * 0.38); ctx.lineTo(x + w * 0.2, y - h * 0.38); ctx.lineTo(x + w * 0.36, y - h * 0.24); ctx.closePath(); ctx.fill(); }
  }
  return inner;
}
// Rect (relative 0..1 of the carrier box) where stickers sit visibly
export const STICKER_AREA = { x: 0.08, y: 0.22, w: 0.84, h: 0.7 };

// ---------- full scene used by Show-Off and Gallery thumbnails ----------
export function drawScene(ctx, C, w, h, { open = true } = {}) {
  ctx.fillStyle = '#FFF4E0'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#B8E8D2'; ctx.fillRect(0, h * 0.72, w, h * 0.28);
  const cw = w * 0.7, ch = h * 0.78, cx = w / 2, cy = h * 0.55;
  drawCarrier(ctx, C.carrier || 'bento', cx, cy, cw, ch, open);
  // stickers on the carrier body
  for (const st of C.carrierDecor || []) drawSticker(ctx, st.id, cx - cw / 2 + st.x * cw, cy - ch / 2 + st.y * ch, ch * 0.2);
  if (open) {
    const pw = cw * 0.8, ph = ch * 0.42, py = cy - ch * 0.2;
    drawPlate(ctx, C.plate || 'round-pink', cx, py, pw, ph);
    const n = 6, s = Math.min(pw / 3.6, ph / 1.6);
    for (let i = 0; i < n; i++) { const col = i % 3, row = Math.floor(i / 3); drawTreat(ctx, C, i, cx + (col - 1) * s * 1.05, py - s * 0.35 + row * s * 0.7, s); }
  }
}

// Artie's baked cookies are golden only: tint them to the batter color with a multiply.
const tintCache = new Map();
export function tintedCookieImage(shape, colorId) {
  const img = artImage(`cookie-${shape}-baked`);
  if (!img) return null;
  const key = shape + '|' + colorId;
  if (tintCache.has(key)) return tintCache.get(key);
  const w = img.naturalWidth || 256, h = img.naturalHeight || 256;
  const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height);
  if (colorId !== 'vanilla') {
    x.globalCompositeOperation = 'multiply';
    const C = COLORS.find(k => k.id === colorId);
    if (C && C.hex === 'rainbow') { const g = x.createLinearGradient(0, 0, c.width, c.height); RAINBOW.forEach((k, i) => g.addColorStop(i / 5, lighten(k, 0.45))); x.fillStyle = g; }
    else x.fillStyle = lighten(C ? C.hex : '#ffffff', colorId === 'chocolate' ? 0.1 : 0.35);
    x.fillRect(0, 0, c.width, c.height);
    x.globalCompositeOperation = 'destination-in'; x.drawImage(img, 0, 0, c.width, c.height);
  }
  tintCache.set(key, c);
  return c;
}
function drawTintedCookie(ctx, shape, colorId, x, y, s) {
  const c = tintedCookieImage(shape, colorId);
  if (!c) return false;
  ctx.drawImage(c, x - s / 2, y - s / 2, s, s);
  return true;
}
