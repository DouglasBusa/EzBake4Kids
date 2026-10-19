// All game content lives here. Art ids follow Artie's manifest naming (kebab-case, state as suffix).
export const PAL = {
  strawberry: '#F7A8C0', cream: '#FFF4E0', mint: '#B8E8D2', lemon: '#FFE98A',
  sky: '#A9D8F5', lavender: '#CDB8F0', cocoa: '#6B4A3A', coral: '#FF7F7F', white: '#FFFFFF'
};

export const RECIPES = {
  cupcakes: {
    id: 'cupcakes', name: 'Cupcakes', art: 'card-cupcakes',
    phases: [
      { kind: 'pour', items: ['flour', 'sugar'] },
      { kind: 'egg', count: 2 },
      { kind: 'pour', items: ['milk', 'butter'] },
      { kind: 'stir' }
    ],
    count: 6, hasLiners: true, bake: 'fill'
  },
  cookies: {
    id: 'cookies', name: 'Cookies', art: 'card-cookies',
    phases: [
      { kind: 'pour', items: ['flour', 'sugar'] },
      { kind: 'egg', count: 1 },
      { kind: 'pour', items: ['butter', 'chips'] },
      { kind: 'stir' }
    ],
    count: 6, hasLiners: false, bake: 'cut'
  }
};
export const RECIPE_ORDER = ['cupcakes', 'cookies'];

export const INGREDIENTS = {
  flour:  { name: 'Flour',  art: 'ingredient-flour',  color: '#FFFFFF' },
  sugar:  { name: 'Sugar',  art: 'ingredient-sugar',  color: '#FFFFFF' },
  milk:   { name: 'Milk',   art: 'ingredient-milk',   color: '#F4FAFF' },
  butter: { name: 'Butter', art: 'ingredient-butter', color: '#FFE98A' },
  chips:  { name: 'Chocolate chips', art: 'ingredient-choc-chips', color: '#7A4B32' },
  egg:    { name: 'Egg', art: 'ingredient-egg-whole', artCracked: 'ingredient-egg-cracked' }
};

export const LINERS = [
  { id: 'dots',    name: 'Dots',      art: 'liner-dots',    base: '#F7A8C0', ink: '#FFFFFF' },
  { id: 'stripes', name: 'Stripes',   art: 'liner-stripes', base: '#B8E8D2', ink: '#FFFFFF' },
  { id: 'hearts',  name: 'Hearts',    art: 'liner-hearts',  base: '#CDB8F0', ink: '#FF7F7F' },
  { id: 'stars',   name: 'Stars',     art: 'liner-stars',   base: '#A9D8F5', ink: '#FFE98A' },
  { id: 'gingham', name: 'Gingham',   art: 'liner-gingham', base: '#FFF4E0', ink: '#FF9FB5' },
  { id: 'gold',    name: 'Gold foil', art: 'liner-gold-foil',    base: '#E8C25A', ink: '#FFF2B0' }
];

export const COLORS = [
  { id: 'vanilla',    name: 'Vanilla',    art: 'batter-swatch-vanilla',    hex: '#FFE7B0' },
  { id: 'strawberry', name: 'Pink',       art: 'batter-swatch-strawberry', hex: '#F7A8C0' },
  { id: 'chocolate',  name: 'Chocolate',  art: 'batter-swatch-chocolate',  hex: '#A9775A' },
  { id: 'matcha',     name: 'Green',      art: 'batter-swatch-matcha',     hex: '#A8D5A2' },
  { id: 'blueberry',  name: 'Blue',       art: 'batter-swatch-blueberry',  hex: '#9DB4F0' },
  { id: 'lemon',      name: 'Yellow',     art: 'batter-swatch-lemon',      hex: '#FFE98A' },
  { id: 'lavender',   name: 'Purple',     art: 'batter-swatch-lavender',   hex: '#CDB8F0' },
  { id: 'rainbow',    name: 'Rainbow',    art: 'batter-swatch-rainbow',    hex: 'rainbow' }
];
export const RAINBOW = ['#F7A8C0', '#FFC59E', '#FFE98A', '#B8E8D2', '#A9D8F5', '#CDB8F0'];

export const CUTTERS = [
  { id: 'heart',  name: 'Heart',  art: 'cutter-heart' },
  { id: 'star',   name: 'Star',   art: 'cutter-star' },
  { id: 'bunny',  name: 'Bunny',  art: 'cutter-bunny' },
  { id: 'flower', name: 'Flower', art: 'cutter-flower' }
];

export const FROSTINGS = [
  { id: 'vanilla', name: 'White', hex: '#FFF8EC' }, { id: 'strawberry', name: 'Pink', hex: '#F7A8C0' },
  { id: 'chocolate', name: 'Chocolate', hex: '#8A5A44' }, { id: 'matcha', name: 'Green', hex: '#A8D5A2' },
  { id: 'blueberry', name: 'Blue', hex: '#A9C4F5' }, { id: 'lemon', name: 'Yellow', hex: '#FFE98A' },
  { id: 'lavender', name: 'Purple', hex: '#CDB8F0' }, { id: 'rainbow', name: 'Rainbow', hex: 'rainbow' }
].map(f => ({ ...f, art: `frosting-${f.id}-stroke` }));

