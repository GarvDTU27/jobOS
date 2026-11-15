# JobOS — Agent Operating Manual

Version: 1.1  
Status: **Strict operating manual** for autonomous coding agents (e.g., Google Antigravity, Claude, Cursor) working in the JobOS codebase.  
Last Updated: November 2026 (Audited against active codebase).

This document governs **process and engineering discipline**—product and architectural decisions live in `masterplan.md`; the sequential task list lives in `task.md`. This file tells the agent *how to work safely, phase by phase, task by task*.

If any instruction here conflicts with a request to "just build the whole thing in one pass" or skip quality gates, **this document wins**. Do not rush or bypass architectural rules.

---

## 0. Golden Rules (Read First, Apply Always)

1. **No TypeScript**: The project uses JavaScript/JSX only (`.js`, `.jsx`). Do not introduce TypeScript or `.ts`/`.tsx` files under any circumstance.
2. **Session-Scoped Security**: Never trust client-supplied `userId`. Every query and mutation must derive user identity from the server-verified session via `getSessionOrThrow()`.
3. **No Fabricated Content**: Never fabricate resume metrics, companies, dates, or skills in AI-assisted code paths. Raw AI output must pass strict Zod validation before saving.
4. **Deterministic Domain Logic**: Scoring algorithms, skill-gap derivations, and business rules must be pure, testable functions with zero network dependencies. Never ask an LLM to guess a match percentage.
5. **Phase-Gated Development**: Never work on `main` for feature implementation. Never start a new phase before the current phase's gate has fully passed and merged.
6. **Observability**: Use `lib/logger.js` for structured JSON logging with level, timestamp, and request context. Never emit raw `console.log` containing secrets.
7. **Never Leave `main` Broken**: If a merge or commit would break the build, stop and fix forward before proceeding.
8. **Consult Documentation First**: When uncertain, re-read `masterplan.md` and the current task's acceptance criteria before improvising.

---

## 1. Before Coding (Session Start / Resume Checklist)

On the start of any work session, execute these steps in order:

1. **Review Governing Documents**: Confirm familiarity with `masterplan.md`, `task.md`, and this file (`agent.md`).
2. **Inspect Repository State**: Run `git status`, `git branch --show-current`, and `git log -n 10 --oneline`.
3. **Identify Current Branch & Phase**:
   - If on `main`: The current phase is the next unmerged phase. Confirm via `task.md` and `docs/STATUS.md`.
   - If on a `phase/NN-name` branch (e.g., `phase/07-matching`): That phase is active.
4. **Identify Next Incomplete Task**: Find the first uncompleted task in `task.md` for the active phase.
5. **Verify Dependencies**: Confirm all prerequisite tasks are complete and verified in the active code.
6. **Inspect Existing Code**: Before editing, read the relevant files completely (`read_file`). Match existing conventions for error handling, service boundaries, and naming.

---

## 2. Phase Initialization

Before starting any new phase's tasks:

```bash
git checkout main
git pull
```

1. Confirm `git status` is clean on `main`.
2. Confirm the previous phase's gate fully passed (all unit, integration, and E2E tests green; lint and build pass).
3. Create the new phase branch using the exact branch name from `task.md`:
   ```bash
   git checkout -b phase/<NN>-<short-name>
   ```
4. Verify you are on the new branch (`git branch --show-current`) before writing any code.
5. Never create a phase branch from an unverified or dirty state.

---

## 3. Task Execution Loop

For each individual task, in the order specified in `task.md`:

```
Select next incomplete task in task.md
        ↓
Verify all dependencies are satisfied in actual code
        ↓
Read existing implementation files thoroughly
        ↓
Plan specific files to create or modify
        ↓
Implement code (models → services → routes → UI)
        ↓
Run tests required by the task (and related regression tests)
        ↓
Verify every acceptance criterion line by line
        ↓
Commit with Conventional Commits message referencing task ID
        ↓
Proceed to next task
```

### Operational Rules Within the Loop
- **Bottom-Up Construction**: Build bottom-up within a task: Prisma models → service layer → REST route handlers → UI components.
- **No Unrelated Refactoring**: Do not perform sweeping refactorings while implementing a task. Note separate improvements for future tasks.
- **Write Tests Immediately**: Do not defer writing tests until the end of a phase. Implement the required tests as part of the task.
- **Handle Ambiguity Safely**: If an acceptance criterion is ambiguous, make the smallest reasonable design decision, document it in the commit message, and maintain consistency with `masterplan.md`.

---

## 4. Commit Discipline & Conventional Commits

Use structured Conventional Commits messages:
- `feat: <description>` — New feature or endpoint.
- `fix: <description>` — Bug fix.
- `test: <description>` — Adding or updating test suites.
- `docs: <description>` — Documentation updates.
- `chore: <description>` — Tooling, linting, configuration, or dependency updates.

### Examples
- `feat(JOBOS-055): implement skill normalizer with alias table and unit tests`
- `fix(JOBOS-026): correct debounce timeout in application filter component`
- `test(JOBOS-049): add unit tests with mocked Gemini provider`
- `docs: update masterplan and task checklist for phase 07`

