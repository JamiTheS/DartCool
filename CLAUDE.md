# DartCool — contexte du projet

Application iOS (Expo / React Native) qui tient le score de parties de fléchettes dans un bar :
dix modes de jeu (treize formats prêts à lancer), trois façons de saisir les fléchettes, les sorties calculées en direct, les
statistiques des joueurs. Gratuite, hors ligne, sans compte, sans publicité, sans achat intégré.

## Non négociable

1. **Les parties ne quittent pas l'appareil.** Pas de backend, pas d'analytics, pas de compte.
   Joueurs, historique, statistiques et réglages restent dans AsyncStorage.
   **Seule exception, depuis la 1.1.0 : le SDK publicitaire Google AdMob** (`src/ads`), qui est
   le seul accès réseau de l'app. Toute autre dépendance réseau reste exclue, et toute évolution
   de la publicité doit se répercuter dans `src/app/privacy.tsx`, `docs/privacy-policy.html` et
   la déclaration de confidentialité d'App Store Connect — les trois doivent toujours dire la
   même chose que le code.
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

## Publicité (`src/ads`)

Un seul format : **un interstitiel au lancement de chaque partie** — bouton « Lancer la partie »
de `setup.tsx` et « Revanche » de `summary.tsx`, qui est un lancement comme un autre. Jamais
pendant une partie : la cible occupe l'écran, les cibles de toucher font 46 px, et une bannière
provoquerait des erreurs de saisie. Revenir à l'accueil n'affiche rien.

Pas de cadence : c'est un choix assumé de Damien (25/10), contre mon avis — une pub avant chaque
partie est ce qui expose le plus aux mauvaises notes, surtout sur un enchaînement de revanches.
Pour revenir en arrière, il suffit de remettre un compteur dans `showBeforeMatch()`.

`initAds()` est appelé par `_layout.tsx` une fois l'app affichée : consentement Google UMP (RGPD),
puis App Tracking Transparency sur iOS, puis seulement l'initialisation du SDK. Tout est
encapsulé : un échec n'empêche jamais l'app de démarrer, et `showBeforeMatch()` résout toujours,
avec ou sans pub, pour que la partie ne dépende jamais de la publicité.

**Sans message de consentement publié dans AdMob** (Confidentialité et messages → Réglementations
européennes), le SDK ne fait aucune demande dans l'UE : zéro pub, silencieusement. C'est la
première chose à vérifier si rien ne s'affiche — le compteur « Demandes » d'AdMob reste à 0, ce
qui distingue ce cas d'un simple défaut de remplissage.

`ADS_DEBUG` (en tête de `src/ads/index.ts`) affiche un bloc **« Diagnostic publicité »** en bas
des Réglages : état du consentement, droit de demander des pubs, ATT, pub chargée, nombre de
demandes, dernière erreur, et un bouton qui rejoue le consentement sans réinstaller l'app.
**À repasser à `false` avant toute soumission à l'App Store** — c'est un outil de mise au point,
pas une fonctionnalité. Il existe parce que le module avale ses erreurs par conception : sans
lui, une pub absente est indébogable.

`src/ads/index.web.ts` neutralise tout sur le web : le SDK n'y existe pas, et `npm run web` sert
à produire les captures de la fiche App Store.

En développement, les identifiants de test officiels de Google sont utilisés automatiquement
(`__DEV__`). **L'`androidAppId` d'`app.json` est l'identifiant d'exemple de Google** : l'app n'est
pas publiée sur Android, il faudra le remplacer avant toute diffusion Play Store.

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

Identité claire, posée à la refonte d'octobre 2026 : fond gris très pâle (`#F5F4F7`), cartes
blanches, encre presque noire (`#16161C`), rose (`#FF9EC4`) pour l'action et le joueur au
lancer, pêche (`#FFC08A`) en accent secondaire, vert (`#3BA776`) et rouge (`#E5484D`) pour les
états. Typographie système condensée (`DIN Condensed` sur iOS) pour les chiffres, chiffres
tabulaires partout.
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
npm run store:creative # compose l'en-tête et le visuel de résultats de recherche
```

## État au 25 octobre 2026

**DartCool est publié sur l'App Store depuis le 22 octobre 2026** (version 1.0, gratuite, 4+,
`https://apps.apple.com/fr/app/dartcool/id6821425205`).

Fonctionnel et complet : dix moteurs de jeu vérifiés, quatre écrans de score, trois saisies,
statistiques, règles, carnet de joueurs, visuels et captures générés, pages web rédigées.

Dépôt public : `JamiTheS/DartCool`, branche `main`. Les pages sont en ligne via GitHub Pages
(`/docs`) : accueil, confidentialité et aide répondent 200.

### 1.1.0 — publicité, en préparation

Intégration d'AdMob terminée et vérifiée (`npm run check` passe, l'app démarre) mais **non
soumise**. Voir la section « Publicité » plus haut pour les règles de placement.

- compte AdMob : app id iOS `ca-app-pub-4942532111934732~6176689160`, bloc interstitiel
  `ca-app-pub-4942532111934732/6643593025` ;
- textes de confidentialité réécrits dans l'app **et** sur la page web ;
- **reste à faire avant soumission** : publier `app-ads.txt` à la racine de
  `jamithes.github.io` (dépôt `JamiTheS.github.io` à créer — tant qu'il manque, AdMob est en
  « diffusion d'annonces limitée »), builder, **mettre à jour la déclaration de confidentialité
  d'App Store Connect** (elle dit encore « aucune donnée collectée », ce qui devient faux), puis
  soumettre.

### Historique de la première soumission

Version 1.0.0 build 2 soumise le 12 octobre, **refusée le 13 octobre** au titre de la guideline
2.1 « Information Needed » — demande d'informations liée à un compte développeur sans
historique, pas un défaut de l'app. Traitement du refus (voir `store/app-review-reply-2.1.md`) :
- champ **Remarques** d'App Review Information remplacé par une version anglaise couvrant les
  six points demandés (l'ancienne note française est sauvegardée dans
  `store/app-review-notes-FR-precedente.md`) ;
- enregistrement d'écran compressé de 152 Mo à 8,4 Mo (H.264, 886 × 1920, 30 fps), durée et
  lisibilité intactes ;
- réponse aux six points **envoyée le 18 octobre à 22:07**, vidéo en pièce jointe ;
- version **resoumise** dans la foulée : statut « En attente de vérification » ;
- ressources créatives de la page produit générées par `npm run store:creative` et envoyées :
  c'est le PNG 16:9 `universel-5244x2950.png` qui sert d'en-tête, App Store Connect refusant le
  21:9 pourtant documenté. Le visuel attend dans un brouillon de soumission à part — une
  ressource créative ne part qu'accompagnée d'une version d'app : elle partira donc avec la
  1.1.0.

Pistes pour la suite : support iPad (implique des captures iPad), anglais, mode équipes,
export CSV de l'historique, objectifs d'entraînement.
