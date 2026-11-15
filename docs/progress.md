# JobOS Progress Tracker

## Phase 01 — Project Setup & Foundations (`[x] DONE`)
- [x] JOBOS-001 — Initialize Next.js project (JS/JSX only, Tailwind CSS, ESLint)
- [x] JOBOS-002 — Add Prisma and connect to PostgreSQL
- [x] JOBOS-003 — Base folder structure and lib utilities (`errors.js`, `logger.js`, `pagination.js`)
- [x] JOBOS-004 — Base UI primitives (Button, Input, Select, Dialog, Badge, Table, Toast)
- [x] JOBOS-005 — Dashboard layout shell with responsive sidebar navigation
- [x] JOBOS-006 — Testing and quality pipeline setup (Vitest + Playwright)

## Phase 02 — Authentication & User Management (`[x] DONE`)
- [x] JOBOS-007 — User and Session Prisma models & initial migration
- [x] JOBOS-008 — Password hashing utility with bcryptjs (salt rounds 10)
- [x] JOBOS-009 — Registration validation schema and auth service
- [x] JOBOS-010 — Auth.js configuration with Credentials provider + DB sessions
- [x] JOBOS-011 — Registration and login UI pages & forms
- [x] JOBOS-012 — Route protection middleware (`middleware.js`)
- [x] JOBOS-013 — Logout action & session invalidation
- [x] JOBOS-014 — Password reset API endpoints (`/api/auth/reset-password/*`)
- [x] JOBOS-015 — Email verification backend architecture & token persistence
- [x] JOBOS-016 — Auth integration & Playwright E2E authentication tests

## Phase 03 — Application Tracker (`[x] DONE`)
- [x] JOBOS-017 — Application, StatusHistory, Event, Note, Tag Prisma models
- [x] JOBOS-018 — Application Zod validation schemas
- [x] JOBOS-019 — Application service (CRUD, cascade deletes, status transition history)
- [x] JOBOS-020 — Application list & creation REST API (`/api/applications`)
- [x] JOBOS-021 — Application detail, update, delete REST API (`/api/applications/[id]`)
- [x] JOBOS-022 — Status transition dedicated endpoint (`/api/applications/[id]/status`)
- [x] JOBOS-023 — Application Notes & Events sub-resource REST APIs
- [x] JOBOS-024 — Application Tags management REST API
- [x] JOBOS-025 — Application list table UI with multi-status badges
- [x] JOBOS-026 — Application search, status filtering, and sorting UI controls
- [x] JOBOS-027 — Application detail view with timeline and notes panels
- [x] JOBOS-028 — Application creation & editing UI forms
- [x] JOBOS-029 — Application tracker Playwright E2E test suite
- [x] JOBOS-030 — Phase 03 gate verification & merge

## Phase 04 — Job Inventory (`[x] DONE`)
- [x] JOBOS-031 — Job & JobSkill Prisma models with relations
- [x] JOBOS-032 — Job validation schema & job service with archive guard
- [x] JOBOS-033 — Job REST API endpoints (`/api/jobs`, `/api/jobs/[id]`)
- [x] JOBOS-034 — Job to Application conversion endpoint (`/api/jobs/[id]/convert-to-application`)
- [x] JOBOS-035 — Job list, filter, and detail UI views (`/jobs`, `/jobs/[id]`)
- [x] JOBOS-036 — Job creation & edit forms with conversion trigger
- [x] JOBOS-037 — Job management integration tests & Phase 04 gate

## Phase 05 — Resume Ingestion & Storage (`[x] DONE`)
- [x] JOBOS-038 — Resume, ResumeSkill, Education, Experience, Project models
- [x] JOBOS-039 — Storage provider abstraction & local filesystem driver (`uploads/`)
- [x] JOBOS-040 — Document parser contract & parser dispatcher
- [x] JOBOS-041 — Multi-format parsers (PDF via `pdf-parse`, DOCX via `mammoth`, TXT UTF-8, DOC probe)
- [x] JOBOS-042 — Magic-byte MIME validation (`file-type`) & size guard
- [x] JOBOS-043 — Resume service (upload, storage, parsing dispatch, versioning)
- [x] JOBOS-044 — Resume upload and management REST APIs (`/api/resumes/*`)
- [x] JOBOS-045 — Resume upload drag-and-drop UI with status indicators
- [x] JOBOS-046 — Resume detail viewer with extracted metadata and parsed text
- [x] JOBOS-047 — Resume processing test suite & Phase 05 gate

## Phase 06 — JD Analysis & AI Extraction (`[x] DONE`)
- [x] JOBOS-048 — JobAnalysis Prisma model
- [x] JOBOS-049 — Google Gemini AI provider module with retry logic & schema parsing
- [x] JOBOS-050 — Prompt injection defense & XML boundary guards (`lib/ai/prompt-guard.js`)
- [x] JOBOS-051 — JD parsing & structured extraction service (`lib/services/jd-service.js`)
- [x] JOBOS-052 — JD parse API endpoint (`POST /api/jd/parse`)
- [x] JOBOS-053 — Interactive JD input & extraction results UI (`features/jd-analysis/`)

## Phase 07 — Resume/JD Matching Engine (`[x] DONE`)
- [x] JOBOS-054 — MatchAnalysis and SkillGap Prisma models with `isCurrent` toggle
- [x] JOBOS-055 — Skill normalizer with alias table & unit tests (`lib/matching/skill-normalizer.js`)
- [x] JOBOS-056 — AI semantic skill matcher on residual unmatched skill pairs (`lib/ai/matching.js`)
- [x] JOBOS-057 — Deterministic 6-category score engine (`lib/matching/score-engine.js`)
- [x] JOBOS-058 — Match weights configuration & per-user override (`lib/matching/weights.js`)
- [x] JOBOS-059 — Match service orchestrator & endpoints (`POST /api/match`, `GET /api/match/[applicationId]`)
- [x] JOBOS-060 — Skill gap derivation (`STRONG`, `PARTIAL`, `MISSING` × `REQUIRED`, `PREFERRED`)
- [x] JOBOS-061 — Match Analysis UI breakdown (`/analysis/[applicationId]` with score card & gap list)

## DevOps & Core Engineering (`[x] DONE`)
- [x] ENG-001 — Multi-Stage Dockerfile & Docker Compose Setup
- [x] ENG-002 — Automated GitHub Actions CI/CD Pipeline
- [x] ENG-003 — Vitest Test Coverage Reporting with v8 Provider (85.1% statement coverage, 98 tests)
- [x] ENG-004 — Structured JSON Logging & Centralized Error Handling (`lib/logger.js`)
- [x] ENG-005 — End-to-End Runtime Input Validation with Zod
- [x] ENG-006 — Database Health Check Endpoint (`GET /api/health`)
- [x] ENG-007 — Documented Environment Configuration (`.env.example`)

## Phase 08 — AI Resume Assistant (`[ ] PLANNED`)
- [ ] JOBOS-062 — AI Resume Assistant: Anti-fabrication prompt guardrails (`lib/ai/resume-writing.js`)
- [ ] JOBOS-063 — AI Resume Assistant: Tailored bullet generation API (`/api/ai/tailor-bullet`)
- [ ] JOBOS-064 — AI Resume Assistant: Diff-based bullet review & approval UI
