# EzBake4Kids art: MVP batch (Cupcakes + Cookies) v0.1

All original artwork. No Sanrio or other third-party IP: no ear-bows, no mouthless-whisker faces, no white-cat shapes. Characters (Momo, Pip, Biscuit) are not in this batch.

## Palette
| Name | Hex | Use |
|---|---|---|
| Strawberry | #F7A8C0 | primary pink |
| Cream | #FFF4E0 | light bases |
| Mint | #B8E8D2 | |
| Lemon | #FFE98A | |
| Sky | #A9D8F5 | |
| Lavender | #CDB8F0 | |
| Cocoa | #6B4A3A | outlines, text, glyphs |
| Accent coral | #FF7F7F | |

Outlines are 3.5 px at 1x, in a darker shade of each fill (the fill mixed 55% toward Cocoa), never black. Each object gets one soft white highlight (55% opacity). Batter tints come from the palette: vanilla = cream+lemon, chocolate = cocoa+cream, matcha = mint+green, blueberry = sky+lavender, rainbow = a gradient of the six pastels.

## Naming
- kebab-case. `id` = file name without the extension. States are suffixes: `bowl-fill-50`, `oven-door-open`, `batter-cupcake-vanilla-mixed`, `cupcake-strawberry-baked`, `carrier-bento-closed`.
- The PNG @2x file uses the same id as its SVG (`png@2x/<id>.png`). Background rasters add their size: `bg-home-1920x1080.webp`.
- Folders: `<category>/svg/` and `<category>/png@2x/`; backgrounds use `svg/` (source), `webp/`, `png/`.
- Prefixes: ingredient-, bowl-fill-, tool-, cutter-, oven-, tin-, tray-, liner-, batter-swatch-, batter-cupcake-, batter-cookie-, batter-texture-, cupcake-, cookie-, frosting-, sprinkles-, topper-, plate-, carrier-, sticker-, btn-, trail-, hint-, card-, fx-, bg-.

## Sizes (1x)
ingredients and tools 256², oven parts 512², tins 512×384, liners/batter/baked/toppers 256², frosting strokes 512×128, sprinkles and fx 128² (polaroid 400×480 with a photo window at 40,44, 320×328; flash 256²), plates 512², carriers 800×600, stickers 160², UI buttons 96² (play 200²), trail icons 96², hint hand 128², cards 240², backgrounds 1920×1080 and 2560×1440 (each file 300 KB or less).

## Notes
- `manifest.json` lists every file with id, file, format, type, width, height, bytes, states.
- Frosting strokes are tileable "brush" strips. Stretch or stamp them along the drag path.
- Cookies are baked in one golden color, and the batter-cookie-* doughs show the chosen color. Tint at runtime if you want colored baked cookies.
- Contact sheets (color plus grayscale) are in `../contact-sheets/`.
