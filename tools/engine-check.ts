/**
 * Vérification du moteur, sans dépendance de test : on rejoue des séquences de
 * fléchettes connues et on compare l'état obtenu à l'état attendu.
 *
 *   npm run check:engine
 *
 * Toute règle corrigée doit arriver avec son cas ici.
 */
import { checkout } from '../src/engine/checkout';
import { Dart, dart, MISS, totalDart } from '../src/engine/darts';
import { runMatch } from '../src/engine/index';
import { Match, ModeId, Options } from '../src/engine/types';

let pass = 0;
const fails: string[] = [];

function check(name: string, got: unknown, want: unknown): void {
  const a = JSON.stringify(got);
  const b = JSON.stringify(want);
  if (a === b) {
    pass += 1;
  } else {
    fails.push(`${name}\n    attendu : ${b}\n    obtenu  : ${a}`);
  }
}

function match(modeId: ModeId, options: Options, names: string[], darts: Dart[]): Match {
  return {
    id: 'test',
    modeId,
    presetId: 'test',
    title: 'test',
    players: names.map((n, i) => ({ id: `p${i}`, name: n, color: '#fff' })),
    options,
    darts,
    startedAt: 0,
  };
}

const T20 = dart(20, 3);
const D20 = dart(20, 2);
const S20 = dart(20, 1);
const BULL = dart(25, 2);

/* ------------------------------------------------------------------- X01 */

{
  const st = runMatch(match('x01', { start: 501, outRule: 'double', legs: 1, sets: 1 }, ['A', 'B'], [T20, T20, T20]));
  if (st.kind !== 'x01') throw new Error('kind');
  check('501 · 180 marqué', st.players[0].score, 321);
  check('501 · la main passe après trois fléchettes', st.turnIdx, 1);
  check('501 · moyenne à 3 fléchettes', Math.round((st.players[0].stat.scored / st.players[0].stat.darts) * 3), 180);
  check('501 · volée comptée comme 180', st.players[0].stat.c180, 1);
}

{
  // A : 180, 180, 141 (T20 T19 D12) → sortie en 9 fléchettes.
  const darts = [
    T20, T20, T20,
    MISS, MISS, MISS,
    T20, T20, T20,
    MISS, MISS, MISS,
    T20, dart(19, 3), dart(12, 2),
  ];
  const st = runMatch(match('x01', { start: 501, outRule: 'double', legs: 1, sets: 1 }, ['A', 'B'], darts));
  if (st.kind !== 'x01') throw new Error('kind');
  check('501 · sortie en 9 fléchettes', st.finished, true);
  check('501 · vainqueur', st.winnerIdx, 0);
  check('501 · reste à zéro', st.players[0].score, 0);
  check('501 · meilleure manche', st.players[0].stat.bestLegDarts, 9);
  check('501 · plus haute sortie', st.players[0].stat.highFinish, 141);
}

{
  // 101 - 20 - 20 - 1 = 60.
  const st0 = runMatch(match('x01', { start: 101, outRule: 'double', legs: 1, sets: 1 }, ['A'], [dart(20, 1), dart(20, 1), dart(1, 1)]));
  if (st0.kind !== 'x01') throw new Error('kind');
  check('101 · reste 60 après 20 20 1', st0.players[0].score, 60);

  // Reste 40 : un T20 passe sous zéro → bust, retour à 40.
  const st1 = runMatch(match('x01', { start: 40, outRule: 'double', legs: 1, sets: 1 }, ['A'], [T20]));
  if (st1.kind !== 'x01') throw new Error('kind');
  check('bust · score restauré', st1.players[0].score, 40);
  check('bust · signalé', st1.flash?.kind, 'bust');

  // Bust au milieu d'une volée : les points de la volée sont perdus aussi.
  const st2 = runMatch(match('x01', { start: 100, outRule: 'double', legs: 1, sets: 1 }, ['A'], [dart(20, 1), T20, dart(20, 1)]));
  if (st2.kind !== 'x01') throw new Error('kind');
  check('bust · volée entière annulée', st2.players[0].score, 100);
}

