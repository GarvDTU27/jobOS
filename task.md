# JobOS — Task Breakdown

Format per task: ID, Title, Phase, Priority (P0=MVP blocking, P1=MVP important, P2=Phase 2, P3=Future), Dependencies, Description, Expected files/modules, Implementation details, Acceptance criteria, Tests required, Git branch.

Tasks within a phase are ordered; implement sequentially unless explicitly marked parallelizable. All P0/P1 tasks belong to Phases 01–11 (MVP + hardening). No P2/P3 tasks are scheduled in this document's phases — they are listed at the end for backlog awareness only.

---

## Phase 01 — Foundation
Branch: `phase/01-foundation`
Objective: Bootstrapped Next.js app, Prisma connected to local Postgres, base UI shell, lint/test/build pipeline green, CI-equivalent scripts runnable locally.

### JOBOS-001 — Initialize Next.js project (JS/JSX only)
Priority: P0 | Dependencies: none
Description: Scaffold Next.js App Router project with JavaScript (no TypeScript), Tailwind CSS, ESLint.
Expected files: `package.json`, `next.config.js`, `tailwind.config.js`, `postcss.config.js`, `app/layout.jsx`, `app/page.jsx`, `.eslintrc.json`, `.gitignore`.
Implementation details: Use `create-next-app` with `--js` flag (or manual scaffold if the CLI defaults to TS); explicitly delete any `.ts`/`.tsx` generated files; configure ESLint with `eslint-config-next` and a rule forbidding `.ts`/`.tsx` files being added.
Acceptance criteria: `npm run dev` serves a placeholder home page; `npm run lint` and `npm run build` pass; zero `.ts`/`.tsx` files in repo.
Tests: N/A (scaffolding).
Branch: `phase/01-foundation`

### JOBOS-002 — Add Prisma and connect to local PostgreSQL
Priority: P0 | Dependencies: JOBOS-001
Description: Install Prisma, create `prisma/schema.prisma` per masterplan §21, configure `DATABASE_URL`.
Expected files: `prisma/schema.prisma`, `lib/db/prisma.js`, `.env.example`.
Implementation details: `lib/db/prisma.js` exports a singleton `PrismaClient`, guarding against multiple instances in dev via `globalThis` pattern.
Acceptance criteria: `npx prisma migrate dev --name init` succeeds against a locally created `jobos_dev` database; `npx prisma studio` can open and show empty tables.
Tests: Integration smoke test asserting `prisma.$connect()` succeeds.
Branch: `phase/01-foundation`

### JOBOS-003 — Base folder structure and lib utilities
Priority: P0 | Dependencies: JOBOS-001
Description: Create the full folder skeleton from masterplan §16 with placeholder index files/README stubs where empty, plus `lib/utils/errors.js`, `lib/utils/logger.js`, `lib/utils/pagination.js`.
Expected files: as listed in masterplan §16; `lib/utils/errors.js`, `lib/utils/logger.js`, `lib/utils/pagination.js`.
Implementation details: `errors.js` implements the error hierarchy from masterplan §44. `pagination.js` implements `parsePageParams(searchParams, { maxPageSize: 100, defaultPageSize: 25 })`.
Acceptance criteria: Folder structure matches masterplan; error classes instantiate with correct `.status`/`.code`.
Tests: Unit tests for `errors.js` (status codes correct) and `pagination.js` (clamping behavior, invalid input defaults).
Branch: `phase/01-foundation`

### JOBOS-004 — Base UI primitives
Priority: P0 | Dependencies: JOBOS-001
Description: Build `components/ui/` primitives: Button, Input, Select, Dialog, Badge, Table, Toast, Card.
Expected files: `components/ui/*.jsx`.
Implementation details: Tailwind-based, no external UI library dependency beyond `lucide-react` for icons (optional) and `@radix-ui/react-dialog`/`react-toast` primitives if helpful for accessibility.
Acceptance criteria: Each primitive renders in isolation (verified via a temporary `/dev/ui` page removed before phase end, or Storybook-less manual check); accessible attributes present (labels, roles) on interactive components.
Tests: Unit render tests (React Testing Library) for Button, Input, Dialog open/close.
Branch: `phase/01-foundation`

### JOBOS-005 — Dashboard layout shell
Priority: P0 | Dependencies: JOBOS-004
Description: Build `app/(dashboard)/layout.jsx` with sidebar nav (Jobs, Applications, Resumes, Analytics, Settings) and topbar.
Expected files: `app/(dashboard)/layout.jsx`, `components/layout/Sidebar.jsx`, `components/layout/Topbar.jsx`.
Implementation details: Layout is a Server Component; nav active-state highlighting via `usePathname` in a small client child.
Acceptance criteria: Navigating between placeholder routes preserves the shell; responsive down to mobile width.
Tests: N/A beyond render smoke test.
Branch: `phase/01-foundation`

### JOBOS-006 — Testing and quality pipeline
Priority: P0 | Dependencies: JOBOS-001
Description: Configure Vitest (unit+integration) and Playwright (E2E), wire `npm run lint`, `npm run test`, `npm run test:e2e`, `npm run build` scripts.
Expected files: `vitest.config.js`, `playwright.config.js`, `tests/unit/.gitkeep`, `tests/integration/.gitkeep`, `tests/e2e/.gitkeep`, `package.json` scripts.
Implementation details: Vitest config supports both jsdom (component tests) and node (service/util tests) environments via per-file `@vitest-environment` comments or separate projects.
Acceptance criteria: A trivial passing test exists in each of unit/integration/e2e; all four npm scripts run clean on a fresh checkout.
Tests: The trivial tests themselves.
Branch: `phase/01-foundation`

**Phase 01 Gate:** lint/test/build pass; `npm install && npm run dev` works with only local Postgres running (no Docker); README documents setup per masterplan §49; merge to `main`.

---

## Phase 02 — Authentication
Branch: `phase/02-authentication`
Objective: Full register/login/logout, protected routes, password reset architecture, user data isolation groundwork.

### JOBOS-007 — User and Session Prisma models + migration
Priority: P0 | Dependencies: JOBOS-002
Description: Add `User`, `Session`, `PasswordResetToken` models per masterplan §21.
Expected files: `prisma/schema.prisma` (updated), new migration.
Acceptance criteria: Migration applies cleanly; unique constraint on `User.email` enforced.
Tests: Integration test inserting a user, asserting duplicate email insert fails with a unique constraint violation.
Branch: `phase/02-authentication`

