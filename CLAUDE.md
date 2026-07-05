# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Cet Extra: a Next.js platform matching event/catering companies (`company`) with temporary staff (`extra`) for missions/jobs. Frontend copy and domain vocabulary are in French.

## Commands

This repo uses **Bun** (lockfile is `bun.lock`; hooks call `bun`/`bunx`).

- Install: `bun install`
- Dev (Turbopack): `bun run dev`
- Dev (no Turbopack): `bun run cdev`
- Lint: `bun run lint`
- Type-check: `bun tsc --noEmit`
- Build (runs Biome check, then `next build`): `bun run build`
- Production build (Vercel, runs Prisma migrate + sitemap): `bun run vercel-build`
- Format: `bun run format`
- Check formatting only: `bun run format:check`
- Prisma Studio: `bun run studio`
- Preview React Email templates: `bun run email`

There is no test runner configured in `package.json` — no unit/integration test command exists yet.

## Architecture

- `app/(public)`: marketing/auth/blog routes (`/`, `/about`, `/blog`, `/sign-in`, `/sign-up`).
- `app/(private)`: authenticated, role-specific routes (`/company`, `/extra`).
- `app/api/**/route.ts`: API route handlers (missions, users, companies, blog, address, private/batch jobs).
- `middleware.ts`: central access-control gateway — combines Clerk auth with `sessionClaims.publicMetadata.role` against route matchers (public, protected, role-specific, blog admin) and performs role-based redirects.
- `app/lib/prisma.ts`: singleton Prisma client (Prisma 7, `@prisma/adapter-pg`, configured via `prisma.config.ts`; datasource URL via `DIRECT_URL`).
- `prisma/schema.prisma`: domain model — `User`, `Extra`, `Company`, `Mission`, `RequiredPosition`, `UserLocation`/`MissionLocation`, `UserMission`, `Invitation`, `BlogPost`/`BlogComment`/`BlogSubscriber`, `ExtraMissionJob`, plus enums (`MissionJob`, `Role`, `UserMissionStatus`, `MissionStatus`, `BusinessSector`, etc.).
- `store/`: Zustand client state (`useSignUpstore`, `useCurrentUserStore`, `useUserResearchStore`).
- `hooks/`: shared React hooks (`useFetch`, `useDebounce`, `useMapUser`, `useModalStack`, etc.).
- `utils/`: cross-cutting helpers — `enum.ts` (mission job mapping), `prismaErrors.util.ts`, `security.ts`/`crypto.ts`, `distance.utils.ts`, `map.util.ts`, `date.ts`.

## Conventions

- **Auth & roles**: never infer roles from UI state. Authorization is based on Clerk session claims (`sessionClaims.publicMetadata.role`, values `company` | `extra`) checked in middleware/API routes. Admin blog/API routes check `ADMIN_USER_ID`. Internal cron-triggered private routes check the `X-Cron-Secret` header.
- **Dynamic API route params**: typed as `Promise<{ ... }>` and awaited inside the handler (Next.js 16 convention used throughout existing routes).
- **MissionJob mapping**: frontend labels (French) and the Prisma `MissionJob` enum differ. Always convert via `utils/enum.ts`'s `convertToDbMissionJob` / `convertToFrontendMissionJob` rather than ad-hoc mapping.
- **Prisma errors**: use `handlePrismaError` (`utils/prismaErrors.util.ts`) to produce consistent API error responses.
- **Imports**: use the `@/*` path alias (see `tsconfig.json`) instead of deep relative paths.
- **Lint & formatting**: **Biome** (`biome.jsonc`) replaces ESLint and Prettier — see [docs/adr/0001-biome-replaces-eslint-prettier.md](./docs/adr/0001-biome-replaces-eslint-prettier.md). Enforces double quotes, semicolons, no trailing commas, and Tailwind class sorting (`nursery/useSortedClasses`, configured for `cn`/`clsx`/`cva`). `bun run build` runs `biome ci .` and fails on lint or format errors. Accessibility/correctness rules newly surfaced by Biome's recommended preset (not previously checked by ESLint) are intentionally kept at `warn` so they don't block the build; suppress new violations with `// biome-ignore <rule>: reason` (or `// biome-ignore-all <rule>: reason` for a whole file) only when justified, not to silence real bugs.
- **Git hooks**: pre-commit runs `bun lint-staged`, which reads `.lintstagedrc.js` (NOT the `lint-staged` key in `package.json`, which doesn't exist) — runs `tsc --noEmit` and `biome check --write --unsafe` on staged `.ts`/`.tsx`/`.js` files; commit-msg requires the first line to start with an official gitmoji (enforced by `.husky/commit-msg`).

## Key flows

- **Signup (company/extra)**: form state in `store/useSignUpstore.ts` → `app/api/users/sign-up/route.ts` creates `User` + linked `Company`/`Extra` → Clerk `publicMetadata.role` is updated → for an `extra`, existing `Invitation`s are transferred to `UserMission`.
- **Missions (company)**: create via `app/api/missions/route.ts`; list for a company via `app/api/companies/[companyId]/missions/route.ts`; cancellation (with email notifications) via `app/api/missions/[missionId]/cancel/route.ts`.
- **Blog & email**: CRUD under `app/api/blog/**`; newsletter sending via `app/api/blog/send-mails/route.ts` (Resend).
- **Monthly security batch (currently disabled/no-op)**: `.github/workflows/preview-cron.yml` still calls `/api/private/batchs/security/encrypt` (secured by `X-Cron-Secret`) monthly, and it still emails an admin report, but the actual encryption logic was removed (see `2a199cc`) — `app/api/private/encrypt` and `app/api/private/decrypt` are now no-op passthroughs, so the batch just rewrites sensitive fields unchanged rather than re-encrypting them. To be reworked; don't assume data is actually being re-encrypted today.

## Critical environment variables

`DATABASE_URL`, `DIRECT_URL`, `CLERK_SECRET_KEY`, `ADMIN_USER_ID`, `SVIX_SECRET_WEBHOOKS`, `X_CRON_SECRET`, `RESEND_API_KEY`, `INFISICAL_CLIENT_ID`/`INFISICAL_CLIENT_SECRET`/`INFISICAL_WORKSPACE_ID`, `VERCEL_ENV`.
