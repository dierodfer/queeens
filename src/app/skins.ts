export type SkinId =
  | 'default'
  | 'safari'
  | 'farm'
  | 'aquarium'
  | 'arctic'
  | 'synthwave'
  | 'roman'
  | 'circus';

/**
 * Generic, reusable print "shapes". Each one is painted with colours supplied
 * at the region level via the --p1 / --p2 custom properties, so a handful of
 * CSS rules can produce many visually distinct region looks.
 */
export type PatternId =
  | 'stripes-a'
  | 'stripes-b'
  | 'stripes-bold'
  | 'spots-sm'
  | 'spots-md'
  | 'spots-lg'
  | 'rosettes'
  | 'scales'
  | 'honeycomb'
  | 'waves'
  | 'bubbles'
  | 'crystals'
  | 'cracks'
  | 'feathers'
  | 'tiles'
  | 'confetti'
  | 'grid-glow'
  | 'scanlines'
  | 'fur';

export interface SkinRegion {
  /** Emoji placed on a tile that belongs to this region (instead of a queen). */
  animal: string;
  /** Print shape painted over the region's base colour. */
  pattern: PatternId;
  /** Primary print colour. */
  p1: string;
  /** Optional secondary print colour (two-tone patterns only). */
  p2?: string;
}

export interface Skin {
  id: SkinId;
  label: string;
  /** Indicator shown on the skin toggle button. */
  emoji: string;
  /** Base solid colour for each board region. */
  boardColors: string[];
  /** When true the board uses animal prints and animal pieces. */
  patterned: boolean;
  /** Per-region print + animal piece (only for patterned skins). */
  regions?: SkinRegion[];
}

function regions(list: SkinRegion[]): SkinRegion[] {
  return list;
}

/** 🌍 Safari — warm savanna, classic plains animals. */
const SAFARI_REGIONS = regions([
  { animal: '🦓', pattern: 'stripes-bold', p1: '#1b1b1b' },
  { animal: '🐅', pattern: 'stripes-a', p1: '#241307' },
  { animal: '🐆', pattern: 'rosettes', p1: '#4a2c0c' },
  { animal: '🐾', pattern: 'spots-sm', p1: '#2a1c08' },
  { animal: '🦒', pattern: 'spots-lg', p1: '#b06c24' },
  { animal: '🐍', pattern: 'scales', p1: '#2f5418' },
  { animal: '🐊', pattern: 'tiles', p1: '#2a3e16', p2: '#50702e' },
  { animal: '🐘', pattern: 'cracks', p1: 'rgba(0,0,0,.16)' },
  { animal: '🦁', pattern: 'fur', p1: 'rgba(90,50,10,.18)' },
  { animal: '🐄', pattern: 'spots-lg', p1: '#1a1a1a' },
  { animal: '🐺', pattern: 'spots-md', p1: '#3a2410' },
  { animal: '🦏', pattern: 'cracks', p1: 'rgba(0,0,0,.15)' },
  { animal: '🦛', pattern: 'bubbles', p1: 'rgba(255,255,255,.22)' },
  { animal: '🐒', pattern: 'fur', p1: 'rgba(0,0,0,.18)' },
  { animal: '🦜', pattern: 'feathers', p1: '#156b5d' },
  { animal: '🦩', pattern: 'feathers', p1: '#d65a86' },
]);

const SAFARI_COLORS = [
  '#fafafa', '#ef8b1e', '#d7a24a', '#f2dd7a',
  '#f5deb0', '#5b8f2e', '#3f5a23', '#8a8f96',
  '#c9832b', '#fbfbfb', '#b98c52', '#6b7d8a',
  '#9a7d8c', '#8a5a2b', '#1f9e8a', '#ef7fa6',
];

