# DartCool — contexte du projet

Application iOS (Expo / React Native) qui tient le score de parties de fléchettes dans un bar :
dix modes de jeu (treize formats prêts à lancer), trois façons de saisir les fléchettes, les sorties calculées en direct, les
statistiques des joueurs. Gratuite, hors ligne, sans compte, sans publicité, sans achat intégré.

## Non négociable

1. **Aucune donnée ne quitte l'appareil.** Pas de backend, pas d'analytics, pas de SDK tiers
   réseau. La fiche App Store déclare « aucune donnée collectée » : tout ajout de réseau
   invaliderait cette déclaration.
2. **Aucun achat intégré.** L'app est gratuite. Introduire un abonnement rouvrirait toute la
   mécanique App Store Connect (guideline 3.1.2, soumission des produits avec la version, etc.).
3. **Aucune référence à l'alcool, au pari ou à l'argent.** C'est un outil de score sportif ;
   le jeu d'argent est un motif de refus structurant (guideline 5.3) et l'alcool force un 17+.
4. **Classification 4+.** Le contenu doit le rester : pas de gages, pas de défis, pas de contenu
   généré par les utilisateurs au-delà des prénoms saisis localement.
5. **Le français est la langue de l'app.** Une seule langue déclarée, pas d'i18n à moitié faite.

## Stack

| Élément | Version |
|---|---|
| Expo SDK | 57 |
| React Native | 0.86 |
| React | 19.2 |
| expo-router | 57 (routes dans `src/app/`) |
| react-native-svg | cible interactive et icônes |
| AsyncStorage | persistance locale |
| TypeScript | 6, `strict` |

Dépendances natives volontairement réduites : `react-native-svg`, `expo-haptics`,
`expo-keep-awake`, `expo-splash-screen`, AsyncStorage. **Toute dépendance native utilisée doit
être déclarée en direct dans `package.json`** (un bundle qui compile ne prouve pas que
l'autolinking a suivi).

## Structure

```
src/
  app/              écrans (expo-router)
    _layout.tsx     providers, splash, filet de sécurité 2,5 s
    index.tsx       accueil : reprise de partie, grille des formats
    setup.tsx       joueurs, ordre de lancer, réglages du mode
    match.tsx       écran de partie (le cœur)
    summary.tsx     résultat, classement, statistiques, revanche
    players.tsx     carnet de joueurs
    stats.tsx       statistiques de carrière, historique
    rules.tsx       règles des modes, lexique, table des sorties
    settings.tsx    réglages, données, liens
    privacy.tsx     politique de confidentialité hors ligne
  components/       ui.tsx, DartPad, BoardInput, TotalPad, ThrowTray, boards, icons
  engine/           moteur de jeu (aucune dépendance React)
  data/modes.ts     catalogue des modes : règles, réglages, préréglages
  store/app.tsx     état global + persistance
  theme/tokens.ts   couleurs, espacements, typographie — source unique
  utils/            storage, haptique, identifiants
tools/              vérification du moteur, génération des visuels et des captures
docs/               pages publiées (GitHub Pages) : confidentialité, aide, accueil
store/              métadonnées App Store et captures
```

## Le moteur — la règle d'or

**Une partie n'est que la liste chronologique des fléchettes lancées** (`Match.darts`).
Scores, tours, manches, busts, vainqueur et statistiques sont **recalculés** à chaque changement
par `runMatch(match)` (`src/engine/index.ts`).

Conséquences, à respecter dans toute évolution :
- l'annulation est exacte par construction : on retire la dernière fléchette et on rejoue ;
- aucun état dérivé n'est stocké, donc rien ne peut désynchroniser ;
- une partie se rejoue, se répare et se teste en rejouant une séquence.

Une fléchette : `{ seg, mult, turnTotal? }` — `seg` 0 = manquée, 1..20, 25 = centre ;
`mult` 1/2/3 ; au centre `mult 2` vaut 50 et compte comme un double. `turnTotal` porte le total
d'une volée entière (saisie rapide, X01 et Score Max uniquement, en début de volée).

Un moteur par mode : `x01.ts`, `cricket.ts`, `rounds.ts` (horloge, shanghai, golf, baseball),
`practice.ts` (score max, halve it, bob's 27), `killer.ts`. Les modes « simples » partagent
l'ossature de `generic.ts` mais gardent leur propre boucle de règles.

`checkout.ts` calcule les sorties : table des finitions standard du circuit + recherche
exhaustive pour le reste. C'est le même code qui alimente l'écran de partie et la table des
sorties des règles.

## État et persistance

`src/store/app.tsx` expose `useApp()` : carnet de joueurs, réglages, partie en cours, historique
(60 parties). Tout est persisté dans AsyncStorage sous le préfixe `dartcool.`. La partie en cours
est sauvegardée à chaque fléchette : fermer l'app ne perd rien.

## Design

Identité « craie & sisal » : noir chaud (`#0B0E0C`), craie crème, laiton (`#F0B429`) pour
l'action et le joueur au lancer, rouge et vert de cible pour les états. Typographie système
condensée (`DIN Condensed` sur iOS) pour les chiffres, chiffres tabulaires partout.
**Aucune couleur ni taille en dur dans un composant** : tout vient de `src/theme/tokens.ts`.

Règles d'interface : écran unique sans défilement pendant une partie, cibles de toucher ≥ 46 px,
retour haptique sur chaque saisie (désactivable), écran maintenu allumé pendant la partie, et
les cibles inutiles au mode en cours sont estompées (`state.focus`).

## Commandes

```bash
npm run check          # types + lint + moteur (à lancer avant tout commit)
npm run check:engine   # 70 vérifications de règles, sans dépendance de test
npm start              # dev server
npm run web            # aperçu navigateur (sert aussi aux captures)
npm run assets         # régénère icônes et splash depuis tools/make-assets.mjs
npm run store:shots    # recompose les captures App Store depuis store/raw/
```

## État au 10 octobre 2026

Fonctionnel et complet : dix moteurs de jeu vérifiés, quatre écrans de score, trois saisies,
statistiques, règles, carnet de joueurs, visuels et captures générés, pages web rédigées.

Reste à faire, côté humain (voir `store/appstore-metadata.md`) :
- créer le dépôt GitHub, activer Pages sur `/docs`, vérifier les deux URLs au `curl` ;
- créer la fiche App Store Connect, renseigner `ascAppId` dans `eas.json` ;
- `eas build --profile production` puis `eas submit`, et tester le build sur un iPhone réel.

Pistes pour la suite : support iPad (implique des captures iPad), anglais, mode équipes,
export CSV de l'historique, objectifs d'entraînement.
