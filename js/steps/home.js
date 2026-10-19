import { el, place, artButton, onTap } from '../ui.js';
import { iconCanvas, drawMomo, drawPip, drawBiscuit } from '../draw.js';
import { unlock, sfx } from '../audio.js';

export function create(api) {
  return {
    customCue: true,
    enter(root) {
      const title = el('h1', 'title', root, { text: 'EzBake4Kids' });
      place(title, 0, 30, 1024, 80);
      const momo = el('div', 'momo-wave', root, { 'aria-hidden': 'true' });
      place(momo, 150, 170, 300, 300);
      momo.appendChild(iconCanvas(300, (c, x, y, s) => drawMomo(c, x, y, s, 'wave')));
      const pip = el('div', 'cast-hop', root, { 'aria-hidden': 'true' }); place(pip, 760, 360, 140, 140);
      pip.appendChild(iconCanvas(140, (c, x, y, s) => drawPip(c, x, y, s)));
      const bis = el('div', 'cast-hop d2', root, { 'aria-hidden': 'true' }); place(bis, 860, 380, 130, 130);
      bis.appendChild(iconCanvas(130, (c, x, y, s) => drawBiscuit(c, x, y, s)));
      const play = artButton(root, { id: 'btn-play', label: 'Play', size: 220, cls: 'play pulse', draw: (c, x, y, s) => {
        c.beginPath(); c.arc(x, y, s * 0.46, 0, Math.PI * 2); c.fillStyle = '#FF7F7F'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#6B4A3A'; c.stroke();
        c.beginPath(); c.moveTo(x - s * 0.12, y - s * 0.2); c.lineTo(x + s * 0.22, y); c.lineTo(x - s * 0.12, y + s * 0.2); c.closePath(); c.fillStyle = '#fff'; c.fill(); } });
      place(play, 470, 200, 220, 220);
      play.id = 'play';
      onTap(play, () => { unlock(); sfx('ding'); api.go('STEP1_CHOOSE'); });
      this.play = play;
      const gal = artButton(root, { id: 'btn-gallery', label: 'My treats', size: 96, draw: (c, x, y, s) => {
        c.beginPath(); c.arc(x, y, s * 0.46, 0, Math.PI * 2); c.fillStyle = '#CDB8F0'; c.fill();
        c.fillStyle = '#fff'; c.fillRect(x - s * 0.24, y - s * 0.18, s * 0.48, s * 0.36); c.fillStyle = '#A9D8F5'; c.fillRect(x - s * 0.18, y - s * 0.12, s * 0.36, s * 0.2); } });
      place(gal, 24, 456, 96, 96);
      onTap(gal, () => { unlock(); sfx('pop'); api.go('GALLERY'); });
      // Momo greets once audio is unlocked by a tap; bubble shows right away
      api.say('Hi! I am Momo. Tap play to bake!', { bubbleOnly: true });
    },
    hintTarget() { return this.play; },
    exit() {}
  };
}
