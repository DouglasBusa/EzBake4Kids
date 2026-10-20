import { fxArt, el, place, startDrag, rectOf, grow, overlaps, sparkles, toLocal, wait } from '../ui.js';
import { RECIPES, INGREDIENTS } from '../data.js';
import { mkCanvas, iconCanvas, drawBowl, drawIngredient } from '../draw.js';
import { artNode } from '../assets.js';
import { sfx } from '../audio.js';

const SPOTS = [{ cx: 170, cy: 390 }, { cx: 854, cy: 390 }];

export function create(api) {
  let root, C, bowl, level = 0, total = 1, added = 0, lumps = 1, stirring = false, cum = 0;
  let phase = -1, items = [], egg = null, spoon = null, stars = [], busy = false, finished = false;
  const offs = [];
  const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
  const R = () => RECIPES[C.recipe || 'cupcakes'];

  function drawB() { bowl.clear(); drawBowl(bowl.ctx, 170, 128, 320, 210, { level, lumps, stirring, recipe: C.recipe }); }
  function bowlRect() { return rectOf(bowl); }

  function startPhase(i) {
    phase = i;
    const ph = R().phases[i];
    if (!ph) return finish();
    if (ph.kind === 'pour') {
      const names = ph.items.map(k => INGREDIENTS[k].name.toLowerCase()).join(' and ');
      api.setCue(i === 0 ? `Drag the ${names} into the bowl!` : `Now the ${names}!`, 'Drag it to the bowl!');
      items = ph.items.map((k, j) => makeItem(k, SPOTS[j]));
    } else if (ph.kind === 'egg') {
      eggsLeft = ph.count;
      api.setCue(ph.count > 1 ? 'Tap the eggs to crack them!' : 'Tap the egg to crack it!', 'Tap the egg!');
      spawnEgg();
    } else {
      api.setCue('Stir in big circles!', 'Move your finger round and round!');
      stirring = true; drawB(); showStirUI();
    }
  }
  function makeItem(kind, spot) {
    const d = el('div', 'item pop-in', root, { 'aria-label': INGREDIENTS[kind].name, role: 'img' });
    place(d, spot.cx - 70, spot.cy - 70, 140, 140);
    d.dataset.ing = kind;
    const mk = () => artNode(INGREDIENTS[kind].art, () => iconCanvas(140, (c, x, y, s) => drawIngredient(c, kind, x, y, s * 0.95)), 140, 140);
    d.appendChild(mk());
    on(d, 'pointerdown', e => {
      if (busy && false) return;
      api.progress();
      d.style.visibility = 'hidden';
      startDrag(e, {
        makeGhost: mk, size: 140, from: rectOf(d),
        onDrop: (gr, p, ghost) => {
          if (overlaps(gr, grow(bowlRect(), 1.5))) { pour(kind, d, ghost); return 'keep'; }
          setTimeout(() => { d.style.visibility = ''; }, 430);
          return false;
        }
      });
    });
    return d;
  }
  async function pour(kind, d, ghost) {
    api.progress();
    const b = bowlRect();
    ghost.classList.add('pouring');
    ghost.style.transform = `translate(${b.cx - 20}px, ${b.y - 90}px) rotate(-70deg)`;
    sfx('pour');
    if (kind === 'flour' || kind === 'sugar') setTimeout(() => fxArt('fx-flour-puff', b.cx, b.y + 10, 150, 900), 300);
    for (let i = 0; i < 10; i++) setTimeout(() => {
      const p = el('div', 'tmp drip', document.getElementById('fx'));
      place(p, b.cx - 30 + Math.random() * 30, b.y - 30, 14, 14);
      p.style.background = INGREDIENTS[kind].color;
      setTimeout(() => p.remove(), 700);
    }, 200 + i * 50);
    await wait(750);
    ghost.remove(); d.remove();
    items = items.filter(x => x !== d);
    added++; level = added / total; drawB();
    sparkles(b.cx, b.y + 40, 5, 60);
    if (!items.length && !finished) {
      if (phase === 0) { sfx('cheer'); api.say('Yay! Great pouring!', {}); }
      await wait(phase === 0 ? 900 : 300);
      startPhase(phase + 1);
    }
  }
  let eggsLeft = 0, eggState = 0;
  function spawnEgg() {
    eggState = 0;
    egg = el('div', 'item egg pop-in', root, { 'aria-label': 'Egg', role: 'img' });
    place(egg, 442, 110, 140, 140);
    renderEgg();
  }
  function renderEgg() {
    egg.innerHTML = '';
    const st = ['whole', 'cracked', 'shells'][eggState];
    const id = { whole: 'ingredient-egg-whole', cracked: 'ingredient-egg-cracked', shells: 'ingredient-egg-shell-halves' }[st];
    egg.appendChild(artNode(id, () => iconCanvas(140, (c, x, y, s) => drawIngredient(c, 'egg', x, y, s * 0.9, st)), 140, 140));
  }
  async function tapEgg() {
    if (!egg || busy) return; // extra taps do nothing harmful
    api.progress();
    if (eggState === 0) { eggState = 1; renderEgg(); sfx('crack'); egg.classList.remove('wiggle'); void egg.offsetWidth; egg.classList.add('wiggle'); return; }
    busy = true; eggState = 2; renderEgg(); sfx('plop');
    const b = bowlRect();
    const er = rectOf(egg); const y = el('div', 'tmp yolk', document.getElementById('fx')); place(y, er.cx - 15, er.cy - 10, 30, 30);
    requestAnimationFrame(() => { y.style.transform = `translateY(${b.y + 50 - er.cy}px)`; });
    await wait(450); y.remove();
    added++; level = added / total; drawB();
    egg.classList.add('fade-out');
    await wait(350);
    egg.remove(); egg = null; busy = false;
    eggsLeft--;
    if (finished) return;
    if (eggsLeft > 0) spawnEgg(); else startPhase(phase + 1);
  }
  function showStirUI() {
    spoon = el('div', 'spoon', document.getElementById('fx'), { 'aria-hidden': 'true' });
    spoon.classList.add('tmp');
    spoon.appendChild(artNode('tool-wooden-spoon', () => iconCanvas(140, (c, x, y, s) => {
      c.save(); c.translate(x, y); c.rotate(0.6); c.fillStyle = '#E0B07A'; c.strokeStyle = '#8a6040'; c.lineWidth = 3;
      c.beginPath(); c.roundRect(-8, -60, 16, 90, 8); c.fill(); c.stroke(); c.beginPath(); c.ellipse(0, 42, 22, 30, 0, 0, Math.PI * 2); c.fill(); c.stroke(); c.restore();
    }), 140, 140));
    const b = bowlRect();
    place(spoon, b.cx - 20, b.y - 40, 140, 140);
    const row = el('div', 'stir-stars', root, { 'aria-hidden': 'true' });
    place(row, b.cx - 90, b.y - 76, 180, 50);
    stars = [0, 1, 2].map(() => el('div', 'stir-star', row));
  }
  let last = null, stirId = null;
  function stirDown(e) {
    if (!stirring || finished) return;
    stirId = e.pointerId; last = null; stirMove(e);
  }
  function stirMove(e) {
    if (!stirring || finished || e.pointerId !== stirId) return;
    const p = toLocal(e);
    if (spoon) spoon.style.transform = `translate(${p.x - (parseFloat(spoon.style.left) + 50)}px, ${p.y - (parseFloat(spoon.style.top) + 110)}px)`;
    const b = bowlRect();
    const dx = p.x - b.cx, dy = p.y - (b.cy - 10), r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    if (last != null && r >= 30) {
      let d = a - last; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      cum += Math.abs(d) * 180 / Math.PI;
      api.progress();
      sfx('squish', 260);
      lumps = Math.max(0, 1 - cum / 1080); drawB();
      stars.forEach((s, i) => s.classList.toggle('on', cum >= (i + 1) * 360));
      if (cum >= 1080) finish();
    }
    last = r >= 30 ? a : null;
  }
  function stirUp(e) { if (e.pointerId === stirId) { stirId = null; last = null; } }
  function finish() {
    if (finished) return;
    finished = true; stirring = true; lumps = 0; level = 1; C.ingredientsDone = true; drawB();
    stars.forEach(s => s.classList.add('on'));
    const b = bowlRect(); sparkles(b.cx, b.cy, 12, 140);
    api.say('Smooth and yummy!');
    api.complete();
  }

  return {
    skill: true,
    customCue: true,
    enter(r, c) {
      root = r; C = c;
      const rec = R();
      total = rec.phases.reduce((n, p) => n + (p.kind === 'pour' ? p.items.length : p.kind === 'egg' ? p.count : 0), 0);
      bowl = mkCanvas(340, 250, 'bowl'); root.appendChild(bowl); place(bowl, 342, 300);
      bowl.setAttribute('aria-label', 'Mixing bowl'); bowl.setAttribute('role', 'img');
      on(root, 'pointerdown', e => {
        if (egg) { const p = toLocal(e), er = rectOf(egg); if (Math.hypot(p.x - er.cx, p.y - er.cy) <= 70 + 60) tapEgg(); }
        stirDown(e);
      });
      on(window, 'pointermove', stirMove); on(window, 'pointerup', stirUp); on(window, 'pointercancel', stirUp);
      if (C.ingredientsDone) { finished = true; level = 1; lumps = 0; stirring = true; drawB(); api.setCue('Your batter is ready!'); return; }
      drawB();
      startPhase(0);
    },
    isComplete() { return C.ingredientsDone; },
    autoComplete() {
      items.forEach(d => d.remove()); items = [];
      if (egg) { egg.remove(); egg = null; }
      finish();
    },
    hintTarget() { return items.find(d => d.isConnected) || egg || bowl; },
    exit() { offs.forEach(f => f()); finished = true; }
  };
}
