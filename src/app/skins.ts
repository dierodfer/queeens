export type SkinId = 'default' | 'zebra' | 'leopard' | 'cobra' | 'flamingo';

export interface Skin {
  id: SkinId;
  label: string;
  emoji: string;
  boardColors: string[];
}

export const SKINS: Skin[] = [
  {
    id: 'default',
    label: 'Default',
    emoji: '💙',
    boardColors: [
      '#77DD77', '#AEC6CF', '#F6D7A7', '#FFB7B2', '#B39EB5',
      '#FF6961', '#FFD1DC', '#CFCFC4', '#C1E1C1', '#F7CAC9',
      '#F4A259', '#7BC8A4', '#89A7FF', '#D7A9E3', '#F0E68C',
      '#9AD1D4',
    ],
  },
  {
    id: 'zebra',
    label: 'Zebra',
    emoji: '🦓',
    boardColors: [
      '#F2F2F2', '#D9D9D9', '#BFBFBF', '#A6A6A6',
      '#8C8C8C', '#737373', '#595959', '#404040',
      '#E8E8E8', '#CECECE', '#B4B4B4', '#9A9A9A',
      '#808080', '#666666', '#4D4D4D', '#333333',
    ],
  },
  {
    id: 'leopard',
    label: 'Leopard',
    emoji: '🐆',
    boardColors: [
      '#F5C842', '#E8A830', '#D4901A', '#C07810',
      '#F2D870', '#E0C050', '#CEAA32', '#BC9420',
      '#F8E090', '#E6C860', '#D4B040', '#C29828',
      '#B08018', '#9E6C0C', '#8C5A06', '#FAD060',
    ],
  },
  {
    id: 'cobra',
    label: 'Cobra',
    emoji: '🐍',
    boardColors: [
      '#2A5A1A', '#1E4C14', '#163E0E', '#0E3008',
      '#3A6E22', '#2E5C18', '#224E10', '#18400A',
      '#507A34', '#426828', '#34561E', '#264414',
      '#6A8840', '#587232', '#465E26', '#344A1A',
    ],
  },
  {
    id: 'flamingo',
    label: 'Flamingo',
    emoji: '🦩',
    boardColors: [
      '#FF85A1', '#FF6B8A', '#FF5075', '#E83A5F',
      '#FFB3C6', '#FF99B5', '#FF7FA4', '#FF6593',
      '#FFCCD8', '#FFB8C8', '#FFA4B8', '#FF90A8',
      '#F06292', '#EC407A', '#E91E63', '#D81B60',
    ],
  },
];

export const DEFAULT_SKIN = SKINS[0];
