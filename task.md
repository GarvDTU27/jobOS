# JobOS — Master Task Checklist & Implementation Breakdown

Format per task: ID, Title, Phase, Priority (P0=MVP blocking, P1=MVP important, P2=Phase 2, P3=Future), Dependencies, Description, Expected files/modules, Implementation details, Acceptance criteria, Tests required, Git branch.

---

## 1. Executive Status Dashboard

### [x] COMPLETED TASKS (Phases 01–06 + Phase 07 Milestones + Core Engineering)
- [x] **JOBOS-001** — Initialize Next.js project (JS/JSX only, Tailwind CSS, ESLint)
- [x] **JOBOS-002** — Add Prisma and connect to PostgreSQL
- [x] **JOBOS-003** — Base folder structure and lib utilities (`errors.js`, `logger.js`, `pagination.js`)
- [x] **JOBOS-004** — Base UI primitives (Button, Input, Select, Dialog, Badge, Table, Toast)
- [x] **JOBOS-005** — Dashboard layout shell with responsive sidebar navigation
- [x] **JOBOS-006** — Testing and quality pipeline setup (Vitest + Playwright)
- [x] **JOBOS-007** — User and Session Prisma models & initial migration
- [x] **JOBOS-008** — Password hashing utility with bcryptjs (salt rounds 10)
- [x] **JOBOS-009** — Registration validation schema and auth service
- [x] **JOBOS-010** — Auth.js configuration with Credentials provider + DB sessions
- [x] **JOBOS-011** — Registration and login UI pages & forms
- [x] **JOBOS-012** — Route protection middleware (`middleware.js`)
- [x] **JOBOS-013** — Logout action & session invalidation
- [x] **JOBOS-014** — Password reset API endpoints (`/api/auth/reset-password/*`)
- [x] **JOBOS-015** — Email verification backend architecture & token persistence
- [x] **JOBOS-016** — Auth integration & Playwright E2E authentication tests
- [x] **JOBOS-017** — Application, StatusHistory, Event, Note, Tag Prisma models
- [x] **JOBOS-018** — Application Zod validation schemas
- [x] **JOBOS-019** — Application service (CRUD, cascade deletes, status transition history)
- [x] **JOBOS-020** — Application list & creation REST API (`/api/applications`)
- [x] **JOBOS-021** — Application detail, update, delete REST API (`/api/applications/[id]`)
- [x] **JOBOS-022** — Status transition dedicated endpoint (`/api/applications/[id]/status`)
- [x] **JOBOS-023** — Application Notes & Events sub-resource REST APIs
- [x] **JOBOS-024** — Application Tags management REST API
- [x] **JOBOS-025** — Application list table UI with multi-status badges
- [x] **JOBOS-026** — Application search, status filtering, and sorting UI controls
- [x] **JOBOS-027** — Application detail view with timeline and notes panels
- [x] **JOBOS-028** — Application creation & editing UI forms
- [x] **JOBOS-029** — Application tracker Playwright E2E test suite
- [x] **JOBOS-030** — Phase 03 gate verification & merge
- [x] **JOBOS-031** — Job & JobSkill Prisma models with relations
- [x] **JOBOS-032** — Job validation schema & job service with archive guard
- [x] **JOBOS-033** — Job REST API endpoints (`/api/jobs`, `/api/jobs/[id]`)
- [x] **JOBOS-034** — Job to Application conversion endpoint (`/api/jobs/[id]/convert-to-application`)
- [x] **JOBOS-035** — Job list, filter, and detail UI views (`/jobs`, `/jobs/[id]`)
- [x] **JOBOS-036** — Job creation & edit forms with conversion trigger
- [x] **JOBOS-037** — Job management integration tests & Phase 04 gate
- [x] **JOBOS-038** — Resume, ResumeSkill, Education, Experience, Project models
- [x] **JOBOS-039** — Storage provider abstraction & local filesystem driver (`uploads/`)
- [x] **JOBOS-040** — Document parser contract & parser dispatcher
- [x] **JOBOS-041** — Multi-format parsers (PDF via `pdf-parse`, DOCX via `mammoth`, TXT UTF-8, DOC probe)
- [x] **JOBOS-042** — Magic-byte MIME validation (`file-type`) & size guard
- [x] **JOBOS-043** — Resume service (upload, storage, parsing dispatch, versioning)
- [x] **JOBOS-044** — Resume upload and management REST APIs (`/api/resumes/*`)
- [x] **JOBOS-045** — Resume upload drag-and-drop UI with status indicators
- [x] **JOBOS-046** — Resume detail viewer with extracted metadata and parsed text
- [x] **JOBOS-047** — Resume processing test suite & Phase 05 gate
- [x] **JOBOS-048** — JobAnalysis Prisma model
- [x] **JOBOS-049** — Google Gemini AI provider module with retry logic & schema parsing
- [x] **JOBOS-050** — Prompt injection defense & XML boundary guards (`lib/ai/prompt-guard.js`)
- [x] **JOBOS-051** — JD parsing & structured extraction service (`lib/services/jd-service.js`)
- [x] **JOBOS-052** — JD parse API endpoint (`POST /api/jd/parse`)
- [x] **JOBOS-053** — Interactive JD input & extraction results UI (`features/jd-analysis/`)
- [x] **JOBOS-054** — MatchAnalysis and SkillGap Prisma models with `isCurrent` toggle
- [x] **JOBOS-055** — Skill normalizer with alias table & unit tests (`lib/matching/skill-normalizer.js`)
- [x] **ENG-001** — Multi-Stage Dockerfile & Docker Compose Setup
- [x] **ENG-002** — Automated GitHub Actions CI/CD Pipeline
- [x] **ENG-003** — Vitest Test Coverage Reporting with v8 Provider (82.5% statement coverage)
- [x] **ENG-004** — Structured JSON Logging & Centralized Error Handling (`lib/logger.js`)
- [x] **ENG-005** — End-to-End Runtime Input Validation with Zod
- [x] **ENG-006** — Database Health Check Endpoint (`GET /api/health`)
- [x] **ENG-007** — Documented Environment Configuration (`.env.example`)

