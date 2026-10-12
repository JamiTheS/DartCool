# Fiche App Store — DartCool 1.0.0

Tout le texte à coller dans App Store Connect, prêt à l'emploi.
Langue principale : **français (France)**. Aucune autre langue n'est déclarée.

---

## Informations sur l'app

| Champ | Valeur |
|---|---|
| **Nom** (30 car. max) | `DartCool` |
| **Sous-titre** (30 car. max) | `Carnet de scores fléchettes` (27) |
| **Identifiant de lot** | `com.dartcool.app` |
| **UGS / SKU** | `dartcool-ios-001` |
| **Catégorie principale** | Sports |
| **Catégorie secondaire** | Jeux › Jeux de société |
| **Droits relatifs au contenu** | Non, l'app ne contient pas de contenu tiers |
| **Contrat de licence** | EULA standard d'Apple |
| **Classification par âge** | 4+ — aucune violence, aucun contenu suggestif, **aucun jeu d'argent**, aucune référence à l'alcool ou au tabac |
| **Chiffrement** | `usesNonExemptEncryption: false` dans `app.json` → rien à déclarer |

## URLs

| Champ | Valeur |
|---|---|
| **URL de l'assistance** (obligatoire) | `https://jamithes.github.io/DartCool/support.html` |
| **URL de la politique de confidentialité** | `https://jamithes.github.io/DartCool/privacy-policy.html` |
| **URL marketing** (facultative) | `https://jamithes.github.io/DartCool/` |

> ✅ En ligne depuis le 10 octobre 2026 : dépôt public `JamiTheS/DartCool`, GitHub Pages servi
> depuis `/docs` sur la branche `main`. Les trois URLs répondent **200** (vérifié au `curl`).
> Les mêmes adresses sont codées dans `src/data/links.ts` : si le dépôt est renommé ou rendu
> privé, mettre à jour ce fichier *et* les champs d'App Store Connect. À revérifier au `curl`
> avant chaque soumission — une URL d'assistance morte est un refus à elle seule.

## Confidentialité de l'app

> « Le développeur ne collecte aucune donnée avec cette app. »

Cohérent avec le code : aucun SDK réseau, aucun analytics, aucune requête sortante. Les seules
données existent dans le stockage local (`AsyncStorage`) et ne quittent jamais l'appareil.

---

## Texte promotionnel (170 car. max — modifiable sans resoumettre)

```
Dix modes de jeu, trois façons de saisir, les sorties calculées pour vous. DartCool tient le score pendant que vous jouez.
```
(117 caractères)

## Description (4000 car. max)

> Texte **en ligne** dans App Store Connect depuis le 12 octobre 2026.

```
DartCool tient le score de vos parties de fléchettes, du 501 du vendredi soir au Cricket qui s'éternise.

Posez le téléphone sur le comptoir, ajoutez les joueurs, lancez : l'app s'occupe du reste.

LA CIBLE, EN GRAND
Appuyez exactement là où la fléchette est plantée. L'anneau extérieur compte un double, l'anneau intérieur un triple, le centre les 25 et le bull. Chaque appui laisse sa marque à l'endroit touché, et la troisième fléchette passe la main au joueur suivant. Aucun calcul, aucune traduction mentale.

Et si vous préférez taper les chiffres, deux autres saisies sont à un appui : le pavé (un multiplicateur, un numéro) et le total de la volée (trois chiffres et c'est au suivant).

DIX MODES DE JEU
• X01 — 501, 301, 201, 701, 1001, en sortie double, simple ou maître, avec ou sans entrée double, en manches et en sets
• Cricket — version à points, Cut-Throat ou sans points
• Tour de cadran — du 1 au 20 puis le bull, en simples, doubles ou triples
• Shanghai — une cible par tour, et la victoire immédiate au Shanghai
• Score Max — le plus gros total en un nombre de volées fixé
• Halve It — ratez la cible et votre score est coupé en deux
• Golf — 9 ou 18 trous, le moins de coups l'emporte
• Bob's 27 — les vingt doubles puis le bull, l'exercice le plus vexant qui soit
• Killer — chacun son numéro, le dernier debout gagne
• Baseball — neuf manches, neuf numéros

LE SCORE QUI PENSE AVEC VOUS
• Le reste s'affiche en grand, et la sortie conseillée apparaît dès qu'elle existe — T20 T19 D12, comme sur le circuit
• Les busts sont gérés automatiquement, le score revient à sa valeur de début de volée
• Seules les cibles utiles s'allument : au Cricket, tout ce qui ne compte pas s'éteint sur la cible
• Annulation illimitée : une erreur de saisie se répare d'un geste, même plusieurs volées en arrière
• La partie reprend là où vous l'avez laissée, même si l'app a été fermée
• L'écran reste allumé pendant la partie

LES STATISTIQUES QUI COMPTENT
Moyenne à trois fléchettes, moyenne des neuf premières, meilleure volée, 180 / 140+ / 100+, pourcentage de doubles, meilleure manche, plus haute sortie. Par partie et sur toute la carrière, joueur par joueur.

LA TABLE DES SORTIES
De 170 à 2, le chemin conseillé en sortie double, consultable à tout moment — plus les règles complètes des dix modes et le lexique des fléchettes.

GRATUIT, HORS LIGNE, SANS COMPTE
Aucune publicité, aucun abonnement, aucun achat intégré. Aucune inscription, aucune donnée collectée : tout reste sur votre téléphone, et l'app fonctionne sans connexion — pratique dans un bar où le réseau ne passe pas.
```