{
  // Sortie double obligatoire : finir sur un simple est un bust.
  const st = runMatch(match('x01', { start: 40, outRule: 'double', legs: 1, sets: 1 }, ['A'], [dart(20, 1), dart(20, 1)]));
  if (st.kind !== 'x01') throw new Error('kind');
  check('sortie double · simple refusé', st.finished, false);
  check('sortie double · bust et retour à 40', st.players[0].score, 40);
}

{
  const st = runMatch(match('x01', { start: 40, outRule: 'double', legs: 1, sets: 1 }, ['A'], [D20]));
  if (st.kind !== 'x01') throw new Error('kind');
  check('sortie double · D20 valide', st.finished, true);
  check('sortie double · bull compte comme double', runMatch(match('x01', { start: 50, outRule: 'double', legs: 1, sets: 1 }, ['A'], [BULL])).finished, true);
}

{
  // Rester à 1 en sortie double est un bust.
  const st = runMatch(match('x01', { start: 3, outRule: 'double', legs: 1, sets: 1 }, ['A'], [dart(2, 1)]));
  if (st.kind !== 'x01') throw new Error('kind');
  check('reste 1 · bust', st.players[0].score, 3);
}

{
  // Sortie simple : n'importe quelle fléchette termine.
  const st = runMatch(match('x01', { start: 40, outRule: 'straight', legs: 1, sets: 1 }, ['A'], [dart(20, 1), dart(20, 1)]));
  check('sortie simple · acceptée', st.finished, true);
}

{
  // Entrée double : rien ne compte avant le premier double.
  const st = runMatch(match('x01', { start: 301, outRule: 'double', doubleIn: true, legs: 1, sets: 1 }, ['A'], [T20]));
  if (st.kind !== 'x01') throw new Error('kind');
  check('entrée double · triple ignoré', st.players[0].score, 301);
  const st2 = runMatch(match('x01', { start: 301, outRule: 'double', doubleIn: true, legs: 1, sets: 1 }, ['A'], [T20, D20]));
  if (st2.kind !== 'x01') throw new Error('kind');
  check('entrée double · ouverture au double', st2.players[0].score, 261);
}

{
  // Saisie par total de volée.
  const st = runMatch(match('x01', { start: 501, outRule: 'double', legs: 1, sets: 1 }, ['A', 'B'], [totalDart(140)]));
  if (st.kind !== 'x01') throw new Error('kind');
  check('total de volée · retiré', st.players[0].score, 361);
  check('total de volée · la main passe', st.turnIdx, 1);
  check('total de volée · compte trois fléchettes', st.players[0].stat.darts, 3);
}

{
  // Manches : premier à deux manches.
  const leg = [totalDart(180), totalDart(180), totalDart(141)];
  const st = runMatch(
    match('x01', { start: 501, outRule: 'double', legs: 2, sets: 1 }, ['A', 'B'], [
      ...leg.flatMap((d, i) => (i === 0 ? [d] : [MISS, MISS, MISS, d])),
    ])
  );
  if (st.kind !== 'x01') throw new Error('kind');
  check('manches · A mène une manche à zéro', st.players[0].legs, 1);
  check('manches · partie non terminée', st.finished, false);
  check('manches · B commence la deuxième manche', st.turnIdx, 1);
  check('manches · scores remis à 501', st.players[0].score, 501);
}

/* ------------------------------------------------------------ Annulation */

{
  const darts = [T20, T20, dart(19, 3), MISS, S20];
  const full = runMatch(match('x01', { start: 501, outRule: 'double', legs: 1, sets: 1 }, ['A', 'B'], darts));
  const undone = runMatch(match('x01', { start: 501, outRule: 'double', legs: 1, sets: 1 }, ['A', 'B'], darts.slice(0, -1)));
  const replayed = runMatch(match('x01', { start: 501, outRule: 'double', legs: 1, sets: 1 }, ['A', 'B'], darts.slice(0, -1)));
  check('annulation · état identique au rejeu', JSON.stringify(undone), JSON.stringify(replayed));
  check('annulation · revient bien en arrière', undone.turnIdx !== full.turnIdx || undone.dartsInTurn !== full.dartsInTurn, true);
}

/* -------------------------------------------------------------- Sorties */

