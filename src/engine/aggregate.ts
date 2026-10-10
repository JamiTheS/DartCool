/**
 * Statistiques de carrière, recalculées depuis l'historique des parties.
 * Rien n'est stocké en double : l'historique est la seule source.
 */
import { Match, ModeId, Player } from './types';

export type LifetimeStats = {
  playerId: string;
  name: string;
  color: string;
  matches: number;
  wins: number;
  winPct: number | null;
  darts: number;
  /** Moyenne à trois fléchettes, sur les parties de X01 uniquement. */
  avgX01: number | null;
  bestAvgX01: number | null;
  bestLegDarts: number | null;
  highTurn: number;
  highFinish: number;
  c180: number;
  c140: number;
  c100: number;
  doubles: number;
  triples: number;
  bulls: number;
  legsWon: number;
  favouriteMode: ModeId | null;
  perMode: Partial<Record<ModeId, { played: number; won: number }>>;
};

function empty(p: Player): LifetimeStats {
  return {
    playerId: p.id,
    name: p.name,
    color: p.color,
    matches: 0,
    wins: 0,
    winPct: null,
    darts: 0,
    avgX01: null,
    bestAvgX01: null,
    bestLegDarts: null,
    highTurn: 0,
    highFinish: 0,
    c180: 0,
    c140: 0,
    c100: 0,
    doubles: 0,
    triples: 0,
    bulls: 0,
    legsWon: 0,
    favouriteMode: null,
    perMode: {},
  };
}

export function aggregate(history: Match[], players: Player[]): LifetimeStats[] {
  const out = new Map<string, LifetimeStats>();
  for (const p of players) out.set(p.id, empty(p));

  // Cumuls pour la moyenne X01 pondérée par les fléchettes.
  const x01 = new Map<string, { scored: number; darts: number }>();

  for (const m of history) {
    if (!m.result) continue;
    for (const mp of m.players) {
      let s = out.get(mp.id);
      if (!s) {
        s = empty({ id: mp.id, name: mp.name, color: mp.color, createdAt: 0 });
        out.set(mp.id, s);
      }
      const st = m.result.stats[mp.id];
      s.matches += 1;
      if (m.result.winnerIds.includes(mp.id)) s.wins += 1;
      const pm = s.perMode[m.modeId] ?? { played: 0, won: 0 };
      pm.played += 1;
      if (m.result.winnerIds.includes(mp.id)) pm.won += 1;
      s.perMode[m.modeId] = pm;
      if (!st) continue;
      s.darts += st.darts;
      s.highTurn = Math.max(s.highTurn, st.highTurn);
      s.highFinish = Math.max(s.highFinish, st.highFinish);
      s.c180 += st.c180;
      s.c140 += st.c140;
      s.c100 += st.c100;
      s.doubles += st.doublesHit;
      s.triples += st.triplesHit;
      s.bulls += st.bullsHit;
      s.legsWon += st.legsWon;
      if (st.bestLegDarts !== null) {
        s.bestLegDarts = s.bestLegDarts === null ? st.bestLegDarts : Math.min(s.bestLegDarts, st.bestLegDarts);
      }
      if (m.modeId === 'x01') {
        const acc = x01.get(mp.id) ?? { scored: 0, darts: 0 };
        acc.scored += st.scored;
        acc.darts += st.darts;
        x01.set(mp.id, acc);
        if (st.avg3 !== null) {
          s.bestAvgX01 = s.bestAvgX01 === null ? st.avg3 : Math.max(s.bestAvgX01, st.avg3);
        }
      }
    }
  }

  for (const [id, s] of out) {
    s.winPct = s.matches > 0 ? (s.wins / s.matches) * 100 : null;
    const acc = x01.get(id);
    s.avgX01 = acc && acc.darts > 0 ? (acc.scored / acc.darts) * 3 : null;
    let best: { mode: ModeId; played: number } | null = null;
    for (const [mode, v] of Object.entries(s.perMode) as [ModeId, { played: number; won: number }][]) {
      if (!best || v.played > best.played) best = { mode, played: v.played };
    }
    s.favouriteMode = best?.mode ?? null;
  }

  return [...out.values()].sort((a, b) => b.matches - a.matches || b.wins - a.wins);
}
