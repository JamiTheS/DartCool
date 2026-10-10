/**
 * Cricket — 15 à 20 plus le centre.
 * Trois marques ferment une cible ; ensuite chaque marque supplémentaire
 * rapporte des points tant qu'un adversaire n'a pas fermé la même cible.
 * Variantes : points classiques, Cut-Throat (les points vont aux adversaires,
 * le plus bas gagne) et sans points (premier à tout fermer).
 */
import { Dart, marks as markCount } from './darts';
import { countDart, countTurn, newStat } from './stats';
import { CricketP, CricketState, Flash, Match, TurnLog } from './types';

export const CRICKET_TARGETS = [20, 19, 18, 17, 16, 15, 25];

export function runCricket(match: Match): CricketState {
  const n = match.players.length;
  const scoring = (typeof match.options.scoring === 'string' ? match.options.scoring : 'points') as
    | 'points'
    | 'cutthroat'
    | 'noscore';
  const targets = CRICKET_TARGETS;

  const players: CricketP[] = match.players.map((p, idx) => ({
    idx,
    id: p.id,
    name: p.name,
    color: p.color,
    out: false,
    done: false,
    rank: null,
    stat: newStat(),
    marks: Object.fromEntries(targets.map((t) => [t, 0])) as Record<number, number>,
    points: 0,
    closedAll: false,
    marksTotal: 0,
  }));

  let turnIdx = 0;
  let turnsPlayed = 0;
  let dartsInTurn = 0;
  let turnDarts: Dart[] = [];
  let turnScored = 0;
  const turns: TurnLog[] = [];
  let finished = false;
  let winnerIdx: number | null = null;
  let flash: Flash | null = null;

  const closedBy = (t: number, p: CricketP) => p.marks[t] >= 3;
  const allClosed = (p: CricketP) => targets.every((t) => closedBy(t, p));
  const deadNumber = (t: number) => players.every((p) => closedBy(t, p));

  const closeTurn = (note?: string) => {
    if (turnDarts.length > 0) {
      turns.push({
        playerIdx: turnIdx,
        round: Math.floor(turnsPlayed / n) + 1,
        darts: turnDarts,
        scored: turnScored,
        note,
      });
      countTurn(players[turnIdx].stat, turnScored);
    }
    turnsPlayed += 1;
    turnIdx = (turnIdx + 1) % n;
    dartsInTurn = 0;
    turnDarts = [];
    turnScored = 0;
  };

  const checkEnd = () => {
    for (const p of players) {
      p.closedAll = allClosed(p);
    }
    const others = (p: CricketP) => players.filter((q) => q.idx !== p.idx);
    for (const p of players) {
      if (!p.closedAll) continue;
      if (scoring === 'noscore') {
        finished = true;
        winnerIdx = p.idx;
      } else if (scoring === 'cutthroat') {
        if (others(p).every((q) => p.points <= q.points)) {
          finished = true;
          winnerIdx = p.idx;
        }
      } else if (others(p).every((q) => p.points >= q.points)) {
        finished = true;
        winnerIdx = p.idx;
      }
      if (finished) {
        flash = { kind: 'win', text: `${p.name} remporte la partie` };
        return;
      }
    }
    // Plus rien à marquer : toutes les cibles sont mortes.
    if (targets.every((t) => deadNumber(t))) {
      finished = true;
      const best = [...players].sort((a, b) =>
        scoring === 'cutthroat' ? a.points - b.points : b.points - a.points
      )[0];
      winnerIdx = best.idx;
      flash = { kind: 'win', text: `${best.name} remporte la partie` };
    }
  };

  for (const d of match.darts) {
    if (finished) break;
    flash = null;
    const p = players[turnIdx];
    turnDarts = [...turnDarts, d];
    dartsInTurn += 1;

    let gained = 0;
    let gainedMarks = 0;
    const t = d.seg;
    if (!d.turnTotal && targets.includes(t)) {
      const m = markCount(d);
      for (let i = 0; i < m; i += 1) {
        if (p.marks[t] < 3) {
          p.marks[t] += 1;
          gainedMarks += 1;
        } else if (!deadNumber(t)) {
          gainedMarks += 1;
          if (scoring === 'points') {
            p.points += t;
            gained += t;
          } else if (scoring === 'cutthroat') {
            for (const q of players) {
              if (q.idx !== p.idx && !closedBy(t, q)) q.points += t;
            }
            gained += t;
          }
        }
      }
    }
    p.marksTotal += gainedMarks;
    countDart(p.stat, d, gained);
    turnScored += gained;

    checkEnd();
    if (finished) {
      closeTurn('fin');
      break;
    }
    if (dartsInTurn >= 3) closeTurn();
  }

  const order = [...players]
    .sort((a, b) => {
      const ca = targets.filter((t) => closedBy(t, a)).length;
      const cb = targets.filter((t) => closedBy(t, b)).length;
      if (scoring === 'cutthroat') {
        if (a.points !== b.points) return a.points - b.points;
        return cb - ca;
      }
      if (b.points !== a.points) return b.points - a.points;
      return cb - ca;
    })
    .map((p) => p.idx);
  if (winnerIdx !== null) {
    const at = order.indexOf(winnerIdx);
    if (at > 0) {
      order.splice(at, 1);
      order.unshift(winnerIdx);
    }
  }
  order.forEach((idx, i) => {
    players[idx].rank = i + 1;
  });

  const cur = players[turnIdx];
  const openForMe = targets.filter((t) => cur.marks[t] < 3);
  const nextTarget = openForMe[0];

  return {
    kind: 'cricket',
    modeId: 'cricket',
    title: match.title,
    players,
    targets,
    scoring,
    turnIdx,
    dartsInTurn,
    turnDarts,
    round: Math.floor(turnsPlayed / n) + 1,
    totalRounds: null,
    turns,
    finished,
    winnerIdx,
    order,
    flash,
    target: nextTarget ? (nextTarget === 25 ? 'BULL' : String(nextTarget)) : 'Points',
    hint:
      scoring === 'cutthroat'
        ? 'Cut-Throat : les points vont aux adversaires, le plus bas gagne'
        : openForMe.length === 0
          ? 'Tout est fermé : marque des points sur les cibles ouvertes chez les autres'
          : null,
    checkout: null,
    focus: targets,
    allowTotal: false,
    headline: `Tour ${Math.floor(turnsPlayed / n) + 1}`,
  };
}