## Mots-clés (100 car. max, séparés par des virgules, sans espace)

```
fléchettes,darts,501,301,cricket,score,compteur,scoreur,checkout,sortie,x01,killer,bar,shanghai
```
(94 caractères)

## Nouveautés de cette version (1.0.0)

```
Première version de DartCool : onze modes de jeu, trois façons de saisir les scores, les sorties calculées en direct et les statistiques de vos soirées.
```

---

## Captures d'écran

| Taille | Dossier | Contenu |
|---|---|---|
| iPhone 6,1"/6,3" — 1206 × 2622 | `store/appstore/iphone-6.3/` | 6 captures composées, **en ligne depuis le 12/10/2026** |
| Sources brutes | `store/raw/` | captures de l'app, 1206 × 2622, sans habillage |

Ordre en ligne : cible → formats → cricket → pavé → statistiques → table des sorties.

App Store Connect n'accepte plus qu'une seule famille d'écrans iPhone : ces captures servent
pour toutes les tailles. `supportsTablet` est à `false`, **aucune capture iPad n'est exigée**.

Pour les regénérer après un changement d'interface : relancer l'app en web, reprendre les
captures brutes à 402 × 874 en densité 3, puis `npm run store:shots`.

---

## Informations pour la vérification (champ « Remarques »)

```
1. DESCRIPTION DE L'APP
DartCool est un compteur de points pour le jeu de fléchettes. L'utilisateur saisit manuellement les fléchettes lancées sur une vraie cible physique ; l'app calcule les scores, les sorties possibles et les statistiques. Il s'agit d'un outil de score, pas d'un jeu d'argent : aucun pari, aucune mise, aucune monnaie virtuelle.

2. ACCÈS
Aucun compte, aucune connexion, aucun achat intégré. L'app est entièrement gratuite et fonctionne hors ligne.

3. PARCOURS DE TEST (1 minute)
- Au premier lancement, appuyer sur la tuile « 501 ».
- Saisir un nom dans « Nouveau joueur » puis le bouton « + ». Répéter pour un deuxième joueur.
- Appuyer sur « LANCER LA PARTIE ».
- Saisir des fléchettes : appuyer sur « TRIPLE » puis « 20 » ; le score passe de 501 à 441.
- Les trois autres saisies sont accessibles en bas de l'écran : « Pavé », « Cible » (cible interactive) et « Total ».
- Le bouton flèche à droite des trois fléchettes annule la dernière saisie.

4. SERVICES EXTERNES
Aucun. Pas de backend, pas d'analytics, pas de SDK publicitaire. L'app ne fait aucune requête réseau.

5. DIFFÉRENCES RÉGIONALES
Aucune. L'app est en français et se comporte de façon identique dans tous les pays.

6. CONTENU RÉGLEMENTÉ
Aucun. Pas de jeu d'argent, pas d'alcool, pas de tabac, pas de contenu généré par les utilisateurs autre que les noms de joueurs saisis localement.
```

**Informations de connexion** : case « Connexion requise » **décochée** (l'app n'a pas de comptes).

---

## Checklist avant envoi

État au 12 octobre 2026.

### Fait
- [x] `npm run check` passe (types, lint, 70 vérifications du moteur)
- [x] URLs d'assistance et de confidentialité : **200** au `curl`, pages publiées sur GitHub Pages
- [x] Fiche App Store Connect créée — app id `6821425205`
- [x] Nom, sous-titre, catégorie **Sports**, droits de contenu
- [x] Classification par âge : **4+** sur 172 pays
- [x] Confidentialité **publiée** : « aucune donnée collectée »
- [x] Textes de la fiche en ligne, description mise à jour avec la saisie sur cible
- [x] 6 captures **1206 × 2622** chargées, dans le style actuel de l'app
- [x] « Connexion requise » décochée, coordonnées et remarques de vérification complètes
- [x] Build **1.0.0 (2)** compilé, envoyé, **disponible dans TestFlight**

### Reste à faire
- [ ] **Installer le build 2 depuis TestFlight et jouer une vraie partie** : saisie sur cible,
      double, bull, annulation, fin de manche. Étape non négociable.
- [ ] Sélectionner le build 2 sur la version
- [ ] **Ajouter pour vérification**, vérifier que la soumission contient **1 seul élément**
      (la version — aucun achat intégré à rattacher), puis envoyer
