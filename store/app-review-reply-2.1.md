# Refus 2.1 — Information Needed · DartCool 1.0.0 (build 2)

Refus du 13/10/2026. Ce n'est **pas** un rejet de l'app : Apple demande des
informations parce que le compte développeur a peu d'historique de review.
Rien à changer dans le code.

## État au 18 octobre 2026

| Étape | État |
|---|---|
| Champ **Remarques** (App Review Information) | ✅ remplacé par la version anglaise, enregistré et vérifié après rechargement |
| Case « Connexion requise » | ✅ déjà décochée, correct (aucun compte dans l'app) |
| Vidéo compressée | ✅ 152 Mo → **8,42 Mo**, durée et lisibilité intactes |
| Réponse au centre de résolution | ✅ **envoyée** le 18/10 à 22:07, avec la vidéo en pièce jointe |
| Resoumission de la version | ✅ **faite** — statut « En attente de vérification » |
| Ressource créative en-tête + recherche | ✅ générée et envoyée, **en attente dans un brouillon à part** |

Soumission : `2df12ac6-5f25-473a-98f3-65b35914ffa4`, élément unique
« iOS App 1.0 · 1.0.0 (2) ». La resoumission ne contient que la version, ce qui
est le cas le plus simple à faire passer.

---

## §1 · Ce qu'il reste

Rien d'obligatoire : il faut attendre le retour d'Apple.

Un seul reliquat, le visuel de page produit. Il est validé et rattaché, mais il
attend dans « Brouillons de soumissions (1) » (en bas à droite de la page
produit) : App Store Connect exige qu'une version d'app accompagne une
soumission de ressource créative, et la 1.0 est maintenant en vérification.
Le plus simple est de l'envoyer avec la prochaine mise à jour, ou dès que la
1.0 est acceptée. Rien ne presse : la page produit s'affiche très bien sans.

### La vidéo

`C:\Users\damie\Downloads\DartCool-demo-iPhone.mp4` — 8,42 Mo, 2 min 26 s,
886 × 1920, H.264 30 fps. L'original HEVC 60 fps de 152 Mo est conservé à côté.
La compression ne touche ni la durée ni le cadrage, et le texte de l'interface
reste parfaitement net (vérifié image par image).

Contenu vérifié, image par image, avant d'être décrit à Apple : départ sur
l'écran d'accueil iOS puis lancement de l'app, grille des formats,
configuration d'un 501 à quatre joueurs, saisie avec les trois modes (cible,
pavé, total), score en direct avec sorties et annulation, menu de partie,
écran **Résultat** avec classement et statistiques par joueur, écrans de
règles et lexique, et enfin **Réglages → Tout effacer → Effacer
définitivement**. C'est exactement ce que décrit la réponse.

---

## §2 · Le texte enregistré en brouillon (3 867 caractères)

Le champ du centre de résolution est limité à **4 000 caractères**, ce qui a
imposé une version condensée. Les six points y sont tous traités ; le détail
complet vit désormais dans le champ Remarques (§3), que le relecteur a sous les
yeux en même temps.