---

### [-] IN PROGRESS (Phase 07 Matching Engine Core)
- [-] **JOBOS-056** — AI semantic skill matcher on residual unmatched skill pairs (`lib/ai/matching.js`)
- [-] **JOBOS-057** — Deterministic 6-category score engine (`lib/matching/score-engine.js`)

---

### [ ] NEXT / PLANNED TASKS (Phases 07–11 + Production Deployment)
- [ ] **JOBOS-058** — Match weights configuration & per-user override (`lib/matching/weights.js`)
- [ ] **JOBOS-059** — Match service orchestrator & endpoints (`POST /api/match`, `GET /api/match/[applicationId]`)
- [ ] **JOBOS-060** — Skill gap derivation (`STRONG`, `PARTIAL`, `MISSING` × `REQUIRED`, `PREFERRED`)
- [ ] **JOBOS-061** — Match Analysis UI breakdown (`/analysis/[applicationId]` with score card & gap list)
- [ ] **JOBOS-062** — AI Resume Assistant: Anti-fabrication prompt guardrails
- [ ] **JOBOS-063** — AI Resume Assistant: Tailored bullet generation API (`/api/ai/tailor-bullet`)
- [ ] **JOBOS-064** — AI Resume Assistant: Diff-based bullet review & approval UI
- [ ] **JOBOS-065** — Application Kanban board view (`app/(dashboard)/applications/kanban`)
- [ ] **JOBOS-066** — Analytics API (`/api/analytics`) calculating funnel conversion and stage velocity
- [ ] **JOBOS-067** — Analytics Dashboard with responsive charts
- [ ] **JOBOS-068** — In-app notification center and reminder scheduler (`/api/notifications`)
- [ ] **JOBOS-069** — Live email integration via SMTP / AWS SES for password resets and deadline reminders
- [ ] **JOBOS-070** — S3 Storage provider driver (`lib/storage/s3-provider.js`)
- [ ] **JOBOS-071** — Job Priority Score algorithm (`lib/matching/priority-score.js`)
- [ ] **JOBOS-072** — Rate limiting on authentication and AI endpoints
- [ ] **JOBOS-073** — Centralized error boundary & safe error response audit
- [ ] **JOBOS-074** — Full cross-user isolation integration test suite
- [ ] **JOBOS-075** — File upload security audit and executable disguised file checks
- [ ] **JOBOS-076** — Account deletion flow with password confirmation and cascade verification
- [ ] **JOBOS-077** — Performance pass: N+1 query audit and index verification with 5,000 seeded rows
- [ ] **JOBOS-078** — Structured logging audit across all service boundaries
- [ ] **JOBOS-079** — Final documentation pass and ADR consolidation
- [ ] **JOBOS-080** — Full regression pass (unit + integration + E2E + lint + build)
- [ ] **ENG-008** — Production Cloud Deployment (Vercel & AWS ECS Container Hosting)

---

## 2. Phase-by-Phase Detailed Specifications

### Phase 01 — Foundation (`[x] DONE`)
Branch: `phase/01-foundation`  
Objective: Bootstrapped Next.js app, Prisma connected to PostgreSQL, base UI shell, lint/test/build pipeline green.

#### [x] JOBOS-001 — Initialize Next.js project (JS/JSX only)
- **Priority**: P0 | **Dependencies**: none
- **Description**: Scaffold Next.js App Router project with JavaScript (no TypeScript), Tailwind CSS, ESLint.
- **Expected files**: `package.json`, `next.config.mjs`, `postcss.config.mjs`, `app/layout.js`, `app/page.jsx`, `eslint.config.mjs`, `.gitignore`.
- **Implementation details**: Use Next.js 16 App Router; explicitly delete any `.ts`/`.tsx` files; configure ESLint rule forbidding `.ts`/`.tsx` files.
- **Acceptance criteria**: `npm run dev` serves home page; `npm run lint` and `npm run build` pass; zero `.ts`/`.tsx` files.
- **Tests**: Scaffolding build check.

#### [x] JOBOS-002 — Add Prisma and connect to PostgreSQL
- **Priority**: P0 | **Dependencies**: JOBOS-001
- **Description**: Install Prisma, create `prisma/schema.prisma`, configure `DATABASE_URL`.
- **Expected files**: `prisma/schema.prisma`, `lib/db/prisma.js`, `.env.example`.
- **Implementation details**: Singleton `PrismaClient` in `lib/db/prisma.js`, guarding against connection proliferation in dev via `globalThis`.
- **Acceptance criteria**: Database connection succeeds against PostgreSQL; `prisma generate` creates client.
- **Tests**: Integration smoke test asserting `prisma.$connect()` succeeds.

#### [x] JOBOS-003 — Base folder structure and lib utilities
- **Priority**: P0 | **Dependencies**: JOBOS-001
- **Description**: Create folder skeleton, custom error classes, and pagination utilities.
- **Expected files**: `lib/utils/errors.js`, `lib/utils/logger.js`, `lib/utils/pagination.js`.
- **Implementation details**: `errors.js` implements custom error hierarchy (`AppError`, `ValidationError`, `NotFoundError`, etc.). `pagination.js` parses and bounds skip/take limits.
- **Acceptance criteria**: Error classes instantiate with correct `.status` and `.code`; pagination clamps to max 100 items.
- **Tests**: Unit tests in `tests/unit/errors.test.js` and `tests/unit/pagination.test.js`.

