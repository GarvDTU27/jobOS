# JobOS — Agent Operating Manual

*Strict operating manual for autonomous coding agents implementing JobOS.*

---

## 1. Golden Rules

1. **No TypeScript**: The project uses JavaScript/JSX only (`.js`, `.jsx`). Do not introduce TypeScript.
2. **Session Scoping**: Never trust client-supplied `userId`. Every query and mutation is strictly scoped to the authenticated user from `getSessionOrThrow()`.
3. **AI Safety & Anti-Fabrication**: AI assists with extraction and drafting, but never synthesizes false claims. Raw AI output must always be validated against Zod schemas before persisting to PostgreSQL.
4. **Deterministic Domain Logic**: Heuristics, skill-gap categorization, and match scores are deterministic pure functions. Never use an LLM to guess a match score.
5. **Observability**: Use `lib/logger.js` for structured JSON logging with level, timestamp, and request context.
6. **Error Standards**: Use custom error classes in `lib/utils/errors.js` (`ValidationError`, `NotFoundError`, etc.) and `handleRouteError`.
7. **Test Verification**: Always run `npm run lint` and `npm run test` before committing changes.

---

## 2. Common Commands

```bash
# Development
npm run dev              # Start development server on http://localhost:3000

# Quality & Testing
npm run lint             # ESLint 9 checks
npm run test             # Run Vitest test suite
npm run test:coverage    # Run Vitest unit tests with coverage reporting
npm run test:e2e         # Run Playwright E2E tests
npm run build            # Next.js production build

# Database & Infrastructure
npx prisma generate      # Generate Prisma client
npx prisma db push       # Sync Prisma schema to PostgreSQL
docker compose up -d     # Start PostgreSQL and Next.js app in containers
```

---

## 3. Architecture & Code Organization

- `app/(auth)/`: Authentication pages (`login`, `register`).
- `app/(dashboard)/`: Protected dashboard pages (`applications`, `jobs`, `resumes`).
- `app/api/`: REST API route handlers (`applications`, `jobs`, `resumes`, `jd/parse`, `health`).
- `components/`: UI primitives (`components/ui`) and feature components (`jobs`, `resumes`, `tracker`).
- `lib/ai/`: Gemini AI provider, prompt injection guards, and JD extraction prompts.
- `lib/auth/`: Auth.js / NextAuth configuration and password hashing.
- `lib/db/`: Prisma client singleton (`lib/db/prisma.js`).
- `lib/matching/`: Skill normalizer and alias table.
- `lib/parsers/`: Document parsers (PDF, DOCX, TXT, DOC).
- `lib/services/`: Core business logic services.
- `lib/storage/`: Abstract storage provider and local filesystem driver (`uploads/`).
- `lib/utils/`: Structured JSON logger, error classes, pagination utilities.
- `lib/validation/schemas/`: Zod validation schemas for all domain entities.

---

## 4. Current Implementation Status

See `docs/STATUS.md` for the exact feature implementation matrix and `task.md` for the sequential task checklist.
- **Phases 01–06**: Completed (Foundation, Auth, Applications, Jobs, Resumes, JD Extraction).
- **Phase 07**: In Progress (Matching Engine, Skill Normalizer done).
- **Phases 08–11**: Planned (Resume AI Assistant, Analytics, Notifications, Cloud Deploy).
