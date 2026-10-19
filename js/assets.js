// Asset loader. Reads assets/art/manifest.json (from Artie) and looks art up by id.
// Any id that is missing (or whose file fails to load) falls back to the
// placeholder drawing passed by the caller, so art can drop in at any time.
const BASE = 'assets/art/';
const FOLDERS = {
  ingredient: 'ingredients', tool: 'tools', tin: 'tins-liners', liner: 'tins-liners',
  batter: 'batter', baked: 'baked', decoration: 'decorations', plate: 'plates',
  carrier: 'carriers', sticker: 'stickers', ui: 'ui', bg: 'backgrounds', background: 'backgrounds',
  fx: 'effects', effect: 'effects', card: 'cards'
};
const entries = new Map();   // id -> { srcs: [primary, fallback...], width, height }
const images = new Map();    // id -> HTMLImageElement (loaded) | 'pending' | 'failed'
const listeners = new Set();

function guessSrcs(id) {
  const prefix = id.split('-')[0];
  const folder = FOLDERS[prefix];
  if (!folder) return [];
  if (folder === 'backgrounds') return [`${BASE}${folder}/webp/${id}.webp`, `${BASE}${folder}/png/${id}.png`];
  return [`${BASE}${folder}/svg/${id}.svg`, `${BASE}${folder}/png@2x/${id}.png`];
}
function norm(p) {
  if (!p) return null;
  p = String(p).replace(/^\.?\//, '');
  if (/^(https?:)?\/\//.test(p)) return null; // never load anything off-site
  if (p.startsWith('assets/')) return p;
  return BASE + p;
}
function addEntry(raw, keyId) {
  if (!raw) return;
  if (typeof raw === 'string') raw = { file: raw };
  const file = raw.file || raw.path || raw.src || raw.svg || raw.png || raw.webp;
  const id = raw.id || keyId || (file && file.split('/').pop().replace(/\.[^.]+$/, '').replace(/@2x$/, ''));
  if (!id) return;
  const prev = entries.get(id) || { srcs: [], width: raw.width, height: raw.height };
  const listed = [raw.svg, raw.webp, file, raw.png, ...(raw.files || [])].map(norm).filter(Boolean);
  const srcs = [...new Set([...prev.srcs, ...listed, ...(listed.length ? [] : guessSrcs(id))])];
  // vector first, then raster
  srcs.sort((a, b) => rank(a) - rank(b));
  entries.set(id, { srcs, width: raw.width ?? prev.width, height: raw.height ?? prev.height });
}
const rank = s => (s.endsWith('.svg') ? 0 : s.endsWith('.webp') ? 1 : 2);

export async function loadManifest() {
  try {
    const res = await fetch(BASE + 'manifest.json', { cache: 'no-cache' });
    if (!res.ok) return 0;
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.assets || data.files || data.items || null);
    if (list) list.forEach(e => addEntry(e));
    else Object.entries(data).forEach(([k, v]) => { if (typeof v === 'object' || typeof v === 'string') addEntry(v, k); });
  } catch (e) { /* no manifest yet: placeholders everywhere */ }
  listeners.forEach(fn => fn());
  return entries.size;
}

export const hasArt = id => entries.has(id) && images.get(id) !== 'failed';
export const artInfo = id => entries.get(id) || null;
export const onArtReady = fn => listeners.add(fn);

function loadImage(id) {
  const st = images.get(id);
  if (st) return st;
  const e = entries.get(id);
  if (!e) return null;
  images.set(id, 'pending');
  const img = new Image();
  let i = 0;
  img.onload = () => { images.set(id, img); listeners.forEach(fn => fn(id)); };
  img.onerror = () => { i++; if (i < e.srcs.length) img.src = e.srcs[i]; else images.set(id, 'failed'); };
  img.src = e.srcs[0];
  return 'pending';
}

// For canvas drawing: returns a ready image or null (caller draws placeholder).
export function artImage(id) {
  const st = loadImage(id);
  return st && st !== 'pending' && st !== 'failed' ? st : null;
}

// Draw art for id into a box on a canvas; returns true when art was drawn.
export function drawArt(ctx, id, x, y, w, h) {
  const img = artImage(id);
  if (!img) return false;
  const iw = img.naturalWidth || w, ih = img.naturalHeight || h;
  const s = Math.min(w / iw, h / ih);
  ctx.drawImage(img, x + (w - iw * s) / 2, y + (h - ih * s) / 2, iw * s, ih * s);
  return true;
}

// For DOM: returns an <img> for id, or the placeholder node if the id/file is missing.
export function artNode(id, makePlaceholder, w, h) {
  const ph = () => makePlaceholder();
  const e = entries.get(id);
  if (!e || images.get(id) === 'failed') return ph();
  const img = document.createElement('img');
  img.alt = ''; img.draggable = false; img.className = 'art';
  img.dataset.art = id;
  if (w) img.style.width = w + 'px';
  if (h) img.style.height = h + 'px';
  let i = 0;
  img.onerror = () => {
    i++;
    if (i < e.srcs.length) img.src = e.srcs[i];
    else { images.set(id, 'failed'); img.replaceWith(ph()); }
  };
  img.src = e.srcs[0];
  return img;
}

// Preload every non-background image; resolves when done (or after a timeout).
export function preloadAll(timeout = 4000) {
  const ids = [...entries.keys()].filter(id => !id.startsWith('bg-'));
  ids.forEach(loadImage);
  return new Promise(res => {
    const t0 = performance.now();
    const check = () => {
      const pending = ids.some(id => images.get(id) === 'pending');
      if (!pending || performance.now() - t0 > timeout) res(); else setTimeout(check, 50);
    };
    check();
  });
}