#### [x] JOBOS-004 — Base UI primitives
- **Priority**: P0 | **Dependencies**: JOBOS-001
- **Description**: Build `components/ui/` primitives: Button, Input, Select, Dialog, Table, Toast.
- **Expected files**: `components/ui/*.jsx`.
- **Implementation details**: Tailwind-based, accessible primitives using Radix UI headless components where appropriate.
- **Acceptance criteria**: Each primitive renders cleanly with proper styling and ARIA attributes.
- **Tests**: Unit render tests in `tests/unit/components.test.jsx`.

#### [x] JOBOS-005 — Dashboard layout shell
- **Priority**: P0 | **Dependencies**: JOBOS-004
- **Description**: Build `app/(dashboard)/layout.jsx` with responsive navigation sidebar and topbar.
- **Expected files**: `app/(dashboard)/layout.jsx`, `app/(dashboard)/page.jsx`.
- **Implementation details**: Server Component layout shell; active-link highlighting based on current pathname.
- **Acceptance criteria**: Navigating between routes preserves shell layout without flickering.
- **Tests**: Smoke test rendering dashboard layout.

#### [x] JOBOS-006 — Testing and quality pipeline
- **Priority**: P0 | **Dependencies**: JOBOS-001
- **Description**: Configure Vitest for unit/integration tests and Playwright for browser E2E tests.
- **Expected files**: `vitest.config.js`, `playwright.config.js`, `package.json` test scripts.
- **Acceptance criteria**: `npm run test` and `npm run test:e2e` execute properly.
- **Tests**: Initial passing unit test suite.

---

### Phase 02 — Authentication (`[x] DONE`)
Branch: `phase/02-authentication`  
Objective: Full register/login/logout, protected routes, password reset architecture, user data isolation groundwork.

#### [x] JOBOS-007 — User and Session Prisma models & migration
- **Priority**: P0 | **Dependencies**: JOBOS-002
- **Description**: Add `User`, `Session`, `PasswordResetToken` models to Prisma schema.
- **Acceptance criteria**: Migration applies cleanly; unique constraint on `User.email` enforced.
- **Tests**: Integration test verifying unique email constraint and cascade deletions.

#### [x] JOBOS-008 — Password hashing utility
- **Priority**: P0 | **Dependencies**: JOBOS-007
- **Description**: `lib/auth/password.js` with `hashPassword` and `verifyPassword` using bcryptjs (salt rounds 10).
- **Acceptance criteria**: Round-trip hash/verify succeeds; incorrect password fails verification.
- **Tests**: Unit tests in `tests/unit/password.test.js`.

#### [x] JOBOS-009 — Registration validation schema and auth service
- **Priority**: P0 | **Dependencies**: JOBOS-008
- **Description**: `lib/validation/schemas/auth.js` and `lib/services/auth-service.js`.
- **Acceptance criteria**: Service rejects duplicate emails with `ConflictError`; persists bcrypt hash only.
- **Tests**: Unit tests in `tests/unit/auth-schema.test.js` and integration tests in `tests/integration/auth-service.test.js`.

#### [x] JOBOS-010 — Auth.js configuration with Credentials provider
- **Priority**: P0 | **Dependencies**: JOBOS-009
- **Description**: Configure NextAuth v5 with Credentials provider and Prisma session adapter.
- **Expected files**: `lib/auth/auth.config.js`, `lib/auth/auth.js`, `app/api/auth/[...nextauth]/route.js`.
- **Acceptance criteria**: User can authenticate with valid credentials; sessions persist in database.
- **Tests**: Integration tests in `tests/integration/auth-authorize.test.js`.

#### [x] JOBOS-011 — Registration and login pages
- **Priority**: P0 | **Dependencies**: JOBOS-010, JOBOS-004
- **Description**: Build `app/(auth)/login/page.jsx`, `app/(auth)/register/page.jsx`, and feature components in `features/auth/`.
- **Acceptance criteria**: Form submits credentials; error alerts display on bad login or validation failure.
- **Tests**: Component render tests and Playwright E2E verification.

#### [x] JOBOS-012 — Route protection middleware
- **Priority**: P0 | **Dependencies**: JOBOS-010
- **Description**: Implement `middleware.js` to protect `app/(dashboard)/*` and `app/api/*`, redirecting unauthenticated requests to `/login`.
- **Acceptance criteria**: Unauthenticated browser visits redirect to `/login`; unauthenticated API calls return 401 Unauthorized.
- **Tests**: E2E route protection test in `tests/e2e/auth.spec.js`.

#### [x] JOBOS-013 — Logout functionality
- **Priority**: P0 | **Dependencies**: JOBOS-010
- **Description**: NextAuth signOut action clearing session cookies and invalidating session token in database.
- **Acceptance criteria**: Clicking logout invalidates session and redirects to `/login`.
- **Tests**: E2E logout flow test in `tests/e2e/auth.spec.js`.

#### [x] JOBOS-014 — Password reset API architecture
- **Priority**: P1 | **Dependencies**: JOBOS-010
- **Description**: Endpoints `app/api/auth/reset-password/request` and `confirm`.
- **Acceptance criteria**: Generates secure random reset token with 1-hour expiry; resets password when presented with valid token.
- **Tests**: Integration test in `tests/integration/auth-reset.test.js`.

#### [x] JOBOS-015 — Email verification architecture
- **Priority**: P1 | **Dependencies**: JOBOS-010
- **Description**: Endpoint `app/api/auth/verify-email` updating `emailVerified` timestamp on user.
- **Acceptance criteria**: Valid verification token updates user record; expired or invalid token rejected.
- **Tests**: Integration test in `tests/integration/auth-verify.test.js`.

