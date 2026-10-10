/**
 * Accumulation et mise en forme des statistiques.
 * Les compteurs sont alimentés fléchette par fléchette pendant la simulation ;
 * `summarize` en fait des chiffres présentables.
 */
import { Dart, isDouble, isTriple, value } from './darts';
import { PlayerMatchStats, StatAcc } from './types';

export function newStat(): StatAcc {
  return {
    darts: 0,
    scored: 0,
    turnScores: [],
    first9Darts: 0,
    first9Scored: 0,
    highTurn: 0,
    c180: 0,
    c140: 0,
    c100: 0,
    c60: 0,
    doublesHit: 0,
    triplesHit: 0,
    bullsHit: 0,
    misses: 0,
    bestLegDarts: null,
    legsWon: 0,
    checkoutTries: 0,
    checkoutHits: 0,
    highFinish: 0,
  };
}

/**
 * Comptabilise une fléchette.
 * `scored` est fourni par le mode : au Cricket ou à l'Horloge, les points
 * marqués ne sont pas la valeur brute de l'impact.
 */
export function countDart(stat: StatAcc, d: Dart, scored: number): void {
  if (d.turnTotal) {
    // Une saisie par total vaut trois fléchettes.
    stat.darts += 3;
    stat.scored += scored;
    if (stat.first9Darts < 9) {
      stat.first9Darts = Math.min(9, stat.first9Darts + 3);
      stat.first9Scored += scored;
    }
    return;
  }
  stat.darts += 1;
  stat.scored += scored;
  if (stat.first9Darts < 9) {
    stat.first9Darts += 1;
    stat.first9Scored += scored;
  }
  if (d.seg === 0) stat.misses += 1;
  else if (d.seg === 25) stat.bullsHit += 1;
  if (isDouble(d)) stat.doublesHit += 1;
  if (isTriple(d)) stat.triplesHit += 1;
}

/** Comptabilise une volée terminée. */
export function countTurn(stat: StatAcc, scored: number): void {
  stat.turnScores.push(scored);
  if (scored > stat.highTurn) stat.highTurn = scored;
  if (scored === 180) stat.c180 += 1;
  if (scored >= 140) stat.c140 += 1;
  if (scored >= 100) stat.c100 += 1;
  if (scored >= 60) stat.c60 += 1;
}

export function summarize(stat: StatAcc): PlayerMatchStats {
  return {
    darts: stat.darts,
    scored: stat.scored,
    avg3: stat.darts > 0 ? (stat.scored / stat.darts) * 3 : null,
    avgFirst9: stat.first9Darts > 0 ? (stat.first9Scored / stat.first9Darts) * 3 : null,
    highTurn: stat.highTurn,
    c180: stat.c180,
    c140: stat.c140,
    c100: stat.c100,
    doublesHit: stat.doublesHit,
    triplesHit: stat.triplesHit,
    bullsHit: stat.bullsHit,
    legsWon: stat.legsWon,
    bestLegDarts: stat.bestLegDarts,
    checkoutPct:
      stat.checkoutTries > 0 ? (stat.checkoutHits / stat.checkoutTries) * 100 : null,
    highFinish: stat.highFinish,
  };
}

/** Moyenne à trois fléchettes, en direct. */
export function avg3(stat: StatAcc): number | null {
  return stat.darts > 0 ? (stat.scored / stat.darts) * 3 : null;
}

export function fmt1(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return n.toFixed(1);
}

export function fmt0(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return Math.round(n).toString();
}

/** Points marqués par une volée, pour l'historique. */
export function turnSum(darts: Dart[]): number {
  return darts.reduce((s, d) => s + value(d), 0);
}
