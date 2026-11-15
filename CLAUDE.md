# JobOS — Claude Assistant Guide

Full-stack personal Job Search Operating System (Next.js 16, PostgreSQL, Prisma, Auth.js, Gemini AI).

## Commands

- `npm run dev` — Run local development server (port 3000)
- `npm run lint` — Run ESLint 9 checks (`eslint .`)
- `npm run test` — Run unit tests with Vitest
- `npm run test:coverage` — Run Vitest with v8 coverage report
- `npm run test:e2e` — Run Playwright E2E tests
- `npm run build` — Build production application
- `docker compose up -d` — Start app and PostgreSQL 16 containers

## Key Conventions

- **JS/JSX Only**: Do NOT use TypeScript. Files must be `.js` or `.jsx`.
- **Auth**: Always scope DB queries using `session.user.id` via `getSessionOrThrow()`.
- **Validation**: Validate all inputs at the API boundary with Zod schemas in `lib/validation/schemas/`.
- **AI Safety**: Isolate AI calls in `lib/ai/`, guard with prompt delimiters, and parse with Zod before saving.
- **Logging**: Use `import { logger } from '@/lib/logger'` for structured JSON logging.
- **Health Check**: Available at `GET /api/health` (unauthenticated).

See `AGENTS.md` and `docs/STATUS.md` for full implementation status.
