# JobOS — Master Task Checklist & Roadmap

*Status: Living checklist tracking all implementation milestones, architectural tasks, and engineering deliverables.*

---

## 1. Executive Status Dashboard

### [x] DONE
- [x] **JOBOS-001** — Initialize Next.js 16 project (App Router, JS/JSX only, Tailwind CSS)
- [x] **JOBOS-002** — Add Prisma ORM & connect to PostgreSQL database
- [x] **JOBOS-003** — Base folder structure, custom error classes & pagination utilities
- [x] **JOBOS-004** — Base UI primitives (Button, Input, Select, Dialog, Table, Toast)
- [x] **JOBOS-005** — Dashboard layout shell with responsive navigation
- [x] **JOBOS-006** — Quality pipeline setup (Vitest unit/integration + Playwright E2E)
- [x] **JOBOS-007** — User and Session Prisma models & initial migration
- [x] **JOBOS-008** — Password hashing utility with bcryptjs (salt rounds 10)
- [x] **JOBOS-009** — Registration validation schema & auth service
- [x] **JOBOS-010** — Auth.js (NextAuth v5 beta) Credentials provider & session cookies
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
- [x] **ENG-DOCKER** — Multi-stage Next.js Dockerfile, `.dockerignore`, and `docker-compose.yml` (PostgreSQL 16 + app)
- [x] **ENG-CI** — GitHub Actions CI pipeline (`.github/workflows/ci.yml`) with caching, lint, migration, tests, and coverage artifact
- [x] **ENG-COVERAGE** — Vitest test coverage integration with v8 provider (82.5% statement coverage measured)
- [x] **ENG-LOGGING** — Lightweight structured JSON logger (`lib/logger.js`, `lib/utils/logger.js`) with request context
- [x] **ENG-HEALTH** — Database health check endpoint (`GET /api/health`) with latency metrics and error diagnostics
- [x] **ENG-ENV** — Documented `.env.example` with required and optional environment variables
- [x] **ENG-LINT** — Clean ESLint 9 configuration with 0 errors and 0 warnings

---

### [-] IN PROGRESS
- [-] **JOBOS-056** — AI semantic skill matcher (`lib/ai/matching.js` for residual unmatched skill pairs)
- [-] **JOBOS-057** — Deterministic score engine (`lib/matching/score-engine.js` implementing 6-category algorithm)

---

### [ ] NEXT / PLANNED
- [ ] **JOBOS-058** — Match weight configuration & per-user override (`lib/matching/weights.js`)
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
- [ ] **ENG-DEPLOY** — Production deployment to Vercel and container deployment to AWS (ECS/Fargate)

---

## 2. Phase-by-Phase Checklist

### Phase 01 — Foundation (`[x] DONE`)
- [x] **JOBOS-001**: Initialize Next.js project (JS/JSX only).
- [x] **JOBOS-002**: Add Prisma and connect to PostgreSQL.
- [x] **JOBOS-003**: Base folder structure and lib utilities (`errors.js`, `logger.js`, `pagination.js`).
- [x] **JOBOS-004**: Base UI primitives (`Button`, `Input`, `Select`, `Dialog`, `Table`, `Toast`).
- [x] **JOBOS-005**: Dashboard layout shell with navigation sidebar.
- [x] **JOBOS-006**: Testing and quality pipeline setup.

### Phase 02 — Authentication (`[x] DONE`)
- [x] **JOBOS-007**: User and Session Prisma models.
- [x] **JOBOS-008**: Password hashing utility (`bcryptjs`).
- [x] **JOBOS-009**: Registration validation schema and service.
- [x] **JOBOS-010**: Auth.js configuration with Credentials provider.
- [x] **JOBOS-011**: Registration and login pages.
- [x] **JOBOS-012**: Route protection middleware.
- [x] **JOBOS-013**: Logout functionality.
- [x] **JOBOS-014**: Password reset backend architecture.
- [x] **JOBOS-015**: Email verification backend architecture.
- [x] **JOBOS-016**: Auth integration & Playwright E2E tests.

### Phase 03 — Application Tracker (`[x] DONE`)
- [x] **JOBOS-017**: Application, StatusHistory, Event, Note, Tag Prisma models.
- [x] **JOBOS-018**: Application Zod validation schemas.
- [x] **JOBOS-019**: Application service with status transition logging.
- [x] **JOBOS-020**: Application collection REST API (`/api/applications`).
- [x] **JOBOS-021**: Application item REST API (`/api/applications/[id]`).
- [x] **JOBOS-022**: Application status transition API.
- [x] **JOBOS-023**: Application Notes and Events REST APIs.
- [x] **JOBOS-024**: Application Tags REST API.
- [x] **JOBOS-025**: Application list table UI.
- [x] **JOBOS-026**: Search, status filter, and sorting UI controls.
- [x] **JOBOS-027**: Application detail view with timeline and notes panels.
- [x] **JOBOS-028**: Application creation and editing forms.
- [x] **JOBOS-029**: Application tracker Playwright E2E tests.
- [x] **JOBOS-030**: Phase 03 gate passed.

