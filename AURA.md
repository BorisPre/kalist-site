# Guide éditorial KALIST — pour AURA et pour vous

Ce site sert à faire connaître KALIST et la calisthenics, en français et en anglais. Chaque article doit répondre à une vraie question de recherche, renvoyer vers les guides et la bibliothèque, puis présenter l’application.

## 1. Où lire le contenu existant

| Source | Adresse | Usage |
|---|---|---|
| Tout le contenu structuré | `/content.json` | Articles (Markdown complet), guides, 94 exercices FR/EN |
| Flux RSS français | `/feed.xml` | Nouveaux articles et guides |
| Flux RSS anglais | `/en/feed.xml` | Idem en anglais |
| Résumé pour les IA | `/llms.txt` | Liste des pages avec une phrase chacune |
| Plan du site | `/sitemap.xml` | Toutes les pages, avec leurs traductions |

Toutes ces adresses commencent par `https://borispre.github.io/kalist-site`.

## 2. Ajouter un article

1. Créez un fichier Markdown dans `content/fr/blog/` (ou `content/en/blog/`). Le nom du fichier devient l’adresse : `content/fr/blog/abdos-calisthenics.md` → `/blog/abdos-calisthenics/`.
2. Commencez par l’en-tête :

```
---
title: Titre affiché sur la page (H1)
seo_title: Titre pour Google, 50 caractères maximum
description: Résumé pour Google et les réseaux, 120 à 155 caractères.
keyword: mot-clé principal
tags: [tag1, tag2]
image: pullup
ref: post-abdos
date: 2026-12-01
---
```

- `image` : l’identifiant d’un mouvement (liste dans `data/movements.json`, champ `id`). Son illustration sert de visuel.
- `ref` : le même identifiant dans la version française et la version anglaise. C’est ce qui relie les deux traductions pour Google.
- `updated` (facultatif) : date de mise à jour, à ajouter quand vous révisez un article.

3. Rédigez en Markdown :
   - `## Titre de section` et `### Sous-titre` ; un seul `#` est interdit (le H1 vient du `title`) ;
   - listes `- ` et `1. `, **gras**, *italique*, [liens](/guides/front-lever/), tableaux `| a | b |` ;
   - une section `## Questions fréquentes` (ou `## Frequently asked questions`) avec une question par `###` : elle devient automatiquement une FAQ structurée pour Google.

4. Blocs spéciaux :

```
::: moves pushup, pullup, dip
:::
```
Une grille de mouvements animés, liés à la bibliothèque.

```
::: step pullup
Texte de l’étape.
:::
```
Une carte d’étape avec animation, niveau, matériel, objectif et muscles (utilisée dans les guides).

```
::: note
Conseil de sécurité.
:::
```

```
::: cta Titre de l’encart
Phrase de présentation de l’application.
:::
```
L’encart de téléchargement de KALIST (les boutons se mettent à jour seuls quand l’app est publiée).

5. Publiez :

```
npm run build && npm run og && npm run build && npm run check
git add -A && git commit -m "Article : abdos calisthenics" && git push
```

`npm run check` doit afficher 0 erreur. GitHub Pages publie en une à deux minutes.

## 3. Règles éditoriales

- **Une intention par article** : une question précise, un mot-clé principal dans le titre, le premier paragraphe, un H2 et la description.
- **800 à 1 500 mots**, des H2 qui répondent chacun à une sous-question, des listes et des tableaux pour les programmes.
- **Liens internes** : au moins un guide de progression, la bibliothèque d’exercices (`/exercices/#id`) et un autre article.
- **Santé** : conseils généraux, jamais de promesse de résultat chiffrée ni de diagnostic. Formulations prudentes (« souvent », « selon votre point de départ »), rappel de s’arrêter en cas de douleur.
- **Vérité sur l’app** : 94 mouvements, 24 programmes (4 gratuits), 7 parcours, coach caméra sur l’appareil, aucune image envoyée, 5 langues. Pas de prix tant qu’ils ne sont pas fixés dans les stores. Pas de communauté ni de ligues (masquées dans l’app pour l’instant).
- **Anglais** : adapter, pas traduire mot à mot. Les recherches anglaises utilisent d’autres formulations (« progression », « for beginners », « how to »).
- **Ton** : tutoiement interdit en français (vouvoiement, comme dans l’app), phrases courtes, concret.

## 4. Mots-clés

