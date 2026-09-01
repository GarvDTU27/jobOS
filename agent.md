# JobOS — Agent Operating Manual

This document is the **strict operating manual** for any autonomous coding agent (e.g., Google Antigravity) implementing JobOS. It governs process, not product decisions — product/architecture decisions live in `masterplan.md`; the task list lives in `task.md`. This file tells the agent *how to work*, phase by phase, task by task, safely.

If any instruction here conflicts with a request to "just build the whole thing" or to skip ahead, **this document wins**. Do not build the entire application in one pass.

---

## 0. Golden Rules (read first, apply always)

1. Never work on `main` for feature implementation. `main` only receives merges.
2. Never start a new phase before the current phase's gate has fully passed and merged.
3. Never skip ahead to a future phase's tasks, even if they seem quick.
4. Never introduce TypeScript, Docker, Redis, Kafka, Elasticsearch, or microservices without following the Architecture Change process (§9).
5. Never fabricate resume content in AI-assisted code paths, and never let unvalidated AI output reach the database.
6. Never trust a client-supplied `userId`; every query is scoped by the authenticated session's user.
7. Never leave `main` broken. If a merge would break `main`, stop and fix forward before merging.
8. When uncertain, re-read `masterplan.md` and the current task's acceptance criteria before improvising.

---

## 1. Before Coding (session start / resume checklist)

On the start of any work session, in order:

1. Read `masterplan.md` in full (or re-confirm familiarity if already read this session).
2. Read `task.md` in full (or re-confirm familiarity).
3. Read this file, `agent.md`, in full.
4. Inspect the repository (`ls`, `git status`, `git log --oneline -20`).
5. Run `git branch --show-current` to identify the current branch.
6. Determine the current phase:
   - If on `main`: the current phase is the next phase whose branch does not exist yet and whose predecessor phase is merged. Confirm by checking `task.md` for the last phase with all tasks checked off in commit history / `task.md` status annotations (see §5 for how completion is tracked in this file).
   - If on a `phase/NN-name` branch: that branch's phase is current.
7. Identify the first incomplete task in the current phase (in task ID order, per `task.md`).
8. Check that task's `Dependencies` field — confirm all dependency tasks are already complete (their code exists and their acceptance criteria were met). If a dependency is incomplete, work on the dependency first, even if it's earlier in the list than expected.
9. Before modifying any existing file, `view` it. Do not blind-edit. Understand existing conventions (naming, error handling patterns, service-layer shape) before adding new code, and match them.

---

## 2. Phase Initialization

Before starting **any** new phase's tasks:

```bash
git checkout main
git pull            # or equivalent local sync if no remote configured
```

1. Confirm `git status` is clean on `main`.
2. Confirm the *previous* phase's gate (see §6) fully passed. If it did not, stop — go fix the previous phase, do not start a new one on top of an unfinished one.
3. Create the new phase branch:

```bash
git checkout -b phase/<NN>-<short-name>
```

Use the exact branch name given in `task.md`'s phase header (e.g., `phase/03-application-tracker`).

4. Verify you are on the new branch (`git branch --show-current`) before writing any code.
5. Never create a phase branch from anything other than up-to-date `main`.
6. Never begin a new phase while uncommitted work exists on the previous phase's branch — that work must be committed and merged (or explicitly abandoned with the user's confirmation) first.

---

## 3. Task Execution Loop

For each task, in the order given in `task.md`:

```
Select next incomplete task
        ↓
Re-check dependencies are actually satisfied in the current code (not just assumed)
        ↓
Inspect existing implementation relevant to this task (view files, don't guess)
        ↓
Plan the specific files to add/change
        ↓
Implement
        ↓
Run the tests required by the task (and any existing tests that touch the same area)
        ↓
Re-read the task's acceptance criteria line by line; confirm each is actually satisfied
        ↓
Commit (small, meaningful commit — see §4)
        ↓
Move to next task
```

Rules within this loop:

