/**
 * DartCool — design tokens.
 * Identité : « Craie & Sisal ». Un tableau de bar réinventé :
 * noir chaud (feutre), craie crème, laiton pour l'action, rouge/vert de cible.
 * Source unique de vérité : aucune couleur, taille ou espacement en dur ailleurs.
 */
import { Platform, TextStyle } from 'react-native';

export const C = {
  /** Fond général, noir chaud à sous-ton vert (feutre de bar). */
  base: '#0B0E0C',
  /** Panneaux, cartes. */
  panel: '#131815',
  /** Panneau surélevé (touche de pavé, ligne active). */
  panelHigh: '#1C2420',
  panelHigher: '#263028',
  /** Filets façon trait de craie. */
  line: '#2A332D',
  lineSoft: 'rgba(242,239,230,0.08)',

  /** Texte principal : craie. */
  chalk: '#F3F0E7',
  chalkDim: '#A9B0A6',
  chalkFaint: '#6B736C',

  /** Laiton : couleur de marque, état actif, joueur au lancer. */
  brass: '#F0B429',
  brassSoft: 'rgba(240,180,41,0.14)',
  onBrass: '#1A1304',

  /** Rouge et vert de cible. */
  red: '#D23B2E',
  redSoft: 'rgba(210,59,46,0.14)',
  green: '#2FA86B',
  greenSoft: 'rgba(47,168,107,0.14)',
  sisal: '#D9C08A',
} as const;

/** Couleurs de joueur : palette de plumes de fléchettes. */
export const PLAYER_COLORS = [
  '#F0B429', // laiton
  '#3BA3D0', // cyan
  '#D23B2E', // rouge
  '#2FA86B', // vert
  '#A77BE0', // violet
  '#E8743B', // orange
  '#E2D04A', // citron
  '#5FD3C4', // turquoise
] as const;

export const SP = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, xxl: 40 } as const;
export const R = { xs: 4, sm: 8, md: 12, lg: 18, xl: 26, pill: 999 } as const;

/**
 * Polices système uniquement : zéro fichier à charger, donc zéro risque de
 * blocage au démarrage, et un rendu « tableau de score » natif sur iOS.
 */
export const FONT = {
  /** Gros chiffres, titres : condensé. */
  display: Platform.select({
    ios: 'DIN Condensed',
    android: 'sans-serif-condensed',
    default: 'Oswald, Arial Narrow, system-ui, sans-serif',
  }),
  /** Chiffres secondaires, étiquettes techniques. */
  numeric: Platform.select({
    ios: 'DIN Alternate',
    android: 'sans-serif-condensed',
    default: 'Inter, system-ui, sans-serif',
  }),
  /** Texte courant : police système. */
  body: Platform.select({ ios: undefined, android: undefined, default: 'system-ui, sans-serif' }),
} as const;

/** Chiffres à largeur fixe : indispensable pour un score qui ne tremble pas. */
export const TABULAR: TextStyle = { fontVariant: ['tabular-nums'] };

export const T = {
  /** Score géant (reste au 501). */
  hero: { fontFamily: FONT.display, fontSize: 104, lineHeight: 104, color: C.chalk, ...TABULAR },
  score: { fontFamily: FONT.display, fontSize: 56, lineHeight: 58, color: C.chalk, ...TABULAR },
  scoreSm: { fontFamily: FONT.display, fontSize: 34, lineHeight: 36, color: C.chalk, ...TABULAR },
  title: { fontFamily: FONT.display, fontSize: 30, lineHeight: 34, color: C.chalk, letterSpacing: 0.5 },
  subtitle: { fontFamily: FONT.display, fontSize: 21, lineHeight: 25, color: C.chalk },
  num: { fontFamily: FONT.numeric, fontSize: 19, color: C.chalk, ...TABULAR },
  body: { fontFamily: FONT.body, fontSize: 15, lineHeight: 21, color: C.chalkDim },
  bodyStrong: { fontFamily: FONT.body, fontSize: 15, lineHeight: 21, color: C.chalk, fontWeight: '600' as const },
  small: { fontFamily: FONT.body, fontSize: 13, lineHeight: 18, color: C.chalkDim },
  /** Étiquette en capitales espacées : les repères du tableau. */
  label: {
    fontFamily: FONT.body,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
    color: C.chalkFaint,
    fontWeight: '700' as const,
  },
} as const;

/** Cible de toucher minimale, pensée pour une main qui tient trois fléchettes. */
export const HIT = 56;

export function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