/** 🚜 Granja — warm pastoral barnyard. */
const FARM_REGIONS = regions([
  { animal: '🐄', pattern: 'spots-lg', p1: '#2b2b2b' },
  { animal: '🐖', pattern: 'spots-sm', p1: '#c97a83' },
  { animal: '🐑', pattern: 'bubbles', p1: '#fbf6ec' },
  { animal: '🐔', pattern: 'feathers', p1: '#d65f3c' },
  { animal: '🐴', pattern: 'fur', p1: 'rgba(90,55,20,.3)' },
  { animal: '🦆', pattern: 'waves', p1: '#2f6c8f' },
  { animal: '🐰', pattern: 'spots-sm', p1: '#9a8c86' },
  { animal: '🐶', pattern: 'spots-md', p1: '#7a5a3a' },
  { animal: '🐱', pattern: 'stripes-bold', p1: '#c97830' },
  { animal: '🦃', pattern: 'rosettes', p1: '#7a4a2a' },
  { animal: '🐭', pattern: 'spots-sm', p1: '#8a7a72' },
  { animal: '🐝', pattern: 'stripes-bold', p1: '#3a3a3a', p2: '#caa400' },
  { animal: '🐐', pattern: 'stripes-a', p1: '#7a6a8a' },
  { animal: '🐓', pattern: 'confetti', p1: '#c23b2c', p2: '#e8a93a' },
  { animal: '🦢', pattern: 'feathers', p1: '#9aa6ad' },
  { animal: '🐹', pattern: 'fur', p1: 'rgba(120,80,40,.32)' },
]);

const FARM_COLORS = [
  '#F5E6CA', '#F7C8C8', '#FBE7A1', '#D9EAD3',
  '#CDE7F0', '#E8D5B7', '#F2D9E1', '#D7CCC8',
  '#FCEFC7', '#E3D0FF', '#C8E6C9', '#FFE0B2',
  '#D6C2A9', '#F0E68C', '#B3E5C7', '#F5D6BA',
];

/** 🐠 Acuario — deep reef and open ocean. */
const AQUARIUM_REGIONS = regions([
  { animal: '🐠', pattern: 'stripes-a', p1: '#ff7d3c' },
  { animal: '🐙', pattern: 'bubbles', p1: '#5a2e7a' },
  { animal: '🐢', pattern: 'tiles', p1: '#2f5d3a', p2: '#88b894' },
  { animal: '🦀', pattern: 'spots-md', p1: '#a3261b' },
  { animal: '🐡', pattern: 'spots-sm', p1: '#caa400' },
  { animal: '🐬', pattern: 'waves', p1: '#3a6b8a' },
  { animal: '🦈', pattern: 'stripes-b', p1: '#3a4750' },
  { animal: '🦑', pattern: 'bubbles', p1: '#5a3a8a' },
  { animal: '🦞', pattern: 'scales', p1: '#9a2a1a' },
  { animal: '🐋', pattern: 'waves', p1: '#1c3f5e' },
  { animal: '🦐', pattern: 'spots-sm', p1: '#d6604a' },
  { animal: '🪼', pattern: 'feathers', p1: '#caa0e0' },
  { animal: '🐚', pattern: 'honeycomb', p1: '#caa97a' },
  { animal: '🐟', pattern: 'confetti', p1: '#1a8a8a', p2: '#e8c83c' },
  { animal: '🦦', pattern: 'fur', p1: 'rgba(80,55,30,.32)' },
  { animal: '🪸', pattern: 'rosettes', p1: '#e8607a' },
]);

const AQUARIUM_COLORS = [
  '#A8DADC', '#5DA9C7', '#1D6F87', '#0B4F6C',
  '#FFB4A2', '#FF8C72', '#FFD972', '#7FD8BE',
  '#3E8E7E', '#274472', '#9AC4E5', '#C2EABD',
  '#F4A6A0', '#B197FC', '#73C2FB', '#E0FBFC',
];

/** ❄️ Ártico — ice fields and polar wildlife. */
const ARCTIC_REGIONS = regions([
  { animal: '🐻‍❄️', pattern: 'fur', p1: 'rgba(140,160,170,.32)' },
  { animal: '🐧', pattern: 'stripes-bold', p1: '#1a2b35' },
  { animal: '🦭', pattern: 'spots-md', p1: '#5a6a72' },
  { animal: '🦊', pattern: 'fur', p1: 'rgba(200,110,40,.3)' },
  { animal: '🦌', pattern: 'spots-sm', p1: '#6b4a30' },
  { animal: '🦉', pattern: 'feathers', p1: '#8a7a6a' },
  { animal: '🐺', pattern: 'fur', p1: 'rgba(90,100,108,.32)' },
  { animal: '🐰', pattern: 'spots-sm', p1: '#c6d2d6' },
  { animal: '🐋', pattern: 'waves', p1: '#1c3f5e' },
  { animal: '🦦', pattern: 'fur', p1: 'rgba(90,65,40,.3)' },
  { animal: '🦅', pattern: 'feathers', p1: '#5a4632' },
  { animal: '🦢', pattern: 'bubbles', p1: '#fbfdfe' },
  { animal: '🐂', pattern: 'cracks', p1: 'rgba(90,70,50,.3)' },
  { animal: '🦬', pattern: 'fur', p1: 'rgba(70,55,40,.34)' },
  { animal: '🐦', pattern: 'confetti', p1: '#d6601f', p2: '#1a1a1a' },
  { animal: '🐭', pattern: 'spots-sm', p1: '#9a8a78' },
]);