### JOBOS-008 — Password hashing utility
Priority: P0 | Dependencies: JOBOS-007
Description: `lib/auth/password.js` with `hashPassword(plain)` and `verifyPassword(plain, hash)` using bcrypt cost 12.
Expected files: `lib/auth/password.js`.
Acceptance criteria: Round-trip hash/verify works; wrong password fails verify.
Tests: Unit tests for both functions, including edge cases (empty string rejected by a min-length Zod check upstream, not here).
Branch: `phase/02-authentication`

### JOBOS-009 — Registration validation schema and service
Priority: P0 | Dependencies: JOBOS-008
Description: `lib/validation/schemas/auth.js` (email format, password min 8 chars with complexity check) and `lib/services/auth-service.js` `registerUser({ email, password, name })`.
Expected files: `lib/validation/schemas/auth.js`, `lib/services/auth-service.js`.
Acceptance criteria: Service rejects duplicate email with `ConflictError`; stores only the bcrypt hash, never plaintext.
Tests: Unit test for schema edge cases; integration test for service against test DB (duplicate email → 409-mapped error).
Branch: `phase/02-authentication`

### JOBOS-010 — Auth.js configuration with Credentials provider + DB sessions
Priority: P0 | Dependencies: JOBOS-009
Description: Configure Auth.js v5 (`lib/auth/auth.config.js`, `app/api/auth/[...nextauth]/route.js`) with Prisma adapter, Credentials provider calling `verifyPassword`, database session strategy.
Expected files: `lib/auth/auth.config.js`, `app/api/auth/[...nextauth]/route.js`, `lib/auth/session.js` (helper `getSessionOrThrow()`).
Acceptance criteria: Login with correct credentials creates a `Session` row and sets an httpOnly cookie; wrong password rejected with a generic error (no user-enumeration hint).
Tests: Integration test exercising the credentials authorize() function directly.
Branch: `phase/02-authentication`

### JOBOS-011 — Registration and login pages
Priority: P0 | Dependencies: JOBOS-010, JOBOS-004
Description: `app/(auth)/register/page.jsx`, `app/(auth)/login/page.jsx` with client forms.
Expected files: as above, `features/auth/RegisterForm.jsx`, `features/auth/LoginForm.jsx`.
Acceptance criteria: Successful register redirects to login (or auto-login) with a success toast; validation errors shown inline; successful login redirects to dashboard.
Tests: Playwright E2E: register → login → land on dashboard.
Branch: `phase/02-authentication`

### JOBOS-012 — Route protection middleware
Priority: P0 | Dependencies: JOBOS-010
Description: `middleware.js` protecting `(dashboard)` routes and `app/api/**` (except `api/auth/*`), redirecting unauthenticated browser requests to `/login`, returning `401` JSON for API requests.
Expected files: `middleware.js`.
Acceptance criteria: Unauthenticated request to `/applications` redirects to `/login`; unauthenticated `fetch('/api/applications')` returns 401 JSON.
Tests: Integration test hitting a protected route with/without a valid session cookie.
Branch: `phase/02-authentication`

### JOBOS-013 — Logout
Priority: P0 | Dependencies: JOBOS-010
Description: Logout action clearing the session (Auth.js `signOut`) accessible from Topbar.
Expected files: `components/layout/Topbar.jsx` (updated).
Acceptance criteria: Logout destroys the `Session` DB row and cookie; subsequent protected requests are unauthenticated.
Tests: Playwright E2E logout flow.
Branch: `phase/02-authentication`

### JOBOS-014 — Password reset architecture
Priority: P1 | Dependencies: JOBOS-010
Description: `POST /api/auth/reset-password/request` and `/confirm`, `PasswordResetToken` issuance (hashed at rest, 1hr expiry, single-use), dev-mode display of the reset link (no email provider required to develop locally).
Expected files: `app/api/auth/reset-password/request/route.js`, `.../confirm/route.js`, `lib/services/auth-service.js` (extended).
Acceptance criteria: Requesting reset for a non-existent email returns a generic success response (no enumeration); using an expired/used token fails with a clear error; successful confirm updates the password hash and invalidates all existing sessions for that user.
Tests: Integration tests for expiry, single-use, and session-invalidation-on-reset behavior.
Branch: `phase/02-authentication`

### JOBOS-015 — Email verification architecture (non-blocking)
Priority: P1 | Dependencies: JOBOS-010
Description: `User.emailVerified` timestamp, verification token issuance on register, dev-mode display of the verification link, a non-blocking banner in the dashboard shell when unverified.
Expected files: `lib/services/auth-service.js` (extended), `components/layout/VerificationBanner.jsx`.
Acceptance criteria: New users are unverified by default; visiting the verify link sets `emailVerified`; app usage is not blocked pre-verification in MVP.
Tests: Integration test for token verification flow.
Branch: `phase/02-authentication`

### JOBOS-016 — Auth integration + E2E test suite completion
Priority: P0 | Dependencies: JOBOS-011..015
Description: Consolidate and fill gaps in auth test coverage per masterplan §46/spec §33.
Expected files: `tests/integration/auth.test.js`, `tests/e2e/auth.spec.js`.
Acceptance criteria: All auth flows (register, login, logout, reset, verify, protected-route redirect) covered.
Tests: as above.
Branch: `phase/02-authentication`

**Phase 02 Gate:** all above tests pass; lint/build pass; no plaintext password ever logged (grep check); merge to `main`.

---

## Phase 03 — Application Tracker
Branch: `phase/03-application-tracker`
Objective: Full CRUD on Applications, status pipeline with history, List + Kanban views, search/filter/sort/pagination, notes, events.

### JOBOS-017 — Application, ApplicationStatusHistory, ApplicationEvent, ApplicationNote, Tag/ApplicationTag Prisma models
Priority: P0 | Dependencies: JOBOS-007
Description: Add all models per masterplan §21 with indexes.
Expected files: `prisma/schema.prisma` (updated), migration.
Acceptance criteria: Migration applies; indexes present (`userId+status`, `userId+deadline`, `userId+company`, `userId+createdAt`).
Tests: Integration test verifying an application query plan uses the index (via `EXPLAIN`) is optional/nice-to-have; required: FK cascade behavior test (deleting a User cascades Applications; deleting an Application cascades its events/notes/history).
Branch: `phase/03-application-tracker`