- Do not implement multiple unrelated tasks in a single commit.
- Do not implement a task's UI before its underlying API/service exists, even if both are in the same task list position — build bottom-up (models → services → routes → UI) within a task where the task spans layers.
- Do not perform "unrelated refactoring" while implementing a task. If you notice something that should change elsewhere, note it (e.g., as a TODO comment or a follow-up mentioned in the commit body) rather than expanding scope silently.
- Do not skip writing the tests a task specifies, even if the feature "obviously works." Acceptance is defined by tests + criteria, not by manual spot-checking alone.
- If a task's acceptance criteria cannot be met because of a gap in `masterplan.md` or `task.md` (missing detail, contradiction), do not silently improvise a major decision — apply the Architecture Change process (§9) or, for a minor clarification, make the smallest reasonable decision, document it in the commit message, and continue.

---

## 4. Commit Discipline

Use Conventional-Commits-style prefixes: `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`.

Good:
```
feat: add application database models
feat: add application creation API
test: add application API integration tests
fix: handle duplicate status transition race
```

Bad (too large / vague):
```
finished application tracker
wip
misc changes
```

Guidelines:
- One logical change per commit. A task frequently spans 2–5 commits (model → service → route → UI → tests), which is expected and preferred over one giant commit.
- Every commit that adds a feature should either include its tests or be immediately followed by a `test:` commit before moving to the next task — do not defer all testing to the end of a phase.
- Never commit `.env.local`, `node_modules`, `uploads/`, or any secret value.
- Never commit generated Prisma migration artifacts that weren't produced by `prisma migrate dev` against the actual schema change (i.e., don't hand-write migration SQL unless there's a documented reason, noted in the commit body).

---

## 5. Tracking Task Completion