```text
Hello,

Thank you for the review. DartCool is a free, fully offline darts scoreboard: no accounts, no in-app purchases, no advertising, no analytics and no network requests. The six points are answered below, and the same information has been added to the Notes field of the App Review Information section.

1. SCREEN RECORDING
A screen recording captured on a physical iPhone running the latest iOS is attached. It begins on the iOS Home Screen and launches the app, then shows the typical flow: the list of game formats, setting up a 501 game with four players, entering throws with all three input methods (interactive dartboard, keypad, whole-turn total), the live score with checkout suggestions and undo, the in-game menu, the end-of-game result screen with the ranking and per-player statistics, the rules and glossary screens, and the permanent deletion of all local data from Settings.
None of the flows you list exist in this app. There is no account registration, login or account deletion, because there are no accounts and no server. No user-generated content is shared or transmitted: player names stay in local storage on the user's own device and are visible to nobody else, so no content reporting or blocking mechanism applies. There is no paid content: every mode and every screen is free.

2. PURPOSE AND TARGET AUDIENCE
DartCool replaces pen-and-paper scorekeeping for a real game of darts, where scoring by hand is slow and error-prone. The user taps where each dart landed and the app handles the running score, turn order, legs and sets, bust detection, checkout suggestions, undo, a summary and per-player statistics. 10 game modes and 13 presets, for one to eight players on one device. Audience: amateur and club darts players using the phone as the scoreboard beside a physical dartboard. Rated 4+, no gambling or betting.

3. SETTING UP AND ACCESSING THE MAIN FEATURES
No credentials, demo account or sample files are needed, and the app works in airplane mode. Tap the "501" tile, type a name in "Nouveau joueur" and tap "+", repeat for a second player, then tap "LANCER LA PARTIE". Enter darts by tapping the dartboard, or tap "TRIPLE" then "20" on the keypad: the score goes from 501 to 441. The three input methods are the tabs at the bottom of the match screen: "Pave" (keypad), "Cible" (dartboard) and "Total" (whole turn). The arrow button undoes the last dart. The home screen also gives access to Statistiques, Joueurs, Regles, Reglages and Confidentialite.

4. EXTERNAL SERVICES
None. No backend, data provider, authentication service, payment processor or AI service, and no analytics, attribution or advertising SDK. The app makes no network request; everything is computed and stored on the device. It is built with React Native / Expo SDK and EAS Build, which are build tooling only and are never contacted at runtime. The only outbound links are two static web pages (privacy policy, support) and a mailto: support link, opened on explicit user tap.

5. REGIONAL DIFFERENCES
The app functions identically in every region. No geolocation, no region-specific content or restriction, and no remote configuration: it cannot vary by region because it never contacts a server. The interface is in French only, everywhere.

6. REGULATED INDUSTRY AND THIRD-PARTY MATERIAL
Neither applies. No gambling, betting, wagering or real-money play, no financial service, no health data, no personal data. The darts games scored here are traditional and their rules are in the public domain. All artwork, including the dartboard, is vector graphics drawn for this project. No third-party trademark is used, and the app is not affiliated with any darts federation, brand or competition.

The submitted build was tested on a physical iPhone running the latest iOS.

Please let me know if anything else is needed.

Best regards,
Damien Dechamps
```

---

## §3 · Le texte en place dans Remarques (3 255 caractères)

Déjà enregistré dans App Store Connect, et vérifié après rechargement de la
page. L'ancienne note française est conservée dans
`app-review-notes-FR-precedente.md` ; son parcours de test, avec les libellés
exacts des boutons, a été repris ici.

```text
DartCool is a free, fully offline darts scoreboard. No accounts, no login, no in-app purchases, no advertising, no analytics, and no network requests of any kind. Nothing is locked and no credentials are needed for review: install, open and play. The app works in airplane mode.

1. PURPOSE AND TARGET AUDIENCE
It replaces pen-and-paper scorekeeping for a real game of darts on a physical dartboard. The user taps where each dart landed; the app handles the running score, turn order, legs and sets, bust detection, checkout suggestions, undo, an end-of-game summary and per-player statistics. 10 game modes (X01 201-1001 with double-in and double/straight/master out, Cricket in points / cut-throat / no-score, Around the Clock, Shanghai, Count Up, Halve It, Golf, Bob's 27, Killer, Baseball) and 13 one-tap presets, for one to eight players on the same device depending on the mode. Audience: amateur and club darts players using the phone as the scoreboard. Rated 4+, no gambling, no betting, no alcohol.

2. ACCESS AND TEST PATH (1 minute)
No account, no login, no password, no in-app purchase, nothing to unlock.
- Tap the "501" tile on the home screen.
- Type a name in "Nouveau joueur" and tap "+". Repeat for a second player.
- Tap "LANCER LA PARTIE".
- Enter darts: tap "TRIPLE" then "20"; the score goes from 501 to 441.
- The three input methods are the tabs at the bottom of the match screen: "Pavé" (keypad), "Cible" (interactive dartboard) and "Total" (whole three-dart turn).
- The arrow button to the right of the three darts undoes the last entry.
- The home screen also gives access to Statistiques, Joueurs, Règles, Réglages and Confidentialité.

3. NO ACCOUNTS, NO USER CONTENT, NO PAID CONTENT
There is no registration, login or account deletion flow, because there are no accounts and no server. Nothing is shared, published or transmitted: the player names typed by the user stay in local storage on their own device, so no content reporting or blocking mechanism applies. Every mode and every screen is free.
Local data deletion: Réglages > Données > "Tout effacer" permanently deletes players, history, statistics and settings.

4. EXTERNAL SERVICES USED FOR CORE FUNCTIONALITY
None. No backend, data provider, authentication service, payment processor or AI service, and no analytics, attribution or advertising SDK. The app makes no network request. Built with React Native / Expo SDK and EAS Build (build tooling only, never contacted at runtime). The only outbound links are two static web pages (privacy policy, support) and a mailto: support link, opened on explicit user tap.

5. REGIONAL DIFFERENCES
None. Identical behaviour in every region, no geolocation, no remote configuration. The interface is in French only, everywhere.

6. REGULATED INDUSTRY AND THIRD-PARTY MATERIAL
None. No gambling, betting, wagering or real-money play, no alcohol or tobacco, no health data, no personal data. The darts games scored here are traditional and their rules are in the public domain; Bob's 27 is a common practice routine. All artwork, including the dartboard, is vector graphics drawn for this project. No third-party trademark, and no affiliation with any darts federation, brand or competition.

Contact: damiendchps@gmail.com
```

