/**
 * Catalogue des modes de jeu : réglages, règles, préréglages d'accueil.
 * Le contenu est ici, jamais dans les composants.
 */
import { ModeId, Options, OptionValue } from '../engine/types';

export type OptionDef =
  | {
      kind: 'choice';
      key: string;
      label: string;
      hint?: string;
      choices: { value: OptionValue; label: string }[];
    }
  | { kind: 'toggle'; key: string; label: string; hint?: string }
  | {
      kind: 'stepper';
      key: string;
      label: string;
      hint?: string;
      min: number;
      max: number;
      step: number;
      suffix?: string;
    };

export type ModeDef = {
  id: ModeId;
  name: string;
  tagline: string;
  /** Règles complètes, un paragraphe par entrée. */
  rules: string[];
  minPlayers: number;
  maxPlayers: number;
  /** Mode qui a du sens en solo (entraînement). */
  solo: boolean;
  defaults: Options;
  options: OptionDef[];
};

export const MODES: Record<ModeId, ModeDef> = {
  x01: {
    id: 'x01',
    name: 'X01',
    tagline: 'Descendre à zéro, pile.',
    rules: [
      'Chaque joueur part du même score (501, 301, 701…) et retire le total de ses trois fléchettes à chaque volée.',
      'Il faut tomber sur zéro exactement. En sortie double, la dernière fléchette doit être un double (le bull à 50 compte comme un double).',
      'Si une volée fait passer sous zéro, ou laisse 1 en sortie double, c’est un bust : le score revient à sa valeur du début de volée et la main passe.',
      'En entrée double, rien ne compte avant d’avoir touché un premier double.',
      'DartCool affiche en direct la meilleure sortie possible et prévient quand le reste n’est pas finissable.',
    ],
    minPlayers: 1,
    maxPlayers: 8,
    solo: true,
    defaults: { start: 501, outRule: 'double', doubleIn: false, legs: 1, sets: 1 },
    options: [
      {
        kind: 'choice',
        key: 'start',
        label: 'Score de départ',
        choices: [
          { value: 201, label: '201' },
          { value: 301, label: '301' },
          { value: 501, label: '501' },
          { value: 701, label: '701' },
          { value: 1001, label: '1001' },
        ],
      },
      {
        kind: 'choice',
        key: 'outRule',
        label: 'Sortie',
        hint: 'Comment terminer la manche',
        choices: [
          { value: 'double', label: 'Double' },
          { value: 'straight', label: 'Simple' },
          { value: 'master', label: 'Maître' },
        ],
      },
      { kind: 'toggle', key: 'doubleIn', label: 'Entrée double', hint: 'Un double pour ouvrir le score' },
      { kind: 'stepper', key: 'legs', label: 'Manches à gagner', min: 1, max: 9, step: 1 },
      { kind: 'stepper', key: 'sets', label: 'Sets à gagner', min: 1, max: 7, step: 1, hint: '1 = pas de sets' },
    ],
  },

  cricket: {
    id: 'cricket',
    name: 'Cricket',
    tagline: 'Fermer 15 à 20 et le bull.',
    rules: [
      'Les cibles sont 20, 19, 18, 17, 16, 15 et le centre. Il faut trois marques pour fermer une cible : un simple vaut 1 marque, un double 2, un triple 3 ; le 25 vaut 1 marque et le bull 2.',
      'Une fois une cible fermée, chaque marque supplémentaire rapporte sa valeur en points, tant qu’au moins un adversaire ne l’a pas fermée.',
      'Quand tout le monde a fermé une cible, elle est morte : elle ne rapporte plus rien.',
      'La partie est gagnée par le joueur qui a fermé toutes les cibles avec le plus de points.',
      'En Cut-Throat, les points partent chez les adversaires qui n’ont pas fermé la cible : c’est le score le plus bas qui gagne.',
    ],
    minPlayers: 1,
    maxPlayers: 6,
    solo: true,
    defaults: { scoring: 'points' },
    options: [
      {
        kind: 'choice',
        key: 'scoring',
        label: 'Comptage',
        choices: [
          { value: 'points', label: 'Points' },
          { value: 'cutthroat', label: 'Cut-Throat' },
          { value: 'noscore', label: 'Sans points' },
        ],
      },
    ],
  },

  atc: {
    id: 'atc',
    name: 'Tour de cadran',
    tagline: 'Du 1 au 20 dans l’ordre.',
    rules: [
      'Il faut toucher les numéros dans l’ordre, du 1 au 20, trois fléchettes par volée.',
      'Chaque cible touchée fait avancer d’un cran : on peut enchaîner plusieurs cibles dans la même volée.',
      'Avec l’option bull, il reste le centre à toucher pour conclure.',
      'En mode double ou triple, seuls les doubles (ou les triples) font avancer : excellent entraînement.',
      'Le premier à finir gagne ; le nombre de fléchettes utilisées sert de référence pour s’améliorer.',
    ],
    minPlayers: 1,
    maxPlayers: 8,
    solo: true,
    defaults: { ring: 'any', bull: true },
    options: [
      {
        kind: 'choice',
        key: 'ring',
        label: 'Zone qui compte',
        choices: [
          { value: 'any', label: 'Tout' },
          { value: 'double', label: 'Doubles' },
          { value: 'triple', label: 'Triples' },
        ],
      },
      { kind: 'toggle', key: 'bull', label: 'Finir sur le bull' },
    ],
  },

  shanghai: {
    id: 'shanghai',
    name: 'Shanghai',
    tagline: 'Une cible par tour.',
    rules: [
      'Au tour 1 on ne marque que sur le 1, au tour 2 sur le 2, et ainsi de suite.',
      'Les points sont ceux de la zone touchée : un triple 7 au tour 7 rapporte 21.',
      'Réussir simple + double + triple de la cible dans la même volée, c’est un Shanghai : victoire immédiate.',
      'Sans Shanghai, le meilleur total à la fin du dernier tour gagne.',
    ],
    minPlayers: 1,
    maxPlayers: 8,
    solo: true,
    defaults: { rounds: 7, shanghaiWin: true },
    options: [
      {
        kind: 'choice',
        key: 'rounds',
        label: 'Nombre de tours',
        choices: [
          { value: 7, label: '7 tours' },
          { value: 10, label: '10 tours' },
          { value: 20, label: '20 tours' },
        ],
      },
      { kind: 'toggle', key: 'shanghaiWin', label: 'Victoire au Shanghai' },
    ],
  },

  countup: {
    id: 'countup',
    name: 'Score Max',
    tagline: 'Tout compte. Le plus gros total gagne.',
    rules: [
      'Aucune contrainte de cible : chaque fléchette marque sa valeur.',
      'La partie dure un nombre de volées fixé à l’avance, identique pour tout le monde.',
      'Idéal pour s’échauffer, pour jouer à beaucoup, ou pour mesurer sa moyenne à trois fléchettes.',
      'La saisie par total de volée est disponible : trois chiffres et c’est au suivant.',
    ],
    minPlayers: 1,
    maxPlayers: 8,
    solo: true,
    defaults: { rounds: 8 },
    options: [
      {
        kind: 'choice',
        key: 'rounds',
        label: 'Volées',
        choices: [
          { value: 5, label: '5' },
          { value: 8, label: '8' },
          { value: 10, label: '10' },
          { value: 15, label: '15' },
        ],
      },
    ],
  },

  halveit: {
    id: 'halveit',
    name: 'Halve It',
    tagline: 'Rate la cible, score coupé en deux.',
    rules: [
      'Une cible imposée par tour, annoncée pour tout le monde : un numéro, « un double », « un triple » ou le bull.',
      'Les fléchettes qui touchent la cible ajoutent leur valeur, multiplicateur compris.',
      'Une volée entièrement hors cible coupe le score en deux, arrondi à l’inférieur. C’est là que tout se joue.',
      'Le meilleur total après la dernière cible gagne.',
    ],
    minPlayers: 1,
    maxPlayers: 8,
    solo: true,
    defaults: { seq: 'classic', start: 40 },
    options: [
      {
        kind: 'choice',
        key: 'seq',
        label: 'Séquence',
        choices: [
          { value: 'classic', label: 'Classique (9)' },
          { value: 'court', label: 'Courte (5)' },
          { value: 'nombres', label: 'Nombres (7)' },
        ],
      },
      { kind: 'stepper', key: 'start', label: 'Score de départ', min: 0, max: 100, step: 20 },
    ],
  },

  golf: {
    id: 'golf',
    name: 'Golf',
    tagline: '9 ou 18 trous, le moins de coups.',
    rules: [
      'Le numéro du trou est le numéro visé : trou 1 sur le 1, trou 2 sur le 2, etc.',
      'Trois fléchettes par trou. Le meilleur impact compte : triple = 1 coup, double = 2, simple = 3, rien = 5.',
      'Le par est de 3 par trou ; l’écart au par est affiché en direct.',
      'Le total le plus bas à la fin du parcours gagne.',
    ],
    minPlayers: 1,
    maxPlayers: 6,
    solo: true,
    defaults: { holes: 9 },
    options: [
      {
        kind: 'choice',
        key: 'holes',
        label: 'Parcours',
        choices: [
          { value: 9, label: '9 trous' },
          { value: 18, label: '18 trous' },
        ],
      },
    ],
  },

  bobs27: {
    id: 'bobs27',
    name: "Bob's 27",
    tagline: 'Les 20 doubles, puis le bull.',
    rules: [
      'On part de 27 points. Au tour 1 la cible est le double 1, au tour 2 le double 2… jusqu’au double 20, puis le bull.',
      'Chaque double touché rapporte sa valeur (le double 6 vaut 12). Le bull vaut 50.',
      'Trois fléchettes hors cible et la valeur de la cible est retirée du score.',
      'Score négatif, c’est terminé pour le joueur. Le meilleur total au bout des 21 cibles gagne.',
      'Inventé par Bob Anderson : le meilleur exercice de doubles qui existe, et le plus vexant.',
    ],
    minPlayers: 1,
    maxPlayers: 6,
    solo: true,
    defaults: { hard: false },
    options: [{ kind: 'toggle', key: 'hard', label: 'Mode dur', hint: 'Éliminé dès zéro' }],
  },

  killer: {
    id: 'killer',
    name: 'Killer',
    tagline: 'Chacun son numéro, dernier debout.',
    rules: [
      'Chaque joueur reçoit un numéro (tiré au sort ou choisi au départ) et un stock de vies.',
      'Première étape : toucher son propre numéro pour devenir tueur.',
      'Ensuite, chaque impact sur le numéro d’un adversaire lui retire des vies : une par simple, deux par double, trois par triple.',
      'À zéro vie, le joueur est éliminé. Le dernier debout gagne.',
      'En mode classique, seuls les doubles comptent — pour devenir tueur comme pour tuer — et un impact retire une seule vie.',
    ],
    minPlayers: 2,
    maxPlayers: 8,
    solo: false,
    defaults: { lives: 3, strict: false, numbers: '' },
    options: [
      { kind: 'stepper', key: 'lives', label: 'Vies', min: 1, max: 9, step: 1 },
      { kind: 'toggle', key: 'strict', label: 'Mode classique', hint: 'Doubles uniquement' },
    ],
  },

  baseball: {
    id: 'baseball',
    name: 'Baseball',
    tagline: 'Neuf manches, neuf numéros.',
    rules: [
      'La manche 1 se joue sur le 1, la manche 2 sur le 2, jusqu’à la neuvième.',
      'Un simple rapporte 1 point, un double 2, un triple 3. Le reste de la cible ne compte pas.',
      'Le plus grand total après la dernière manche gagne.',
      'En cas d’égalité, des manches supplémentaires sont jouées (jusqu’à trois).',
    ],
    minPlayers: 1,
    maxPlayers: 8,
    solo: true,
    defaults: { innings: 9, extra: true },
    options: [
      {
        kind: 'choice',
        key: 'innings',
        label: 'Manches',
        choices: [
          { value: 5, label: '5' },
          { value: 7, label: '7' },
          { value: 9, label: '9' },
        ],
      },
      { kind: 'toggle', key: 'extra', label: 'Manches supplémentaires' },
    ],
  },
};