### JOBOS-018 — Application service: create/read/update/delete
Priority: P0 | Dependencies: JOBOS-017
Description: `lib/services/application-service.js` with `createApplication`, `getApplicationById`, `listApplications`, `updateApplication`, `deleteApplication` — all scoped by `userId`.
Expected files: `lib/services/application-service.js`, `lib/validation/schemas/application.js`.
Acceptance criteria: All functions reject/404 on cross-user access; create sets initial status `SAVED` and writes the first `ApplicationStatusHistory` row.
Tests: Unit tests for validation schema; integration tests for each service function including a cross-user-isolation test (user A cannot fetch/update/delete user B's application).
Branch: `phase/03-application-tracker`

### JOBOS-019 — Application status transition service
Priority: P0 | Dependencies: JOBOS-018
Description: `applicationService.updateStatus(applicationId, userId, newStatus, note)` writing `Application.status` and `ApplicationStatusHistory` atomically.
Expected files: `lib/services/application-service.js` (extended).
Implementation details: Wrapped in `prisma.$transaction`.
Acceptance criteria: Status and history are always consistent; invalid status value rejected by Zod enum validation before reaching the service.
Tests: Integration test asserting a history row is created on every transition, and that a simulated mid-transaction failure leaves no partial write (transaction rollback test).
Branch: `phase/03-application-tracker`

### JOBOS-020 — Applications API routes
Priority: P0 | Dependencies: JOBOS-018, JOBOS-019
Description: `app/api/applications/route.js` (GET list, POST create), `app/api/applications/[id]/route.js` (GET/PATCH/DELETE), `app/api/applications/[id]/status` handled via PATCH on main resource or a dedicated sub-route per API inventory.
Expected files: as above.
Acceptance criteria: Matches API inventory in masterplan §22; errors mapped per masterplan §44.
Tests: Integration tests per route (happy path + validation error + auth error + not-found).
Branch: `phase/03-application-tracker`

### JOBOS-021 — Server-side filter builder
Priority: P0 | Dependencies: JOBOS-020
Description: `lib/utils/build-application-filter.js` translating validated query params (status, role, company, location, salary range, experience, date range, match score range, priority, tags) into a Prisma `where` object.
Expected files: `lib/utils/build-application-filter.js`, `lib/validation/schemas/application-query.js`.
Acceptance criteria: Pure function, zero DB/HTTP dependency, fully unit-testable.
Tests: Unit tests covering every filter combination listed in spec §11, including combined filters.
Branch: `phase/03-application-tracker`

### JOBOS-022 — Server-side sort map
Priority: P0 | Dependencies: JOBOS-020
Description: `lib/utils/application-sort-map.js` mapping the 10 allowed sort keys (spec §11) to explicit Prisma `orderBy` clauses; reject unknown keys.
Expected files: `lib/utils/application-sort-map.js`.
Acceptance criteria: Unknown sort key throws `ValidationError`, never passed through to Prisma raw.
Tests: Unit test per sort key + one invalid-key rejection test.
Branch: `phase/03-application-tracker`

### JOBOS-023 — Application List view
Priority: P0 | Dependencies: JOBOS-020, JOBOS-021, JOBOS-022
Description: `app/(dashboard)/applications/page.jsx` table view with columns per spec §10 (Company, Role, Location, Status, Match), filter/search/sort controls, pagination controls.
Expected files: `app/(dashboard)/applications/page.jsx`, `features/applications/ApplicationTable.jsx`, `features/applications/ApplicationFilters.jsx`.
Implementation details: Server Component fetches initial page via the service directly; client filter controls update the URL query string, triggering a server re-render (App Router search-params pattern) — no client-side re-filtering of a large already-fetched set.
Acceptance criteria: Changing a filter updates the URL and the table without a full page reload feel; pagination works past page 1; empty state shown when no results.
Tests: Playwright E2E: create several applications via API/seed, filter by status, assert correct subset shown.
Branch: `phase/03-application-tracker`

### JOBOS-024 — Application Kanban view
Priority: P0 | Dependencies: JOBOS-020
Description: `app/(dashboard)/applications/kanban/page.jsx` with drag-and-drop columns per default status pipeline.
Expected files: `app/(dashboard)/applications/kanban/page.jsx`, `features/applications/KanbanBoard.jsx` (client component using a lightweight DnD library, e.g. `@dnd-kit/core`).
Acceptance criteria: Dragging a card to a new column calls the status-transition API and persists; optimistic UI update with rollback on API failure.
Tests: Playwright E2E: drag a card, reload page, assert new column persisted. Unit test for the optimistic-update/rollback reducer logic.
Branch: `phase/03-application-tracker`

### JOBOS-025 — Application details page
Priority: P0 | Dependencies: JOBOS-020
Description: `app/(dashboard)/applications/[id]/page.jsx` showing job info, current status, status history/timeline, resume used, match score (placeholder until Phase 07), notes, recruiter info, events.
Expected files: `app/(dashboard)/applications/[id]/page.jsx`, `features/applications/ApplicationDetail.jsx`, `features/applications/Timeline.jsx`.
Acceptance criteria: All fields from spec §9/§10/§24 render; 404 page for a non-existent or non-owned application id.
Tests: Playwright E2E covering navigation from list → detail.
Branch: `phase/03-application-tracker`

### JOBOS-026 — Notes CRUD
Priority: P1 | Dependencies: JOBOS-025
Description: `POST /api/applications/:id/notes`, notes list/add UI on detail page.
Expected files: route handler, `features/applications/NotesPanel.jsx`.
Acceptance criteria: Notes persist and display in reverse-chronological order.
Tests: Integration test for the route; component test for the panel.
Branch: `phase/03-application-tracker`

### JOBOS-027 — Events CRUD (create/edit/complete/delete)
Priority: P0 | Dependencies: JOBOS-025
Description: Full CRUD on `ApplicationEvent` per spec §25 (OA deadline, Interview, Recruiter call, Follow-up, Application deadline, Custom).
Expected files: `app/api/applications/[id]/events/route.js`, `.../events/[eventId]/route.js`, `features/applications/EventForm.jsx`, `features/applications/EventList.jsx`.
Acceptance criteria: Completing an event sets `completedAt`; deleting removes it; editing updates `scheduledAt`/`title`/`notes`.
Tests: Integration tests for each CRUD operation, isolation test (cross-user).
Branch: `phase/03-application-tracker`

### JOBOS-028 — Tags
Priority: P1 | Dependencies: JOBOS-017
Description: Tag creation (implicit, get-or-create by name) and attach/detach on applications; filter integration.
Expected files: `lib/services/tag-service.js`, UI tag input component.
Acceptance criteria: Tags are user-scoped in filtering even though `Tag` rows can be shared by name globally (only `ApplicationTag` rows are user-relevant via the owning application).
Tests: Integration test for get-or-create idempotency.
Branch: `phase/03-application-tracker`

### JOBOS-029 — Dashboard upcoming-events widget
Priority: P1 | Dependencies: JOBOS-027
Description: `app/(dashboard)/page.jsx` widget listing next 7 days of scheduled events across all applications.
Expected files: `app/(dashboard)/page.jsx`, `features/applications/UpcomingEvents.jsx`.
Acceptance criteria: Correctly filters to future, incomplete events, sorted by `scheduledAt`.
Tests: Unit test for the date-range query builder.
Branch: `phase/03-application-tracker`

**Phase 03 Gate:** create→list→filter→sort→kanban-drag→detail→notes→events all work E2E; lint/test/build pass; cross-user isolation integration tests pass; merge to `main`.

---

## Phase 04 — Job Management
Branch: `phase/04-job-management`
Objective: Job CRUD, search/filter/sort, convert-to-application.

### JOBOS-030 — Job, JobSkill, Skill Prisma models
Priority: P0 | Dependencies: JOBOS-017
Description: Add `Job`, `Skill`, `JobSkill` models per masterplan §21.
Acceptance criteria: Migration applies; `Skill.normalizedName` unique.
Tests: Integration test for unique constraint.
Branch: `phase/04-job-management`

### JOBOS-031 — Job service (CRUD, archive)
Priority: P0 | Dependencies: JOBOS-030
Description: `lib/services/job-service.js`: create/get/list/update/archive/delete, all user-scoped.
Expected files: `lib/services/job-service.js`, `lib/validation/schemas/job.js`.
Acceptance criteria: Archive is a soft flag (`archived: true`), not a delete; delete is hard and blocked (409) if referenced by an existing Application unless the caller explicitly confirms (documented UX: application's `jobId` is set null on force-delete per §21 cascade rule — service defaults to `SetNull` behavior via Prisma's `onDelete`).
Tests: Integration tests for CRUD + archive + delete-with-linked-application behavior.
Branch: `phase/04-job-management`

### JOBOS-032 — Jobs API routes
Priority: P0 | Dependencies: JOBOS-031
Description: `app/api/jobs/route.js`, `app/api/jobs/[id]/route.js`.
Acceptance criteria: Matches API inventory; validated input; proper error mapping.
Tests: Integration tests per route.
Branch: `phase/04-job-management`

### JOBOS-033 — Jobs list/search/filter/sort UI
Priority: P0 | Dependencies: JOBOS-032
Description: `app/(dashboard)/jobs/page.jsx` reusing the filter/sort/pagination pattern from Phase 03 (extracted shared utilities where applicable).
Expected files: `app/(dashboard)/jobs/page.jsx`, `features/jobs/JobTable.jsx`, `features/jobs/JobFilters.jsx`.
Acceptance criteria: Search by company/role/location works; salary range filter works; archived jobs hidden by default with a toggle to show them.
Tests: Playwright E2E for search + filter.
Branch: `phase/04-job-management`

### JOBOS-034 — Job create/edit form
Priority: P0 | Dependencies: JOBOS-032
Description: `app/(dashboard)/jobs/new/page.jsx` and edit mode on `[id]/page.jsx`, covering all fields in spec §12.
Expected files: as above, `features/jobs/JobForm.jsx`.
Acceptance criteria: All fields validated (e.g., `salaryMax >= salaryMin` when both present); saves correctly.
Tests: Component test for validation logic; integration test for save.
Branch: `phase/04-job-management`

### JOBOS-035 — Job details page
Priority: P0 | Dependencies: JOBOS-032
Description: `app/(dashboard)/jobs/[id]/page.jsx` showing full job info and a "Convert to Application" action.
Expected files: as above, `features/jobs/JobDetail.jsx`.
Acceptance criteria: Renders all job fields; convert action visible.
Tests: Playwright E2E render check.
Branch: `phase/04-job-management`

### JOBOS-036 — Convert job to application
Priority: P0 | Dependencies: JOBOS-035, JOBOS-018
Description: `POST /api/jobs/:id/convert-to-application` creating an `Application` (status `SAVED`) linked to the job, copying company/role/location.
Expected files: route handler, service method.
Acceptance criteria: Resulting application has correct linked `jobId`; redirects user to the new application's detail page.
Tests: Integration test asserting field copy correctness and linkage.
Branch: `phase/04-job-management`

**Phase 04 Gate:** job CRUD + convert-to-application E2E pass; lint/test/build pass; merge to `main`.

---

## Phase 05 — Resume & Document Processing
Branch: `phase/05-document-processing`
Objective: File upload pipeline, PDF/DOC/DOCX/TXT parsers, resume storage/versioning, storage abstraction.

### JOBOS-037 — Storage abstraction + local provider
Priority: P0 | Dependencies: JOBOS-003
Description: `lib/storage/provider.js` interface (`save(buffer, key)`, `read(key)`, `delete(key)`), `lib/storage/local-provider.js` implementation writing to `./uploads/<userId>/<uuid>.<ext>`.
Expected files: as above.
Acceptance criteria: Provider is swappable via `FILE_STORAGE_DRIVER` env; local provider creates per-user subdirectories; path traversal in `key` is rejected.
Tests: Unit tests for save/read/delete, and a path-traversal-rejection test (`../../etc/passwd` style key rejected).
Branch: `phase/05-document-processing`

### JOBOS-038 — Parser contract + TXT parser
Priority: P0 | Dependencies: none (parallel-safe with 037)
Description: `lib/parsers/contract.js`, `lib/parsers/txt-parser.js`.
Acceptance criteria: TXT parser handles UTF-8 and falls back to latin1; throws `EMPTY_CONTENT` `ParserError` on truly empty input.
Tests: Unit tests with UTF-8, latin1, and empty fixtures.
Branch: `phase/05-document-processing`

### JOBOS-039 — PDF parser
Priority: P0 | Dependencies: JOBOS-038
Description: `lib/parsers/pdf-parser.js` using `pdf-parse`.
Acceptance criteria: Extracts text from a text-based PDF fixture; detects near-empty output (scanned PDF) and throws `EMPTY_CONTENT`.
Tests: Unit tests with a real small PDF fixture checked into `tests/fixtures/`.
Branch: `phase/05-document-processing`

### JOBOS-040 — DOCX parser
Priority: P0 | Dependencies: JOBOS-038
Description: `lib/parsers/docx-parser.js` using `mammoth`.
Acceptance criteria: Extracts text from a DOCX fixture; logs mammoth warnings without failing unless output is empty.
Tests: Unit test with a DOCX fixture.
Branch: `phase/05-document-processing`

### JOBOS-041 — DOC parser (LibreOffice conversion)
Priority: P0 | Dependencies: JOBOS-040
Description: `lib/parsers/doc-parser.js` shelling out to `soffice --headless --convert-to docx`, cached PATH probe at boot, delegating to `docx-parser.js`, cleaning temp files.
Expected files: `lib/parsers/doc-parser.js`, boot-time probe hook (e.g., in `instrumentation.js`).
Acceptance criteria: Successfully converts a `.doc` fixture when LibreOffice is installed; throws `CONVERSION_TOOL_UNAVAILABLE` with a clear message when `soffice` is missing (simulate by temporarily unsetting PATH in a test); temp files are always cleaned up even on failure (verified via `finally`).
Tests: Unit/integration test gated behind a `describe.skipIf(!hasLibreOffice)` for the real-conversion path, plus an always-run test for the "tool unavailable" error path via a mocked `which` check.
Branch: `phase/05-document-processing`

### JOBOS-042 — Parser dispatcher (MIME sniffing + selection)
Priority: P0 | Dependencies: JOBOS-039, JOBOS-040, JOBOS-041
Description: `lib/parsers/index.js` `parseDocument(buffer, declaredMimeType)` — sniffs actual MIME via `file-type` package, selects the correct parser, ignores/flags mismatches between declared and sniffed type.
Acceptance criteria: A `.docx` file renamed with a `.pdf` extension is still correctly routed via sniffed MIME, not the filename/declared type.
Tests: Unit tests covering all four formats + one mismatch case.
Branch: `phase/05-document-processing`

### JOBOS-043 — Resume, Education, Experience, Project, Certification, ResumeSkill Prisma models
Priority: P0 | Dependencies: JOBOS-030
Description: Add remaining models per masterplan §21.
Acceptance criteria: Migration applies; cascade deletes verified (deleting a Resume removes its child rows).
Tests: Integration cascade test.
Branch: `phase/05-document-processing`

### JOBOS-044 — Resume upload endpoint + validation
Priority: P0 | Dependencies: JOBOS-037, JOBOS-042, JOBOS-043
Description: `POST /api/resumes` multipart handler: size check (413 if >10MB), MIME allowlist check (422 if disallowed), filename sanitization, storage save, DB row creation with `parseStatus=PENDING`.
Expected files: `app/api/resumes/route.js`, `lib/services/resume-service.js`, `lib/validation/schemas/resume.js`.
Acceptance criteria: Oversized/disallowed files rejected with correct status codes and no partial DB/storage writes (transactional cleanup on failure).
Tests: Integration tests for size limit, MIME rejection, and successful upload.
Branch: `phase/05-document-processing`

### JOBOS-045 — Resume list/rename/archive/delete/set-default
Priority: P0 | Dependencies: JOBOS-044
Description: `app/api/resumes/[id]/route.js` (GET/PATCH/DELETE), `app/(dashboard)/resumes/page.jsx` list UI.
Acceptance criteria: Setting a resume as default unsets any prior default for that user (transactional); archive hides from default pickers but keeps historical application links intact.
Tests: Integration test for default-uniqueness invariant.
Branch: `phase/05-document-processing`

### JOBOS-046 — Deterministic resume section extraction
Priority: P0 | Dependencies: JOBOS-042
Description: `lib/services/resume-extraction/section-splitter.js` and regex-based extractors for contact info, section headers.
Acceptance criteria: Correctly splits a fixture resume into Experience/Education/Skills/Projects/Certifications blocks with reasonable accuracy (documented as heuristic, not perfect).
Tests: Unit tests against 2–3 varied fixture resumes.
Branch: `phase/05-document-processing`

### JOBOS-047 — Resume details page (structured view)
Priority: P0 | Dependencies: JOBOS-045
Description: `app/(dashboard)/resumes/[id]/page.jsx` showing parsed structured data (education, experience, skills, projects, certifications) with parse status/error surfaced.
Acceptance criteria: `FAILED` parse status shows the error and a "raw text" fallback view.
Tests: Playwright E2E render check for both success and failure states (use a corrupted fixture to trigger failure).
Branch: `phase/05-document-processing`

**Phase 05 Gate:** upload+parse works for all four formats (including a real `.doc` fixture) end-to-end when LibreOffice is present, and fails gracefully with a clear error when it's not; lint/test/build pass; merge to `main`.

---

## Phase 06 — JD Analysis
Branch: `phase/06-jd-analysis`
Objective: JD paste/upload, AI-assisted structured extraction with schema validation, Required/Preferred/Inferred labeling.

### JOBOS-048 — JobAnalysis Prisma model
Priority: P0 | Dependencies: JOBOS-030
Description: Add `JobAnalysis` per masterplan §21.
Tests: Migration + cascade test.
Branch: `phase/06-jd-analysis`

### JOBOS-049 — AI provider module
Priority: P0 | Dependencies: none
Description: `lib/ai/provider.js` implementing `complete({ system, messages, schema, maxRetries })` per masterplan §35, wrapping the Anthropic SDK, server-only.
Acceptance criteria: On schema-validation failure, retries once with a correction follow-up before throwing; on provider error, exponential backoff up to 2 retries.
Tests: Unit tests with a mocked Anthropic client covering: success first try, success after one retry, exhausted retries throws `AIProviderError`.
Branch: `phase/06-jd-analysis`

### JOBOS-050 — Prompt-injection guard utilities
Priority: P0 | Dependencies: JOBOS-049
Description: `lib/ai/prompt-guard.js`: wraps untrusted content in delimiter tags, provides `buildUntrustedContentBlock(text)`, logs (does not block) detected injection markers.
Acceptance criteria: Every AI call site uses this helper rather than raw string concatenation (enforced by code review checklist in `agent.md`).
Tests: Unit test verifying delimiter wrapping and marker detection/logging.
Branch: `phase/06-jd-analysis`

### JOBOS-051 — JD extraction schema + AI module
Priority: P0 | Dependencies: JOBOS-049, JOBOS-050
Description: `lib/validation/schemas/jd-extraction.js` (Zod schema: company, role, location, salary, experience, employmentType, skills[]{name,requirement}, responsibilities[], qualifications[], educationReq, technologies[], softSkills[], keywords[], seniority), `lib/ai/jd-analysis.js` `extractJobDescription(text)`.
Acceptance criteria: AI output validated against schema before returning; every skill tagged REQUIRED/PREFERRED/INFERRED (spec §18); malformed AI output triggers the retry path from JOBOS-049.
Tests: Unit test with mocked provider returning valid/invalid payloads.
Branch: `phase/06-jd-analysis`

### JOBOS-052 — JD parse endpoint (paste + upload)
Priority: P0 | Dependencies: JOBOS-051, JOBOS-042
Description: `POST /api/jd/parse` accepting either `{ text }` JSON or multipart file, routing file uploads through the document parser dispatcher first, then AI extraction, persisting `Job` + `JobAnalysis` + `JobSkill` rows in a transaction.
Acceptance criteria: Both input methods produce equivalent persisted structures; a corrupt/unsupported file returns the parser's typed error mapped to 422.
Tests: Integration tests for both paste and upload paths, plus a bad-file-type test.
Branch: `phase/06-jd-analysis`

### JOBOS-053 — JD paste/upload UI
Priority: P0 | Dependencies: JOBOS-052
Description: A JD input panel (used from Job create/edit flow and standalone) supporting paste-into-textarea and drag/drop upload, showing extraction results with Required/Preferred/Inferred badges.
Expected files: `features/jd-analysis/JDInputPanel.jsx`, `features/jd-analysis/ExtractionResults.jsx`.
Acceptance criteria: Inferred skills are visually distinct (e.g., dashed badge) per spec §18's labeling requirement.
Tests: Playwright E2E: paste a JD, see extraction results rendered with correct badges.
Branch: `phase/06-jd-analysis`

**Phase 06 Gate:** JD paste and upload both produce validated, labeled structured data; AI failures degrade gracefully (typed error, no crash, no unvalidated data persisted); lint/test/build pass; merge to `main`.

---

## Phase 07 — Resume/JD Matching
Branch: `phase/07-matching`
Objective: Hybrid deterministic+AI match engine, skill-gap breakdown, explainable score UI.

### JOBOS-054 — MatchAnalysis, SkillGap Prisma models
Priority: P0 | Dependencies: JOBOS-043, JOBOS-048
Description: Add per masterplan §21.
Tests: Migration + cascade test; `isCurrent` flag behavior test (creating a new analysis flips prior ones to false).
Branch: `phase/07-matching`

### JOBOS-055 — Skill normalizer
Priority: P0 | Dependencies: none
Description: `lib/matching/skill-normalizer.js`: lowercase/trim + alias table (JS→javascript, Postgres→postgresql, etc.) + fuzzy-safe exact matcher.
Acceptance criteria: Alias table is a maintainable, documented JS object/array, not hardcoded inline in the scorer.
Tests: Unit tests for direct matches, alias matches, and non-matches.
Branch: `phase/07-matching`

### JOBOS-056 — AI semantic skill matcher
Priority: P0 | Dependencies: JOBOS-049, JOBOS-050, JOBOS-055
Description: `lib/ai/matching.js` `semanticSkillMatch(unmatchedResumeSkills, unmatchedJobSkills)` returning validated `{ skillPairs: [{ resumeSkill, jobSkill, confidence }] }`.
Acceptance criteria: Only called on the residual unmatched sets after deterministic matching (not the full skill lists) to bound cost.
Tests: Unit test with mocked provider.
Branch: `phase/07-matching`

### JOBOS-057 — Score engine (deterministic core)
Priority: P0 | Dependencies: JOBOS-055, JOBOS-056
Description: `lib/matching/score-engine.js` implementing the 6-category scoring algorithm and weighting from masterplan §32, pure function `computeMatch({ resumeData, jobData, semanticPairs, weights })`.
Acceptance criteria: Zero DB/network dependency — fully deterministic given inputs, so identical inputs always produce identical output (critical for testability and the "not a black box" requirement).
Tests: Extensive unit tests: perfect match=100 in technical skills category, all-missing=0, partial-credit math verified with hand-computed expected values, weight-override behavior.
Branch: `phase/07-matching`

### JOBOS-058 — Weights configuration + per-user override
Priority: P1 | Dependencies: JOBOS-057
Description: `lib/matching/weights.js` default weights; read `UserPreference.matchWeightOverrides` if present and merge.
Acceptance criteria: Invalid override shape (doesn't sum sanely) falls back to defaults with a logged warning, never crashes scoring.
Tests: Unit tests for override merge and fallback.
Branch: `phase/07-matching`

### JOBOS-059 — Match service + endpoint
Priority: P0 | Dependencies: JOBOS-057, JOBOS-058, JOBOS-054
Description: `lib/services/match-service.js` `runMatch({ userId, resumeId, jobId, applicationId })` orchestrating normalizer → semantic matcher → score engine → persistence (transaction, flips `isCurrent`), `POST /api/match`, `GET /api/match/:applicationId`.
Acceptance criteria: `Application.matchScore` denormalized field updated alongside `MatchAnalysis` creation for fast list-view sorting (masterplan §11/§42 sort-by-match requirement).
Tests: Integration test end-to-end (mocked AI) asserting DB state after a run, including the isCurrent-flip and denormalized field update.
Branch: `phase/07-matching`

### JOBOS-060 — Skill gap derivation
Priority: P0 | Dependencies: JOBOS-059
Description: Derive `SkillGap` rows (STRONG/PARTIAL/MISSING × REQUIRED/PREFERRED/INFERRED) from the same matching pass, persisted alongside `MatchAnalysis`.
Acceptance criteria: Every JD skill appears in exactly one `SkillGap` row per analysis.
Tests: Unit test on the derivation function (pure, given normalized/semantic inputs).
Branch: `phase/07-matching`

### JOBOS-061 — Match Analysis UI
Priority: P0 | Dependencies: JOBOS-059, JOBOS-060
Description: `app/(dashboard)/analysis/[applicationId]/page.jsx` — overall score, per-category breakdown (bar/number per masterplan example), skill gap lists (✓ strong / ~ partial / ✗ missing), explicit "not an ATS score" disclaimer copy.
Expected files: as above, `features/matching/MatchScoreCard.jsx`, `features/matching/SkillGapList.jsx`.
Acceptance criteria: Triggerable from an Application detail page ("Run Match Analysis" button) when both a resume and job/JD are present; disabled state with explanation when missing either.
Tests: Playwright E2E: attach resume+job to an application, run match, see score and skill gap breakdown rendered.
Branch: `phase/07-matching`

**Phase 07 Gate:** match scoring is deterministic and explainable per masterplan §32; skill gap categorization correct; AI mocked in tests; lint/test/build pass; merge to `main`.

---

## Phase 08 — Resume AI Assistant
Branch: `phase/08-resume-assistant`
Objective: Bullet improvement/tailoring with anti-fabrication guardrails, diff-based approval UX.

### JOBOS-062 — Anti-fabrication guard
Priority: P0 | Dependencies: JOBOS-049
Description: `lib/ai/prompt-guard.js` extended with `containsUnexplainedNumber(original, suggestion)` and a broader `validateNoFabrication(original, suggestion)` heuristic check (flags numbers/proper nouns in the suggestion absent from the original and not wrapped as an explicit `[ADD ...]` placeholder).
Acceptance criteria: A suggestion inventing a metric not present in the original and not placeholder-marked is rejected.
Tests: Unit tests: valid rephrase passes; invented metric fails; correctly placeholder-marked metric passes.
Branch: `phase/08-resume-assistant`

### JOBOS-063 — Resume-writing AI module
Priority: P0 | Dependencies: JOBOS-049, JOBOS-050, JOBOS-062
Description: `lib/ai/resume-writing.js` `improveBullet({ bulletText, jobContext, targetSkills })` → `{ suggestion, rationale, keywordsAdded, requiresUserInput }`, validated via Zod, post-checked via JOBOS-062, retried once on guard failure, else surfaced as a typed failure (never silently accepted).
Acceptance criteria: System prompt explicitly instructs "never invent metrics/employers/titles/technologies; use `[ADD METRIC: ...]` placeholders instead" per spec §21.
Tests: Unit tests with mocked provider covering pass, guard-triggered-retry, and guard-triggered-final-failure paths.
Branch: `phase/08-resume-assistant`

### JOBOS-064 — Tailor-bullet endpoint
Priority: P0 | Dependencies: JOBOS-063
Description: `POST /api/ai/tailor-bullet` accepting `{ resumeExperienceId, bulletId, jobId }`, loading context, calling the AI module, returning the diff — does **not** write to the resume.
Acceptance criteria: No DB mutation of `Experience.bullets` occurs from this endpoint; a separate explicit "apply" action is required (JOBOS-066).
Tests: Integration test asserting DB unchanged after calling the endpoint.
Branch: `phase/08-resume-assistant`

### JOBOS-065 — Keyword suggestion endpoint
Priority: P1 | Dependencies: JOBOS-060, JOBOS-063
Description: `POST /api/ai/suggest-keywords` for a given application, surfacing MISSING+REQUIRED skill gaps as candidate keywords/phrasing suggestions (reuses skill gap data, does not require a new AI call beyond optional phrasing help).
Tests: Integration test.
Branch: `phase/08-resume-assistant`

### JOBOS-066 — Resume tailoring UI (diff + explicit approval)
Priority: P0 | Dependencies: JOBOS-064
Description: In the Match Analysis page (Phase 07), an "Improve this bullet" action per experience bullet opens a diff view (original vs suggested) with Accept/Reject; Accept writes the new bullet text into a **new** `Resume` row (a version) or into the current one only with explicit confirmation copy — never silent overwrite (spec §22).
Expected files: `features/resumes/BulletDiffDialog.jsx`, service function `resumeService.applyBulletSuggestion(...)`.
Acceptance criteria: Rejecting discards; Accepting requires an explicit click and shows exactly what changed.
Tests: Playwright E2E: request a suggestion, view diff, accept, verify persisted change; verify rejecting leaves the resume untouched.
Branch: `phase/08-resume-assistant`

### JOBOS-067 — Resume Tailoring summary panel
Priority: P1 | Dependencies: JOBOS-060, JOBOS-066
Description: Panel showing "what to emphasize / de-emphasize / missing keywords / relevant projects / relevant experience" per spec §22, derived from skill gap + match category scores.
Tests: Component test for the derivation logic (pure function separated from rendering).
Branch: `phase/08-resume-assistant`

**Phase 08 Gate:** no AI-suggested content ever persists without explicit user approval; anti-fabrication guard has test coverage for both pass and reject cases; lint/test/build pass; merge to `main`.

---

## Phase 09 — Analytics
Branch: `phase/09-analytics`
Objective: Dashboard metrics, charts, funnel, correlation views with correct labeling.

### JOBOS-068 — Analytics service: core counts
Priority: P0 | Dependencies: JOBOS-017
Description: `lib/services/analytics-service.js`: total applications, this-week, this-month, counts per status, response rate, interview conversion rate, offer conversion rate — via Prisma `groupBy`/`count`, not in-memory reduction.
Tests: Unit/integration tests with a seeded fixture set asserting exact expected numbers.
Branch: `phase/09-analytics`

### JOBOS-069 — Analytics service: time-series and breakdowns
Priority: P0 | Dependencies: JOBOS-068
Description: Applications-over-time (date-bucketed via `date_trunc`), by-status, by-role, by-location, by-company, by-salary-bucket, match-score-distribution.
Tests: Integration tests per breakdown against seeded data.
Branch: `phase/09-analytics`

### JOBOS-070 — Analytics service: funnel and advanced correlations
Priority: P1 | Dependencies: JOBOS-068
Description: Application→Interview→Offer funnel counts; match-score-vs-interview-progression, role/company/location-vs-response-rate, time-in-stage (derived from `ApplicationStatusHistory` timestamps).
Acceptance criteria: All correlation outputs are structured with a `type: "correlation"` marker consumed by the UI to render the required disclaimer.
Tests: Integration tests for funnel counts and at least one correlation calculation.
Branch: `phase/09-analytics`

### JOBOS-071 — Analytics API routes
Priority: P0 | Dependencies: JOBOS-068, JOBOS-069, JOBOS-070
Description: `GET /api/analytics/summary`, `/funnel`, `/timeseries`.
Tests: Integration tests per route.
Branch: `phase/09-analytics`

### JOBOS-072 — Analytics dashboard UI
Priority: P0 | Dependencies: JOBOS-071
Description: `app/(dashboard)/analytics/page.jsx` with summary cards, charts (using a lightweight chart lib, e.g. `recharts`), funnel visualization, correlation section with explicit "correlation, not causation" copy per spec §23.
Expected files: as above, `components/charts/*.jsx`.
Acceptance criteria: Charts render from seeded data; empty-state handled gracefully for a brand-new account.
Tests: Playwright E2E render/smoke test with seeded data.
Branch: `phase/09-analytics`

**Phase 09 Gate:** all analytics numbers verified against seeded fixtures; correlation labeling present; lint/test/build pass; merge to `main`.

---

## Phase 10 — Events & Notifications
Branch: `phase/10-notifications`
Objective: In-app notification center, Postgres-backed scheduler, reminder rules, job priority score.

### JOBOS-073 — Notification, UserPreference Prisma models
Priority: P0 | Dependencies: JOBOS-007
Description: Add per masterplan §21.
Tests: Migration test.
Branch: `phase/10-notifications`

### JOBOS-074 — Notification rules
Priority: P0 | Dependencies: JOBOS-073, JOBOS-027
Description: `lib/notifications/rules.js`: on `ApplicationEvent` create/update, schedule `EVENT_REMINDER` notifications (24h and 1h before `scheduledAt`); on `Application.deadline` set, schedule a `DEADLINE` notification.
Acceptance criteria: Rescheduling an event cancels/replaces its previously scheduled (unsent) notifications rather than duplicating.
Tests: Unit tests for rule derivation (pure logic) + integration test for the cancel-and-replace behavior.
Branch: `phase/10-notifications`

### JOBOS-075 — In-process scheduler
Priority: P0 | Dependencies: JOBOS-073
Description: `lib/notifications/scheduler.js` using `node-cron`, started once via `instrumentation.js`, polling every 60s for due, unsent notifications, marking `sentAt`.
Acceptance criteria: Idempotent — running the poll twice on the same due notification does not double-send/double-mark; safe under concurrent dev-server hot-reload (guarded start).
Tests: Integration test invoking the poll function directly (not waiting on real cron ticks) asserting correct `sentAt` marking and idempotency.
Branch: `phase/10-notifications`

### JOBOS-076 — Notifications API + in-app center
Priority: P0 | Dependencies: JOBOS-075
Description: `GET /api/notifications`, `PATCH /api/notifications/:id/read`, a bell icon + dropdown/panel in the Topbar.
Expected files: routes, `components/layout/NotificationCenter.jsx`.
Acceptance criteria: Unread count badge accurate; marking read persists.
Tests: Integration tests for routes; Playwright E2E for the UI flow (seed a due notification, see it appear, mark read).
Branch: `phase/10-notifications`

### JOBOS-077 — Job Priority Score
Priority: P1 | Dependencies: JOBOS-057 (reuses matching concepts)
Description: `lib/matching/priority-score.js` combining match score, salary, location preference, deadline proximity, and user-defined priority into an explainable weighted score; surfaced on Job/Application list as an optional sort/column.
Acceptance criteria: Pure, unit-testable function; weights documented and overridable similarly to match weights.
Tests: Unit tests with hand-computed expected outputs for representative inputs.
Branch: `phase/10-notifications`

**Phase 10 Gate:** reminders fire correctly against seeded due data; notification center works E2E; lint/test/build pass; merge to `main`.

---

## Phase 11 — Production Hardening
Branch: `phase/11-production-hardening`
Objective: Security review, rate limiting, error-page polish, account deletion confirmation, performance pass, final documentation.

### JOBOS-078 — Rate limiting on auth and AI endpoints
Priority: P0 | Dependencies: JOBOS-010, JOBOS-049
Description: `lib/utils/rate-limit.js` in-memory token bucket per user+route; applied to login, register, password-reset-request, and all `/api/ai/*` routes.
Tests: Unit test for the bucket algorithm; integration test asserting a 429 after exceeding the configured threshold.
Branch: `phase/11-production-hardening`

### JOBOS-079 — Centralized error boundary + safe error responses audit
Priority: P0 | Dependencies: JOBOS-044 (all routes exist by now)
Description: Audit every Route Handler for correct use of `handleRouteError`; add `app/error.jsx` and `app/(dashboard)/error.jsx` React error boundaries; ensure `NODE_ENV=production` strips stack traces from JSON error bodies.
Tests: Integration test asserting a simulated 500 does not leak a stack trace in production mode.
Branch: `phase/11-production-hardening`

### JOBOS-080 — Full cross-user isolation audit test suite
Priority: P0 | Dependencies: all prior CRUD phases
Description: A dedicated `tests/integration/isolation.test.js` that, for every resource type (Job, Application, Resume, MatchAnalysis, Notification, Event, Note), asserts user B gets 404/403 attempting to read/update/delete user A's records.
Tests: as described — this task's output is itself the test suite.
Branch: `phase/11-production-hardening`

### JOBOS-081 — File upload security audit
Priority: P0 | Dependencies: JOBOS-044
Description: Verify MIME sniffing (not extension trust), size limits, filename sanitization, and storage path isolation are all enforced; add a test uploading a disguised executable with a `.pdf` extension and assert rejection based on sniffed type.
Tests: Integration test as described.
Branch: `phase/11-production-hardening`

### JOBOS-082 — Account deletion flow with confirmation
Priority: P1 | Dependencies: JOBOS-013
Description: Settings page action to delete account, requiring password re-entry confirmation, cascading per masterplan §53.
Tests: Integration test asserting full cascade deletion; Playwright E2E for the confirmation UX.
Branch: `phase/11-production-hardening`

### JOBOS-083 — Performance pass: N+1 audit and index verification
Priority: P0 | Dependencies: all list/detail views
Description: Review every list/detail Server Component's Prisma calls for N+1 patterns; add `select`/`include` scoping; verify `EXPLAIN` on the main application list query uses the intended index with a seeded 5,000-row dataset.
Tests: A benchmark/integration test asserting the seeded list query completes under a documented threshold (e.g., <300ms) as a regression guard (soft-fail warning acceptable, not a hard CI blocker, since dev-machine variance is expected — document this explicitly).
Branch: `phase/11-production-hardening`

### JOBOS-084 — Structured logging pass
Priority: P1 | Dependencies: JOBOS-003
Description: Ensure `lib/utils/logger.js` is used consistently across services/routes (route, durationMs, userId-if-relevant, level); grep-audit for accidental `console.log` of secrets/passwords/tokens.
Tests: A lint rule or grep-based test asserting no raw `console.log` of request bodies containing `password`/`token` fields.
Branch: `phase/11-production-hardening`

### JOBOS-085 — Final documentation pass
Priority: P0 | Dependencies: all phases
Description: Update `README.md` (setup, scripts, env vars), finalize `masterplan.md` if any architecture drifted during implementation, add any pending ADRs from `docs/adr/`.
Acceptance criteria: A fresh clone + `npm install && npm run dev` following only the README works end to end.
Tests: Manual verification checklist recorded in the PR description.
Branch: `phase/11-production-hardening`

### JOBOS-086 — Full regression pass (unit+integration+E2E+lint+build)
Priority: P0 | Dependencies: JOBOS-078..085
Description: Run the entire test suite and fix any regressions surfaced by hardening changes (e.g., rate limiting breaking a Playwright test that logs in repeatedly).
Tests: The full suite itself, green.
Branch: `phase/11-production-hardening`

**Phase 11 Gate:** all tests green, lint/build pass, security audit tasks complete, README verified from a clean clone; merge to `main`. This merge marks MVP production-ready.

---

## Backlog (not scheduled — Phase 2 / Future, per masterplan §9/§10)

P2: Customizable status pipelines (`ApplicationStatusDefinition` migration), email + browser push notifications, resume export to PDF/DOCX, recruiter CRM, browser extension, bulk resume version diffing.

P3: Multi-user/team workspaces, interview question bank, offer comparison/negotiation tooling, calendar sync, Elasticsearch migration, S3/R2 storage migration, BullMQ/Redis notification worker migration.
