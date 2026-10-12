/**
 * DartCool — design tokens.
 *
 * Identité « Porcelaine » : une app blanche et claire, du verre là où du contenu
 * passe dessous, un rose et une pêche comme seules couleurs d'accent, et la
 * cible de fléchettes comme unique objet sombre de l'écran — c'est elle qui
 * porte le regard.
 *
 * Source unique de vérité : aucune couleur, aucun rayon, aucune ombre en dur
 * ailleurs dans le code.
 */
import { Platform, TextStyle, ViewStyle } from 'react-native';

export const C = {
  /** Fond général : blanc chaud légèrement froid, jamais de blanc pur. */
  bg: '#F5F4F7',
  /** Carte posée sur le fond. */
  card: '#FFFFFF',
  /** Surface légèrement en retrait (touches de pavé, champs). */
  cardHi: '#FBFAFC',
  cardHi2: '#F0EFF4',
  /** Filets : presque invisibles, l'ombre fait le travail. */
  line: 'rgba(22,22,28,0.07)',
  lineSoft: 'rgba(22,22,28,0.04)',

  /** Encre. */
  ink: '#16161C',
  ink2: '#6C6C78',
  ink3: '#A6A6B2',

  /** Rose : l'état actif, le joueur au lancer, l'anneau de double. */
  pink: '#FF9EC4',
  pinkInk: '#D8528C',
  pinkSoft: '#FFEEF5',
  onPink: '#3A1223',

  /** Pêche : le second accent, l'anneau de triple. */
  peach: '#FFC08A',
  peachInk: '#C97F35',
  peachSoft: '#FFF3E6',

  /** États. */
  ok: '#3BA776',
  okSoft: '#E7F6EF',
  danger: '#E5484D',
  dangerSoft: '#FDECEC',
  /** Marque laissée par une fléchette sur la cible. */
  mark: '#FF3B3B',

  /** Matières de la cible. */
  boardDark: 'rgba(22,22,28,0.92)',
  boardLight: 'rgba(226,226,236,0.80)',
  boardRim: '#1B1B22',
  boardWire: 'rgba(255,255,255,0.22)',

  /** Verre : dock de saisie, barre d'onglets, feuilles. */
  glass: 'rgba(255,255,255,0.72)',
  glassLine: 'rgba(255,255,255,0.9)',
  scrim: 'rgba(22,22,28,0.45)',
} as const;

/** Couleurs de joueur : pastels distinguables, lisibles sur blanc. */
export const PLAYER_COLORS = [
  '#FF9EC4', // rose
  '#8FC4E8', // bleu
  '#FFC08A', // pêche
  '#9BD9BE', // menthe
  '#C4B5F0', // lilas
  '#F5A9A9', // corail
  '#FFD98A', // miel
  '#A8D8D0', // turquoise
] as const;

export const SP = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, xxl: 40 } as const;

/** Les rayons sont hiérarchisés : c'est ce qui évite l'effet gabarit. */
export const R = { xs: 8, sm: 13, md: 18, lg: 24, xl: 30, dock: 34, pill: 999 } as const;

/** Ombres à deux couches : un contact net, une diffusion large. */
export const SH: Record<'sm' | 'md' | 'lg', ViewStyle> = {
  sm: {
    shadowColor: '#16161C',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#16161C',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  lg: {
    shadowColor: '#16161C',
    shadowOpacity: 0.14,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
};

/**
 * Polices système : zéro fichier à charger, donc zéro risque au démarrage,
 * et des chiffres condensés qui donnent son caractère sportif à l'app.
 */
export const FONT = {
  display: Platform.select({
    ios: 'DIN Condensed',
    android: 'sans-serif-condensed',
    default: 'Barlow Condensed, Oswald, system-ui, sans-serif',
  }),
  numeric: Platform.select({
    ios: 'DIN Alternate',
    android: 'sans-serif-condensed',
    default: 'Inter, system-ui, sans-serif',
  }),
  body: Platform.select({ ios: undefined, android: undefined, default: 'Inter, system-ui, sans-serif' }),
} as const;

/** Chiffres à largeur fixe : un score ne doit jamais trembler. */
export const TABULAR: TextStyle = { fontVariant: ['tabular-nums'] };

export const T = {
  hero: { fontFamily: FONT.display, fontSize: 92, lineHeight: 90, color: C.ink, ...TABULAR },
  score: { fontFamily: FONT.display, fontSize: 52, lineHeight: 54, color: C.ink, ...TABULAR },
  scoreSm: { fontFamily: FONT.display, fontSize: 30, lineHeight: 32, color: C.ink, ...TABULAR },
  title: { fontFamily: FONT.display, fontSize: 30, lineHeight: 34, color: C.ink, letterSpacing: 0.3 },
  subtitle: { fontFamily: FONT.display, fontSize: 21, lineHeight: 25, color: C.ink },
  num: { fontFamily: FONT.numeric, fontSize: 18, color: C.ink, ...TABULAR },
  body: { fontFamily: FONT.body, fontSize: 15, lineHeight: 21, color: C.ink2 },
  bodyStrong: { fontFamily: FONT.body, fontSize: 15, lineHeight: 21, color: C.ink, fontWeight: '600' as const },
  small: { fontFamily: FONT.body, fontSize: 13, lineHeight: 18, color: C.ink2 },
  label: {
    fontFamily: FONT.body,
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 1.3,
    textTransform: 'uppercase' as const,
    color: C.ink3,
    fontWeight: '700' as const,
  },
} as const;

/** Cible de toucher minimale, pensée pour une main qui tient trois fléchettes. */
export const HIT = 52;

export function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
