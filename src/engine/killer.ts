/**
 * Killer — chacun son numéro, on devient tueur, puis on prend les vies des autres.
 * Deux réglages : « convivial » (tout impact compte) et « classique »
 * (seuls les doubles comptent, un impact = une vie).
 */
import { isDouble } from './darts';
import { everyoneDone, finishGeneric, initPlayers, opt, optB, optS, Rotation } from './generic';
import { countDart } from './stats';
import { Flash, GenericState, Match } from './types';

/** Numéros par défaut si le réglage n'en fournit pas. */
const FALLBACK = [20, 19, 18, 17, 16, 15, 14, 13];

export function parseNumbers(raw: string, count: number): number[] {
  const parsed = raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 20);
  const out: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const candidate = parsed[i];
    out.push(candidate && !out.includes(candidate) ? candidate : 0);
  }
  // Comble les trous avec des numéros encore libres.
  for (let i = 0; i < count; i += 1) {
    if (out[i] !== 0) continue;
    const free = FALLBACK.find((n) => !out.includes(n)) ?? 20;
    out[i] = free;
  }
  return out;
}

export function runKiller(match: Match): GenericState {
  const lives = opt(match, 'lives', 3);
  const strict = optB(match, 'strict', false);
  const numbers = parseNumbers(optS(match, 'numbers', ''), match.players.length);

  const players = initPlayers(match, lives);
  players.forEach((p, i) => {
    p.ownTarget = numbers[i];
  });
  const killers = players.map(() => false);
  const elimSeq = players.map(() => 0);
  let elimCount = 0;

  const rot = new Rotation(players);
  let finished = false;
  let winnerIdx: number | null = null;
  let flash: Flash | null = null;

  for (const d of match.darts) {
    if (finished) break;
    flash = null;
    const p = rot.current;
    let gained = 0;

    if (!d.turnTotal && d.seg >= 1 && d.seg <= 20) {
      const counts = strict ? isDouble(d) : true;
      const hitOwn = d.seg === p.ownTarget;
      if (counts && hitOwn && !killers[p.idx]) {
        killers[p.idx] = true;
        flash = { kind: 'big', text: `${p.name} devient tueur` };
      } else if (counts && killers[p.idx] && !hitOwn) {
        const victim = players.find((q) => q.ownTarget === d.seg && !q.out);
        if (victim) {
          const take = strict ? 1 : d.mult;
          victim.main = Math.max(0, victim.main - take);
          gained = take;
          flash = { kind: 'info', text: `−${take} vie${take > 1 ? 's' : ''} pour ${victim.name}` };
          if (victim.main === 0) {
            victim.out = true;
            elimCount += 1;
            elimSeq[victim.idx] = elimCount;
            flash = { kind: 'out', text: `${victim.name} est éliminé` };
          }
        }
      }
    }

    rot.add(d, gained);
    countDart(p.stat, d, gained);

    const alive = players.filter((q) => !q.out);
    if (alive.length <= 1 && players.length > 1) {
      finished = true;
      winnerIdx = alive[0]?.idx ?? p.idx;
      flash = { kind: 'win', text: `${players[winnerIdx].name} reste seul debout` };
      rot.close('fin');
      break;
    }

    if (rot.dartsInTurn >= 3) {
      rot.close();
      if (everyoneDone(players)) finished = true;
    }
  }

  const cur = rot.current;
  const amKiller = killers[cur.idx];
  return finishGeneric({
    match,
    modeId: 'killer',
    players,
    rot,
    finished,
    winnerIdx,
    flash,
    target: amKiller ? 'Les autres' : cur.ownTarget === null ? '—' : strict ? `D${cur.ownTarget}` : String(cur.ownTarget),
    hint: amKiller
      ? 'Tueur : touche le numéro des autres pour leur retirer des vies'
      : `Touche ${strict ? 'le double de ' : ''}ton numéro pour devenir tueur`,
    mainLabel: 'Vies',
    focus: players.filter((q) => !q.out && q.ownTarget !== null).map((q) => q.ownTarget as number),
    focusMult: strict ? 2 : undefined,
    totalRounds: null,
    headline: `Tour ${rot.round} · ${lives} vies`,
    tieBreak: (p) => elimSeq[p.idx],
    lines: (p) => [
      { label: 'Numéro', value: p.ownTarget === null ? '—' : String(p.ownTarget) },
      { label: 'Statut', value: p.out ? 'Éliminé' : killers[p.idx] ? 'Tueur' : 'En chasse' },
    ],
  });
}