check('sortie 170', checkout(170, 3, 'double'), ['T20', 'T20', 'BULL']);
check('sortie 40', checkout(40, 2, 'double'), ['D20']);
check('sortie 99', checkout(99, 3, 'double'), ['T19', '10', 'D16']);
check('sortie 1 impossible', checkout(1, 3, 'double'), null);
check('sortie 171 impossible', checkout(171, 3, 'double'), null);
check('sortie 50 en une fléchette', checkout(50, 1, 'double'), ['BULL']);
check('sortie 100 en deux fléchettes', checkout(100, 2, 'double'), ['T20', 'D20']);
check('sortie 20 en une fléchette', checkout(20, 1, 'double'), ['D10']);
check('sortie simple 60', checkout(60, 1, 'straight'), ['T20']);

/* -------------------------------------------------------------- Cricket */

{
  const st = runMatch(match('cricket', { scoring: 'points' }, ['A', 'B'], [T20]));
  if (st.kind !== 'cricket') throw new Error('kind');
  check('cricket · triple = 3 marques', st.players[0].marks[20], 3);
  check('cricket · pas encore de points', st.players[0].points, 0);
  const st2 = runMatch(match('cricket', { scoring: 'points' }, ['A', 'B'], [T20, S20]));
  if (st2.kind !== 'cricket') throw new Error('kind');
  check('cricket · points après fermeture', st2.players[0].points, 20);
  const st3 = runMatch(match('cricket', { scoring: 'cutthroat' }, ['A', 'B'], [T20, T20]));
  if (st3.kind !== 'cricket') throw new Error('kind');
  check('cut-throat · points chez l’adversaire', st3.players[1].points, 60);
  check('cut-throat · rien pour moi', st3.players[0].points, 0);
  const st4 = runMatch(match('cricket', { scoring: 'points' }, ['A', 'B'], [dart(25, 2)]));
  if (st4.kind !== 'cricket') throw new Error('kind');
  check('cricket · bull = 2 marques', st4.players[0].marks[25], 2);
}

{
  // Fermer les sept cibles donne la victoire quand les points suivent.
  const closeAll: Dart[] = [20, 19, 18, 17, 16, 15].flatMap((n) => [dart(n, 3)]);
  const st = runMatch(match('cricket', { scoring: 'noscore' }, ['A'], [...closeAll, dart(25, 2), dart(25, 1)]));
  if (st.kind !== 'cricket') throw new Error('kind');
  check('cricket · victoire en fermant tout', st.finished, true);
  check('cricket · vainqueur', st.winnerIdx, 0);
}

/* -------------------------------------------------------------- Horloge */

{
  const st = runMatch(match('atc', { ring: 'any', bull: false }, ['A'], [dart(1), dart(2), dart(3)]));
  if (st.kind !== 'generic') throw new Error('kind');
  check('horloge · trois cibles enchaînées', st.players[0].main, 3);
  check('horloge · cible suivante', st.players[0].ownTarget, 4);
  const st2 = runMatch(match('atc', { ring: 'double', bull: false }, ['A'], [dart(1, 1)]));
  if (st2.kind !== 'generic') throw new Error('kind');
  check('horloge en doubles · simple refusé', st2.players[0].main, 0);
  const all = Array.from({ length: 20 }, (_, i) => dart(i + 1));
  const st3 = runMatch(match('atc', { ring: 'any', bull: false }, ['A'], all));
  check('horloge · parcours terminé', st3.finished, true);
}

/* ------------------------------------------------------------- Shanghai */

{
  const st = runMatch(match('shanghai', { rounds: 7, shanghaiWin: true }, ['A'], [dart(1, 1), dart(1, 2), dart(1, 3)]));
  if (st.kind !== 'generic') throw new Error('kind');
  check('shanghai · victoire immédiate', st.finished, true);
  check('shanghai · message', st.flash?.text.startsWith('SHANGHAI'), true);
  const st2 = runMatch(match('shanghai', { rounds: 7, shanghaiWin: true }, ['A'], [dart(1, 3), dart(5, 3), MISS]));
  if (st2.kind !== 'generic') throw new Error('kind');
  check('shanghai · hors cible ne compte pas', st2.players[0].main, 3);
}

