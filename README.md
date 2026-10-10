# DartCool

Le carnet de scores de toutes les fléchettes. Application iOS (Expo / React Native) pour tenir le
score d'une soirée fléchettes : dix modes de jeu, trois façons de saisir les fléchettes, les
sorties calculées en direct, les statistiques des joueurs.

Gratuite, hors ligne, sans compte, sans publicité, sans achat intégré.

## Démarrer

```bash
npm install
npm start          # puis « i » pour iOS, ou npm run web
```

## Vérifier

```bash
npm run check      # types + lint + 70 vérifications du moteur de jeu
```

Le moteur n'a aucune dépendance React : `tools/engine-check.ts` rejoue des séquences de fléchettes
connues et compare l'état obtenu à l'état attendu. Toute règle corrigée arrive avec son cas.

## Publier

```bash
npm run assets          # icônes et splash
npm run store:shots     # captures App Store 1290 × 2796
npx eas-cli@latest build --profile production --platform ios
npx eas-cli@latest submit --profile production --platform ios
```

La marche à suivre complète, les textes de la fiche et la liste de contrôle avant envoi sont dans
[`store/appstore-metadata.md`](store/appstore-metadata.md). Le contexte technique du projet est
dans [`CLAUDE.md`](CLAUDE.md).

## Structure

| Dossier | Rôle |
|---|---|
| `src/app/` | écrans (expo-router) |
| `src/engine/` | moteur de jeu, pur TypeScript |
| `src/components/` | pavé, cible interactive, tableaux de score |
| `src/data/modes.ts` | catalogue des modes : règles, réglages, préréglages |
| `src/theme/tokens.ts` | couleurs, typographie, espacements |
| `tools/` | vérification du moteur, génération des visuels et des captures |
| `docs/` | pages publiées : confidentialité, aide, accueil (GitHub Pages) |
| `store/` | métadonnées et captures App Store |

## Principe du moteur

Une partie n'est que la liste des fléchettes lancées. Tout le reste est recalculé à chaque
changement : l'annulation est exacte par construction, aucun état ne peut dériver, et une partie
se rejoue à l'identique.
