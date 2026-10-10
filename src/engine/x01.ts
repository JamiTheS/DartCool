/**
 * X01 — 501, 301, 201, 701, 1001.
 * Entrée simple ou double, sortie simple / double / maître, manches et sets,
 * gestion du bust, conseils de sortie, statistiques de volée.
 */
import { checkout, isOneDartOut, OutRule } from './checkout';
import { Dart, isDouble, isTriple, value } from './darts';
import { countDart, countTurn, newStat } from './stats';
import { Flash, Match, TurnLog, X01P, X01State } from './types';

const num = (v: unknown, d: number): number => (typeof v === 'number' ? v : d);

export function runX01(match: Match): X01State {
  const n = match.players.length;
  const start = num(match.options.start, 501);
  const outRule = (typeof match.options.outRule === 'string' ? match.options.outRule : 'double') as OutRule;
  const doubleIn = match.options.doubleIn === true;
  const legsToWin = num(match.options.legs, 1);
  const setsToWin = num(match.options.sets, 1);

  const players: X01P[] = match.players.map((p, idx) => ({
    idx,
    id: p.id,
    name: p.name,
    color: p.color,
    out: false,
    done: false,
    rank: null,
    stat: newStat(),
    score: start,
    legs: 0,
    sets: 0,
    open: !doubleIn,
    dartsInLeg: 0,
    turnStartScore: start,
    lastTurn: null,
  }));

  let leg = 1;
  let set = 1;
  let legStarter = 0;
  let turnIdx = legStarter;
  let turnsPlayedInLeg = 0;
  let dartsInTurn = 0;
  let turnDarts: Dart[] = [];
  let turnScored = 0;
  let turnStartRemaining = start;
  const turns: TurnLog[] = [];
  let finished = false;
  let winnerIdx: number | null = null;
  let flash: Flash | null = null;

  const closeTurn = (bust: boolean, note?: string) => {
    if (turnDarts.length > 0) {
      turns.push({
        playerIdx: turnIdx,
        round: Math.floor(turnsPlayedInLeg / n) + 1,
        darts: turnDarts,
        scored: bust ? 0 : turnScored,
        bust: bust || undefined,
        note,
      });
      countTurn(players[turnIdx].stat, bust ? 0 : turnScored);
      players[turnIdx].lastTurn = bust ? 0 : turnScored;
    }
    turnsPlayedInLeg += 1;
    turnIdx = (turnIdx + 1) % n;
    dartsInTurn = 0;
    turnDarts = [];
    turnScored = 0;
    turnStartRemaining = players[turnIdx].score;
    players[turnIdx].turnStartScore = players[turnIdx].score;
  };

  const startLeg = () => {
    leg += 1;
    legStarter = (legStarter + 1) % n;
    turnIdx = legStarter;
    turnsPlayedInLeg = 0;
    dartsInTurn = 0;
    turnDarts = [];
    turnScored = 0;
    for (const p of players) {
      p.score = start;
      p.open = !doubleIn;
      p.dartsInLeg = 0;
      p.turnStartScore = start;
      p.lastTurn = null;
    }
    turnStartRemaining = start;
  };

  const winLeg = (p: X01P) => {
    p.legs += 1;
    p.stat.legsWon += 1;
    p.stat.checkoutHits += 1;
    if (p.stat.bestLegDarts === null || p.dartsInLeg < p.stat.bestLegDarts) {
      p.stat.bestLegDarts = p.dartsInLeg;
    }
    if (turnStartRemaining > p.stat.highFinish) p.stat.highFinish = turnStartRemaining;

    if (p.legs >= legsToWin) {
      if (setsToWin > 1) {
        p.sets += 1;
        if (p.sets >= setsToWin) {
          finished = true;
          winnerIdx = p.idx;
          flash = { kind: 'win', text: `${p.name} remporte la partie` };
          return;
        }
        set += 1;
        for (const q of players) q.legs = 0;
        leg = 0; // startLeg l'incrémente à 1
        flash = { kind: 'leg', text: `${p.name} prend le set ${set - 1}` };
        startLeg();
        return;
      }
      finished = true;
      winnerIdx = p.idx;
      flash = { kind: 'win', text: `${p.name} remporte la partie` };
      return;
    }
    flash = { kind: 'leg', text: `${p.name} gagne la manche ${leg}` };
    startLeg();
  };

  for (const d of match.darts) {
    if (finished) break;
    const p = players[turnIdx];
    if (dartsInTurn === 0) {
      turnStartRemaining = p.score;
      p.turnStartScore = p.score;
    }
    flash = null;

    // Saisie rapide : total de la volée. Elle ne vaut qu'en début de volée :
    // l'interface l'interdit ailleurs, le moteur l'ignore par sécurité.
    if (d.turnTotal) {
      if (dartsInTurn > 0) continue;
      const v = value(d);
      const rest = p.score - v;
      turnDarts = [d];
      p.dartsInLeg += 3;
      if (rest < 0 || (outRule === 'double' && rest === 1)) {
        countDart(p.stat, d, 0);
        p.score = p.turnStartScore;
        flash = { kind: 'bust', text: 'BUST' };
        closeTurn(true);
      } else {
        countDart(p.stat, d, v);
        p.score = rest;
        p.open = true;
        turnScored = v;
        if (rest === 0) {
          p.stat.checkoutTries += 1;
          closeTurnForWin(d);
          winLeg(p);
          continue;
        }
        closeTurn(false);
      }
      continue;
    }

    const v = value(d);
    turnDarts = [...turnDarts, d];
    dartsInTurn += 1;
    p.dartsInLeg += 1;

    // Entrée double : rien ne compte avant le premier double.
    if (!p.open) {
      if (isDouble(d)) {
        p.open = true;
      } else {
        countDart(p.stat, d, 0);
        if (dartsInTurn >= 3) closeTurn(false);
        continue;
      }
    }

    const wasOneDartOut = isOneDartOut(p.score, outRule);
    if (wasOneDartOut) p.stat.checkoutTries += 1;

    const rest = p.score - v;
    const legalFinish =
      rest === 0 &&
      (outRule === 'straight' ||
        (outRule === 'master' ? isDouble(d) || isTriple(d) : isDouble(d)));

    if (rest < 0 || (rest === 0 && !legalFinish) || (outRule === 'double' && rest === 1)) {
      countDart(p.stat, d, 0);
      p.score = p.turnStartScore;
      flash = { kind: 'bust', text: 'BUST' };
      closeTurn(true);
      continue;
    }

    countDart(p.stat, d, v);
    turnScored += v;
    p.score = rest;

    if (legalFinish) {
      if (!wasOneDartOut) p.stat.checkoutTries += 1;
      closeTurnForWin(d);
      winLeg(p);
      continue;
    }

    if (dartsInTurn >= 3) closeTurn(false);
  }

  /** Enregistre la volée gagnante avant de basculer la manche. */
  function closeTurnForWin(_d: Dart) {
    turns.push({
      playerIdx: turnIdx,
      round: Math.floor(turnsPlayedInLeg / n) + 1,
      darts: turnDarts,
      scored: turnScored,
      note: 'sortie',
    });
    countTurn(players[turnIdx].stat, turnScored);
    players[turnIdx].lastTurn = turnScored;
    turnsPlayedInLeg += 1;
    dartsInTurn = 0;
    turnDarts = [];
    turnScored = 0;
  }

  const cur = players[turnIdx];
  const dartsLeft = 3 - dartsInTurn;
  const co =
    !finished && cur.open ? checkout(cur.score, dartsLeft, outRule) : null;

  // Classement : vainqueur en tête, puis sets / manches / reste le plus bas.
  const order = [...players]
    .sort((a, b) => {
      if (b.sets !== a.sets) return b.sets - a.sets;
      if (b.legs !== a.legs) return b.legs - a.legs;
      return a.score - b.score;
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

  const headline =
    setsToWin > 1
      ? `Set ${set} · Manche ${leg} · ${legsToWin} manche${legsToWin > 1 ? 's' : ''} par set`
      : legsToWin > 1
        ? `Manche ${leg} · au meilleur des ${legsToWin * 2 - 1}`
        : 'Partie sèche';

  return {
    kind: 'x01',
    modeId: 'x01',
    title: match.title,
    players,
    start,
    outRule,
    doubleIn,
    leg,
    set,
    legsToWin,
    setsToWin,
    turnIdx,
    dartsInTurn,
    turnDarts,
    round: Math.floor(turnsPlayedInLeg / n) + 1,
    totalRounds: null,
    turns,
    finished,
    winnerIdx,
    order,
    flash,
    target: null,
    hint: !cur.open ? 'Entrée double : un double pour ouvrir le score' : null,
    checkout: co,
    allowTotal: true,
    headline,
  };
}
