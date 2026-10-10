/**
 * Ossature commune aux modes « simples » (tout sauf X01 et Cricket) :
 * initialisation des joueurs, rotation des volées, journal, classement.
 * Chaque mode garde sa propre boucle de règles : la duplication de quelques
 * lignes vaut mieux qu'une abstraction qui cacherait une règle de travers.
 */
import { Dart } from './darts';
import { countTurn, newStat } from './stats';
import { Flash, GenericP, GenericState, Match, ModeId, ScoreLine, TurnLog } from './types';

export const opt = (m: Match, key: string, d: number): number => {
  const v = m.options[key];
  return typeof v === 'number' ? v : d;
};
export const optS = (m: Match, key: string, d: string): string => {
  const v = m.options[key];
  return typeof v === 'string' ? v : d;
};
export const optB = (m: Match, key: string, d: boolean): boolean => {
  const v = m.options[key];
  return typeof v === 'boolean' ? v : d;
};

export function initPlayers(match: Match, main: number): GenericP[] {
  return match.players.map((p, idx) => ({
    idx,
    id: p.id,
    name: p.name,
    color: p.color,
    out: false,
    done: false,
    rank: null,
    stat: newStat(),
    main,
    lines: [],
    ownTarget: null,
  }));
}

/** Contexte de rotation partagé par les boucles de mode. */
export class Rotation {
  turnIdx = 0;
  turnsPlayed = 0;
  dartsInTurn = 0;
  turnDarts: Dart[] = [];
  turnScored = 0;
  turns: TurnLog[] = [];

  constructor(private readonly players: GenericP[]) {}

  get round(): number {
    return Math.floor(this.turnsPlayed / this.players.length) + 1;
  }

  get current(): GenericP {
    return this.players[this.turnIdx];
  }

  add(d: Dart, scored: number): void {
    this.turnDarts = [...this.turnDarts, d];
    this.dartsInTurn += 1;
    this.turnScored += scored;
  }

  /** Clôt la volée et passe au joueur suivant encore en jeu. */
  close(note?: string): void {
    if (this.turnDarts.length > 0) {
      this.turns.push({
        playerIdx: this.turnIdx,
        round: this.round,
        darts: this.turnDarts,
        scored: this.turnScored,
        note,
      });
      countTurn(this.players[this.turnIdx].stat, this.turnScored);
    }
    this.turnsPlayed += 1;
    this.dartsInTurn = 0;
    this.turnDarts = [];
    this.turnScored = 0;
    // Joueur suivant encore en jeu ; si personne, on reste sur place.
    const n = this.players.length;
    for (let step = 1; step <= n; step += 1) {
      const cand = (this.turnIdx + step) % n;
      if (!this.players[cand].out && !this.players[cand].done) {
        this.turnIdx = cand;
        return;
      }
    }
    this.turnIdx = (this.turnIdx + 1) % n;
  }
}

export type FinishArgs = {
  match: Match;
  modeId: ModeId;
  players: GenericP[];
  rot: Rotation;
  finished: boolean;
  winnerIdx: number | null;
  flash: Flash | null;
  target: string | null;
  hint?: string | null;
  mainLabel: string;
  lowestWins?: boolean;
  totalRounds: number | null;
  headline: string;
  allowTotal?: boolean;
  focus?: number[];
  focusMult?: 1 | 2 | 3;
  /** Critère de départage secondaire, plus grand = mieux classé. */
  tieBreak?: (p: GenericP) => number;
  lines?: (p: GenericP) => ScoreLine[];
};

export function finishGeneric(a: FinishArgs): GenericState {
  const { players, rot } = a;
  if (a.lines) {
    for (const p of players) p.lines = a.lines(p);
  }

  const score = (p: GenericP) => (a.lowestWins ? -p.main : p.main);
  const order = [...players]
    .sort((x, y) => {
      if (x.out !== y.out) return x.out ? 1 : -1;
      const s = score(y) - score(x);
      if (s !== 0) return s;
      const tb = (a.tieBreak?.(y) ?? 0) - (a.tieBreak?.(x) ?? 0);
      if (tb !== 0) return tb;
      return x.idx - y.idx;
    })
    .map((p) => p.idx);
  if (a.winnerIdx !== null) {
    const at = order.indexOf(a.winnerIdx);
    if (at > 0) {
      order.splice(at, 1);
      order.unshift(a.winnerIdx);
    }
  }
  order.forEach((idx, i) => {
    players[idx].rank = i + 1;
  });

  return {
    kind: 'generic',
    modeId: a.modeId,
    title: a.match.title,
    players,
    lowestWins: a.lowestWins === true,
    mainLabel: a.mainLabel,
    turnIdx: rot.turnIdx,
    dartsInTurn: rot.dartsInTurn,
    turnDarts: rot.turnDarts,
    round: rot.round,
    totalRounds: a.totalRounds,
    turns: rot.turns,
    finished: a.finished,
    winnerIdx: a.winnerIdx,
    order,
    flash: a.flash,
    target: a.target,
    hint: a.hint ?? null,
    checkout: null,
    focus: a.focus,
    focusMult: a.focusMult,
    allowTotal: a.allowTotal === true,
    headline: a.headline,
  };
}

/** Vrai quand tous les joueurs ont fini ou sont éliminés. */
export function everyoneDone(players: GenericP[]): boolean {
  return players.every((p) => p.done || p.out);
}
