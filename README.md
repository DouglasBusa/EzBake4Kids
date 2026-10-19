# EzBake4Kids

A free baking + lunchbox game for kids about 4–8. Pick a treat, add ingredients, bake, decorate, plate it, pack it, decorate the box, and show it off.

- **Free forever.** No ads, purchases, accounts, tracking, or links out.
- Plain HTML/CSS/JS (ES modules). No build step, no frameworks, no network requests.
- Works offline after the first visit (service worker), and can be added to the home screen.
- Landscape-first and made for tablets. Big tap targets, a voice guide, a hint hand, and no way to fail.

## Play
Open `index.html` from any static web server (for example `python3 -m http.server`), or use GitHub Pages.

## Code map
| Path | What |
|---|---|
| `js/main.js` | App shell, screen state machine, HUD (back, trail, speaker, mute, Next), hint hand + auto-assist |
| `js/steps/*.js` | One module per screen. Each one exposes `enter`, `exit`, `isComplete`, `autoComplete`, `hintTarget` |
| `js/data.js` | Recipes, liners, colors, toppers, plates, carriers, stickers, voice cues |
| `js/assets.js` | Art loader: reads `assets/art/manifest.json` and looks art up by id |
| `js/draw.js` | Canvas drawing: placeholder shapes and the treat/plate/carrier/scene renderers |
| `js/audio.js` | Web Audio SFX + music (separate gains), voice cues via the device speech engine |
| `sw.js` | Offline precache. Regenerate it with `node tools/build-sw.mjs <version>` |

## Art
The art is by Artie and lives in `assets/art/` (see `assets/art/README.md` and `manifest.json`). The game looks every picture up by its manifest id. If an id or file is missing, it draws a simple placeholder shape instead, so new art drops straight in. Add the files and their manifest entries, then rerun `tools/build-sw.mjs`.
