/**
 * Modes de score pur et d'entraînement : Score Max, Halve It, Bob's 27.
 */
import { Dart, isDouble, isTriple, value } from './darts';
import { everyoneDone, finishGeneric, initPlayers, opt, optB, optS, Rotation } from './generic';
import { countDart } from './stats';
import { Flash, GenericState, Match } from './types';

/* ---------------------------------------------------------------- Score Max */

export function runCountUp(match: Match): GenericState {
  const rounds = opt(match, 'rounds', 8);
  const players = initPlayers(match, 0);
  const rot = new Rotation(players);
  let finished = false;
  let winnerIdx: number | null = null;
  let flash: Flash | null = null;

  for (const d of match.darts) {
    if (finished) break;
    flash = null;
    const p = rot.current;
    const v = value(d);
    rot.add(d, v);
    countDart(p.stat, d, v);
    p.main += v;

    const turnOver = d.turnTotal === true || rot.dartsInTurn >= 3;
    if (turnOver) {
      if (rot.turnScored >= 100) flash = { kind: 'big', text: `${rot.turnScored} !` };
      rot.close();
      if (rot.turnsPlayed >= rounds * players.length) {
        finished = true;
        const best = [...players].sort((a, b) => b.main - a.main)[0];
        winnerIdx = best.idx;
        flash = { kind: 'win', text: `${best.name} termine à ${best.main}` };
        break;
      }
    }
  }

  return finishGeneric({
    match,
    modeId: 'countup',
    players,
    rot,
    finished,
    winnerIdx,
    flash,
    target: 'Libre',
    hint: 'Tout compte : visez le maximum de points en ' + rounds + ' volées',
    mainLabel: 'Points',
    totalRounds: rounds,
    allowTotal: true,
    headline: `Volée ${Math.min(rot.round, rounds)} / ${rounds}`,
    lines: (p) => [
      {
        label: 'Moy./volée',
        value: p.stat.turnScores.length
          ? (p.stat.turnScores.reduce((s, x) => s + x, 0) / p.stat.turnScores.length).toFixed(1)
          : '—',
      },
      { label: 'Record', value: p.stat.highTurn ? String(p.stat.highTurn) : '—' },
    ],
  });
}

/* ------------------------------------------------------------------ Halve It */

type HalveTarget = { code: string; label: string; test: (d: Dart) => boolean };

const T_NUM = (n: number): HalveTarget => ({
  code: String(n),
  label: String(n),
  test: (d) => !d.turnTotal && d.seg === n,
});
const T_DOUBLE: HalveTarget = {
  code: 'D',
  label: 'Double',
  test: (d) => isDouble(d),
};
const T_TRIPLE: HalveTarget = {
  code: 'T',
  label: 'Triple',
  test: (d) => isTriple(d),
};
const T_BULL: HalveTarget = {
  code: 'B',
  label: 'Bull',
  test: (d) => !d.turnTotal && d.seg === 25,
};

export const HALVE_SEQUENCES: Record<string, HalveTarget[]> = {
  classic: [T_NUM(20), T_NUM(19), T_NUM(18), T_DOUBLE, T_NUM(17), T_NUM(16), T_TRIPLE, T_NUM(15), T_BULL],
  court: [T_NUM(20), T_NUM(19), T_DOUBLE, T_TRIPLE, T_BULL],
  nombres: [T_NUM(20), T_NUM(19), T_NUM(18), T_NUM(17), T_NUM(16), T_NUM(15), T_BULL],
};

export function halveSequence(id: string): HalveTarget[] {
  return HALVE_SEQUENCES[id] ?? HALVE_SEQUENCES.classic;
}

