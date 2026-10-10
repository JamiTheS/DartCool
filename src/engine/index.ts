/**
 * Point d'entrée du moteur : simulation d'une partie et construction du
 * résultat figé. Tout passe par `runMatch`.
 */
import { Dart } from './darts';
import { runCricket } from './cricket';
import { runKiller } from './killer';
import { runBobs27, runCountUp, runHalveIt } from './practice';
import { runAtc, runBaseball, runGolf, runShanghai } from './rounds';
import { summarize } from './stats';
import { AnyState, Match, MatchResult, ModeId, PlayerMatchStats } from './types';
import { runX01 } from './x01';

export * from './darts';
export * from './types';
export { checkout, isOneDartOut } from './checkout';
export { CRICKET_TARGETS } from './cricket';
export { HALVE_SEQUENCES, halveSequence } from './practice';
export { parseNumbers } from './killer';
export { avg3, fmt0, fmt1, summarize } from './stats';

const RUNNERS: Record<ModeId, (m: Match) => AnyState> = {
  x01: runX01,
  cricket: runCricket,
  atc: runAtc,
  shanghai: runShanghai,
  countup: runCountUp,
  halveit: runHalveIt,
  golf: runGolf,
  bobs27: runBobs27,
  killer: runKiller,
  baseball: runBaseball,
};

/** Rejoue toute la partie depuis la liste des fléchettes. */
export function runMatch(match: Match): AnyState {
  const run = RUNNERS[match.modeId];
  return run(match);
}

/** Valeur principale affichée pour un joueur, selon le mode. */
export function mainValue(state: AnyState, idx: number): number {
  if (state.kind === 'x01') return state.players[idx].score;
  if (state.kind === 'cricket') return state.players[idx].points;
  return state.players[idx].main;
}

/** Résultat figé : classement et statistiques, pour l'historique. */
export function buildResult(match: Match, state: AnyState): MatchResult {
  const stats: Record<string, PlayerMatchStats> = {};
  const ranking: MatchResult['ranking'] = [];

  state.order.forEach((idx, i) => {
    const p = state.players[idx];
    stats[p.id] = summarize(p.stat);
    let score: string;
    if (state.kind === 'x01') {
      const xp = state.players[idx];
      score = state.setsToWin > 1 ? `${xp.sets} set${xp.sets > 1 ? 's' : ''}` : `${xp.legs} manche${xp.legs > 1 ? 's' : ''}`;
    } else if (state.kind === 'cricket') {
      score = `${state.players[idx].points} pts`;
    } else {
      score = `${state.players[idx].main}`;
    }
    ranking.push({ playerId: p.id, name: p.name, rank: i + 1, score });
  });

  const winnerIds =
    state.winnerIdx !== null
      ? [state.players[state.winnerIdx].id]
      : ranking.filter((r) => r.rank === 1).map((r) => r.playerId);

  return { winnerIds, ranking, stats };
}

/** Ajoute une fléchette à la partie (immuable). */
export function withDart(match: Match, d: Dart): Match {
  return { ...match, darts: [...match.darts, d] };
}

/** Retire la dernière fléchette. */
export function withoutLastDart(match: Match): Match {
  if (match.darts.length === 0) return match;
  return { ...match, darts: match.darts.slice(0, -1) };
}
