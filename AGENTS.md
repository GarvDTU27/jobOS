<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# JobOS — Agent Guidelines

JobOS is an intelligent personal Job Search Operating System built with Next.js 16 (App Router), PostgreSQL, Prisma ORM, Auth.js, and Google Gemini AI.

## Essential Commands

```bash
# Development
npm run dev              # Start Next.js development server (http://localhost:3000)

# Quality & Testing
npm run lint             # Run ESLint 9 checks
npm run test             # Run Vitest unit tests
npm run test:coverage    # Run Vitest with v8 code coverage reporting
npm run test:e2e         # Run Playwright end-to-end browser tests
npm run build            # Run Next.js production build

# Database & Infrastructure
npx prisma generate      # Generate Prisma client
npx prisma db push       # Sync Prisma schema to PostgreSQL
docker compose up -d     # Start PostgreSQL and Next.js app in containers
```

## Core Conventions

1. **Language**: JavaScript (ES2024 / JSX) only. TypeScript (`.ts`/`.tsx`) is strictly forbidden.
2. **Security**: Never accept client-supplied `userId`. Derive user identity from `getSessionOrThrow()` in all server actions and route handlers.
3. **Data Integrity**: Never let raw/unvalidated AI output write to the database. All AI interactions must pass Zod schema validation.
4. **Deterministic Logic**: Domain scoring and business rules must be pure, testable functions without network or database dependencies.
5. **Observability**: Use `lib/logger.js` for structured JSON logging with level, timestamp, and request context.
6. **Error Handling**: Use custom error classes from `lib/utils/errors.js` (`ValidationError`, `NotFoundError`, `ConflictError`) and `handleRouteError`.