export function runHalveIt(match: Match): GenericState {
  const seqId = optS(match, 'seq', 'classic');
  const seq = halveSequence(seqId);
  const start = opt(match, 'start', 40);
  const players = initPlayers(match, start);
  const rot = new Rotation(players);
  let finished = false;
  let winnerIdx: number | null = null;
  let flash: Flash | null = null;

  for (const d of match.darts) {
    if (finished) break;
    flash = null;
    const p = rot.current;
    const t = seq[Math.min(rot.round, seq.length) - 1];
    const on = t.test(d);
    const gained = on ? value(d) : 0;
    rot.add(d, gained);
    countDart(p.stat, d, gained);
    p.main += gained;

    if (rot.dartsInTurn >= 3) {
      if (rot.turnScored === 0) {
        const before = p.main;
        p.main = Math.floor(p.main / 2);
        flash = { kind: 'bust', text: `Coupé en deux : ${before} → ${p.main}` };
        rot.close('coupé');
      } else {
        rot.close();
      }
      if (rot.turnsPlayed >= seq.length * players.length) {
        finished = true;
        const best = [...players].sort((a, b) => b.main - a.main)[0];
        winnerIdx = best.idx;
        flash = { kind: 'win', text: `${best.name} termine à ${best.main}` };
        break;
      }
    }
  }

  const t = seq[Math.min(rot.round, seq.length) - 1];
  return finishGeneric({
    match,
    modeId: 'halveit',
    players,
    rot,
    finished,
    winnerIdx,
    flash,
    target: t.label,
    hint: 'Trois fléchettes hors cible et le score est coupé en deux',
    mainLabel: 'Points',
    focus: /^\d+$/.test(t.code) ? [parseInt(t.code, 10)] : t.code === 'B' ? [25] : [],
    focusMult: t.code === 'D' ? 2 : t.code === 'T' ? 3 : undefined,
    totalRounds: seq.length,
    headline: `Cible ${Math.min(rot.round, seq.length)} / ${seq.length} · ${t.label}`,
    lines: () => [],
  });
}

/* ------------------------------------------------------------------ Bob's 27 */

export function runBobs27(match: Match): GenericState {
  const hard = optB(match, 'hard', false);
  const players = initPlayers(match, 27);
  const rot = new Rotation(players);
  let finished = false;
  let winnerIdx: number | null = null;
  let flash: Flash | null = null;
  const ROUNDS = 21; // D1 à D20, puis le bull

  const targetOf = (round: number) => Math.min(round, ROUNDS);
  const stake = (round: number) => (round >= ROUNDS ? 50 : targetOf(round) * 2);

  for (const d of match.darts) {
    if (finished) break;
    flash = null;
    const p = rot.current;
    const round = Math.min(rot.round, ROUNDS);
    const isBullRound = round === ROUNDS;
    const on = isBullRound
      ? !d.turnTotal && d.seg === 25 && d.mult === 2
      : isDouble(d) && d.seg === round;
    const gained = on ? (isBullRound ? 50 : round * 2) : 0;
    rot.add(d, gained);
    countDart(p.stat, d, gained);
    p.main += gained;

    if (rot.dartsInTurn >= 3) {
      if (rot.turnScored === 0) {
        p.main -= stake(round);
        flash = { kind: 'bust', text: `Raté : −${stake(round)}` };
      }
      if (p.main < 0 || (hard && p.main <= 0)) {
        p.out = true;
        flash = { kind: 'out', text: `${p.name} est éliminé` };
      }
      rot.close();
      const roundsDone = rot.turnsPlayed >= ROUNDS * players.length;
      if (roundsDone || everyoneDone(players)) {
        finished = true;
        const alive = players.filter((q) => !q.out);
        const best = (alive.length ? alive : players).sort((a, b) => b.main - a.main)[0];
        winnerIdx = best.idx;
        flash = { kind: 'win', text: `${best.name} termine à ${best.main}` };
        break;
      }
    }
  }

  const round = Math.min(rot.round, ROUNDS);
  return finishGeneric({
    match,
    modeId: 'bobs27',
    players,
    rot,
    finished,
    winnerIdx,
    flash,
    target: round === ROUNDS ? 'BULL' : `D${round}`,
    hint: `Chaque double touché rapporte ${round === ROUNDS ? 50 : round * 2}, trois ratés le retirent`,
    mainLabel: 'Points',
    focus: round === ROUNDS ? [25] : [round],
    focusMult: 2,
    totalRounds: ROUNDS,
    headline: `Cible ${round} / ${ROUNDS} · ${round === ROUNDS ? 'bull' : `double ${round}`}`,
    lines: (p) => [{ label: 'Doubles', value: String(p.stat.doublesHit) }],
  });
}
