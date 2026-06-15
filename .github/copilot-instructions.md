# Copilot instructions for CetExtraV2

## Build, lint, and test commands

Use Bun in this repository (lockfile is `bun.lock`, hooks call `bun`/`bunx`).

- Install dependencies: `bun install`
- Run dev server (Turbo): `bun run dev`
- Run dev server (without Turbo): `bun run cdev`
- Lint: `bun run lint`
- Type-check: `bun tsc --noEmit`
- Build (includes Prettier check before Next build): `bun run build`
- Production build with Prisma migration + sitemap (Vercel script): `bun run vercel-build`
- Format all files: `bun run format`
- Check formatting only: `bun run format:check`

Test status:

- No test runner or test script is currently configured in `package.json`.
- Single-test command: not available until a test framework is added.

## High-level architecture

This is a Next.js App Router app with a clear split between public and authenticated product areas:

- `app/(public)` contains marketing/auth/blog routes (`/`, `/about`, `/blog`, `/sign-in`, `/sign-up`).
- `app/(private)` contains role-specific product routes (`/company`, `/extra`) and related pages.
- `middleware.ts` is the main access-control gateway: it combines Clerk auth with `sessionClaims.publicMetadata.role` and route matchers (public, protected, role-specific, and blog admin).

Core backend shape:

- API routes live under `app/api/**/route.ts`.
- Data access uses Prisma + PostgreSQL (`prisma/schema.prisma`) with Prisma 7 config in `prisma.config.ts` and a Prisma client initialized in `app/lib/prisma.ts` using `@prisma/adapter-pg`.
- Domain centers on users (`company` vs `extra` roles), missions, invitations, and blog content.

Important cross-cutting flows:

- Signup flow spans frontend store/types (`store/`) and backend provisioning (`app/api/users/sign-up/route.ts`), then syncs role metadata to Clerk (`publicMetadata.role`).
- Mission lifecycle is handled through company-facing APIs/pages (`app/api/missions*`, `app/api/companies/[companyId]/missions/route.ts`, `app/(private)/company/**`).
- Blog/admin flow is protected with `ADMIN_USER_ID` checks in API routes (for post creation and newsletter sends).
- Monthly security batch job is triggered by GitHub Actions (`.github/workflows/preview-cron.yml`) and hits `/api/private/batchs/security/encrypt` secured by `X-Cron-Secret`.

## Key repository conventions

- **Auth + roles:** Do not infer roles from UI state; authorization relies on Clerk session claims (`sessionClaims.publicMetadata.role`) and middleware/API checks.
- **Route handlers:** In dynamic API routes, params are typed as `Promise<{ ... }>` and awaited inside handlers (Next.js 16 style used across existing routes).
- **Mission job enums:** Frontend labels and Prisma enum values differ; use helpers in `utils/enum.ts` (especially `convertToDbMissionJob` / `convertToFrontendMissionJob`) instead of ad-hoc mapping.
- **Error handling for Prisma:** Prefer `handlePrismaError` from `utils/prismaErrors.util.ts` for consistent DB error messages and HTTP statuses.
- **Imports:** Use the `@/*` path alias (configured in `tsconfig.json`) instead of deep relative paths.
- **Formatting/lint style:** Prettier enforces double quotes, semicolons, no trailing commas, and Tailwind class sorting (`prettier-plugin-tailwindcss`).
- **Git hooks:** Pre-commit runs `bun lint-staged`; commit messages must start with a gitmoji (validated by `.husky/commit-msg`).
