// Tokens extraídos do protótipo (docs/prototipo/Prototipo.html).

export const colors = {
  bg: '#FAF6EF',
  card: '#FCFAF5',
  paper: '#FFFDF9',
  cream: '#F3ECDF',
  creamSoft: '#FBF5EA',
  line: '#EADFCC',
  lineStrong: '#DCCDB4',

  ink: '#3E332E',
  inkSoft: '#55463F',
  muted: '#6E5F56',
  faint: '#8C7C71',

  accent: '#B0552F',
  accentDark: '#98462A',
  accentSoft: '#F7E2D7',
  accentLine: '#EFC3AC',

  dark: '#3E332E',
  green: '#3D5A41',
  greenSoft: '#EAF2EB',
  greenMint: '#CFE0D2',
  gold: '#6F5410',
  goldSoft: '#F7E8B5',
  lilac: '#DCD3E8',
  lilacSoft: '#F0ECF6',
  rose: '#F6D8CE',
};

export const fonts = {
  serif: 'Literata_600SemiBold',
  serifRegular: 'Literata_400Regular',
  serifItalic: 'Literata_400Regular_Italic',
  serifBold: 'Literata_700Bold',
  sans: 'NunitoSans_400Regular',
  sansMedium: 'NunitoSans_500Medium',
  sansSemi: 'NunitoSans_600SemiBold',
  sansBold: 'NunitoSans_700Bold',
  mono: 'CourierPrime_400Regular',
  monoBold: 'CourierPrime_700Bold',
};

export const radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 };

export const shadow = {
  card: {
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cover: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
};

export const type = {
  eyebrow: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
    color: colors.muted,
  },
  h1: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 28, color: colors.ink },
  h2: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 24, color: colors.ink },
  title: { fontFamily: fonts.sansBold, fontSize: 15, lineHeight: 20, color: colors.ink },
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.ink },
  small: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: colors.muted },
  mono: { fontFamily: fonts.monoBold, fontSize: 11, lineHeight: 14, color: colors.inkSoft },
};
