# Sauvegarde — ancienne note « Remarques » (App Review Information)

Contenu français présent dans App Store Connect avant le remplacement du
2026-10-18 par la version anglaise (§3 de `app-review-reply-2.1.md`).
Conservé au cas où tu voudrais y revenir.

```text
1. DESCRIPTION DE L'APP
DartCool est un compteur de points pour le jeu de fléchettes. L'utilisateur saisit manuellement les fléchettes lancées sur une vraie cible physique ; l'app calcule les scores, les sorties possibles et les statistiques. Il s'agit d'un outil de score, pas d'un jeu d'argent : aucun pari, aucune mise, aucune monnaie virtuelle.

2. ACCÈS
Aucun compte, aucune connexion, aucun achat intégré. L'app est entièrement gratuite et fonctionne hors ligne.

3. PARCOURS DE TEST (1 minute)
- Au premier lancement, appuyer sur la tuile « 501 ».
- Saisir un nom dans « Nouveau joueur » puis le bouton « + ». Répéter pour un deuxième joueur.
- Appuyer sur « LANCER LA PARTIE ».
- Saisir des fléchettes : appuyer sur « TRIPLE » puis « 20 » ; le score passe de 501 à 441.
- Les trois modes de saisie sont en bas de l'écran : « Pavé », « Cible » (cible interactive) et « Total ».
- Le bouton flèche à droite des trois fléchettes annule la dernière saisie.

4. SERVICES EXTERNES
Aucun. Pas de backend, pas d'analytics, pas de SDK publicitaire. L'app ne fait aucune requête réseau.

5. DIFFÉRENCES RÉGIONALES
Aucune. L'app est en français et se comporte de façon identique dans tous les pays.

6. CONTENU RÉGLEMENTÉ
Aucun. Pas de jeu d'argent, pas d'alcool, pas de tabac, pas de contenu généré par les utilisateurs autre que les noms de joueurs saisis localement sur l'appareil.
```

Ce qui a été repris dans la version anglaise : le parcours de test, avec les
libellés exacts des boutons (« 501 », « Nouveau joueur », « LANCER LA PARTIE »,
« TRIPLE » puis « 20 » → 441, les onglets « Pavé » / « Cible » / « Total »).

Ce qui a été ajouté : la mention de la vidéo, les trois flux qu'Apple réclame
et qui n'existent pas ici (compte, contenu généré, contenu payant), le public
visé, la suppression des données locales, et les outils de build.
