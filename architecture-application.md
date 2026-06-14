# Architecture de l'application

```mermaid
flowchart TB
  U[Utilisateur] --> APP[Application Next.js]

  APP --> PUB_ZONE[Zone publique\napp/(public)]
  APP --> PRIV_ZONE[Zone privée\napp/(private)]
  APP --> API_ZONE[API routes\napp/api]
  APP --> MW[Middleware Clerk<br/>middleware.ts]

  MW -->|autorise / bloque / redirige| PUB_ZONE
  MW -->|autorise / bloque / redirige| PRIV_ZONE
  MW -->|protège les endpoints| API_ZONE

  subgraph PUBLIC_AREA[Public]
    HOME[Accueil]
    SIGN[Sign-in / Sign-up]
    BLOG[Blog]
    ABOUT[About]
    ADMIN[Blog admin]
  end

  subgraph PRIVATE_AREA[Privé]
    COMPANY[Dashboard company]
    MISSIONS[Gestion des missions]
    EXTRA[Dashboard extra]
  end

  subgraph BACKEND_API[Backend API]
    UAPI[Users]
    MAPI[Missions]
    BAPI[Blog]
    PRIVAPI[Private routes]
  end

  API_ZONE --> DB[(PostgreSQL)]
  DB --> PRISMA[Prisma]

  MW --> CLERK[Clerk Auth]
  API --> EXT[Services externes<br/>emails / webhooks / chiffrement]
```
