# Biome remplace ESLint et Prettier

Le projet utilisait ESLint (`eslint-config-next`) pour le lint et Prettier (+ `prettier-plugin-tailwindcss`) pour le formatage, avec deux outils distincts à exécuter et configurer (`eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`). On remplace les deux par **Biome**, un outil unique plus rapide qui gère lint + format + tri des classes Tailwind via une seule config (`biome.json`).

## Considered Options

- **Hybride** (Biome pour format/lint général + ESLint allégé pour les règles spécifiques Next.js comme `no-img-element`, `no-html-link-for-pages`) — rejeté : complexité de maintenir deux outils pour un gain de couverture jugé secondaire sur ce projet.
- **Remplacement total** (retenu) — un seul outil, configuration plus simple, au prix de la perte des règles Next-spécifiques et du support Markdown/YAML/TOML (Biome ne formate pas ces formats ; impact limité ici : `README.md`, `CONTEXT.md`, `.github/copilot-instructions.md`).

## Consequences

- `bun run build` exécute désormais `biome ci .` (lint + format) avant `next build` : le build casse maintenant sur une erreur de lint, ce qui n'était pas garanti avant (le lint n'était vérifié que via `bun run lint`, à part).
- Le tri automatique des classes Tailwind est conservé via la règle `nursery/useSortedClasses` de Biome (configurée pour `cn`, `clsx`, `cva`), une règle encore expérimentale — à surveiller si Biome change son comportement dans une future version.
- Les fichiers Markdown/YAML/TOML (peu nombreux dans ce repo) ne sont plus auto-formatés par l'outillage ; ils restent formatés manuellement si besoin.
