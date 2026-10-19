# Changelog

All versions are free, with no ads, purchases, accounts, tracking, or links out.

## v0.1: MVP (Cupcakes + Cookies)
The full 9-step flow and Show-Off for **Cupcakes** (with Liners) and **Cookies** (Liners skipped), using Artie's art batch "mvp-cupcakes-cookies". Characters, cast-face stickers, and character toppers still use placeholder drawings.

**Stories covered (all 28 P0):** US-01, US-02, US-03, US-04, US-05, US-06, US-07, US-08, US-09, US-10, US-12, US-13, US-14, US-16, US-17, US-18, US-19, US-21, US-22, US-23, US-25, US-27, US-29, US-32, US-33, US-35, US-36, US-38

- Shell: one-tap Play, voice cues with a replay speaker, a mute button (when muted, an animated hand demonstrates instead), a 9-icon progress trail (the liner icon is hidden for cookies), Back that keeps choices, a hint hand after 8 s, auto-complete after 20 s in skill minigames, and a pulsing Next arrow.
- Minigames (no way to fail): drag-pour with 1.5× drop zones (a miss floats back), tap-to-crack eggs, circular stir (cumulative 1080°), liner swatches plus drag or tap-to-fill cups, 8 batter colors including rainbow, hold-to-fill (auto top-up, an overfill just looks fluffy), cookie cutters, oven dial with a countdown, rise and glow, and a door that opens itself.
- Decorating: frosting piping with a dotted swirl guide (sparkles within 40 px), sprinkles on tap or drag (they stick only to the treat), drag-on and drag-off toppers, undo, and clear.
- Plates (6), carriers (4) with a hop-in animation, 24 stickers on the carrier (drag on, move, drag off to remove, undo/clear).
- Show-Off: the carrier opens inside a polaroid with a camera click, one soft flash, confetti, and the cast cheering. Save (localStorage only, choices JSON, 30-entry cap, fails silently), Play Again, and Gallery.
- Offline service worker precaches the app, all SVG art, and the 1920×1080 backgrounds. A web app manifest is included. There are zero external requests.
- `prefers-reduced-motion` support: confetti, bounces, and shakes become soft fades.
- Bonus (not counted, P1 US-34 groundwork): a basic gallery grid of saved creations.
