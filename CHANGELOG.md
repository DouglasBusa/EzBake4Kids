# Changelog

All versions are free, with no ads, purchases, accounts, tracking, or links out.

## v0.2: MVP polish
No playtest notes yet, so this round fixes what showed up in automated play on desktop, iPad, and phone.

**Stories covered:** all 28 P0 stories from v0.1 (US-01–10, 12–14, 16–19, 21–23, 25, 27, 29, 32, 33, 35, 36, 38), with polish on US-18, US-08, US-32, US-33, and US-02. No new stories.

- US-32: the Show-Off photo now shows the decorated treats on their plate, inside the open carrier, with the carrier stickers along the bottom.
- Cookies: Artie's golden baked cookies are tinted more softly to match the batter color, so rainbow, chocolate, and the others stay readable.
- Artie's effect art is wired in: a flour puff when pouring flour or sugar (US-08), steam when the oven opens (US-18), a hearts burst on Save (US-33), and the camera flash star (US-32). Each falls back to a soft glow if the art is missing.
- Audio balance (US-02): music ducks under voice cues.

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
