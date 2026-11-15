# JobOS

[![CI Status](https://github.com/GarvDTU27/jobOS/actions/workflows/ci.yml/badge.svg)](https://github.com/GarvDTU27/jobOS/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Test Coverage](https://img.shields.io/badge/coverage-83.5%25-blue.svg)](./tests)

> An intelligent, single-tenant personal Job Search Operating System that unifies job discovery, resume ingestion, automated JD analysis, deterministic skill matching, and full application lifecycle tracking.

---

## Live Demo & Screenshots

- **Live Demo**: *[Coming soon / Deployment link placeholder]*
- **Product Preview**:

<!-- Screenshot / GIF placeholder -->
```
+-----------------------------------------------------------------------------------------+
|                                    JobOS Dashboard                                      |
|                                                                                         |
|  [Applications: 42]   [Interviews: 6]   [Offers: 1]   [Avg Match Score: 88%]           |
|                                                                                         |
|  Pipeline:  [Saved] ---> [Applied] ---> [OA] ---> [Interview] ---> [Offer]              |
|                                                                                         |
|  Recent Applications:                                                                   |
|  * Stripe - Senior Full Stack Engineer (Match: 94% | Status: Technical Interview)       |
|  * Datadog - Backend Systems Engineer  (Match: 86% | Status: OA Completed)             |
|  * Vercel - Platform Engineer          (Match: 91% | Status: Applied)                  |
+-----------------------------------------------------------------------------------------+
```
*(Add production screenshots or workflow GIFs here)*

---

## Problem & Target Audience

### The Problem
Modern job searching requires managing hundreds of application variants, disparate job descriptions, customized resumes, and scattered interview timelines across spreadsheets and email threads. Existing solutions either treat ATS scoring as a black box or encourage automated AI spam that hallucinates qualifications.

### Who It Is For
JobOS is designed for software engineers and knowledge workers who:
- Manage multi-stage application pipelines across dozens of tech companies.
- Maintain multiple tailored resume variations (e.g., Backend, Full Stack, Distributed Systems).
- Need transparent, explainable skill-gap breakdowns between their resume and job requirements before applying.
- Demand complete control over every claim and bullet point submitted to employers.

---

## Features

### Implemented (Active in Codebase)
- **User Authentication & Session Management**: Secure registration, login, and session persistence powered by Auth.js (NextAuth v5 beta) with bcryptjs password hashing and route-protection middleware.
- **Job Inventory & Management**: Full CRUD operations for jobs, including salary ranges, location, status, soft-archive toggle, and one-click conversion of saved jobs to active applications.
- **Application Tracker**: Multi-status application tracking (`SAVED`, `APPLIED`, `OA`, `INTERVIEW`, `TECHNICAL_INTERVIEW`, `HR`, `OFFER`, `REJECTED`, `WITHDRAWN`, `GHOSTED`) with server-side pagination, text search, status filters, and sorting.
- **Timeline, Notes & Tags**: Sub-resource tracking per application with status transition histories, scheduled interview events, notes, and colored categorization tags.
- **Multi-Format Document Ingestion**: Upload engine with magic-byte MIME validation supporting PDF (`pdf-parse`), DOCX (`mammoth`), DOC (`soffice` probe fallback), and plain text.
- **Storage Provider Abstraction**: Pluggable storage architecture with a local filesystem driver and S3-ready interface.
- **Automated JD Analysis via Gemini AI**: Extraction pipeline that transforms unstructured job postings into structured JSON (technical skills, soft skills, seniority, responsibilities, and qualifications) using Google Gemini 2.0 Flash.
- **Prompt Injection Defense**: Boundary tagging, input sanitization, and strict Zod validation preventing malicious prompt injection in pasted job descriptions.
- **Skill Normalization Engine**: Alias dictionary engine resolving skill variations (e.g., `JS` → `JavaScript`, `Postgres` → `PostgreSQL`, `React.js` → `React`).
- **Deterministic Resume↔JD Matching Engine**: Multi-factor scoring algorithm evaluating candidates across 6 independent dimensions (Technical Skills, Experience, Education, Responsibilities, Keywords, Seniority) with customizable weights (default 30/20/10/20/10/10) and LLM-assisted residual semantic matching via Gemini 2.0 Flash.
- **Match Analysis & Skill Gap Dashboard**: Interactive breakdown view (`/analysis/[applicationId]`) displaying aggregate match scores, category progress meters, and filtered skill gap tables (`STRONG`, `PARTIAL`, `MISSING` across `REQUIRED` and `PREFERRED` criteria) with explicit ATS disclaimers.
- **Observability & Diagnostics**: Structured JSON logger (`lib/logger.js`) with contextual metadata, and a `/api/health` endpoint monitoring database connectivity.
- **Multi-Stage Containerization**: Minimal Alpine-based Docker container with Next.js standalone output and Docker Compose configuration.

### Roadmap (In Progress & Planned)
- **Phase 08 (Next)**: AI Resume Assistant for bullet point improvement with strict anti-fabrication guardrails (`lib/ai/resume-writing.js`).
- **Phase 09**: Interactive Analytics Dashboard with funnel conversion metrics.
- **Phase 10**: Email dispatch via AWS SES / Resend for verification and event reminders.
- **Phase 11**: Visual drag-and-drop Kanban pipeline board (`app/(dashboard)/applications/kanban`).

---

## Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack) | Server actions, route handlers, server-rendered components |
| **Language** | JavaScript (ES2024 / JSX) | Full-stack application runtime |
| **Styling** | Tailwind CSS v4 | Responsive UI styling and design system |
| **Database & ORM** | PostgreSQL 16 & Prisma ORM 5 | Relational data persistence, cascades, migrations |
| **Authentication** | Auth.js (NextAuth v5 beta) | Credentials authentication, JWT/database sessions |
| **AI / NLP** | Google Gemini API (2.0 Flash) | Structured JD parsing, semantic extraction |
| **Document Processing** | `pdf-parse`, `mammoth`, `file-type` | Multi-format resume and JD parsing |
| **Validation** | Zod | Runtime schema validation on API boundaries |
| **Testing** | Vitest, Testing Library, Playwright | Unit, integration, and end-to-end browser testing |
| **DevOps & Containers**| Docker, Docker Compose, GitHub Actions | Multi-stage build, automated CI pipeline |
| **Observability** | Structured JSON Logger, `/api/health` | Application diagnostics and container health checks |

---

## Architecture Overview

```mermaid
flowchart TD
    Client["Client Browser\n(React UI / Tailwind CSS)"] -->|HTTP / JSON / Multipart| Middleware["Next.js Middleware\n(Auth & Route Protection)"]
    
    subgraph NextServer["Next.js 16 App Router Server"]
        Middleware -->|Authorized| AppRouter["Route Handlers & Server Actions\n(app/api/* & app/(dashboard)/*)"]
        
        subgraph DomainServices["Domain & Feature Layer"]
            AppRouter --> Val["Zod Validation Schemas\n(lib/validation/*)"]
            Val --> Services["Service Orchestrators\n(lib/services/*)"]
            
            Services --> Parsers["Document Parser Dispatcher\n(PDF, DOCX, TXT via lib/parsers/*)"]
            Services --> Storage["Storage Abstraction\n(Local / S3 via lib/storage/*)"]
            Services --> AIService["AI & Guardrails\n(lib/ai/* via Gemini API)"]
            Services --> Matching["Matching & Normalization\n(lib/matching/*)"]
        end
        
        Services --> Prisma["Prisma ORM Client\n(lib/db/prisma.js)"]
    end
    
    subgraph DataTier["Data Tier"]
        Prisma --> Postgres[("PostgreSQL 16 Database\n(Users, Jobs, Applications, Resumes)")]
        Storage --> Disk[("Local File Storage /uploads\n(or AWS S3)")]
    end
```

### Folder Structure
```text
jobOS/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Unauthenticated routes (login, register)
│   ├── (dashboard)/            # Protected application views (applications, jobs, resumes)
│   ├── api/                    # REST API Route Handlers (auth, jobs, applications, resumes, health)
│   └── layout.js               # Root layout shell
├── components/                 # Reusable UI primitives and domain widgets
│   ├── jobs/                   # Job forms, filters, and conversion components
│   ├── resumes/                # Resume upload dropzone and detail views
│   ├── tracker/                # Application tables, filters, timeline, notes, tags
│   └── ui/                     # Primitives (Button, Dialog, Input, Select, Table)
├── features/                   # Complex feature modules (auth, jd-analysis, matching)
├── lib/                        # Core system services, utilities, and integrations
│   ├── ai/                     # Gemini AI provider, JD analysis, prompt injection guard
│   ├── auth/                   # NextAuth config, password hashing, session extractors
│   ├── db/                     # Prisma database client singleton
│   ├── matching/               # Skill normalization and alias mappings
│   ├── parsers/                # File parsers (PDF, DOCX, TXT, legacy DOC)
│   ├── services/               # Core business logic services
│   ├── storage/                # Abstract storage provider and local filesystem driver
│   ├── utils/                  # Structured logger, error classes, pagination
│   └── validation/schemas/     # Zod validation schemas
├── prisma/                     # Database schema definition and migration history
├── tests/                      # Automated test suites
│   ├── e2e/                    # Playwright end-to-end browser specifications
│   ├── fixtures/               # Test documents and mock payloads
│   ├── integration/            # Service and database integration tests
│   └── unit/                   # Fast isolated unit tests (Vitest)
├── .github/workflows/          # GitHub Actions CI workflow definitions
├── docker-compose.yml          # Container configuration for app and PostgreSQL
└── Dockerfile                  # Multi-stage production container build
```

---

## Data Model

```mermaid
erDiagram
    User ||--o{ Session : has
    User ||--o{ Resume : owns
    User ||--o{ Job : tracks
    User ||--o{ Application : submits
    User ||--o{ Notification : receives
    User ||--o| UserPreference : configures

    Job ||--o| JobAnalysis : has
    Job ||--o{ JobSkill : requires
    Job ||--o{ Application : references

    Resume ||--o{ ResumeSkill : contains
    Resume ||--o{ Education : includes
    Resume ||--o{ Experience : includes
    Resume ||--o{ Project : includes
    Resume ||--o{ Application : attached_to

    Skill ||--o{ JobSkill : mapped_to
    Skill ||--o{ ResumeSkill : extracted_to

    Application ||--o{ ApplicationStatusHistory : records
    Application ||--o{ ApplicationEvent : schedules
    Application ||--o{ ApplicationNote : contains
    Application ||--o{ ApplicationTag : tagged_with
    Application ||--o{ MatchAnalysis : evaluated_by

    Tag ||--o{ ApplicationTag : categorizes
    MatchAnalysis ||--o{ SkillGap : identifies
```

---

## Getting Started

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm` (v10+)
- **PostgreSQL**: `v15+` (local service or Docker container)

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/GarvDTU27/jobOS.git
   cd jobOS
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your PostgreSQL credentials and secrets:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jobos_dev?schema=public"
   AUTH_SECRET="your-secure-random-32-char-secret"
   GEMINI_API_KEY="your-google-gemini-api-key"
   ```

4. **Initialize database schema**:
   ```bash
   npx prisma generate
   npx prisma db push
   # Or run migrations:
   # npx prisma migrate deploy
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running with Docker

Run the entire stack (Next.js application + PostgreSQL 16) with a single command:

```bash
docker compose up -d
```

- **Application**: Accessible at [http://localhost:3000](http://localhost:3000)
- **PostgreSQL**: Bound to `localhost:5432` with a persistent volume (`postgres_data`)
- **Health Check**: Verify app and database connectivity:
  ```bash
  curl http://localhost:3000/api/health
  ```
- **Stop containers**:
  ```bash
  docker compose down
  ```

---

## Testing

The test suite is structured into isolated unit tests and end-to-end integration tests:

### 1. Unit Tests (Vitest)
Executes pure logic tests (schema validation, skill normalization, document parsers, password hashing, prompt injection guard, and structured logger) without requiring an active database:

```bash
npm run test
```

Generate test coverage reports:
```bash
npm run test:coverage
```

**Measured Test Coverage (Vitest v8):**
- **Statements**: `85.1%`
- **Branches**: `77.9%`
- **Functions**: `84.8%`
- **Lines**: `86.1%`
- **Total Unit Tests**: 24 test suites, 98 passing tests

### 2. End-to-End Tests (Playwright)
Executes real browser flows (registration, login, route guards, application creation, and filtering):

```bash
# Install browsers on first run
npx playwright install --with-deps chromium

# Run Playwright test suite
npm run test:e2e
```

---

## Environment Variables

| Variable | Description | Required? | Default |
| :--- | :--- | :---: | :--- |
| `DATABASE_URL` | PostgreSQL connection string | **Yes** | `postgresql://postgres:postgres@localhost:5432/jobos_dev?schema=public` |
| `AUTH_SECRET` | NextAuth session signing key (min 32 chars) | **Yes** | — |
| `NEXTAUTH_URL` | Base canonical application URL | No | `http://localhost:3000` |
| `GEMINI_API_KEY` | Google Gemini API key for JD analysis & AI features | Optional* | — (*Required for Phase 6+ AI parsing) |
| `GEMINI_MODEL` | Gemini LLM model identifier | No | `gemini-2.0-flash` |
| `FILE_STORAGE_DRIVER`| File storage provider (`local` or `s3`) | No | `local` |
| `LOG_LEVEL` | Minimum log level (`debug`, `info`, `warn`, `error`) | No | `info` |
| `PORT` | HTTP port for production server | No | `3000` |

---

## Engineering Decisions

1. **Deterministic Match Scoring over Generative Hallucination**: Rather than asking an LLM to guess a match percentage, JobOS uses Gemini strictly for structured feature extraction (skills, experience, qualifications) and evaluates match scores through a deterministic algorithm with alias dictionaries. This guarantees explainable, reproducible scores.
2. **Strict Security Scoping at Query Boundary**: Every service method (`application-service`, `job-service`, `resume-service`) mandates `userId` parameters validated against server-side session tokens (`getSessionOrThrow`). Client-provided user identifiers are never accepted.
3. **Resilient Multi-Format Ingestion**: Instead of relying on unreliable file extensions, resume uploads inspect magic bytes (`file-type`), enforce strict 5MB size boundaries, and route to dedicated parsers behind a pluggable storage interface.
4. **Prompt Injection Defense**: Job descriptions are wrapped in XML delimiters, bounded in character length, and stripped of prompt escape attempts before reaching the LLM provider, with automated retries and schema-checked outputs.
5. **Standalone Next.js Container Architecture**: Production builds leverage Next.js `output: 'standalone'` inside a multi-stage Alpine container, creating a lightweight image running under an unprivileged user with built-in health monitoring.

---

## Contributing

Contributions are welcome. Please adhere to the following workflow:
1. Fork the repository and create a feature branch (`git checkout -b feat/your-feature`).
2. Run `npm run lint` and `npm run test` before submitting changes.
3. Ensure all commits follow [Conventional Commits](https://www.conventionalcommits.org/) standards.
4. Open a Pull Request against `main`.

---

## License

This project is licensed under the [MIT License](./LICENSE).
