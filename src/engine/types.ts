/**
 * Types du moteur.
 *
 * Principe de conception, à garder en tête avant toute modification :
 * une partie n'est QUE la liste chronologique des fléchettes lancées
 * (`Match.darts`). Tout le reste — scores, tours, manches, bust, vainqueur,
 * statistiques — est **recalculé** depuis cette liste à chaque changement.
 * Conséquences : l'annulation est exacte par construction (on retire la
 * dernière fléchette), aucun état ne peut dériver, et une partie se rejoue
 * ou se répare toujours.
 */
import { Dart } from './darts';

export type ModeId =
  | 'x01'
  | 'cricket'
  | 'atc'
  | 'shanghai'
  | 'countup'
  | 'halveit'
  | 'golf'
  | 'bobs27'
  | 'killer'
  | 'baseball';

/** Joueur du carnet, persistant d'une partie à l'autre. */
export type Player = {
  id: string;
  name: string;
  color: string;
  createdAt: number;
};

/** Joueur figé dans une partie (le carnet peut changer après). */
export type MatchPlayer = {
  id: string;
  name: string;
  color: string;
};

export type OptionValue = number | string | boolean;
export type Options = Record<string, OptionValue>;

export type Match = {
  id: string;
  modeId: ModeId;
  /** Identifiant du préréglage choisi sur l'accueil (« 501 », « cricket-cut »…). */
  presetId: string;
  /** Titre lisible : « 501 · sortie double ». */
  title: string;
  players: MatchPlayer[];
  options: Options;
  darts: Dart[];
  startedAt: number;
  finishedAt?: number;
  /** Résultat figé à la fin, pour l'historique et les statistiques. */
  result?: MatchResult;
};

export type MatchResult = {
  winnerIds: string[];
  ranking: { playerId: string; name: string; rank: number; score: string }[];
  stats: Record<string, PlayerMatchStats>;
};

/** Statistiques accumulées pendant une partie, pour un joueur. */
export type StatAcc = {
  darts: number;
  scored: number;
  /** Score de chaque volée terminée. */
  turnScores: number[];
  first9Darts: number;
  first9Scored: number;
  highTurn: number;
  c180: number;
  c140: number;
  c100: number;
  c60: number;
  doublesHit: number;
  triplesHit: number;
  bullsHit: number;
  misses: number;
  /** X01 : fléchettes de la meilleure manche gagnée. */
  bestLegDarts: number | null;
  legsWon: number;
  /** Tentatives de sortie (fléchette lancée sur un reste finissable d'un coup). */
  checkoutTries: number;
  checkoutHits: number;
  /** Plus haute finition réussie. */
  highFinish: number;
};

export type PlayerMatchStats = {
  darts: number;
  scored: number;
  avg3: number | null;
  avgFirst9: number | null;
  highTurn: number;
  c180: number;
  c140: number;
  c100: number;
  doublesHit: number;
  triplesHit: number;
  bullsHit: number;
  legsWon: number;
  bestLegDarts: number | null;
  checkoutPct: number | null;
  highFinish: number;
};

/** Une volée terminée, pour l'historique visible pendant la partie. */
export type TurnLog = {
  playerIdx: number;
  round: number;
  darts: Dart[];
  scored: number;
  bust?: boolean;
  note?: string;
};

/** Message éphémère affiché après le dernier événement notable. */
export type Flash = {
  kind: 'bust' | 'win' | 'leg' | 'out' | 'info' | 'big';
  text: string;
};

export type ScoreLine = { label: string; value: string };

export type BaseP = {
  idx: number;
  id: string;
  name: string;
  color: string;
  /** Éliminé (Killer, Bob's 27 en mode dur). */
  out: boolean;
  /** A terminé son parcours (Horloge, Golf…). */
  done: boolean;
  rank: number | null;
  stat: StatAcc;
};

export type BaseState = {
  modeId: ModeId;
  title: string;
  /** Index du joueur au lancer. */
  turnIdx: number;
  /** Fléchettes déjà lancées dans la volée en cours (0..3). */
  dartsInTurn: number;
  turnDarts: Dart[];
  /** Tour de table, 1-based. */
  round: number;
  /** Nombre total de tours quand le mode est borné (Shanghai, Golf…). */
  totalRounds: number | null;
  turns: TurnLog[];
  finished: boolean;
  winnerIdx: number | null;
  /** Classement final, indices de joueurs du 1er au dernier. */
  order: number[];
  flash: Flash | null;
  /** Cible courante affichée au-dessus de la saisie (« D12 », « Tour 7 »). */
  target: string | null;
  /** Rappel de règle contextuel, une ligne. */
  hint: string | null;
  /** Chemin de sortie conseillé (X01). */
  checkout: string[] | null;
  /**
   * Secteurs mis en avant sur la saisie (vide ou absent = tout compte).
   * C'est ce qui permet au pavé et à la cible de n'éclairer que l'utile.
   */
  focus?: number[];
  /** Multiplicateur attendu, quand le mode l'impose (Bob's 27, horloge double). */
  focusMult?: 1 | 2 | 3;
  /** Saisie par total de volée autorisée ? */
  allowTotal: boolean;
  headline: string;
};

/** X01 : 501, 301, 701… */
export type X01P = BaseP & {
  score: number;
  legs: number;
  sets: number;
  /** Ouvert au score (pertinent seulement en entrée double). */
  open: boolean;
  dartsInLeg: number;
  turnStartScore: number;
  lastTurn: number | null;
};

export type X01State = BaseState & {
  kind: 'x01';
  players: X01P[];
  start: number;
  outRule: 'double' | 'straight' | 'master';
  doubleIn: boolean;
  leg: number;
  set: number;
  legsToWin: number;
  setsToWin: number;
};

export type CricketP = BaseP & {
  /** Marques par cible : 0 à 3. */
  marks: Record<number, number>;
  points: number;
  closedAll: boolean;
  /** Total de marques réussies : sert à la moyenne de marques par volée. */
  marksTotal: number;
};

export type CricketState = BaseState & {
  kind: 'cricket';
  players: CricketP[];
  targets: number[];
  scoring: 'points' | 'cutthroat' | 'noscore';
};

/** Tous les autres modes partagent une même forme d'affichage. */
export type GenericP = BaseP & {
  /** Valeur principale affichée. */
  main: number;
  /** Texte de la valeur principale quand elle n'est pas un simple nombre. */
  mainText?: string;
  lines: ScoreLine[];
  /** Cible personnelle (Horloge, Killer). */
  ownTarget: number | null;
};

export type GenericState = BaseState & {
  kind: 'generic';
  players: GenericP[];
  /** Vrai si le meilleur score est le plus bas (Golf). */
  lowestWins: boolean;
  mainLabel: string;
};

export type AnyState = X01State | CricketState | GenericState;
