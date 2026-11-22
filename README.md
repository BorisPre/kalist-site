# Site KALIST

Site public de l’application KALIST, en français et en anglais : présentation de l’app, sept guides de progression (première traction, muscle-up, front lever, planche, handstand, L-sit, pistol squat), bibliothèque des 94 exercices animés, blog, pages légales.

Publié par GitHub Pages depuis le dossier `docs/` de la branche `main` : https://borispre.github.io/kalist-site/

## Commandes (Node.js 24)

| Commande | Rôle |
|---|---|
| `npm run build` | Génère tout le site dans `docs/` |
| `npm run check` | Vérifie les pages : h1, titres, descriptions, hreflang, liens, ancres, images |
| `npm run serve` | Aperçu local sur http://localhost:4300/kalist-site/ |
| `npm run og` | Refait les images de partage (Chrome), puis relancer `build` |
| `npm run sync` | Recopie depuis l’app (`../KALIST`) : données des mouvements, animations, logo, police, pages légales |
| `npm run posters` | Refait l’image clé de chaque animation (Chrome), après `sync` |

Aucune dépendance npm. `scripts/images.py` (Pillow) a préparé une fois la photo, les captures et les icônes.

## Organisation

- `content/fr|en/guides|blog/*.md` : les textes. Voir **[AURA.md](AURA.md)** pour écrire un article et le plan de mots-clés.
- `src/strings.mjs` : textes de l’interface et de l’accueil. `src/site.css`, `src/site.js` : design et comportements.
- `site.config.mjs` : adresse du site, liens des stores (les boutons passent de « bientôt » à « télécharger » dès qu’ils sont remplis), vérification Search Console.
- `content/legal/` : pages légales copiées de l’app ; les modifier dans l’app puis `npm run sync`.
- `docs/` : le site généré, à committer.

## Référencement intégré

Titres et descriptions par page, URL canoniques, `hreflang` FR/EN, Open Graph et image de partage par page, données structurées (Organization, WebSite, MobileApplication, Article, BlogPosting, BreadcrumbList, FAQPage), sitemap avec traductions, flux RSS, `llms.txt` et `content.json` pour les agents IA, pages légères (aucun framework, images WebP, animations chargées seulement quand elles sont visibles).

Police Barlow (SIL Open Font License), illustrations et animations : application KALIST.
