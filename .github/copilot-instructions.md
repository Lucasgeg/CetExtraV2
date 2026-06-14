# Cet Extra repository instructions

## Build, lint, and local commands

- `npm run dev` starts the Next.js app with Turbopack.
- `npm run cdev` starts Next.js without Turbopack.
- `npm run build` is the safest pre-merge check: it runs `prettier --check .`, `next build`, then `next-sitemap` through `postbuild`.
- `npm run start` serves the production build.
- `npm run format:check` checks formatting and `npm run format` rewrites it.
- `npm run studio` opens Prisma Studio.
- `npm run lint` currently calls `next lint`, which does not work with this Next 16 setup. Use ESLint directly instead:
  - Full source lint: `npx eslint "app/**/*.{ts,tsx}" "components/**/*.{ts,tsx}" "hooks/**/*.ts" "lib/**/*.ts" "store/**/*.{ts,tsx}" "types/**/*.ts" "utils/**/*.ts" middleware.ts`
  - Single-file lint: `npx eslint "app/(private)/company/page.tsx"`
- There is no automated test suite configured in `package.json`, so there is no repo-level or single-test command yet.

## High-level architecture

- This is a Next.js App Router app split into `app/(public)` and `app/(private)`. Public routes cover marketing pages, auth, and the blog; private routes cover the signed-in company/extra experience. `middleware.ts` is the main access-control layer and uses Clerk plus `sessionClaims.publicMetadata.role` to separate company, extra, and admin access.
- Persistence is centralized in PostgreSQL through Prisma. `app/lib/prisma.ts` creates the Prisma client with `@prisma/adapter-pg`, and `prisma/schema.prisma` defines the main domain: `User` is the root entity, linked one-to-one with either `Extra` or `Company`; missions are modeled with `Mission`, `RequiredPosition`, `MissionLocation`, `Invitation`, and `UserMission`; blog content lives in the same database.
- The sign-up flow is multi-step and client-driven. Components under `components/sign-up/` collect state into the Zustand `useSignUpStore`, then `VerifyingDisplay` completes Clerk email verification and posts the final payload to `app/api/users/sign-up/route.ts`, which encrypts PII, creates Prisma records, updates Clerk public metadata/profile image, and converts pending invitations into `UserMission` rows for newly created extras.
- The company staffing flow spans pages, stores, and APIs. `MissionForm` creates or edits missions through `app/api/missions/*`; the mission detail page hydrates `useUserResearchStore` from `/api/missions/[missionId]`; `MapWithUserFilter` then calls `useMapUsers`, which fetches `/api/users/nearby` to find extras near the mission and applies privacy-preserving coordinate masking by default.
- Sensitive data is intentionally encrypted at rest. `utils/crypto.ts` and `utils/keyCache.ts` handle AES-256-GCM encryption/decryption with keys fetched from Infisical; Clerk webhook updates and `/api/private/*` routes depend on that; `.github/workflows/preview-cron.yml` triggers the monthly batch re-encryption endpoint.
- The blog/admin area is a separate workflow inside the same app. Server-rendered admin pages query Prisma directly, the client `PostEditor` posts to `/api/blog` routes, SEO metadata can be generated through `components/PostEditor/action.ts`, and outbound blog mail uses Resend.

## Key conventions

- Treat Clerk as the source of truth for authentication and role metadata. New protected routes should follow the existing pattern: middleware-level protection plus route-level authorization checks.
- Preserve the existing French product copy. UI labels, validation messages, and API error messages are written in French unless an external API requires otherwise.
- Do not hardcode mission-job strings. Frontend job labels and Prisma enum values intentionally differ, so use the conversion helpers in `utils/enum.ts`.
- Reuse shared DTOs from `types/*` and `store/types/*` instead of redefining API shapes. `useUserResearchStore` is a good example: it reuses slices of `MissionDetailApiResponse` rather than duplicating mission types.
- Cross-page client state is kept in Zustand stores (`useCurrentUserStore`, `useSignUpStore`, `useUserResearchStore`) rather than React context. Follow that pattern when a workflow spans multiple screens.
- Default to privacy-preserving map behavior. Nearby-user lookups intentionally return randomized coordinates unless `privacy=false` is explicitly requested.
- Husky hooks are part of the normal workflow: pre-commit runs `bun lint-staged`, and commit messages must start with a gitmoji.
