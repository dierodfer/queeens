export type SkinId = 'default' | 'safari';

export interface SkinRegion {
  /** Emoji placed on a tile that belongs to this region (instead of a queen). */
  animal: string;
  /** CSS class that paints this region's animal-print pattern. */
  className: string;
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

/**
 * Safari regions. Every region is a clearly distinct animal: a unique base
 * colour (see safariColors) plus its own print pattern, and the piece you
 * place on it is that animal instead of a queen.
 */
const SAFARI_REGIONS: SkinRegion[] = [
  { animal: '🦓', className: 'safari-r0' }, // zebra
  { animal: '🐅', className: 'safari-r1' }, // tiger
  { animal: '🐆', className: 'safari-r2' }, // leopard
  { animal: '🐾', className: 'safari-r3' }, // cheetah
  { animal: '🦒', className: 'safari-r4' }, // giraffe
  { animal: '🐍', className: 'safari-r5' }, // snake
  { animal: '🐊', className: 'safari-r6' }, // crocodile
  { animal: '🐘', className: 'safari-r7' }, // elephant
  { animal: '🦁', className: 'safari-r8' }, // lion
  { animal: '🐄', className: 'safari-r9' }, // cow
  { animal: '🐺', className: 'safari-r10' }, // hyena
  { animal: '🦏', className: 'safari-r11' }, // rhino
  { animal: '🦛', className: 'safari-r12' }, // hippo
  { animal: '🐒', className: 'safari-r13' }, // monkey
  { animal: '🦜', className: 'safari-r14' }, // parrot
  { animal: '🦩', className: 'safari-r15' }, // flamingo
];

const safariColors = [
  '#fafafa', // zebra
  '#ef8b1e', // tiger
  '#d7a24a', // leopard
  '#f2dd7a', // cheetah
  '#f5deb0', // giraffe
  '#5b8f2e', // snake
  '#3f5a23', // crocodile
  '#8a8f96', // elephant
  '#c9832b', // lion
  '#fbfbfb', // cow
  '#b98c52', // hyena
  '#6b7d8a', // rhino
  '#9a7d8c', // hippo
  '#8a5a2b', // monkey
  '#1f9e8a', // parrot
  '#ef7fa6', // flamingo
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
  {
    id: 'safari',
    label: 'Safari',
    emoji: '🦁',
    patterned: true,
    regions: SAFARI_REGIONS,
    boardColors: safariColors,
  },
];

export const DEFAULT_SKIN = SKINS[0];