#### [x] JOBOS-016 — Auth integration & Playwright E2E test suite
- **Priority**: P0 | **Dependencies**: JOBOS-007..015
- **Description**: End-to-end browser tests verifying complete user authentication flow.
- **Acceptance criteria**: Registration, login, dashboard redirection, and logout pass cleanly in headless browser.
- **Tests**: `tests/e2e/auth.spec.js`.

---

### Phase 03 — Application Tracker (`[x] DONE`)
Branch: `phase/03-application-tracker`  
Objective: Relational application tracking, status history, events, notes, tags, server-side filtering, sorting, and pagination.

#### [x] JOBOS-017 — Application models & schema migration
- **Priority**: P0 | **Dependencies**: JOBOS-007
- **Description**: Add `Application`, `ApplicationStatusHistory`, `ApplicationEvent`, `ApplicationNote`, `Tag`, `ApplicationTag` models.
- **Acceptance criteria**: Models support 10 lifecycle statuses; composite indexes on `[userId, status]`, `[userId, deadline]`.
- **Tests**: Migration and cascade delete integration tests in `tests/integration/application-models.test.js`.

#### [x] JOBOS-018 — Application Zod validation schemas
- **Priority**: P0 | **Dependencies**: none
- **Description**: `lib/validation/schemas/application.js`, `event.js`, `note.js`, `tag.js`.
- **Acceptance criteria**: Strict validation of required fields, status enums, dates, and query filter parameters.
- **Tests**: Unit tests in `tests/unit/application-schema.test.js`.

#### [x] JOBOS-019 — Application service layer
- **Priority**: P0 | **Dependencies**: JOBOS-017, JOBOS-018
- **Description**: `lib/services/application-service.js` implementing application CRUD, status transition history, notes, and events.
- **Acceptance criteria**: Status update appends `ApplicationStatusHistory` row atomically via `prisma.$transaction`.
- **Tests**: Integration tests in `tests/integration/application-service.test.js`.

#### [x] JOBOS-020 — Application collection REST API (`/api/applications`)
- **Priority**: P0 | **Dependencies**: JOBOS-019
- **Description**: `GET /api/applications` (paginated, filtered, sorted) and `POST /api/applications`.
- **Acceptance criteria**: Scoped by session `userId`; returns paginated list and total count metadata.
- **Tests**: Integration tests in `tests/integration/applications-api.test.js`.

#### [x] JOBOS-021 — Application item REST API (`/api/applications/[id]`)
- **Priority**: P0 | **Dependencies**: JOBOS-019
- **Description**: `GET`, `PATCH`, `DELETE /api/applications/[id]`.
- **Acceptance criteria**: Returns 404 if application does not belong to session user.
- **Tests**: Integration tests verifying user isolation and update operations.

#### [x] JOBOS-022 — Application status transition API
- **Priority**: P0 | **Dependencies**: JOBOS-019
- **Description**: `PATCH /api/applications/[id]/status` dedicated status transition endpoint.
- **Acceptance criteria**: Updates status and records transition history note.
- **Tests**: Integration tests in `tests/integration/history-api.test.js`.

#### [x] JOBOS-023 — Application Notes and Events REST APIs
- **Priority**: P1 | **Dependencies**: JOBOS-019
- **Description**: Endpoints for managing notes and scheduling interview events.
- **Acceptance criteria**: Events and notes are correctly associated with parent application.
- **Tests**: Integration tests in `tests/integration/note-event-api.test.js`.

#### [x] JOBOS-024 — Application Tags management REST API
- **Priority**: P1 | **Dependencies**: JOBOS-019
- **Description**: Endpoints for associating and removing tags on applications.
- **Acceptance criteria**: Tags are normalized; duplicate tags on same application rejected.
- **Tests**: Integration tests in `tests/integration/tags-api.test.js`.

#### [x] JOBOS-025 — Application list table UI
- **Priority**: P0 | **Dependencies**: JOBOS-020, JOBOS-004
- **Description**: Table view rendering applications with status badges, company, role, match score, and date.
- **Acceptance criteria**: Renders empty state when no applications exist; shows status badges with appropriate colors.
- **Tests**: Component render tests.

#### [x] JOBOS-026 — Search, status filter, and sorting UI controls
- **Priority**: P0 | **Dependencies**: JOBOS-025
- **Description**: `components/tracker/ApplicationFilters.jsx` with debounced text search, multi-select status pills, and sort dropdown.
- **Acceptance criteria**: Changing filter updates URL query parameters and triggers server-side filtered refetch.
- **Tests**: Integration filter tests in `tests/integration/application-filter-sort.test.js`.

#### [x] JOBOS-027 — Application detail view with timeline and notes
- **Priority**: P0 | **Dependencies**: JOBOS-021, JOBOS-022
- **Description**: `app/(dashboard)/applications/[id]/page.jsx` with status progression timeline, notes panel, and event list.
- **Acceptance criteria**: Displays chronological history of status changes and allows adding notes/events inline.
- **Tests**: E2E navigation test.

#### [x] JOBOS-028 — Application creation and editing forms
- **Priority**: P0 | **Dependencies**: JOBOS-020, JOBOS-021
- **Description**: Forms at `/applications/new` and `/applications/[id]/edit`.
- **Acceptance criteria**: Validates inputs; submits payload and redirects to detail view on success.
- **Tests**: Form validation tests.

#### [x] JOBOS-029 — Application tracker Playwright E2E tests
- **Priority**: P0 | **Dependencies**: JOBOS-017..028
- **Description**: Browser tests exercising application creation, search, filter, and status update.
- **Acceptance criteria**: Complete lifecycle flow passes in `tests/e2e/applications.spec.js`.
- **Tests**: `tests/e2e/applications.spec.js`.

#### [x] JOBOS-030 — Phase 03 gate verification
- **Priority**: P0 | **Dependencies**: JOBOS-017..029
- **Description**: Full quality gate check and merge to `main`.
- **Acceptance criteria**: All unit, integration, and E2E tests pass; zero lint errors.