### Commit Guidelines
- Keep commits focused on a single logical change.
- Never commit `.env`, `node_modules`, `uploads/*`, or credentials.
- Ensure `npm run lint` passes before committing.

---

## 5. Phase Completion & Quality Gates

A phase is complete only when **all** of the following gates pass:

1. **Tasks Complete**: Every task in the phase's section in `task.md` is implemented and verified.
2. **Lint Clean**: `npm run lint` passes with 0 errors and 0 warnings.
3. **Tests Pass**: Run Vitest and Playwright test suites:
   ```bash
   npm run test            # Unit & integration tests
   npm run test:coverage   # Verify test coverage reporting
   npm run test:e2e        # Playwright E2E browser tests
   ```
4. **Production Build Passes**: `npm run build` compiles successfully with Next.js standalone output.
5. **Documentation Updated**:
   - Update `task.md` checklist status (`[x]`).
   - Update `docs/STATUS.md` matrix.
   - Update `masterplan.md` if any architecture evolved.
6. **Merge to Main**:
   ```bash
   git checkout main
   git merge --no-ff phase/<NN>-<name>
   ```
7. **Post-Merge Verification**: Run `npm run build && npm run test` on `main` to confirm clean integration.

---

## 6. Code Quality & Architecture Standards

1. **Layering & Separation of Concerns**:
   - `app/api/*`: Thin Route Handlers responsible for session extraction, Zod validation, service invocation, and error mapping via `handleRouteError`.
   - `lib/services/*`: Business logic, database queries, and transaction management. Services must never import Next.js request/response objects.
   - `lib/*`: Framework-agnostic modules (parsers, matching algorithms, AI provider) testable in pure Node.js environments.
   - `components/ui/*`: Reusable accessible primitives (Button, Dialog, Input, Select, Table).
2. **Database Queries**:
   - Always scope queries by `userId` from `session.user.id`.
   - Use `prisma.$transaction` for multi-row mutations that must be atomic (e.g., status transitions, resume default swapping).
   - Use composite indexes defined in `prisma/schema.prisma` for filtering and sorting.
3. **Error Handling**:
   - Throw custom error classes from `lib/utils/errors.js` (`ValidationError`, `NotFoundError`, `ConflictError`).
   - Catch errors in route handlers with `handleRouteError(error)`, which logs via `lib/logger.js` and outputs sanitized JSON.

---

## 7. AI Integration Standards

1. **SDK Isolation**: The Google Gemini SDK is imported **only** inside `lib/ai/provider.js`. No client component or route handler may import the SDK directly.
2. **Structured JSON Validation**: Every AI call must pass a Zod schema. Output must be parsed and validated before persistence.
3. **Prompt Delimiters**: Wrap all user-supplied documents in `<untrusted_document>` XML tags to defend against prompt injection.
4. **Anti-Fabrication**: Resume tailoring prompts must explicitly forbid synthesizing ungrounded metrics, companies, or titles.
5. **No Auto-Applying**: AI-generated resume changes must be presented in a diff view for explicit user approval before saving.
6. **Mocking in Tests**: Always mock `lib/ai/provider.js` in automated tests. Never make live cloud API calls in CI.

---

## 8. File Ingestion & Parsing Standards

1. **Magic-Byte MIME Sniffing**: Inspect file buffers with `file-type`. Never trust user-supplied `Content-Type` headers or file extensions alone.
2. **File Size Bounds**: Enforce a strict 5MB upload limit. Reject oversized uploads with `413 FileTooLargeError`.
3. **Safe Storage Keys**: Store files under generated UUID-based keys (`userId/uuid.ext`). Never use client-supplied filenames for disk paths.
4. **Parser Contract**: All document parsers must implement the contract in `lib/parsers/contract.js`, returning `{ text, warnings }`.
5. **Error Cleanup**: If parsing or processing fails, clean up temporary files and mark the resume record as `FAILED` with `parseError` populated.

---

## 9. Security & Data Protection Rules

1. **Never Commit Secrets**: Never commit real API keys, passwords, or session secrets. Use `.env.example` for documentation.
2. **Zero Plaintext Passwords**: Passwords must be hashed using bcryptjs (salt rounds 10) in `lib/auth/password.js`.
3. **Cross-User Data Isolation**: Never permit User A to access User B's jobs, applications, or resumes.
4. **Sanitize Error Responses**: In production mode (`NODE_ENV=production`), never leak stack traces or internal database error messages to clients.
5. **Safe Logging**: Never log passwords, reset tokens, session cookies, or raw authorization headers.

---

## 10. Essential Development & Testing Commands

```bash
# Development server
npm run dev

# Code quality
npm run lint             # ESLint 9 verification

# Testing
npm run test             # Vitest unit and integration tests
npm run test:coverage    # Vitest with v8 code coverage reporting
npm run test:e2e         # Playwright browser end-to-end tests

# Build
npm run build            # Next.js 16 production standalone build

# Database
npx prisma generate      # Generate Prisma client
npx prisma db push       # Sync schema to PostgreSQL
npx prisma studio        # Web UI database browser

# Containerization
docker compose up -d     # Start Next.js app and PostgreSQL containers
docker compose down      # Stop containers
```