const ARCTIC_COLORS = [
  '#F5FAFC', '#DCEEF5', '#BFE0EE', '#9FCBE0',
  '#7FB3D1', '#5C97BD', '#3D7CA6', '#274F70',
  '#E8EEF1', '#CBD8DF', '#AEC2CC', '#8BA3B0',
  '#D9E7E2', '#C2D9D0', '#A6C9BC', '#EFEAE3',
];

/** 🌆 Neón retro — synthwave grid glow on a midnight skyline. */
const SYNTHWAVE_REGIONS = regions([
  { animal: '🐺', pattern: 'grid-glow', p1: '#2ef0ff' },
  { animal: '🦅', pattern: 'scanlines', p1: '#ff2e9a' },
  { animal: '🦂', pattern: 'grid-glow', p1: '#b347ff' },
  { animal: '🐍', pattern: 'scales', p1: '#39ff8a' },
  { animal: '🦇', pattern: 'scanlines', p1: '#ff6a2e' },
  { animal: '🦉', pattern: 'grid-glow', p1: '#fff84e' },
  { animal: '🐯', pattern: 'stripes-bold', p1: '#ff2e9a' },
  { animal: '🦈', pattern: 'scanlines', p1: '#2ef0ff' },
  { animal: '🐉', pattern: 'grid-glow', p1: '#ff4e4e' },
  { animal: '🦄', pattern: 'bubbles', p1: '#d66bff' },
  { animal: '🦊', pattern: 'scanlines', p1: '#ff8c2e' },
  { animal: '🐙', pattern: 'grid-glow', p1: '#39ffd6' },
  { animal: '🦋', pattern: 'confetti', p1: '#ff2e9a', p2: '#2ef0ff' },
  { animal: '🐆', pattern: 'grid-glow', p1: '#b347ff' },
  { animal: '🦁', pattern: 'stripes-a', p1: '#fff84e' },
  { animal: '🦖', pattern: 'scanlines', p1: '#39ff8a' },
]);

const SYNTHWAVE_COLORS = [
  '#1a1033', '#241640', '#2e1c4d', '#150a28',
  '#1c2640', '#10202e', '#2a1030', '#1a2a2e',
  '#241420', '#101830', '#2a1c1a', '#1c1030',
  '#142030', '#241830', '#1a1424', '#1c1c2e',
];

/** 🏛️ Romano — terracotta, marble and antique mosaics. */
const ROMAN_REGIONS = regions([
  { animal: '🦅', pattern: 'tiles', p1: '#5c3a20', p2: '#caa05a' },
  { animal: '🐺', pattern: 'tiles', p1: '#3a3a3a', p2: '#caa05a' },
  { animal: '🐎', pattern: 'scales', p1: '#7a5a30' },
  { animal: '🦁', pattern: 'rosettes', p1: '#5c3a18' },
  { animal: '🐗', pattern: 'fur', p1: 'rgba(60,40,20,.3)' },
  { animal: '🐬', pattern: 'waves', p1: '#2d5c54' },
  { animal: '🦚', pattern: 'feathers', p1: '#2d5c80' },
  { animal: '🦉', pattern: 'spots-md', p1: '#5c4a30' },
  { animal: '🐂', pattern: 'cracks', p1: 'rgba(60,40,20,.3)' },
  { animal: '🐍', pattern: 'scales', p1: '#3a5c3a' },
  { animal: '🦢', pattern: 'bubbles', p1: '#fbf6ec' },
  { animal: '🐐', pattern: 'stripes-b', p1: '#6b5a40' },
  { animal: '🦌', pattern: 'spots-sm', p1: '#5c4632' },
  { animal: '🐘', pattern: 'cracks', p1: 'rgba(50,50,50,.26)' },
  { animal: '🐓', pattern: 'confetti', p1: '#a33b3b', p2: '#caa05a' },
  { animal: '🦂', pattern: 'tiles', p1: '#5a3a3a', p2: '#caa05a' },
]);