---

### Phase 04 — Job Management (`[x] DONE`)
Branch: `phase/04-job-management`  
Objective: Job inventory CRUD, salary tracking, soft-archive toggle, 1-click conversion to application.

#### [x] JOBOS-031 — Job & JobSkill Prisma models
- **Priority**: P0 | **Dependencies**: JOBOS-007
- **Description**: Add `Job`, `JobSkill`, `Skill` models with cascade constraints.
- **Acceptance criteria**: Unique constraint on `Skill.normalizedName` and `JobSkill.[jobId, skillId]`.
- **Tests**: Integration tests in `tests/integration/job-models.test.js`.

#### [x] JOBOS-032 — Job validation schema and service layer
- **Priority**: P0 | **Dependencies**: JOBOS-031
- **Description**: `lib/validation/schemas/job.js` and `lib/services/job-service.js`.
- **Acceptance criteria**: Deleting a job referenced by an application is blocked unless force flag is passed.
- **Tests**: Integration tests in `tests/integration/job-service.test.js`.

#### [x] JOBOS-033 — Job REST APIs
- **Priority**: P0 | **Dependencies**: JOBOS-032
- **Description**: `GET /api/jobs`, `POST /api/jobs`, `GET /api/jobs/[id]`, `PATCH /api/jobs/[id]`, `DELETE /api/jobs/[id]`.
- **Acceptance criteria**: Scoped by session user; supports search, archive filter, and pagination.
- **Tests**: Integration tests in `tests/integration/jobs-api.test.js`.

#### [x] JOBOS-034 — Convert Job to Application endpoint
- **Priority**: P0 | **Dependencies**: JOBOS-033, JOBOS-019
- **Description**: `POST /api/jobs/[id]/convert-to-application`.
- **Acceptance criteria**: Creates an `Application` linked to the `Job`, copying company, role, and location.
- **Tests**: Integration test verifying conversion and data copying.

#### [x] JOBOS-035 — Job list and detail UI views
- **Priority**: P0 | **Dependencies**: JOBOS-033
- **Description**: Pages at `app/(dashboard)/jobs/page.jsx` and `jobs/[id]/page.jsx`.
- **Acceptance criteria**: Displays saved jobs with salary, location, and archive status.
- **Tests**: UI render tests.

#### [x] JOBOS-036 — Job creation and edit forms
- **Priority**: P0 | **Dependencies**: JOBOS-035
- **Description**: Job form with ConvertJobButton trigger.
- **Acceptance criteria**: Allows entering job details and converting directly into an active application.
- **Tests**: Form interaction tests.

#### [x] JOBOS-037 — Job management integration tests & Phase 04 gate
- **Priority**: P0 | **Dependencies**: JOBOS-031..036
- **Description**: Full test suite pass and merge to `main`.
- **Acceptance criteria**: Lint, build, and test suites pass cleanly.

---

### Phase 05 — Resume & Document Processing (`[x] DONE`)
Branch: `phase/05-resume-processing`  
Objective: Multi-format file ingestion (PDF, DOCX, TXT, DOC), magic-byte MIME validation, storage provider abstraction, resume versioning.

#### [x] JOBOS-038 — Resume Prisma models
- **Priority**: P0 | **Dependencies**: JOBOS-007
- **Description**: Add `Resume`, `ResumeSkill`, `Education`, `Experience`, `Project`, `Certification` models.
- **Acceptance criteria**: Cascade delete removes all extracted child models when a resume is deleted.
- **Tests**: Integration tests in `tests/integration/resume-models.test.js`.

#### [x] JOBOS-039 — Storage provider abstraction & local filesystem driver
- **Priority**: P0 | **Dependencies**: none
- **Description**: `lib/storage/provider.js` and `lib/storage/local-provider.js` storing files in `./uploads`.
- **Acceptance criteria**: Path traversal attempts rejected with `400 INVALID_KEY`.
- **Tests**: Unit tests in `tests/unit/storage.test.js`.

#### [x] JOBOS-040 — Document parser contract & parser dispatcher
- **Priority**: P0 | **Dependencies**: none
- **Description**: `lib/parsers/contract.js` and `lib/parsers/index.js` selecting parser by detected MIME type.
- **Acceptance criteria**: Dispatcher routes to appropriate parser and handles unsupported types cleanly.
- **Tests**: Unit tests in `tests/unit/parser-dispatcher.test.js`.

#### [x] JOBOS-041 — Multi-format parsers (PDF, DOCX, TXT, DOC)
- **Priority**: P0 | **Dependencies**: JOBOS-040
- **Description**: Parsers in `lib/parsers/` using `pdf-parse`, `mammoth`, native UTF-8 decode, and `soffice` probe fallback.
- **Acceptance criteria**: Extracts text and warnings conforming to parser contract.
- **Tests**: Unit tests in `tests/unit/pdf-parser.test.js`, `docx-parser.test.js`, `doc-parser.test.js`, and `parsers.test.js`.

#### [x] JOBOS-042 — Magic-byte MIME validation & file size guards
- **Priority**: P0 | **Dependencies**: JOBOS-040
- **Description**: Detect MIME type via `file-type` buffer inspection; enforce 5MB size limit.
- **Acceptance criteria**: Disguised files (e.g., `.exe` renamed to `.pdf`) rejected with `422 Unsupported file type`.
- **Tests**: Unit tests in `tests/unit/parsers.test.js`.

#### [x] JOBOS-043 — Resume service layer
- **Priority**: P0 | **Dependencies**: JOBOS-038, JOBOS-039, JOBOS-041
- **Description**: `lib/services/resume-service.js` managing uploads, storage persistence, parser execution, and default flags.
- **Acceptance criteria**: Setting a resume as default unsets previous default in a transaction.
- **Tests**: Integration tests in `tests/integration/resume-api.test.js`.