---

## §4 · Ressources créatives (en-tête et résultats de recherche)

Nouvelle section d'App Store Connect : une image large en haut de la page
produit, et une image dédiée aux résultats de recherche. Générées par
`npm run store:creative` depuis `tools/make-store-creative.mjs`, dans la même
charte que les captures.

| Fichier | Format | État |
|---|---|---|
| `universel-5244x2950.png` | 16:9, PNG | ✅ accepté — couvre **en-tête + résultats de recherche** |
| `search-3840x2560.jpg` | 3:2 | ✅ accepté, dans la bibliothèque, non rattaché |
| `header-3840x1646.jpg` | 21:9 | ❌ **refusé** par App Store Connect |

Le 21:9 en 3840 × 1646 est pourtant la taille officiellement documentée par
Apple pour l'en-tête. App Store Connect le refuse malgré tout — « les
dimensions du fichier ne sont pas valides » — même envoyé seul, et le fichier
produit est bien exactement 3840 × 1646, sRGB, sans couche alpha. C'est donc le
PNG universel 16:9 qui tient le rôle d'en-tête : Apple le documente pour les
deux emplacements, et App Store Connect le confirme (« Résultats de recherche
(et 1 de plus) »).

**Ce qu'il faut savoir avant de resoumettre** : le visuel est rattaché mais
attend dans un brouillon de soumission séparé, qui réclame une version d'app
pour partir. Il rejoindra donc la resoumission de la 1.0. Cela ajoute un
élément à vérifier à une soumission déjà sensible : si tu préfères faire
accepter la 1.0 d'abord et ajouter le visuel ensuite, retire-le depuis
« Brouillons de soumissions (1) » en bas à droite de la page produit. C'est
réversible en un clic dans les deux sens.

---

## §5 · Points vérifiés, rien à faire

- **Captures d'écran** : la règle 2.3.3 que cite Apple dans sa liste générique
  est respectée. Chaque capture de `store/appstore/iphone-6.3/` montre
  l'interface réelle en cours d'usage (partie de 501, grille des 13 formats…),
  dominante dans le cadre, avec un simple titre en en-tête — ce qu'Apple
  autorise. Ni écran titre ni splash.
- **Case « Connexion requise »** : décochée, ce qui est correct puisqu'aucun
  compte n'existe dans l'app.
- **Exactitude du contenu envoyé** : chaque affirmation a été vérifiée dans le
  code, pas déduite. Zéro appel réseau dans `src/` (les deux seules URL sont la
  politique de confidentialité et la page d'aide, ouvertes sur tap), stockage
  AsyncStorage local uniquement, aucun SDK d'analytics ou de publicité, 10
  modes et 13 préréglages, statistiques conformes à `src/app/stats.tsx`,
  effacement via `Réglages → Données → Tout effacer`.
- **Statut de l'élément soumis** : repassé à « Prêt pour la vérification »
  après l'enregistrement des Remarques.