### Phase 04 — Job Management (`[x] DONE`)
- [x] **JOBOS-031**: Job and JobSkill Prisma models.
- [x] **JOBOS-032**: Job Zod schemas and service layer with archive toggle.
- [x] **JOBOS-033**: Job REST APIs (`/api/jobs`, `/api/jobs/[id]`).
- [x] **JOBOS-034**: Convert Job to Application endpoint.
- [x] **JOBOS-035**: Job list and detail UI views.
- [x] **JOBOS-036**: Job creation and edit forms.
- [x] **JOBOS-037**: Job management integration tests.

### Phase 05 — Resume & Document Processing (`[x] DONE`)
- [x] **JOBOS-038**: Resume Prisma models and relations.
- [x] **JOBOS-039**: Storage provider abstraction and local filesystem driver.
- [x] **JOBOS-040**: Document parser contract and dispatcher.
- [x] **JOBOS-041**: Multi-format parsers (PDF, DOCX, TXT, DOC).
- [x] **JOBOS-042**: Magic-byte MIME validation and file size guards.
- [x] **JOBOS-043**: Resume service layer.
- [x] **JOBOS-044**: Resume REST API endpoints.
- [x] **JOBOS-045**: Resume upload UI with drag-and-drop.
- [x] **JOBOS-046**: Resume detail view with extracted sections.
- [x] **JOBOS-047**: Resume processing integration tests.

### Phase 06 — JD Analysis & AI Extraction (`[x] DONE`)
- [x] **JOBOS-048**: JobAnalysis Prisma model.
- [x] **JOBOS-049**: Google Gemini AI provider module with retry logic.
- [x] **JOBOS-050**: Prompt injection defense and XML boundary guardrails.
- [x] **JOBOS-051**: JD extraction service and prompt pipeline.
- [x] **JOBOS-052**: JD parse API endpoint (`POST /api/jd/parse`).
- [x] **JOBOS-053**: Interactive JD input panel and extraction results UI.

### Phase 07 — Resume/JD Matching (`[-] IN PROGRESS`)
- [x] **JOBOS-054**: MatchAnalysis and SkillGap Prisma models (`[x] DONE`).
- [x] **JOBOS-055**: Skill normalizer with alias dictionary and unit tests (`[x] DONE`).
- [-] **JOBOS-056**: AI semantic skill matcher on residual unmatched pairs (`[-] IN PROGRESS`).
- [-] **JOBOS-057**: Deterministic 6-category score engine (`[-] IN PROGRESS`).
- [ ] **JOBOS-058**: Match weights configuration and per-user override (`[ ] PLANNED`).
- [ ] **JOBOS-059**: Match service orchestrator and `/api/match` endpoints (`[ ] PLANNED`).
- [ ] **JOBOS-060**: Skill gap derivation (`STRONG`, `PARTIAL`, `MISSING`) (`[ ] PLANNED`).
- [ ] **JOBOS-061**: Match Analysis UI breakdown (`/analysis/[applicationId]`) (`[ ] PLANNED`).

### Phase 08 — Resume AI Assistant (`[ ] PLANNED`)
- [ ] **JOBOS-062**: Bullet tailoring prompt with anti-fabrication guardrails.
- [ ] **JOBOS-063**: Bullet tailoring REST API (`POST /api/ai/tailor-bullet`).
- [ ] **JOBOS-064**: Diff-based side-by-side approval UI.

### Phase 09 — Analytics & Reporting (`[ ] PLANNED`)
- [ ] **JOBOS-065**: Funnel analytics service and calculation logic.
- [ ] **JOBOS-066**: Analytics REST API (`GET /api/analytics`).
- [ ] **JOBOS-067**: Analytics dashboard UI with visual metrics.

### Phase 10 — Events & Notifications (`[ ] PLANNED`)
- [ ] **JOBOS-068**: Notification bell UI and event scheduler.
- [ ] **JOBOS-069**: In-app notifications API (`/api/notifications`).
- [ ] **JOBOS-070**: Live email dispatch integration.

### Phase 11 — Production Hardening & DevOps (`[x] PARTIALLY DONE`)
- [x] **ENG-DOCKER**: Multi-stage Dockerfile and docker-compose stack (`[x] DONE`).
- [x] **ENG-CI**: GitHub Actions CI workflow with PostgreSQL service container (`[x] DONE`).
- [x] **ENG-COVERAGE**: Vitest test coverage reporting with v8 provider (`[x] DONE`).
- [x] **ENG-LOGGING**: Structured JSON logger with request context (`[x] DONE`).
- [x] **ENG-HEALTH**: Health check probe at `/api/health` (`[x] DONE`).
- [x] **ENG-ENV**: Complete `.env.example` file (`[x] DONE`).
- [x] **ENG-LINT**: Clean ESLint 9 configuration with 0 errors (`[x] DONE`).
- [ ] **ENG-DEPLOY**: Production deployment setup for Vercel / AWS (`[ ] PLANNED`).