#### [x] JOBOS-044 — Resume upload and management REST APIs
- **Priority**: P0 | **Dependencies**: JOBOS-043
- **Description**: `GET /api/resumes`, `POST /api/resumes`, `GET /api/resumes/[id]`, `DELETE /api/resumes/[id]`.
- **Acceptance criteria**: Scoped by user session; supports multipart upload and metadata retrieval.
- **Tests**: Integration tests in `tests/integration/resume-api.test.js`.

#### [x] JOBOS-045 — Resume upload UI with drag-and-drop
- **Priority**: P0 | **Dependencies**: JOBOS-044, JOBOS-004
- **Description**: Upload dropzone with progress indicator and file validation feedback.
- **Acceptance criteria**: Provides visual feedback on upload completion or parsing failure.
- **Tests**: Component tests.

#### [x] JOBOS-046 — Resume detail viewer with extracted sections
- **Priority**: P0 | **Dependencies**: JOBOS-044
- **Description**: `app/(dashboard)/resumes/[id]/page.jsx` rendering extracted text, skills, and experience.
- **Acceptance criteria**: Displays parsed resume sections and file metadata.
- **Tests**: UI render tests.

#### [x] JOBOS-047 — Resume processing test suite & Phase 05 gate
- **Priority**: P0 | **Dependencies**: JOBOS-038..046
- **Description**: Full regression check and merge to `main`.
- **Acceptance criteria**: All parser and resume tests pass cleanly.

---

### Phase 06 — JD Analysis & AI Extraction (`[x] DONE`)
Branch: `phase/06-jd-analysis`  
Objective: Google Gemini AI client integration, prompt injection defense, structured extraction of requirements from raw job descriptions.

#### [x] JOBOS-048 — JobAnalysis Prisma model
- **Priority**: P0 | **Dependencies**: JOBOS-031
- **Description**: Add `JobAnalysis` model with 1-to-1 relation to `Job` storing seniority, responsibilities, qualifications, and keywords.
- **Acceptance criteria**: Cascade delete removes `JobAnalysis` when parent `Job` is deleted.
- **Tests**: Integration test in `tests/integration/job-models.test.js`.

#### [x] JOBOS-049 — Google Gemini AI provider module
- **Priority**: P0 | **Dependencies**: none
- **Description**: `lib/ai/provider.js` client wrapper with structured JSON output, timeout handling, and exponential backoff retry logic.
- **Acceptance criteria**: Retries on transient errors; parses and validates output against supplied Zod schema.
- **Tests**: Unit tests with mocked SDK in `tests/unit/ai-provider.test.js`.

#### [x] JOBOS-050 — Prompt injection defense & XML boundary guards
- **Priority**: P0 | **Dependencies**: none
- **Description**: `lib/ai/prompt-guard.js` wrapping untrusted document text in `<untrusted_document>` tags and sanitizing input.
- **Acceptance criteria**: User input cannot escape delimiter tags; suspicious instruction overrides flagged.
- **Tests**: Unit tests in `tests/unit/prompt-guard.test.js`.

#### [x] JOBOS-051 — JD parsing & structured extraction service
- **Priority**: P0 | **Dependencies**: JOBOS-049, JOBOS-050
- **Description**: `lib/ai/jd-analysis.js` and `lib/services/jd-service.js`.
- **Acceptance criteria**: Transforms raw JD text into validated JSON conforming to `jdExtractionSchema`.
- **Tests**: Unit tests in `tests/unit/jd-analysis.test.js`.

#### [x] JOBOS-052 — JD parse API endpoint (`POST /api/jd/parse`)
- **Priority**: P0 | **Dependencies**: JOBOS-051
- **Description**: Route handler accepting raw text JSON payload or multipart document file.
- **Acceptance criteria**: Returns structured analysis and automatically associates extracted skills.
- **Tests**: Integration tests in `tests/integration/jd-parse-api.test.js`.

#### [x] JOBOS-053 — Interactive JD input & extraction results UI
- **Priority**: P0 | **Dependencies**: JOBOS-052
- **Description**: `features/jd-analysis/JDInputPanel.jsx` and `ExtractionResults.jsx` embedded in job creation flow.
- **Acceptance criteria**: User can paste JD, trigger AI extraction, review extracted skills, and save job with analysis attached.
- **Tests**: Component render and user interaction tests.

---

### Phase 07 — Resume/JD Matching Engine (`[-] IN PROGRESS`)
Branch: `phase/07-matching`  
Objective: Deterministic multi-factor scoring engine, skill-gap categorization, explainable match breakdown UI.

#### [x] JOBOS-054 — MatchAnalysis and SkillGap Prisma models (`[x] DONE`)
- **Priority**: P0 | **Dependencies**: JOBOS-043, JOBOS-048
- **Description**: Add `MatchAnalysis` and `SkillGap` models to `prisma/schema.prisma`.
- **Acceptance criteria**: Deleting an application cascades to match analyses; creating a new analysis flips previous ones to `isCurrent: false`.
- **Tests**: Integration tests in `tests/integration/match-models.test.js`.

#### [x] JOBOS-055 — Skill normalizer with alias table (`[x] DONE`)
- **Priority**: P0 | **Dependencies**: none
- **Description**: `lib/matching/skill-normalizer.js` with sanitization, lowercase conversion, and alias mappings (`JS` → `JavaScript`, `Postgres` → `PostgreSQL`).
- **Acceptance criteria**: Normalizer handles aliases, punctuation, and direct matches; alias dictionary is cleanly structured.
- **Tests**: Unit tests in `tests/unit/skill-normalizer.test.js` (11 tests passing).

