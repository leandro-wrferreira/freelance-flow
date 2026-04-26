<div align="center">

# 🚀 FreelanceFlow

**A self-hosted project management tool built for freelancers — track time, manage tasks, and organize projects with a clean Kanban board.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

</div>

---

## 📖 Overview

FreelanceFlow is a full-stack, self-hostable task management application designed for freelancers and independent developers. It provides a structured workspace with folder-based project organization, Kanban-style task boards, integrated time tracking (with real-time timers and manual entries), and an audit log for every action taken — all without requiring a third-party service.

The application is built on **Clean Architecture + Hexagonal Architecture** principles, making the domain logic fully testable and decoupled from frameworks and databases.

---

## ✨ Key Features

- 📁 **Folder & Project Organization** — Group projects into folders with cascading structure
- 🗂️ **Kanban Task Board** — Drag-and-drop task management across `todo`, `in-progress`, and `done` columns
- ⏱️ **Time Tracking** — Start/pause real-time timers per task, or add time entries manually
- 📊 **Audit Log** — Automatic, immutable history of every action (create, move, start/stop timer)
- 💰 **Billing Rates** — Set hourly or fixed-price rates per project for financial tracking
- 📄 **File Attachments** — Attach files to tasks
- 🐳 **Docker-first** — Single `docker compose up` to run the full stack locally
- 🧪 **TDD-tested Application Layer** — Use cases backed by unit tests with Vitest

---

## 🏗️ Architecture

FreelanceFlow follows **Clean Architecture** with a **Hexagonal (Ports & Adapters)** pattern. The domain is entirely framework-agnostic and the dependency rule flows strictly inward.

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js (App Router)                 │  ← Delivery Layer
│           pages / Server Actions / API Routes           │
└──────────────────────────┬──────────────────────────────┘
                           │ calls
┌──────────────────────────▼──────────────────────────────┐
│                  Application Layer                       │  ← Use Cases
│     FolderUseCases | ProjectUseCases | TaskUseCases      │
└──────────────────────────┬──────────────────────────────┘
                           │ depends on (interfaces)
┌──────────────────────────▼──────────────────────────────┐
│                    Domain Layer                          │  ← Core Business Logic
│    Folder | Project | Task | TimeEntry | AuditLog        │
│    FolderRepository | ProjectRepository | TaskRepository │
└──────────────────────────┬──────────────────────────────┘
                           │ implemented by
┌──────────────────────────▼──────────────────────────────┐
│                 Infrastructure Layer                     │  ← Adapters
│   PrismaFolderRepository | PrismaProjectRepository      │
│              PrismaTaskRepository                        │
└─────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                     PostgreSQL                           │  ← Database
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Location | Responsibility |
|---|---|---|
| **Domain** | `src/domain/` | Entities, interfaces (ports), and core business rules |
| **Application** | `src/application/use-cases/` | Orchestrates domain objects to fulfill business scenarios |
| **Infrastructure** | `src/infrastructure/` | Prisma repository implementations (adapters) |
| **Delivery** | `app/` | Next.js pages, Server Actions, and API routes |
| **UI Components** | `src/components/` | Atomic Design component hierarchy |

---

## 🛠️ Technology Stack

| Category | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | `^15` |
| Language | TypeScript | `5.9` |
| UI Library | React | `^19` |
| Styling | Tailwind CSS | `4.1` |
| Component System | shadcn/ui | `^4.5` |
| ORM | Prisma | `^5.21` |
| Database | PostgreSQL | `15` (Alpine) |
| Animations | Motion (Framer) | `^12` |
| Drag & Drop | dnd-kit | `^6 / ^10` |
| PDF Export | jsPDF + AutoTable | `^4 / ^5` |
| AI Integration | Google Gemini | `@google/genai ^1.17` |
| Testing | Vitest | `^4` |
| Containerization | Docker + Docker Compose | — |
| Package Manager | pnpm | — |

---

## 📂 Project Structure

```
freelance-flow/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Root workspace page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── actions.ts                # Server Actions (data mutations)
│   ├── api/                      # API route handlers
│   └── project/                  # Project-scoped routes
├── src/
│   ├── domain/                   # Core domain models & repository interfaces
│   │   ├── folder/               #   Folder entity + FolderRepository port
│   │   ├── project/              #   Project entity + ProjectRepository port
│   │   └── task/                 #   Task, TimeEntry entities + TaskRepository port
│   ├── application/
│   │   └── use-cases/            # Application use cases (business logic)
│   │       ├── folder-use-cases.ts
│   │       ├── project-use-cases.ts
│   │       ├── task-use-cases.ts
│   │       └── *.spec.ts         # Vitest unit tests
│   ├── infrastructure/
│   │   ├── database/             # Prisma client singleton
│   │   └── repositories/         # Prisma adapter implementations
│   └── components/               # Atomic Design UI components
│       ├── atoms/                #   Base shadcn/ui primitives
│       ├── molecules/            #   Composed small components
│       ├── organisms/            #   Complex feature components (FolderList, TaskBoard, TopNav)
│       ├── templates/            #   Page-level layout shells
│       └── pages/                #   Full page compositions
├── prisma/
│   └── schema.prisma             # Database schema (Folder, Project, Task, TimeEntry, AuditLog)
├── Dockerfile                    # Multi-stage production build
├── docker-compose.yml            # Full-stack local environment
└── .env.example                  # Environment variable template
```

