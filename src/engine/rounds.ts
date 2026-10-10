/**
 * Modes à cible imposée qui tourne : Horloge, Shanghai, Golf, Baseball.
 */
import { Dart, isDouble, isTriple, targetLabel } from './darts';
import { finishGeneric, initPlayers, opt, optB, optS, Rotation } from './generic';
import { countDart } from './stats';
import { Flash, GenericState, Match } from './types';

/* ------------------------------------------------------------------ Horloge */

/** Suite des cibles : 1 à 20, puis le bull en option. */
function atcTargets(withBull: boolean): number[] {
  const t = Array.from({ length: 20 }, (_, i) => i + 1);
  return withBull ? [...t, 25] : t;
}

export function runAtc(match: Match): GenericState {
  const ring = optS(match, 'ring', 'any') as 'any' | 'double' | 'triple';
  const withBull = optB(match, 'bull', true);
  const targets = atcTargets(withBull);
  const players = initPlayers(match, 0);
  for (const p of players) p.ownTarget = targets[0];

  const rot = new Rotation(players);
  let finished = false;
  let winnerIdx: number | null = null;
  let flash: Flash | null = null;

  const hits = (d: Dart, target: number): boolean => {
    if (d.turnTotal || d.seg === 0) return false;
    if (target === 25) return d.seg === 25 && d.mult === 2;
    if (d.seg !== target) return false;
    if (ring === 'double') return isDouble(d);
    if (ring === 'triple') return isTriple(d);
    return true;
  };

  for (const d of match.darts) {
    if (finished) break;
    flash = null;
    const p = rot.current;
    const target = p.ownTarget ?? targets[0];
    const ok = hits(d, target);
    rot.add(d, ok ? 1 : 0);
    countDart(p.stat, d, ok ? 1 : 0);

    if (ok) {
      p.main += 1;
      const next = targets[p.main];
      p.ownTarget = next ?? null;
      if (p.main >= targets.length) {
        p.done = true;
        finished = true;
        winnerIdx = p.idx;
        flash = { kind: 'win', text: `${p.name} termine le tour de cadran` };
        rot.close('fin');
        break;
      }
      flash = { kind: 'info', text: `Cible suivante : ${targetLabel(p.ownTarget ?? 0, ring === 'double' ? 2 : ring === 'triple' ? 3 : 1)}` };
    }
    if (rot.dartsInTurn >= 3) rot.close();
  }

  const cur = rot.current;
  const curTargetLabel =
    cur.ownTarget === null
      ? '—'
      : cur.ownTarget === 25
        ? 'BULL'
        : targetLabel(cur.ownTarget, ring === 'double' ? 2 : ring === 'triple' ? 3 : 1);

  return finishGeneric({
    match,
    modeId: 'atc',
    players,
    rot,
    finished,
    winnerIdx,
    flash,
    target: curTargetLabel,
    hint:
      ring === 'any'
        ? 'Touche chaque numéro dans l’ordre, du 1 au 20'
        : ring === 'double'
          ? 'Mode exigeant : seuls les doubles font avancer'
          : 'Mode exigeant : seuls les triples font avancer',
    mainLabel: 'Cibles',
    focus: cur.ownTarget === null ? [] : [cur.ownTarget],
    focusMult: ring === 'double' ? 2 : ring === 'triple' ? 3 : undefined,
    totalRounds: null,
    headline: `Tour ${rot.round} · ${withBull ? '20 + bull' : '20 cibles'}`,
    tieBreak: (p) => -p.stat.darts,
    lines: (p) => [
      { label: 'Cible', value: p.ownTarget === null ? '✓' : p.ownTarget === 25 ? 'BULL' : String(p.ownTarget) },
      { label: 'Fléch.', value: String(p.stat.darts) },
    ],
  });
}

/* ----------------------------------------------------------------- Shanghai */

export function runShanghai(match: Match): GenericState {
  const rounds = opt(match, 'rounds', 7);
  const shanghaiWin = optB(match, 'shanghaiWin', true);
  const players = initPlayers(match, 0);
  const rot = new Rotation(players);
  let finished = false;
  let winnerIdx: number | null = null;
  let flash: Flash | null = null;

  for (const d of match.darts) {
    if (finished) break;
    flash = null;
    const p = rot.current;
    const target = Math.min(rot.round, rounds);
    const on = !d.turnTotal && d.seg === target;
    const gained = on ? target * d.mult : 0;
    rot.add(d, gained);
    countDart(p.stat, d, gained);
    p.main += gained;

    // Shanghai : simple, double et triple de la cible dans la même volée.
    if (shanghaiWin && rot.turnDarts.length === 3) {
      const mults = rot.turnDarts.filter((x) => !x.turnTotal && x.seg === target).map((x) => x.mult);
      if (mults.includes(1) && mults.includes(2) && mults.includes(3)) {
        finished = true;
        winnerIdx = p.idx;
        flash = { kind: 'win', text: `SHANGHAI ! ${p.name} gagne sur le ${target}` };
        rot.close('shanghai');
        break;
      }
    }

    if (rot.dartsInTurn >= 3) {
      rot.close();
      if (rot.turnsPlayed >= rounds * players.length) {
        finished = true;
        const best = [...players].sort((a, b) => b.main - a.main)[0];
        winnerIdx = best.idx;
        flash = { kind: 'win', text: `${best.name} remporte la partie` };
        break;
      }
    }
  }

  const target = Math.min(rot.round, rounds);
  return finishGeneric({
    match,
    modeId: 'shanghai',
    players,
    rot,
    finished,
    winnerIdx,
    flash,
    target: String(target),
    hint: shanghaiWin ? 'Simple + double + triple de la cible dans une volée = victoire immédiate' : null,
    mainLabel: 'Points',
    focus: [target],
    totalRounds: rounds,
    headline: `Tour ${Math.min(rot.round, rounds)} / ${rounds} · cible ${target}`,
    lines: (p) => [{ label: 'Dernière', value: p.stat.turnScores.length ? String(p.stat.turnScores[p.stat.turnScores.length - 1]) : '—' }],
  });
}