#### [-] JOBOS-056 — AI semantic skill matcher (`[-] IN PROGRESS`)
- **Priority**: P0 | **Dependencies**: JOBOS-049, JOBOS-050, JOBOS-055
- **Description**: `lib/ai/matching.js` matching residual unmatched skill pairs for near-equivalence (e.g. "Redis" vs "In-memory caching") returning confidence score.
- **Acceptance criteria**: Operates only on unmatched residual sets to minimize LLM token usage and latency.
- **Tests**: Unit tests with mocked Gemini provider.

#### [-] JOBOS-057 — Deterministic score engine (`[-] IN PROGRESS`)
- **Priority**: P0 | **Dependencies**: JOBOS-055, JOBOS-056
- **Description**: `lib/matching/score-engine.js` implementing pure function `computeMatch({ resumeData, jobData, semanticPairs, weights })`.
- **Acceptance criteria**: Zero database or network dependency; identical inputs always produce identical scores (0–100).
- **Tests**: Extensive unit tests verifying category formulas and edge cases (perfect match=100, zero match=0).

#### [ ] JOBOS-058 — Match weights configuration & per-user override (`[ ] PLANNED`)
- **Priority**: P1 | **Dependencies**: JOBOS-057
- **Description**: `lib/matching/weights.js` defining default category weights (30/20/10/20/10/10) and merging user preference overrides.
- **Acceptance criteria**: Malformed weight overrides fall back safely to defaults with a logged warning.
- **Tests**: Unit tests for weight merge and fallback logic.

#### [ ] JOBOS-059 — Match service orchestrator & endpoints (`[ ] PLANNED`)
- **Priority**: P0 | **Dependencies**: JOBOS-057, JOBOS-058, JOBOS-054
- **Description**: `lib/services/match-service.js` orchestrating normalizer → semantic matcher → score engine → persistence; endpoints `POST /api/match`, `GET /api/match/[applicationId]`.
- **Acceptance criteria**: Denormalized `Application.matchScore` updated atomically alongside `MatchAnalysis` record.
- **Tests**: Integration test verifying complete match run and database state updates.

#### [ ] JOBOS-060 — Skill gap derivation (`[ ] PLANNED`)
- **Priority**: P0 | **Dependencies**: JOBOS-059
- **Description**: Derive `SkillGap` records (`STRONG`, `PARTIAL`, `MISSING` × `REQUIRED`, `PREFERRED`) persisted with `MatchAnalysis`.
- **Acceptance criteria**: Every JD skill is categorized into exactly one `SkillGap` record.
- **Tests**: Unit test on gap derivation logic.

#### [ ] JOBOS-061 — Match Analysis UI breakdown (`[ ] PLANNED`)
- **Priority**: P0 | **Dependencies**: JOBOS-059, JOBOS-060
- **Description**: `app/(dashboard)/analysis/[applicationId]/page.jsx` rendering overall score, category progress bars, and skill gap lists.
- **Acceptance criteria**: Triggerable from application detail page when resume and job are attached; clear disclaimer stating "Not an ATS score".
- **Tests**: Playwright E2E test verifying score breakdown rendering.

---

### Phase 08 — Resume AI Assistant (`[ ] PLANNED`)
Branch: `phase/08-resume-assistant`  
Objective: Bullet point improvement with anti-fabrication guardrails, diff-based manual approval UX.

#### [ ] JOBOS-062 — Anti-fabrication prompt guardrails (`[ ] PLANNED`)
- **Priority**: P0 | **Dependencies**: JOBOS-050
- **Description**: `lib/ai/resume-writing.js` prompting Gemini to strengthen action verbs and clarity while forbidding metric synthesis.
- **Acceptance criteria**: Generates placeholder tokens (e.g. `[ADD METRIC: %]`) for unverified numbers.
- **Tests**: Unit tests verifying that suggestions with fabricated numbers are rejected.

#### [ ] JOBOS-063 — Bullet tailoring API endpoint (`[ ] PLANNED`)
- **Priority**: P0 | **Dependencies**: JOBOS-062
- **Description**: `POST /api/ai/tailor-bullet` accepting experience bullet, job context, and target skills.
- **Acceptance criteria**: Returns validated structured suggestions with rationale and added keywords.
- **Tests**: Integration test with mocked AI provider.

#### [ ] JOBOS-064 — Diff-based bullet review UI (`[ ] PLANNED`)
- **Priority**: P0 | **Dependencies**: JOBOS-063
- **Description**: Side-by-side comparison modal allowing the user to review, edit, and explicitly accept bullet suggestions.
- **Acceptance criteria**: No AI suggestion modifies the resume without explicit user approval.
- **Tests**: Component interaction tests.

---

### Phase 09 — Analytics & Reporting (`[ ] PLANNED`)
Branch: `phase/09-analytics`  
Objective: Application conversion funnel, interview velocity metrics, visual charts.

#### [ ] JOBOS-065 — Funnel analytics service (`[ ] PLANNED`)
- **Priority**: P0 | **Dependencies**: JOBOS-019
- **Description**: `lib/services/analytics-service.js` calculating status conversion rates, average response times, and interview volume.
- **Acceptance criteria**: Queries aggregated in PostgreSQL; handles zero-application edge case cleanly.
- **Tests**: Integration tests with seeded application datasets.

#### [ ] JOBOS-066 — Analytics REST API (`[ ] PLANNED`)
- **Priority**: P0 | **Dependencies**: JOBOS-065
- **Description**: `GET /api/analytics/summary` and `GET /api/analytics/funnel`.
- **Acceptance criteria**: Scoped by user session; returns structured metric objects.
- **Tests**: Integration test verifying metric calculations.

#### [ ] JOBOS-067 — Analytics dashboard UI (`[ ] PLANNED`)
- **Priority**: P0 | **Dependencies**: JOBOS-066
- **Description**: `app/(dashboard)/analytics/page.jsx` rendering conversion funnels and interview timeline charts.
- **Acceptance criteria**: Visual charts display conversion percentages; copy clarifies "Correlation, not causation".
- **Tests**: UI render tests.

