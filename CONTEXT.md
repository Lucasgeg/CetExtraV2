# CONTEXT — CetExtraV2

## Objectif produit

Plateforme **Cet Extra** (FR) pour mettre en relation des entreprises de l’évènementiel (**company**) et des extras (**extra**) autour de missions.

## Language

**Invitation (à une mission)** :
Proposition initiée par l’employeur vers un extra ; c’est à l’extra de répondre. État d’attente : `pending`.
_Avoid_ : candidature, demande

**Candidature (à une mission)** :
Demande initiée par l’extra sur une mission visible publiquement ; c’est à l’employeur de répondre. État d’attente : `requested`. Si l’employeur veut inviter un extra déjà candidat, cela vaut acceptation directe de la candidature.
_Avoid_ : invitation, postulation

**Mission publique** :
Mission que l’employeur n’a pas retirée de la diffusion publique (intention, opt-out possible mission par mission).
_Avoid_ : mission publiée, mission visible

**Fourchette de taux horaire** :
Plage indicative (min–max) affichée sur l’annonce publique d’une mission. Optionnelle (les deux bornes ou aucune, min ≤ max) ; n’engage pas le taux contractuel.
_Avoid_ : salaire, taux de la mission

**Taux horaire (contractuel)** :
Taux réellement convenu pour un extra donné sur une mission donnée, porté par l’engagement individuel.
_Avoid_ : fourchette

**Mission visible (au listing public)** :
Mission effectivement affichée sur la partie publique du site. Toujours calculée, jamais stockée : publique **et** localisée **et** pas encore commencée **et** au moins un poste non pourvu **et** non annulée/terminée.
_Avoid_ : mission publique (l’intention seule ne suffit pas)

**Poste pourvu** :
Poste requis (jobType, quantité) dont le nombre d’engagements `accepted` atteint la quantité. Les invitations et candidatures en attente ne réservent pas de place.
_Avoid_ : poste réservé, poste invité

## Stack technique

- **Next.js 16** (App Router) + **React 19** + TypeScript strict
- **Prisma 7** + PostgreSQL (`@prisma/adapter-pg`)
- **Clerk** pour auth/session + rôles via `sessionClaims.publicMetadata.role`
- **Tailwind CSS** + composants UI (shadcn-like + composants custom)
- **Bun** utilisé dans les scripts/hooks

## Commandes utiles

- Install: `bun install`
- Dev (Turbopack): `bun run dev`
- Dev (classique): `bun run cdev`
- Lint: `bun run lint`
- Typecheck: `bun tsc --noEmit`
- Build: `bun run build`
- Build prod Vercel (migrate + sitemap): `bun run vercel-build`
- Format: `bun run format`
- Check format: `bun run format:check`

> État des tests: **pas de runner de tests configuré** dans `package.json` (pas de commande de test unitaire/intégration à ce jour).

## Architecture globale

- `app/(public)`: pages publiques et auth (`/`, `/about`, `/blog`, `/sign-in`, `/sign-up`)
- `app/(private)`: espaces connectés (`/company`, `/extra`)
- `app/api/**/route.ts`: API routes (missions, users, blog, address, private)
- `middleware.ts`: point central de contrôle d’accès (public/protected/admin + redirections role-based)
- `app/lib/prisma.ts`: client Prisma singleton
- `prisma/schema.prisma`: modèle métier (users, company, extra, missions, invitations, blog)
- `store/`: état client Zustand (ex: signup, current user)
- `utils/`: helpers métier transverses (enums jobs, sécurité, erreurs Prisma, distance, etc.)

## Conventions importantes du projet

### 1) Auth & autorisation

- Les accès reposent sur Clerk + `publicMetadata.role` (`company` | `extra`) et non sur l’UI.
- Certaines routes admin blog/API vérifient `ADMIN_USER_ID`.
- Les routes privées techniques vérifient `X-Cron-Secret` pour les appels cron internes.

### 2) Prisma / DB

- Prisma 7 est configuré via `prisma.config.ts` (URL datasource via `DIRECT_URL`).
- `schema.prisma` garde uniquement `provider = "postgresql"` côté datasource.
- Utiliser `handlePrismaError` (`utils/prismaErrors.util.ts`) pour homogénéiser les erreurs API.

### 3) Mapping des métiers “MissionJob”

- Les valeurs frontend (labels FR) et DB (enum Prisma) diffèrent.
- Toujours passer par `utils/enum.ts` :
  - `convertToDbMissionJob`
  - `convertToFrontendMissionJob`

### 4) Styles/imports/outillage

- Alias import: `@/*` (défini dans `tsconfig.json`)
- Lint + format + tri Tailwind via **Biome** (`biome.jsonc`), un seul outil remplaçant ESLint et Prettier (voir [ADR 0001](./docs/adr/0001-biome-replaces-eslint-prettier.md))
- Hook pre-commit: `.lintstagedrc.js` (tsc --noEmit + `biome check --write --unsafe` sur les fichiers stagés)
- Hook commit-msg: message doit commencer par un gitmoji

## Flows métier clés

### Signup (company/extra)

1. Front gère le formulaire via Zustand (`store/useSignUpStore.ts`)
2. API `app/api/users/sign-up/route.ts` crée User + entité liée (Company ou Extra)
3. Metadata Clerk mise à jour avec le rôle (`publicMetadata.role`)
4. Pour un extra: transfert des invitations existantes vers `UserMission`

### Missions (company)

- Création mission: `app/api/missions/route.ts`
- Liste mission entreprise: `app/api/companies/[companyId]/missions/route.ts`
- Annulation mission + notifications email: `app/api/missions/[missionId]/cancel/route.ts`

### Blog & emails

- CRUD posts/comments sous `app/api/blog/**`
- Envoi newsletter: `app/api/blog/send-mails/route.ts` (Resend)

### Batch de sécurité mensuel

- Workflow GitHub Actions: `.github/workflows/preview-cron.yml`
- Appel endpoint: `/api/private/batchs/security/encrypt`
- Usage: rotation/retraitement batch de données sensibles + rapport email admin

## Variables d’environnement critiques (non exhaustif)

- `DATABASE_URL`, `DIRECT_URL`
- `CLERK_SECRET_KEY`, `ADMIN_USER_ID`
- `SVIX_SECRET_WEBHOOKS`
- `X_CRON_SECRET`
- `RESEND_API_KEY`
- `INFISICAL_CLIENT_ID`, `INFISICAL_CLIENT_SECRET`, `INFISICAL_WORKSPACE_ID`
- `VERCEL_ENV`