/* --------------------------------------------------------------------- Golf */

/** Coups d'un trou : triple = 1, double = 2, simple = 3, rien = 5. */
function holeStrokes(darts: Dart[], hole: number): number {
  let best = 5;
  for (const d of darts) {
    if (d.turnTotal || d.seg !== hole) continue;
    const s = d.mult === 3 ? 1 : d.mult === 2 ? 2 : 3;
    if (s < best) best = s;
  }
  return best;
}

export function runGolf(match: Match): GenericState {
  const holes = opt(match, 'holes', 9);
  const players = initPlayers(match, 0);
  const rot = new Rotation(players);
  let finished = false;
  let winnerIdx: number | null = null;
  let flash: Flash | null = null;
  /** Coups trou par trou, par joueur. */
  const cards: number[][] = players.map(() => []);

  for (const d of match.darts) {
    if (finished) break;
    flash = null;
    const p = rot.current;
    const hole = Math.min(rot.round, holes);
    const on = !d.turnTotal && d.seg === hole;
    rot.add(d, on ? d.mult : 0);
    countDart(p.stat, d, on ? d.mult : 0);

    if (rot.dartsInTurn >= 3) {
      const strokes = holeStrokes(rot.turnDarts, hole);
      cards[p.idx].push(strokes);
      p.main += strokes;
      const name = strokes === 1 ? 'Albatros' : strokes === 2 ? 'Birdie' : strokes === 3 ? 'Par' : 'Bogey';
      flash = { kind: 'info', text: `Trou ${hole} · ${name} (${strokes})` };
      rot.close(`trou ${hole}`);
      if (rot.turnsPlayed >= holes * players.length) {
        finished = true;
        const best = [...players].sort((a, b) => a.main - b.main)[0];
        winnerIdx = best.idx;
        flash = { kind: 'win', text: `${best.name} rentre au club-house en ${best.main}` };
        break;
      }
    }
  }

  const hole = Math.min(rot.round, holes);
  return finishGeneric({
    match,
    modeId: 'golf',
    players,
    rot,
    finished,
    winnerIdx,
    flash,
    target: String(hole),
    hint: 'Triple = 1 coup, double = 2, simple = 3, rien = 5. Le plus bas gagne.',
    mainLabel: 'Coups',
    focus: [hole],
    lowestWins: true,
    totalRounds: holes,
    headline: `Trou ${hole} / ${holes} · par ${hole * 3}`,
    lines: (p) => {
      const played = cards[p.idx].length;
      const par = played * 3;
      const diff = p.main - par;
      return [
        { label: 'Trous', value: `${played}/${holes}` },
        { label: 'Par', value: played === 0 ? '—' : diff === 0 ? 'E' : diff > 0 ? `+${diff}` : String(diff) },
      ];
    },
  });
}

/* ----------------------------------------------------------------- Baseball */

export function runBaseball(match: Match): GenericState {
  const innings = opt(match, 'innings', 9);
  const extra = optB(match, 'extra', true);
  const players = initPlayers(match, 0);
  const rot = new Rotation(players);
  let finished = false;
  let winnerIdx: number | null = null;
  let flash: Flash | null = null;
  const perInning: number[][] = players.map(() => []);

  for (const d of match.darts) {
    if (finished) break;
    flash = null;
    const p = rot.current;
    const inning = rot.round;
    const target = inning <= innings ? inning : ((inning - 1) % 20) + 1;
    const on = !d.turnTotal && d.seg === target && d.seg !== 25;
    const runs = on ? d.mult : 0;
    rot.add(d, runs);
    countDart(p.stat, d, runs);
    p.main += runs;

    if (rot.dartsInTurn >= 3) {
      perInning[p.idx].push(rot.turnScored);
      rot.close(`manche ${inning}`);
      if (rot.turnsPlayed >= innings * players.length) {
        const top = Math.max(...players.map((q) => q.main));
        const leaders = players.filter((q) => q.main === top);
        const roundsPlayed = rot.turnsPlayed / players.length;
        const tie = leaders.length > 1;
        if (!tie || !extra || roundsPlayed >= innings + 3) {
          finished = true;
          winnerIdx = leaders[0].idx;
          flash = {
            kind: 'win',
            text: tie ? `Égalité : ${leaders.map((q) => q.name).join(' / ')}` : `${leaders[0].name} gagne ${top} à ${Math.max(...players.filter((q) => q.idx !== leaders[0].idx).map((q) => q.main), 0)}`,
          };
          break;
        }
        flash = { kind: 'info', text: 'Égalité : manche supplémentaire' };
      }
    }
  }

  const inning = rot.round;
  const target = inning <= innings ? inning : ((inning - 1) % 20) + 1;
  return finishGeneric({
    match,
    modeId: 'baseball',
    players,
    rot,
    finished,
    winnerIdx,
    flash,
    target: String(target),
    hint: 'Simple = 1 point, double = 2, triple = 3, sur le numéro de la manche',
    mainLabel: 'Points',
    focus: [target],
    totalRounds: innings,
    headline: inning > innings ? `Manche supplémentaire ${inning - innings}` : `Manche ${inning} / ${innings}`,
    lines: (p) => [
      { label: 'Manches', value: String(perInning[p.idx].length) },
      { label: 'Dernière', value: perInning[p.idx].length ? String(perInning[p.idx][perInning[p.idx].length - 1]) : '—' },
    ],
  });
}
