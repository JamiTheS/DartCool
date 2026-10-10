/**
 * Arithmétique des fléchettes : représentation d'un impact, valeur, libellé,
 * géométrie de la cible. Tout le reste du moteur s'appuie sur ce fichier.
 */

/**
 * Un impact.
 * - `seg` : 0 = hors cible (manquée), 1..20 = secteur numéroté, 25 = centre.
 * - `mult` : 1 simple, 2 double, 3 triple. Au centre, 1 = 25 (simple bull),
 *   2 = 50 (bull, qui compte comme un double pour une sortie en double).
 * - `turnTotal` : saisie rapide d'un total de volée (X01 et modes de score pur).
 *   `seg` porte alors le total de la volée (0..180) et la volée est consommée.
 */
export type Dart = {
  seg: number;
  mult: 1 | 2 | 3;
  turnTotal?: true;
};

export const MISS: Dart = { seg: 0, mult: 1 };

export const dart = (seg: number, mult: 1 | 2 | 3 = 1): Dart => ({ seg, mult });
export const totalDart = (total: number): Dart => ({ seg: total, mult: 1, turnTotal: true });

/** Points marqués par un impact. */
export function value(d: Dart): number {
  if (d.turnTotal) return d.seg;
  if (d.seg === 0) return 0;
  if (d.seg === 25) return d.mult === 2 ? 50 : 25;
  return d.seg * d.mult;
}

export const isMiss = (d: Dart) => !d.turnTotal && d.seg === 0;
/** Un double au sens des règles : double d'un secteur, ou le bull à 50. */
export const isDouble = (d: Dart) => !d.turnTotal && d.mult === 2 && d.seg !== 0;
export const isTriple = (d: Dart) => !d.turnTotal && d.mult === 3 && d.seg !== 0 && d.seg !== 25;
/** Nombre de marques pour le Cricket. */
export const marks = (d: Dart): number => {
  if (d.turnTotal || d.seg === 0) return 0;
  if (d.seg === 25) return d.mult === 2 ? 2 : 1;
  return d.mult;
};

/** Libellé court et lisible : « T20 », « D16 », « 25 », « BULL », « — ». */
export function label(d: Dart): string {
  if (d.turnTotal) return String(d.seg);
  if (d.seg === 0) return '—';
  if (d.seg === 25) return d.mult === 2 ? 'BULL' : '25';
  return (d.mult === 2 ? 'D' : d.mult === 3 ? 'T' : '') + d.seg;
}

/** Libellé long pour les règles et l'historique. */
export function labelLong(d: Dart): string {
  if (d.turnTotal) return `volée de ${d.seg}`;
  if (d.seg === 0) return 'manquée';
  if (d.seg === 25) return d.mult === 2 ? 'bull (50)' : '25';
  return `${d.mult === 2 ? 'double ' : d.mult === 3 ? 'triple ' : ''}${d.seg}`;
}

/** Libellé d'une cible chiffrée, hors impact : « D12 », « T20 », « BULL ». */
export function targetLabel(seg: number, mult: 1 | 2 | 3 = 1): string {
  if (seg === 25) return mult === 2 ? 'BULL' : '25';
  return (mult === 2 ? 'D' : mult === 3 ? 'T' : '') + seg;
}

/** Ordre des secteurs dans le sens horaire, 20 en haut. */
export const SECTORS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5] as const;

/** Les trois volées maximales : repères affichés dans les stats. */
export const MAX_TURN = 180;

/** Totaux de volée impossibles avec trois fléchettes. */
const IMPOSSIBLE_TURN_TOTALS = new Set([179, 178, 176, 175, 173, 172, 169, 166, 163, 159]);

export function isPossibleTurnTotal(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n <= MAX_TURN && !IMPOSSIBLE_TURN_TOTALS.has(n);
}

/** Toutes les valeurs atteignables avec une fléchette, pour le solveur. */
export const ALL_DARTS: Dart[] = (() => {
  const out: Dart[] = [];
  for (const s of SECTORS) {
    out.push({ seg: s, mult: 1 }, { seg: s, mult: 2 }, { seg: s, mult: 3 });
  }
  out.push({ seg: 25, mult: 1 }, { seg: 25, mult: 2 });
  return out;
})();
