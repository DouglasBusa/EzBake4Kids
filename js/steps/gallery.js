// Early gallery (US-34 is P1): grid of saved creations, tap for a mini show-off.
import { el, place, artButton, onTap } from '../ui.js';
import { mkCanvas, iconCanvas, drawScene, drawMomo } from '../draw.js';
import { sfx } from '../audio.js';
import { loadGallery, polaroid } from './showoff.js';

export function create(api) {
  return {
    customCue: true,
    enter(root) {
      const list = loadGallery().slice().reverse();
      const home = artButton(root, { id: 'btn-back', label: 'Home', size: 96, draw: (c, x, y, s) => { c.beginPath(); c.arc(x, y, s * 0.44, 0, Math.PI * 2); c.fillStyle = '#A9D8F5'; c.fill(); } });
      place(home, 16, 8, 96, 96, { x: 16, y: 8 });
      onTap(home, () => { sfx('pop'); api.go('HOME'); });
      if (!list.length) {
        const m = el('div', 'momo-wave', root, { 'aria-hidden': 'true' }); place(m, 220, 160, 260, 260);
        m.appendChild(iconCanvas(260, (c, x, y, s) => drawMomo(c, x, y, s, 'wave')));
        const play = artButton(root, { id: 'btn-play', label: 'Play', size: 200, cls: 'pulse', draw: (c, x, y, s) => { c.beginPath(); c.arc(x, y, s * 0.46, 0, Math.PI * 2); c.fillStyle = '#FF7F7F'; c.fill(); } });
        place(play, 560, 190, 200, 200);
        onTap(play, () => { api.resetCreation(); api.go('STEP1_CHOOSE'); });
        api.say("Let's make something!");
        return;
      }
      api.say('Here are your yummy creations!');
      const grid = el('div', 'gallery-grid', root); place(grid, 130, 110, 860, 460, { x: 30, y: 200, w: 720, h: 900 });
      list.forEach((C, i) => {
        const b = el('button', 'thumb btn', grid, { type: 'button', 'aria-label': 'Creation ' + (i + 1) });
        const cv = mkCanvas(180, 130); drawScene(cv.ctx, C, 180, 130, { open: true }); b.appendChild(cv);
        onTap(b, () => {
          sfx('pop');
          const ov = el('div', 'overlay', root); place(ov, 0, 0, 1024, 576);
          const p = polaroid(ov, C, 352, 60, 320, 384); setTimeout(() => p.reveal(), 400);
          onTap(ov, () => ov.remove());
        });
      });
    },
    exit() {}
  };
}