export type Preset = {
  id: string;
  modeId: ModeId;
  name: string;
  sub: string;
  /** Glyphe affiché sur la tuile : chiffres ou deux lettres. */
  glyph: string;
  options: Options;
  /** Mise en avant sur l'accueil. */
  featured?: boolean;
};

export const PRESETS: Preset[] = [
  {
    id: '501',
    modeId: 'x01',
    name: '501',
    sub: 'Sortie double',
    glyph: '501',
    options: { start: 501, outRule: 'double', doubleIn: false, legs: 1, sets: 1 },
    featured: true,
  },
  {
    id: '301',
    modeId: 'x01',
    name: '301',
    sub: 'Format court',
    glyph: '301',
    options: { start: 301, outRule: 'double', doubleIn: false, legs: 1, sets: 1 },
    featured: true,
  },
  {
    id: '701',
    modeId: 'x01',
    name: '701',
    sub: 'Format long',
    glyph: '701',
    options: { start: 701, outRule: 'double', doubleIn: false, legs: 1, sets: 1 },
  },
  {
    id: 'cricket',
    modeId: 'cricket',
    name: 'Cricket',
    sub: '15 → 20 + bull',
    glyph: 'CR',
    options: { scoring: 'points' },
    featured: true,
  },
  {
    id: 'cricket-cut',
    modeId: 'cricket',
    name: 'Cut-Throat',
    sub: 'Le plus bas gagne',
    glyph: 'CT',
    options: { scoring: 'cutthroat' },
  },
  {
    id: 'atc',
    modeId: 'atc',
    name: 'Tour de cadran',
    sub: '1 → 20 + bull',
    glyph: '20',
    options: { ring: 'any', bull: true },
  },
  {
    id: 'shanghai',
    modeId: 'shanghai',
    name: 'Shanghai',
    sub: '7 tours',
    glyph: 'SH',
    options: { rounds: 7, shanghaiWin: true },
  },
  {
    id: 'countup',
    modeId: 'countup',
    name: 'Score Max',
    sub: '8 volées',
    glyph: 'MX',
    options: { rounds: 8 },
  },
  {
    id: 'halveit',
    modeId: 'halveit',
    name: 'Halve It',
    sub: '9 cibles',
    glyph: '½',
    options: { seq: 'classic', start: 40 },
  },
  {
    id: 'golf',
    modeId: 'golf',
    name: 'Golf',
    sub: '9 trous',
    glyph: 'GF',
    options: { holes: 9 },
  },
  {
    id: 'bobs27',
    modeId: 'bobs27',
    name: "Bob's 27",
    sub: 'Doubles',
    glyph: '27',
    options: { hard: false },
  },
  {
    id: 'killer',
    modeId: 'killer',
    name: 'Killer',
    sub: '3 vies',
    glyph: 'KL',
    options: { lives: 3, strict: false, numbers: '' },
  },
  {
    id: 'baseball',
    modeId: 'baseball',
    name: 'Baseball',
    sub: '9 manches',
    glyph: 'BB',
    options: { innings: 9, extra: true },
  },
];