---

## 🚀 Getting Started

### Option A — Docker (Recommended)

The fastest way to run FreelanceFlow locally. No Node.js or PostgreSQL required on your host.

**Prerequisites:** Docker & Docker Compose

```bash
# 1. Clone the repository
git clone https://github.com/leandro-wrferreira/freelance-flow.git
cd freelance-flow

# 2. Copy and configure environment variables
cp .env.example .env

# 3. Start all services (app + database)
docker compose up --build -d

# 4. Run database migrations
docker compose exec app npx prisma migrate deploy

# 5. Open the app
open http://localhost:4030
```

> **Ports:** App → `4030`, PostgreSQL → `4031`

---

### Option B — Local Development

**Prerequisites:** Node.js 20+, pnpm, PostgreSQL

```bash
# 1. Clone the repository
git clone https://github.com/leandro-wrferreira/freelance-flow.git
cd freelance-flow

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your database connection string

# 4. Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# 5. Start the development server
pnpm dev
```

App will be available at `http://localhost:3000`.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```env
# PostgreSQL connection (Supabase, Neon, or self-hosted)
DATABASE_URL="postgresql://user:password@host:5432/freelance_flow?schema=public"
DIRECT_URL="postgresql://user:password@host:5432/freelance_flow"

# Optional: Google Gemini AI integration
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# App URL (used for internal links)
APP_URL="http://localhost:3000"
```

> ⚠️ **Special characters in passwords** (e.g., `#`, `@`, `:`) must be percent-encoded in the connection string. See [Prisma docs](https://www.prisma.io/docs/orm/overview/databases/postgresql#connection-details).

---

## 🧪 Testing

The application layer is tested with **Vitest** using TDD (red → green → refactor). Tests are co-located with use case files.

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test --watch
```

Test files:
- `src/application/use-cases/folder-use-cases.spec.ts`
- `src/application/use-cases/project-use-cases.spec.ts`
- `src/application/use-cases/task-use-cases.spec.ts`

Tests use in-memory mock repositories that implement the domain port interfaces, keeping tests fast and free of database dependencies.

---

## 🏛️ Domain Model

```
Folder
  └── Project (hourlyRate | fixedPrice)
        ├── Task (status, timer, files, accumulatedTime)
        │     └── TimeEntry (duration, startTime, endTime)
        └── AuditLog (action, details, createdAt)
```

### Task Status Flow

```
todo  ──►  in-progress  ──►  done
 ▲                            │
 └────────────────────────────┘
```

---

## 🐳 Docker Details

The project uses a **3-stage multi-stage Dockerfile**:

| Stage | Base | Purpose |
|---|---|---|
| `deps` | `node:20-alpine` | Install pnpm dependencies |
| `builder` | `node:20-alpine` | Generate Prisma client + `next build` |
| `runner` | `node:20-alpine` | Minimal production image |

The `docker-compose.yml` defines two services:

| Service | Image | Host Port |
|---|---|---|
| `db` | `postgres:15-alpine` | `4031` |
| `app` | Local Dockerfile | `4030` |

---

## 🎨 UI Component System

Components follow **Atomic Design** principles:

- **Atoms** — Base primitives: `Button`, `Input`, `Badge`, `Card`, `Dialog`, `Select`, `Textarea`, `Label`, `Avatar`
- **Molecules** — Composed small components built from atoms
- **Organisms** — Feature-complete components: `FolderList`, `TaskBoard`, `TopNav`
- **Templates** — Page-level layout shells
- **Pages** — Full page compositions

All atoms are based on **shadcn/ui** with Tailwind CSS 4.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Follow the architecture: place business logic in use cases, not in components or Server Actions
4. Write tests for new use cases before implementing (TDD)
5. Ensure `pnpm lint` and `pnpm test` pass
6. Submit a pull request against `master`

### Key Conventions

- **Domain layer is pure TypeScript** — no framework imports, no Prisma imports
- **Use cases depend only on repository interfaces** — never on concrete implementations
- **Prisma repositories** live in `src/infrastructure/repositories/`
- **Server Actions** in `app/actions.ts` are the bridge between Next.js and use cases

---

## 📄 License

This project is private. All rights reserved.
