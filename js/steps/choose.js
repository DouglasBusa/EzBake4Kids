import { el, place, artButton, sparkles, rectOf, onTap } from '../ui.js';
import { RECIPES, RECIPE_ORDER } from '../data.js';
import { drawCupcake, drawCookie } from '../draw.js';
import { sfx, speak } from '../audio.js';

export function create(api) {
  let cards = {};
  return {
    enter(root, C) {
      RECIPE_ORDER.forEach((rid, i) => {
        const R = RECIPES[rid];
        const b = artButton(root, { id: R.art, label: R.name, size: 260, cls: 'card', draw: (c, x, y, s) => {
          c.beginPath(); c.roundRect(8, 8, s - 16, s - 16, 36); c.fillStyle = rid === 'cupcakes' ? '#FBD3DE' : '#FFF0C8'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#6B4A3A'; c.stroke();
          if (rid === 'cupcakes') { drawCupcake(c, x - s * 0.16, y + s * 0.04, s * 0.44, { liner: 'dots', color: 'strawberry', fill: 0.9, baked: true, frost: '#fff' }); drawCupcake(c, x + s * 0.18, y + s * 0.06, s * 0.4, { liner: 'stars', color: 'vanilla', fill: 0.9, baked: true, frost: '#CDB8F0' }); }
          else { drawCookie(c, x - s * 0.15, y - s * 0.02, s * 0.4, { shape: 'heart', color: 'vanilla' }); drawCookie(c, x + s * 0.16, y + s * 0.1, s * 0.38, { shape: 'star', color: 'strawberry' }); }
        } });
        place(b, 196 + i * 372, 150, 260, 260);
        b.dataset.recipe = rid;
        onTap(b, () => pick(rid));
        cards[rid] = b;
      });
      const mark = () => Object.entries(cards).forEach(([k, b]) => b.classList.toggle('selected', C.recipe === k));
      const pick = rid => {
        if (C.recipe !== rid) {
          // a new recipe makes recipe-specific later choices invalid; colors/plate/carrier/stickers stay
          if (C.recipe) Object.assign(C, { ingredientsDone: false, liner: null, linedCups: 0, bakeResult: null, decorations: [] });
          C.recipe = rid;
        }
        const b = cards[rid];
        b.classList.remove('bounce'); void b.offsetWidth; b.classList.add('bounce');
        sfx('ding'); speak(RECIPES[rid].name + '!');
        const r = rectOf(b); sparkles(r.cx, r.cy, 8, 120);
        mark(); api.progress(); api.complete({ quiet: true });
      };
      mark();
      this.C = C;
    },
    isComplete() { return !!this.C.recipe; },
    hintTarget() { return Object.values(cards)[0]; },
    exit() {}
  };
}