export const SPRINKLES = [
  { id: 'jimmies',    name: 'Rainbow sprinkles', art: 'sprinkles-jimmies' },
  { id: 'nonpareils', name: 'Tiny dots',         art: 'sprinkles-nonpareils' },
  { id: 'hearts',     name: 'Heart sprinkles',   art: 'sprinkles-hearts' },
  { id: 'stars',      name: 'Star sprinkles',    art: 'sprinkles-stars' }
];

// shape = placeholder drawing used until art arrives
export const TOPPERS = [
  { id: 'cherry', name: 'Cherry', shape: 'cherry' },
  { id: 'strawberry', name: 'Strawberry', shape: 'strawberry' },
  { id: 'blueberry', name: 'Blueberry', shape: 'blueberry' },
  { id: 'choc', name: 'Chocolate', shape: 'choc', art: 'choc-piece' },
  { id: 'heart', name: 'Heart', shape: 'heart', color: '#FF7F7F' },
  { id: 'star', name: 'Star', shape: 'star', color: '#FFE98A' },
  { id: 'candle', name: 'Candle', shape: 'candle' },
  { id: 'momo', name: 'Momo', shape: 'momo' },
  { id: 'pip', name: 'Pip', shape: 'pip' },
  { id: 'biscuit', name: 'Biscuit', shape: 'biscuit' }
].map(t => ({ ...t, art: 'topper-' + (t.art || t.id) }));

export const PLATES = [
  { id: 'round-pink', name: 'Pink plate' }, { id: 'scalloped-mint', name: 'Mint plate' },
  { id: 'heart', name: 'Heart plate' }, { id: 'cloud', name: 'Cloud plate' },
  { id: 'star', name: 'Star plate' }, { id: 'wooden-board', name: 'Wooden board' }
].map(p => ({ ...p, art: 'plate-' + p.id }));

export const CARRIERS = [
  { id: 'bento', name: 'Bento box', a: 'bento' }, { id: 'basket', name: 'Picnic basket', a: 'basket' },
  { id: 'tin', name: 'Cookie tin', a: 'cookie-tin' }, { id: 'bag', name: 'Gift bag', a: 'gift-bag' }
].map(c => ({ ...c, artOpen: 'carrier-' + c.a + '-open', artClosed: 'carrier-' + c.a + '-closed' }));

// 24 stickers: hearts x3, stars x3, fruit x4, flowers x3, cast faces x3, clouds x2, rainbows x2, sweets x4
export const STICKERS = [
  ['heart-pink', 'heart', '#F7A8C0'], ['heart-coral', 'heart', '#FF7F7F'], ['heart-lavender', 'heart', '#CDB8F0'],
  ['star-lemon', 'star', '#FFE98A'], ['star-sky', 'star', '#A9D8F5'], ['star-mint', 'star', '#B8E8D2'],
  ['fruit-cherry', 'cherry'], ['fruit-strawberry', 'strawberry'], ['fruit-apple', 'apple'], ['fruit-lemon', 'orange'],
  ['flower-pink', 'flower', '#F7A8C0'], ['flower-mint', 'flower', '#B8E8D2'], ['flower-sky', 'flower', '#A9D8F5'],
  ['face-momo', 'momo'], ['face-pip', 'pip'], ['face-biscuit', 'biscuit'],
  ['cloud-white', 'cloud', '#FFFFFF'], ['cloud-sky', 'cloud', '#A9D8F5'],
  ['rainbow-classic', 'rainbow'], ['rainbow-pastel', 'rainbow2'],
  ['sweet-candy', 'candy'], ['sweet-lollipop', 'lollipop'], ['sweet-donut', 'donut'], ['sweet-macaron', 'minicupcake']
].map(([id, shape, color]) => ({ id, shape, color, art: 'sticker-' + id }));
// 24 stickers: hearts 3, stars 3, fruit 4, flowers 3, cast faces 3 (art pending), clouds 2, rainbows 2, sweets 4

// Voice cues (<= 4 s) and hints per screen
export const CUES = {
  HOME: { cue: 'Hi! I am Momo. Tap play to bake!', hint: 'Tap the big play button!' },
  STEP1_CHOOSE: { cue: 'What shall we make? Tap a treat!', hint: 'Tap a picture!' },
  STEP2_INGREDIENTS: { cue: 'Drag the flour and sugar into the bowl!', hint: 'Drag it to the bowl!' },
  STEP3_LINERS: { cue: 'Pick a liner, then put one in each cup!', hint: 'Tap a cup or drag a liner!' },
  STEP4_COLOR: { cue: 'Tap a color for your batter!', hint: 'Tap a color!' },
  STEP5_BAKE: { cue: 'Hold on a cup to fill it!', hint: 'Press and hold!' },
  STEP6_DECORATE: { cue: 'Draw frosting, shake sprinkles, add toppers!', hint: 'Draw on your treat!' },
  STEP7_PLATE: { cue: 'Pick a pretty plate!', hint: 'Tap a plate!' },
  STEP8_CARRIER: { cue: 'How will you carry your treats?', hint: 'Tap a box or basket!' },
  STEP9_DECORATE_CARRIER: { cue: 'Drag stickers onto your box!', hint: 'Drag a sticker!' },
  SHOWOFF: { cue: 'Ta-da! Look what you made!', hint: '' },
  GALLERY: { cue: 'Here are your yummy creations!', hint: '' }
};
export const PRAISE = ['Yummy!', 'So pretty!', 'You did it!'];
