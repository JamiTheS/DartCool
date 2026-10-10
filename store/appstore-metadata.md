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

> ⚠️ Ces trois URLs supposent un dépôt GitHub `DartCool` sur le compte `jamithes`, avec
> **GitHub Pages activé sur le dossier `/docs` de la branche `main`**. Si le compte ou le nom du
> dépôt changent, mettre à jour **`src/data/links.ts`** *et* les champs d'App Store Connect.
> Avant chaque soumission : `curl -s -o /dev/null -w "%{http_code}" <url>` doit répondre **200**.

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

```
DartCool tient le score de vos parties de fléchettes, du 501 du vendredi soir au Cricket qui s'éternise.

Posez le téléphone sur le comptoir, ajoutez les joueurs, lancez : l'app s'occupe du reste.

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

TROIS FAÇONS DE SAISIR, AU CHOIX
• Le pavé : un appui sur le multiplicateur, un appui sur le numéro. Il revient tout seul sur « simple » pour éviter les erreurs.
• La vraie cible : appuyez exactement là où la fléchette est plantée, doubles et triples compris.
• Le total de la volée : trois chiffres et c'est au suivant, quand ça va vite.

LE SCORE QUI PENSE AVEC VOUS
• Le reste s'affiche en grand, et la sortie conseillée apparaît dès qu'elle existe — T20 T19 D12, comme sur le circuit
• Les busts sont gérés automatiquement, le score revient à sa valeur de début de volée
• Seules les cibles utiles s'allument : au Cricket, le 1 au 14 s'efface ; au Tour de cadran, seule votre cible reste visible
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
| iPhone 6,9" — 1290 × 2796 | `store/appstore/iphone-6.9/` | 7 captures composées |
| Sources brutes | `store/raw/` | captures de l'app, 1290 × 2796, sans habillage |

Ordre proposé : modes → X01 et sortie → saisie sur cible → cricket → statistiques → table des
sorties → règles.

`supportsTablet` est à `false` dans `app.json` : **aucune capture iPad n'est exigée**.

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

- [ ] `npm run check` passe (types, lint, moteur)
- [ ] Build EAS installé et ouvert sur un iPhone réel : l'app démarre, une partie complète se joue
- [ ] Les deux URLs (assistance, confidentialité) répondent **200** au `curl`
- [ ] Les pages web sont **commitées et poussées**, GitHub Pages activé sur `/docs`
- [ ] Captures 6,9" chargées dans App Store Connect
- [ ] Classification par âge remplie (4+)
- [ ] Confidentialité publiée : « aucune donnée collectée »
- [ ] « Connexion requise » décochée
- [ ] Remarques pour la vérification collées
- [ ] Build sélectionné sur la version, puis **Ajouter pour vérification**
- [ ] Dans « Vérification de l'app », la soumission contient bien **1 élément** (la version) —
      il n'y a aucun achat intégré à rattacher dans cette app