const ROMAN_COLORS = [
  '#E8DCC8', '#C9B190', '#B5602F', '#9C4A24',
  '#CAA05A', '#8C7048', '#5C7A6E', '#2D5C54',
  '#A33B3B', '#7A6A8C', '#D8C4A0', '#9A8568',
  '#6E8C7A', '#B08C5C', '#8C4A3A', '#D6BFA0',
];

/** 🎪 Circo — big top stripes and confetti under canvas. */
const CIRCUS_REGIONS = regions([
  { animal: '🦁', pattern: 'rosettes', p1: '#7a4a1a' },
  { animal: '🐘', pattern: 'cracks', p1: 'rgba(60,60,60,.26)' },
  { animal: '🦭', pattern: 'spots-md', p1: '#3a4a5a' },
  { animal: '🐴', pattern: 'stripes-bold', p1: '#caa05a', p2: '#fff' },
  { animal: '🐵', pattern: 'fur', p1: 'rgba(90,60,30,.3)' },
  { animal: '🐻', pattern: 'fur', p1: 'rgba(70,50,30,.32)' },
  { animal: '🐯', pattern: 'stripes-a', p1: '#d6293e' },
  { animal: '🦜', pattern: 'feathers', p1: '#2a4f9e' },
  { animal: '🐩', pattern: 'bubbles', p1: '#fbf6ec' },
  { animal: '🦙', pattern: 'spots-sm', p1: '#caa97a' },
  { animal: '🦓', pattern: 'stripes-bold', p1: '#1a1a1a', p2: '#fff' },
  { animal: '🐪', pattern: 'cracks', p1: 'rgba(90,70,40,.28)' },
  { animal: '🐐', pattern: 'stripes-b', p1: '#7a6a5a' },
  { animal: '🕊️', pattern: 'bubbles', p1: '#ffffff' },
  { animal: '🦚', pattern: 'feathers', p1: '#2a4f9e', p2: '#1a8a8a' },
  { animal: '🐎', pattern: 'confetti', p1: '#d6293e', p2: '#2a4f9e' },
]);

const CIRCUS_COLORS = [
  '#FBF3E3', '#F6D9A0', '#F3B6BE', '#A9C9F2',
  '#F2C9A0', '#C9E4C5', '#F0A6A6', '#D8C7E8',
  '#FBE3B0', '#A6D8D2', '#F2D2C9', '#C9D8F2',
  '#E8C9A6', '#F6C2D8', '#C2E8C9', '#F2E0A6',
];

export const SKINS: Skin[] = [
  {
    id: 'default',
    label: 'Default',
    emoji: '💙',
    patterned: false,
    boardColors: [
      '#77DD77', '#AEC6CF', '#F6D7A7', '#FFB7B2', '#B39EB5',
      '#FF6961', '#FFD1DC', '#CFCFC4', '#C1E1C1', '#F7CAC9',
      '#F4A259', '#7BC8A4', '#89A7FF', '#D7A9E3', '#F0E68C',
      '#9AD1D4',
    ],
  },
  { id: 'safari', label: 'Safari', emoji: '🦁', patterned: true, regions: SAFARI_REGIONS, boardColors: SAFARI_COLORS },
  { id: 'farm', label: 'Granja', emoji: '🐄', patterned: true, regions: FARM_REGIONS, boardColors: FARM_COLORS },
  { id: 'aquarium', label: 'Acuario', emoji: '🐠', patterned: true, regions: AQUARIUM_REGIONS, boardColors: AQUARIUM_COLORS },
  { id: 'arctic', label: 'Ártico', emoji: '🐧', patterned: true, regions: ARCTIC_REGIONS, boardColors: ARCTIC_COLORS },
  { id: 'synthwave', label: 'Neón retro', emoji: '🦄', patterned: true, regions: SYNTHWAVE_REGIONS, boardColors: SYNTHWAVE_COLORS },
  { id: 'roman', label: 'Romano', emoji: '🦅', patterned: true, regions: ROMAN_REGIONS, boardColors: ROMAN_COLORS },
  { id: 'circus', label: 'Circo', emoji: '🎪', patterned: true, regions: CIRCUS_REGIONS, boardColors: CIRCUS_COLORS },
];

export const DEFAULT_SKIN = SKINS[0];