---

### Phase 10 — Events & Notifications (`[ ] PLANNED`)
Branch: `phase/10-notifications`  
Objective: Scheduled interview reminders, in-app notification bell, deadline alerts.

#### [ ] JOBOS-068 — In-app notification center UI (`[ ] PLANNED`)
- **Priority**: P0 | **Dependencies**: JOBOS-005
- **Description**: Bell icon with unread count badge and dropdown panel in dashboard topbar.
- **Acceptance criteria**: Displays unread notifications; clicking marks notification as read.
- **Tests**: UI interaction tests.

#### [ ] JOBOS-069 — Notifications API & background scheduler (`[ ] PLANNED`)
- **Priority**: P0 | **Dependencies**: JOBOS-068
- **Description**: `GET /api/notifications`, `PATCH /api/notifications/[id]/read`, and in-process `node-cron` polling worker.
- **Acceptance criteria**: Polling worker identifies due notifications and transitions status to sent.
- **Tests**: Integration tests for notification lifecycle.

#### [ ] JOBOS-070 — Live email integration (`[ ] PLANNED`)
- **Priority**: P1 | **Dependencies**: JOBOS-069
- **Description**: Email delivery transport (AWS SES or Resend) for password reset links and deadline reminders.
- **Acceptance criteria**: Emails dispatch reliably with HTML and plaintext templates.
- **Tests**: Integration test with mock SMTP server.

---

### Phase 11 — Production Hardening & DevOps (`[x] PARTIALLY DONE`)
Branch: `phase/11-production-hardening`  
Objective: Security verification, Docker containerization, CI/CD automation, test coverage, observability, and production deployment.

#### [x] ENG-001 — Multi-Stage Dockerfile & Docker Compose Setup (`[x] DONE`)
- **Priority**: P0 | **Dependencies**: none
- **Description**: Production-ready multi-stage Alpine Dockerfile using Next.js `output: 'standalone'` and unprivileged user, paired with `docker-compose.yml` orchestrating PostgreSQL 16.
- **Expected files**: `Dockerfile`, `.dockerignore`, `docker-compose.yml`.
- **Acceptance criteria**: App runs inside container, connects to containerized database, and passes health checks.
- **Tests**: `docker compose up -d` verification.

#### [x] ENG-002 — Automated GitHub Actions CI/CD Pipeline (`[x] DONE`)
- **Priority**: P0 | **Dependencies**: ENG-001
- **Description**: Workflow file `.github/workflows/ci.yml` running on push and PR with dependency caching, linting, Prisma generation, database migrations, Vitest with coverage, production build, and Playwright E2E.
- **Expected files**: `.github/workflows/ci.yml`.
- **Acceptance criteria**: Workflow runs automatically on push/PR and uploads coverage report artifact.
- **Tests**: GitHub Actions CI run.

#### [x] ENG-003 — Vitest Test Coverage Reporting with v8 Provider (`[x] DONE`)
- **Priority**: P0 | **Dependencies**: none
- **Description**: Configure `@vitest/coverage-v8` reporting and add `npm run test:coverage` script.
- **Acceptance criteria**: Generates text and HTML coverage reports measuring statement, branch, function, and line coverage.
- **Tests**: Measured 82.52% statements, 83.48% lines across 18 test suites (74 tests).

#### [x] ENG-004 — Structured JSON Logging & Centralized Error Handling (`[x] DONE`)
- **Priority**: P0 | **Dependencies**: none
- **Description**: Structured JSON logger in `lib/logger.js` and `lib/utils/logger.js` with timestamp, log level, request context, and safe Error serialization.
- **Acceptance criteria**: Error handler `handleRouteError` and core API endpoints emit machine-readable JSON logs.
- **Tests**: Unit tests in `tests/unit/logger.test.js`.

#### [x] ENG-005 — End-to-End Runtime Input Validation with Zod (`[x] DONE`)
- **Priority**: P0 | **Dependencies**: none
- **Description**: Zod schemas for all domain entities in `lib/validation/schemas/`.
- **Acceptance criteria**: Invalid payloads rejected at route boundary before reaching service or database layer.
- **Tests**: Unit tests in `tests/unit/auth-schema.test.js`, `application-schema.test.js`.

#### [x] ENG-006 — Database Health Check Endpoint (`GET /api/health`) (`[x] DONE`)
- **Priority**: P0 | **Dependencies**: none
- **Description**: Public health check probe executing `SELECT 1` on PostgreSQL pool with latency measurement.
- **Expected files**: `app/api/health/route.js`, `middleware.js`.
- **Acceptance criteria**: Returns 200 OK with latency when database responds; returns 503 when disconnected; exempt from auth middleware.
- **Tests**: Unit tests in `tests/unit/health.test.js`.

#### [x] ENG-007 — Documented Environment Configuration (`.env.example`) (`[x] DONE`)
- **Priority**: P0 | **Dependencies**: none
- **Description**: Comprehensive `.env.example` detailing required and optional variables for PostgreSQL, Auth.js, Gemini API, and logging.
- **Acceptance criteria**: All environment variables documented with descriptions, default values, and setup instructions.
- **Tests**: Verified against `process.env` references in codebase.

#### [ ] ENG-008 — Production Cloud Deployment (Vercel & AWS ECS) (`[ ] PLANNED`)
- **Priority**: P0 | **Dependencies**: ENG-001..007
- **Description**: Automated deployment setup for Vercel (serverless) and AWS ECS Fargate (containerized).
- **Acceptance criteria**: Application accessible via custom domain with SSL and automated database backups.
- **Tests**: Live production smoke test.