/* ----------------------------------------------------------------- Golf */

{
  const st = runMatch(match('golf', { holes: 9 }, ['A'], [MISS, MISS, MISS]));
  if (st.kind !== 'generic') throw new Error('kind');
  check('golf · trou raté = 5 coups', st.players[0].main, 5);
  const st2 = runMatch(match('golf', { holes: 9 }, ['A'], [dart(1, 3), MISS, MISS]));
  if (st2.kind !== 'generic') throw new Error('kind');
  check('golf · triple = 1 coup', st2.players[0].main, 1);
  const st3 = runMatch(match('golf', { holes: 9 }, ['A'], [dart(1, 1), dart(1, 2), MISS]));
  if (st3.kind !== 'generic') throw new Error('kind');
  check('golf · le meilleur impact compte', st3.players[0].main, 2);
}

/* ------------------------------------------------------------- Bob's 27 */

{
  const st = runMatch(match('bobs27', { hard: false }, ['A'], [dart(1, 2), MISS, MISS]));
  if (st.kind !== 'generic') throw new Error('kind');
  check("bob's 27 · double 1 touché", st.players[0].main, 29);
  const st2 = runMatch(match('bobs27', { hard: false }, ['A'], [MISS, MISS, MISS]));
  if (st2.kind !== 'generic') throw new Error('kind');
  check("bob's 27 · trois ratés", st2.players[0].main, 25);
}

/* ------------------------------------------------------------- Baseball */

{
  const st = runMatch(match('baseball', { innings: 9, extra: true }, ['A'], [dart(1, 3), dart(1, 2), MISS]));
  if (st.kind !== 'generic') throw new Error('kind');
  check('baseball · 3 + 2 points', st.players[0].main, 5);
}

/* ------------------------------------------------------------- Halve It */

{
  const st = runMatch(match('halveit', { seq: 'classic', start: 40 }, ['A'], [MISS, MISS, MISS]));
  if (st.kind !== 'generic') throw new Error('kind');
  check('halve it · score coupé en deux', st.players[0].main, 20);
  const st2 = runMatch(match('halveit', { seq: 'classic', start: 40 }, ['A'], [T20, MISS, MISS]));
  if (st2.kind !== 'generic') throw new Error('kind');
  check('halve it · triple 20 sur la cible 20', st2.players[0].main, 100);
}

/* --------------------------------------------------------------- Killer */

{
  const opts = { lives: 2, strict: false, numbers: '20,19' };
  const st = runMatch(match('killer', opts, ['A', 'B'], [S20]));
  if (st.kind !== 'generic') throw new Error('kind');
  check('killer · devient tueur', st.players[0].lines[1]?.value, 'Tueur');
  const st2 = runMatch(match('killer', opts, ['A', 'B'], [S20, dart(19, 1)]));
  if (st2.kind !== 'generic') throw new Error('kind');
  check('killer · une vie retirée', st2.players[1].main, 1);
  const st3 = runMatch(match('killer', opts, ['A', 'B'], [S20, dart(19, 2)]));
  if (st3.kind !== 'generic') throw new Error('kind');
  check('killer · double retire deux vies et élimine', st3.players[1].out, true);
  check('killer · dernier debout', st3.finished, true);
  check('killer · vainqueur', st3.winnerIdx, 0);
}

/* ------------------------------------------------------- Rotation à trois */

{
  const st = runMatch(
    match('countup', { rounds: 8 }, ['A', 'B', 'C'], [S20, S20, S20, S20, S20, S20, S20])
  );
  check('rotation · troisième joueur au lancer', st.turnIdx, 2);
  check('rotation · une fléchette posée', st.dartsInTurn, 1);
  check('rotation · encore au premier tour de table', st.round, 1);
}

/* ----------------------------------------------------------------- Bilan */

console.log(`\n${pass} vérifications passées`);
if (fails.length > 0) {
  console.log(`\n${fails.length} ÉCHEC(S) :\n`);
  for (const f of fails) console.log('  ✗ ' + f + '\n');
  process.exit(1);
}
console.log('Moteur conforme.\n');