Les volumes ne sont pas mesurés ici : ce sont des estimations d’après la structure des recherches. Validez-les avec Google Search Console (dès que le site est indexé) et le Planificateur de mots-clés Google Ads (gratuit). Stratégie : viser d’abord la **longue traîne** (3 mots et plus, intention précise), moins concurrencée que « calisthenics » ou « street workout » seuls, et le **français**, bien moins concurrencé que l’anglais.

### Pages déjà en ligne

| Page | Mot-clé principal | Intention |
|---|---|---|
| Accueil FR | application calisthenics | Trouver une app |
| Accueil EN | calisthenics app | Trouver une app |
| Guide première traction | première traction | Apprendre |
| Guide muscle-up | apprendre le muscle up | Apprendre |
| Guide front lever | front lever progression | Apprendre |
| Guide planche | planche calisthenics progression | Apprendre |
| Guide handstand | apprendre le handstand | Apprendre |
| Guide L-sit | L-sit progression | Apprendre |
| Guide pistol squat | pistol squat progression | Apprendre |
| Bibliothèque FR | exercices calisthenics | Liste |
| Programme débutant | programme calisthenics débutant | Plan d’entraînement |
| Maison sans matériel | calisthenics maison sans matériel | Plan d’entraînement |
| Street workout | street workout calisthenics différence | Comprendre |
| EN équivalents | first pull up progression, muscle up progression, front lever progression, planche progression, handstand progression for beginners, l sit progression, pistol squat progression, beginner calisthenics program, calisthenics at home no equipment, street workout vs calisthenics | Mêmes intentions |

### Prochains articles conseillés (par priorité)

| # | Français | Anglais | Concurrence estimée |
|---|---|---|---|
| 1 | Combien de tractions pour faire un muscle-up ? | How many pull-ups for a muscle-up? | Faible |
| 2 | Pompes diamant : technique et muscles travaillés | Diamond push-ups: muscles worked and form | Moyenne |
| 3 | Tractions australiennes : le guide complet | Australian pull-ups: complete guide | Faible |
| 4 | Dips : technique, variantes et erreurs | Dips form guide for beginners | Moyenne |
| 5 | Échauffement calisthenics : poignets et épaules | Calisthenics warm-up for wrists and shoulders | Faible |
| 6 | Hollow body : l’exercice de gainage de base | Hollow body hold: how to and progressions | Faible |
| 7 | Calisthenics après 40 ans : par où commencer | Calisthenics over 40: how to start | Faible |
| 8 | Calisthenics pour les femmes : programme débutant | Calisthenics for women beginners | Moyenne |
| 9 | Dragon flag : progression étape par étape | Dragon flag progression | Faible |
| 10 | Back lever : progression et précautions | Back lever progression | Faible |
| 11 | Drapeau humain : progression | Human flag progression | Faible |
| 12 | Barre de traction de porte : bien la choisir et l’installer | Doorway pull-up bar: how to choose | Moyenne |
| 13 | Parallettes : pourquoi et comment les utiliser | Parallettes exercises for beginners | Faible |
| 14 | Anneaux de gymnastique : 10 exercices pour débuter | Gymnastic rings exercises for beginners | Moyenne |
| 15 | Pompes : 10 variantes du débutant à l’avancé | Push-up progression from beginner to advanced | Moyenne |
| 16 | Combien de temps pour voir des résultats en calisthenics ? | How long to see calisthenics results | Moyenne |
| 17 | Calisthenics ou musculation : que choisir ? | Calisthenics vs weights | Moyenne |
| 18 | Parcs de street workout : comment s’y entraîner | How to train at a street workout park | Faible |
| 19 | Tractions supination ou pronation : différences | Chin-ups vs pull-ups | Moyenne |
| 20 | Squat bulgare au poids du corps : technique | Bodyweight Bulgarian split squat | Faible |

Rythme réaliste : un article par semaine en français, sa version anglaise la semaine suivante.

## 5. Suivi

1. Ajoutez la propriété du site dans [Google Search Console](https://search.google.com/search-console) (méthode « balise HTML » : collez la valeur dans `site.config.mjs › googleSiteVerification`, puis rebuild).
2. Envoyez le sitemap : `https://borispre.github.io/kalist-site/sitemap.xml`.
3. Après quelques semaines, l’onglet « Performances » montre les vraies requêtes : enrichissez les pages qui apparaissent en positions 8 à 20.

Un nom de domaine (par exemple `kalist.fr`) améliorera la confiance et la mémorisation : changez `siteUrl` et `basePath` dans `site.config.mjs`, ajoutez le domaine dans GitHub Pages, puis rebuild.