`task.md` is a planning document; do not rewrite its prose. Track completion via:
1. Git history (commits reference task IDs where practical, e.g., `feat: JOBOS-018 create application service`), and
2. A running checklist the agent maintains in `docs/progress.md` (create this file in Phase 01 if it doesn't exist) with one line per task: `- [x] JOBOS-001 — Initialize Next.js project` / `- [ ] JOBOS-018 — ...`. Update this file as part of the commit that completes each task.

Before starting a session, `docs/progress.md` combined with `git log` is the source of truth for "what's already done" — trust it over memory.

---

## 6. Phase Completion (the Phase Gate)

A phase is done only when **all** of the following pass, in this order:

1. **All tasks complete.** Every task in the phase's `task.md` section is implemented and its acceptance criteria verified.
2. **Full phase test suite passes.** Run the project's actual test commands:
   ```bash
   npm run test
   npm run test:integration   # if defined separately
   npm run test:e2e           # for phases with E2E-tagged tasks
   ```
3. **Lint passes.** `npm run lint`
4. **Production build passes.** `npm run build`
5. **No known critical defects.** Re-read the phase's stated objective in `task.md` and manually confirm the end-to-end flow it describes actually works against a dev server.
6. **Documentation updated:**
   - `docs/progress.md` fully checked off for the phase.
   - `masterplan.md` updated if any architectural decision changed during implementation (see §9).
   - New ADRs added under `docs/adr/` if a decision from masterplan §58's candidate list (or a new one) was made concrete this phase.
7. **Git clean and committed.** `git status` shows no uncommitted changes.
8. **Merge to `main`:**
   ```bash
   git checkout main
   git pull
   git merge --no-ff phase/<NN>-<name>
   ```
   Use `--no-ff` so the phase remains visible as a distinct merge commit in history.
9. **Verify `main` post-merge.** On `main`, run `npm install && npm run build && npm run test` again — confirm nothing broke in the merge. If something did, fix forward on `main` immediately (small fix) or revert the merge and return to the phase branch to fix properly — do not leave `main` broken while investigating.
10. Only after step 9 succeeds may Phase Initialization (§2) begin for the next phase.

Never merge a phase branch that fails any of steps 2–5.

---

## 7. Code Quality Standards

- JavaScript/JSX only. If a `.ts`/`.tsx` file is ever created (e.g., by a scaffolding tool's default), delete/convert it before committing.
- Follow the folder structure and layering in `masterplan.md` §16–§18: Route Handlers are thin, business logic lives in `lib/services/*`, domain logic (matching, parsing) lives in framework-agnostic `lib/*` modules.
- Reuse existing `components/ui/*` primitives rather than creating one-off styled elements.
- Every new Route Handler must: check auth, validate input with the relevant Zod schema, delegate to a service, map errors via `handleRouteError` (masterplan §44).
- Every new service function that touches the database must scope queries by `userId` unless it is explicitly a system-level function (rare; document why if so).
- Avoid adding a new npm dependency unless the task or masterplan calls for it; if a task seems to need one not mentioned in `masterplan.md` §13, treat it as a (likely minor) Architecture Change (§9) — usually a one-line note is enough for a small utility library, but never for anything infrastructural (queues, containers, alternate databases).

---

## 8. Database Rules

- All schema changes go through `prisma/schema.prisma` + `npx prisma migrate dev --name <description>`. Never hand-edit the database directly and never hand-write migration SQL except for narrow cases (e.g., adding a `pg_trgm` extension/index) that Prisma's schema DSL can't express — and even then, generate it via `prisma migrate dev --create-only` and edit the generated SQL file, don't bypass Prisma's migration tracking.
- Add indexes whenever a new query path filters/sorts/joins on a column at scale (see masterplan §21 for the baseline set) — don't wait for a performance problem to appear for the well-known access patterns already specified there.
- Use `prisma.$transaction` for any multi-row write that must be atomic (status transitions, resume-default-swap, match-analysis-plus-skill-gaps, etc.) — masterplan §19/§32/§37 call these out explicitly; extend the same discipline to any new multi-row write.
- Never write a service function that accepts a raw `userId` parameter from anywhere other than the authenticated session on the server side.

---

## 9. Architecture Change Process

If, during implementation, following `masterplan.md` exactly turns out to be wrong or impossible (a library doesn't do what was assumed, a requirement conflicts with another), do not silently deviate. Instead:

1. Explain the problem in a code comment and/or commit message: what was specified, why it doesn't work.
2. Evaluate at least one alternative.
3. Update `masterplan.md` in the relevant section (and the technology table in §13/§14 if applicable) to reflect the new decision, keeping the "Decision / Why / Alternatives / Trade-offs" shape used throughout that document.
4. Update any affected tasks in `task.md` (edit the task's implementation details/acceptance criteria to match reality).
5. If the change is significant (a new major dependency, a changed data model shape, a changed security control), add an ADR under `docs/adr/NNNN-title.md`:
   ```markdown
   # NNNN - Title
   ## Context
   ## Decision
   ## Consequences
   ```
6. Only then continue implementation under the revised plan.

Minor deviations (e.g., a slightly different Zod schema shape than sketched inline in the masterplan) do not require this full process — use judgment, but when in doubt, document.

---

## 10. AI Integration Rules (binding on every AI-touching task)

- The Anthropic SDK is imported **only** inside `lib/ai/provider.js`. No other file — especially nothing under `components/`, `features/**/*.jsx` client components, or any file marked `'use client'` — may import it or reference `ANTHROPIC_API_KEY`.
- Every call into `lib/ai/*` must pass a Zod schema for structured output and must have its result validated before it is used or persisted.
- Every prompt that includes resume or JD content must route that content through `lib/ai/prompt-guard.js`'s `buildUntrustedContentBlock()` helper — never string-concatenate untrusted document text directly into a system prompt.
- Resume-writing suggestions (`lib/ai/resume-writing.js`) must pass through the anti-fabrication guard (`lib/ai/prompt-guard.js`'s `validateNoFabrication`) before being returned to any caller.
- No AI-suggested resume change is ever auto-applied. The write path always requires an explicit user "accept" action from a diff view.
- All tests that exercise AI-calling code must mock `lib/ai/provider.js` (e.g., `vi.mock('@/lib/ai/provider')`). Never let the automated test suite make live calls to the Anthropic API.

---

## 11. File Handling Rules (binding on every upload-touching task)

- Validate MIME type via content sniffing (`file-type` package), never trust the client's `Content-Type` header or filename extension alone.
- Validate file size before reading the full buffer into memory where practical; reject over the configured `MAX_UPLOAD_SIZE_MB` with `413`.
- Sanitize/replace filenames — the stored `storageKey` is always a generated UUID-based path, never the user-supplied filename.
- Never execute, `eval`, or otherwise interpret uploaded file content as code.
- Never trust document text content as instructions (see §10's prompt-guard rule) — this applies to parsed resume/JD text just as much as to raw AI prompts.
- On any parser failure, clean up partial state: no orphaned storage file without a corresponding DB row, and no DB row left `PENDING` forever without a `FAILED` status and `parseError` set once the failure is known.

---

## 12. Security Rules (binding always)

Never:
- Hardcode a secret value anywhere in source.
- Commit `.env.local` or any file containing a real secret.
- Log a password, session token, reset token, or API key — even at debug level.
- Expose an internal stack trace or raw error message to an API client in production mode.
- Trust a client-supplied `userId`, `role`, or ownership claim for authorization — always derive identity from the verified session.
- Allow one user's request to read, modify, or delete another user's data. Every relevant task in `task.md` that touches user-owned data requires a cross-user isolation test — do not consider such a task done without one.

---

## 13. Testing Requirements

Before marking any task complete, run the commands actually defined in `package.json` (do not assume script names — check first):
```bash
npm run lint
npm run test
npm run build
```
Add `npm run test:e2e` for tasks with Playwright acceptance criteria.

- Unit tests: pure logic (`lib/matching/*`, `lib/parsers/*`, `lib/validation/*`, `lib/utils/*`) — no DB, no network, no Next.js runtime dependency.
- Integration tests: exercise services/route handlers against the real local test database (`DATABASE_URL_TEST`), migrated fresh. Always include cross-user isolation assertions for any user-owned resource.
- E2E tests: Playwright, only for the specific flows called out in each phase's tasks — do not attempt to E2E-test everything; that's what unit/integration tests are for.
- AI-dependent code paths: always tested against a mocked `lib/ai/provider.js`, never live.
- A task is not complete if its specified tests are missing, even if the feature appears to work manually.

---

## 14. Git Rules (recap and elaboration of masterplan §55)

The agent must always know, before making any change: current branch, current phase, current task. If any of these is unclear, stop and re-run the Before Coding checklist (§1).

Never:
- Work directly on `main` for feature implementation.
- Start a new phase's tasks on an old phase's branch.
- Mix two different phases' tasks into one branch.
- Silently switch branches mid-task without noting why.
- Rewrite Git history unrelated to the current change (no unsolicited rebases of old commits).
- Force-push, ever, unless the user has explicitly authorized it for a specific, named reason.

Branch naming is always `phase/<number>-<name>` exactly as given in `task.md`'s phase header — do not invent alternate names.

---

## 15. Definition of Done (task and phase level)

**A task is done only when:**
- Code exists implementing the described behavior.
- Every acceptance criterion in `task.md` for that task is verified true.
- The specified tests exist and pass.
- `npm run lint` and `npm run build` pass with the change included.
- No security rule from §12 is violated.
- No unrelated regression was introduced (spot-check adjacent functionality touched by the change).
- `docs/progress.md` is updated.
- Changes are committed with a properly scoped commit (or set of commits).

**A phase is done only when** every item in §6 (Phase Gate) is satisfied and the phase branch is merged into a verified-working `main`.

---

## 16. Autonomous Behavior Summary

Do not respond to an instruction like "build all of JobOS" by generating the entire application in one pass. Always follow:

```
Read masterplan.md, task.md, agent.md
      ↓
Inspect repo state; determine current branch/phase/task via §1
      ↓
If starting a phase: Phase Initialization (§2)
      ↓
Task Execution Loop (§3) for each task in order, respecting dependencies
      ↓
Commit discipline (§4) after each meaningful unit of work
      ↓
On last task of the phase: Phase Gate (§6)
      ↓
Merge to main, verify main
      ↓
Return to Phase Initialization (§2) for the next phase
```

Stop and surface the situation to the user (rather than guessing) when:
- A phase gate cannot pass for reasons outside the agent's control (e.g., PostgreSQL or LibreOffice not installed locally — these are documented prerequisites in `masterplan.md` §49, not something to work around by silently changing the architecture).
- A task's requirements conflict with an already-merged decision from an earlier phase in a way that isn't a minor deviation (invoke §9 first; if still unresolved, surface it).
- Required credentials (e.g., `ANTHROPIC_API_KEY`) are missing — AI-dependent tasks' non-AI parts (schema, guard logic, mocked-provider tests) can still proceed, but live-integration verification should be flagged as pending rather than faked.