export function presetById(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}

/** Titre lisible d'une partie, affiché partout. */
export function matchTitle(modeId: ModeId, options: Options): string {
  const mode = MODES[modeId];
  switch (modeId) {
    case 'x01': {
      const start = options.start ?? 501;
      const out =
        options.outRule === 'straight'
          ? 'sortie simple'
          : options.outRule === 'master'
            ? 'sortie maître'
            : 'sortie double';
      const inRule = options.doubleIn === true ? ' · entrée double' : '';
      const legs = typeof options.legs === 'number' && options.legs > 1 ? ` · ${options.legs} manches` : '';
      const sets = typeof options.sets === 'number' && options.sets > 1 ? ` · ${options.sets} sets` : '';
      return `${start} · ${out}${inRule}${legs}${sets}`;
    }
    case 'cricket':
      return options.scoring === 'cutthroat'
        ? 'Cricket · Cut-Throat'
        : options.scoring === 'noscore'
          ? 'Cricket · sans points'
          : 'Cricket';
    case 'atc':
      return `Tour de cadran${options.ring === 'double' ? ' · doubles' : options.ring === 'triple' ? ' · triples' : ''}`;
    case 'shanghai':
      return `Shanghai · ${options.rounds ?? 7} tours`;
    case 'countup':
      return `Score Max · ${options.rounds ?? 8} volées`;
    case 'halveit':
      return 'Halve It';
    case 'golf':
      return `Golf · ${options.holes ?? 9} trous`;
    case 'bobs27':
      return options.hard === true ? "Bob's 27 · mode dur" : "Bob's 27";
    case 'killer':
      return `Killer · ${options.lives ?? 3} vies`;
    case 'baseball':
      return `Baseball · ${options.innings ?? 9} manches`;
    default:
      return mode.name;
  }
}
