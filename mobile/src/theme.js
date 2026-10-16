// "Bliss" colours: warm cream, mocha brown and champagne gold. Every colour in the app comes from here.
export const colors = {
  background: '#F6F0E9',
  blobs: { latte: '#E7D6C6', sand: '#E9D2B4', rose: '#EBCFC2', taupe: '#D8C8BA' },
  sheen: ['#F1DDBD', '#D3A04E', '#A9805F', '#E6CBA4'], // champagne-gold edge

  ink: '#5E4535', // deep mocha: primary buttons, mic, active pill
  mocha: '#8C6A55',
  gold: '#C9963F',
  text: '#3B2B22',
  muted: '#8E7B6E',
  dim: '#BBAA9D',
  onInk: '#FFFFFF',

  card: 'rgba(255,255,255,0.82)',
  surface: '#FFFFFF',
  surfaceAlt: '#F3ECE5',
  border: 'rgba(94,69,53,0.09)',
  backdrop: 'rgba(59,43,34,0.35)',

  personA: '#8C6A55', // mocha
  personASoft: '#F1E7DE',
  personB: '#B8873F', // gold
  personBSoft: '#F7EDDC',

  live: '#C0533A',
  success: '#6E9B6A',
  successSoft: '#E8F0E4',
  danger: '#C0533A',
  dangerSoft: '#F8E7E1',
};

export const fonts = {
  serif: 'PlayfairDisplay_600SemiBold',
  serifBold: 'PlayfairDisplay_700Bold',
  serifItalic: 'PlayfairDisplay_400Regular_Italic',
};

// body text uses the phone's own font
export const type = {
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semibold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
};

// soft warm shadow for floating cards
export const shadow = {
  shadowColor: '#5E4535',
  shadowOpacity: 0.1,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
};
