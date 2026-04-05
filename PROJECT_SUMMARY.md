# Project Summary: AOP Platform

## Overview

This repository is a monorepo for an internal **Agency Operations Platform (AOP)**. Its purpose is to give a freelance or service agency a single system for:

- tracking leads and jobs coming from Upwork,
- moving those jobs through an internal bidding and review pipeline,
- handing won work off to delivery teams,
- managing delivery tasks, meetings, QA, and project links,
- measuring agency performance with dashboard and funnel analytics,
- syncing Upwork jobs and chats into the platform through a Chrome extension.

The project is not a simple CRUD admin panel. It is built around a fairly specific agency workflow:

1. discover a job,
2. script and review the proposal,
3. prepare and review a video proposal,
4. submit the bid,
5. track client interaction states,
6. convert the lead into a won project,
7. manage delivery work after the sale.

## Monorepo Structure

The repo has three main applications:

```text
.
├── backend/    NestJS API + Prisma + PostgreSQL
├── frontend/   Next.js dashboard UI
├── extension/  Chrome extension for Upwork import/sync
├── docker-compose.yml
├── DEPLOYMENT.md
└── package.json
```

### Root

The root package defines convenience scripts for running the backend and frontend, Prisma generation/migration/seed commands, and shared formatting/lint orchestration. The repo name is `aop-platform`, and the root description explicitly frames it as a unified operational platform for freelance agency management.

## Technology Stack

### Frontend

- Next.js 14 with the App Router
- React 18
- TypeScript
- Tailwind CSS
- Radix UI primitives for common UI building blocks
- TanStack Query for API data fetching and cache management
- Framer Motion for transitions
- `@dnd-kit` for drag-and-drop kanban interactions
- `axios` for HTTP requests
- `sonner` for notifications

The frontend is a protected dashboard-style application with role-aware screens and organization switching.

### Backend

- NestJS 10
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication with refresh tokens
- Swagger/OpenAPI docs at `/api/docs`
- class-validator/class-transformer for DTO validation
- Nest schedule module enabled for background/scheduled work

The API is exposed under the global `/api` prefix.

### Browser Extension

- Chrome Extension Manifest V3
- TypeScript
- Vite build
- Background service worker plus content scripts for Upwork pages

The extension is designed to run on Upwork job pages and chat rooms.

### Tooling / Infrastructure

- Bun is used for workspace-level scripts and package execution
- Dockerfiles exist for backend and frontend
- `docker-compose.yml` provides a local Postgres + backend + frontend setup
- Nix files (`flake.nix`, `shell.nix`) are present for environment reproducibility
- `lefthook.yml` and `treefmt.toml` indicate repo-level formatting/hooks discipline

## Product Model and Business Workflow

The strongest organizing concept in the codebase is the **project pipeline**. In practice, a `Project` starts as an Upwork lead and later becomes an internal delivery project if it is won.

### Pipeline Stages

The Prisma schema and project service define these stages:

- `DISCOVERED`
- `SCRIPTED`
- `SCRIPT_REVIEW`
- `VIDEO_DRAFT`
- `UNDER_REVIEW`
- `ASSIGNED`
- `BID_SUBMITTED`
- `VIEWED`
- `MESSAGED`
- `INTERVIEW`
- `WON`
- `IN_PROGRESS`
- `COMPLETED`
- `LOST`
- `CANCELLED`

Important implementation details:

- `ASSIGNED` still exists in the enum for compatibility, but the current pipeline logic largely bypasses it.
- `WON` is treated as transitional in the backend and auto-advances to `IN_PROGRESS`.
- Script review and video review have guardrails:
  - `SCRIPT_REVIEW -> VIDEO_DRAFT` requires script approval.
  - `UNDER_REVIEW -> BID_SUBMITTED` requires video review approval.

This means the product has explicit quality gates in the sales process, not just status labels.

## Core Domain Model

The Prisma schema is the clearest representation of the system's scope.

### Identity and Access

- `Role`
- `Team`
- `User`
- `RefreshToken`

Users belong to roles and optionally teams. Auth is JWT-based with persisted refresh tokens. The system supports multiple linked Upwork accounts per user.

### Multi-Tenancy

- `Organization`
- `UserOrganization`
- `Niche`

Organizations are first-class tenants. Users can belong to multiple organizations, and the frontend supports switching the active org. Niches are organization-scoped categories for work.

### Sales / Delivery Core

- `Project`
- `Milestone`
- `VideoProposal`
- `Meeting`
- `Task`
- `QAReview`
- `ProjectLink`
- `ChatMessage`
- `UpworkAccount`

This data model covers both pre-sale and post-sale operations:

- Upwork job information and pricing
- internal proposal materials
- review metadata
- assignments to closers and PMs
- delivery notes and contract value
- milestones and tasks
- QA review feedback
- external links like GitHub/Vercel/staging/docs
- synced Upwork chat history

### Analytics / Governance

- `Event`
- `Experiment`
- `ExperimentAssignment`

The codebase includes an audit/event log model and an experiments model for testing variants against project outcomes.

## Frontend Application Summary

The frontend is a role-aware operational dashboard, not a public site.

### Authentication and Session Handling

The frontend uses:

- localStorage for access token, refresh token, and active organization,
- an auth provider that restores session state on load,
- automatic token refresh on `401`,
- an auth guard that redirects unauthenticated users to `/login`.

The UI also supports active organization switching, which requests a fresh token scoped to the selected org.

### Main Routes

The main dashboard pages are:

- `/login`
- `/`
- `/jobs`
- `/projects`
- `/meetings`
- `/tasks`
- `/qa-reviews`
- `/analytics`
- `/organizations`
- `/users`

### What Each Main Screen Does

#### Dashboard (`/`)

The dashboard shows:

- headline metrics such as total projects, meetings, wins, and revenue,
- pipeline counts by stage,
- recent projects,
- quick actions filtered by the current user's role.

#### Jobs (`/jobs`)

This is the **sales pipeline board**. It uses drag-and-drop kanban interactions and role-based column visibility.

- Admins and leads can see the full board.
- Bidders mainly see early proposal stages.
- Closers mainly see later bid/submission stages.
- Operators and QA users are redirected away from this screen.

This page is effectively the central workbench for turning raw leads into active contracts.

#### Projects (`/projects`)

This is different from `/jobs`.

`/projects` focuses on **delivery-phase projects**, specifically projects in `IN_PROGRESS` and `COMPLETED`. It surfaces:

- client and pricing info,
- task counts by status,
- urgent task counts,
- meeting counts,
- milestone counts,
- links into project detail.

This split between `/jobs` and `/projects` is one of the most important conceptual distinctions in the app.

#### Tasks (`/tasks`)

The tasks page is a kanban board for delivery work. It supports:

- filtering by project,
- restricting the view to the logged-in developer's tasks,
- creating new tasks,
- urgency flags,
- priority values,
- task assignment flows.

#### Meetings (`/meetings`)

This screen manages meeting scheduling and completion. Meetings can hold:

- type,
- scheduled/completed timestamps,
- notes,
- meeting URL,
- Fathom, Loom, and Drive links.

That suggests the platform is intended to preserve supporting artifacts from client conversations.

#### QA Reviews (`/qa-reviews`)

This page is for QA workflows on tasks. It supports:

- creating QA reviews,
- setting score and status,
- updating comments and outcomes.

#### Analytics (`/analytics`)

The analytics UI consumes backend metrics for:

- all-time dashboard counts,
- conversion rates,
- date-range funnel analysis,
- top closers,
- per-organization summaries.

#### Organizations (`/organizations`)

Admin-focused page for:

- creating organizations,
- editing organization metadata,
- viewing organization members,
- adding and removing members.

#### Users (`/users`)

Admin-focused page for:

- listing users,
- creating users,
- editing roles, team assignments, activation status, and password.

## Backend API Summary

The backend is organized into NestJS modules, each aligned to a business area.

### Main Modules

- `identity`
- `organizations`
- `niches`
- `projects`
- `tasks`
- `qa`
- `meetings`
- `video`
- `analytics`
- `events`
- `experiments`
- `chats`

### Authentication / Identity

`auth.controller.ts` exposes endpoints for:

- login
- refresh token
- current user lookup
- switch active organization
- update profile
- change password
- logout
- list/add/remove/default Upwork accounts

This is one of the more mature parts of the app because it combines auth, org context, and user-linked Upwork identities.

### Projects

The projects module is the core of the backend. It supports:

- creating projects,
- importing projects from Upwork,
- filtered pagination,
- stage counts,
- full project detail retrieval,
- updates,
- direct stage setting,
- advancing to the next logical stage,
- assigning closer/PM,
- review actions.

The project listing service also enriches results with:

- per-status task counts,
- urgent task counts,
- related entity counts.

### Tasks and QA

Tasks support:

- paginated list views,
- kanban-friendly unpaginated fetches,
- per-project fetches,
- updates,
- assignment.

QA is modeled as a separate review layer attached to a task rather than embedded directly into task state.

### Meetings

Meetings are tied to projects and can be created, listed, updated, and marked complete, with support for tracking meeting artifacts.

### Video Proposals

The video module stores proposal video metadata and view counts. It also exposes an `upload-url` endpoint, but the current implementation returns a generated placeholder S3-style URL rather than a real signed upload flow. The presence of S3 environment variables suggests this area is intended to become a fuller media pipeline.

### Chats

The chats module exists specifically to support the Upwork extension workflow:

- sync messages into a project,
- list project chat history,
- fetch the latest sync timestamp.

### Analytics

The analytics module computes:

- dashboard summary metrics,
- pipeline funnel counts over a date range,
- top closer performance,
- per-organization summaries.

### Platform Behavior

Global backend behavior includes:

- JWT auth guard registered application-wide,
- role guard also registered application-wide,
- DTO validation,
- centralized exception filter,
- CORS with configured origins plus explicit allowance for `chrome-extension://` origins,
- Swagger docs generation.

## Chrome Extension Summary

The extension is a meaningful part of the product, not an afterthought.

### Purpose

It connects Upwork directly to AOP in two ways:

1. **Job import**
2. **Chat sync**

### Job Import Flow

On Upwork job pages, the content script:

- scrapes title, description, pricing, and skills from the DOM,
- injects an "Export to AOP" button,
- opens a custom panel,
- loads organizations and niches from the backend,
- posts the imported job to `/projects/import-from-upwork`.

This makes lead intake semi-automated.

### Chat Sync Flow

On Upwork message room pages, the content script:

- scrapes messages from the DOM,
- infers whether each message is from the client or the agency,
- loads organizations and projects,
- syncs chat history into the selected project.

This is valuable because it keeps client communication context inside the internal system.

### Extension Architecture

- popup UI for login/auth context
- background service worker for API messaging
- content scripts for Upwork pages
- Chrome storage for session state

The extension depends on the backend for auth, organizations, niches, projects, and chat sync endpoints.

## Data Flow Across the System

A typical end-to-end flow looks like this:

1. User logs into the frontend or extension.
2. User selects or switches an organization.
3. Upwork job is imported through the extension or manually created in the dashboard.
4. Project moves through proposal pipeline stages on the jobs board.
5. Lead/admin reviews scripts and video drafts.
6. Closer submits and tracks the bid through client response states.
7. If won, the project moves into active delivery.
8. PMs/operators/developers manage tasks, milestones, meetings, and QA.
9. Analytics rolls up performance across the pipeline and orgs.

This is a coherent operating system for an agency, not just a reporting layer.

## Seed Data and Roles

The seed file shows the platform is designed around realistic demo data.

### Seeded Roles

- `admin`
- `bidder`
- `closer`
- `operator`
- `qa`
- `lead`
- `project_manager`

### Seeded Teams

- Alpha Sales
- Beta Sales
- Operations
- QA

### Seeded Organizations

- Development Services
- Accounting Services
- Paralegal Services

This is useful because it shows the intended market shape: one agency platform that can operate across multiple service lines, not just software development.

## Local Development and Runtime Model

### Root Scripts

Important root scripts:

- `bun run dev:backend`
- `bun run dev:frontend`
- `bun run build:backend`
- `bun run build:frontend`
- `bun run db:generate`
- `bun run db:migrate`
- `bun run db:seed`

### Local Ports

From compose and app config:

- frontend: `3000`
- backend: `3001`
- postgres: `5432`

### Environment Variables

Backend example config includes:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `JWT_REFRESH_EXPIRATION`
- `S3_*`
- `CORS_ORIGINS`
- `PORT`
- `NODE_ENV`

Frontend example config includes:

- `NEXT_PUBLIC_API_URL`

### Docker Compose

Local Docker orchestration starts:

- Postgres 16
- backend container
- frontend container

This is enough for a full local stack except the extension, which is built separately with Vite.

## Deployment Model

`DEPLOYMENT.md` describes a production deployment to AWS with:

- Route through Namecheap DNS
- ACM certificate
- ALB for HTTPS and path routing
- ECS Fargate for frontend and backend
- RDS PostgreSQL
- ECR for images
- SSM Parameter Store for secrets
- GitHub Actions OIDC-based deployment

The documented production URL is `https://portal.exerraai.com`.

Operationally, the intended architecture is:

- `/*` -> frontend service
- `/api/*` -> backend service

## Testing and Project Maturity

The backend includes e2e specs for at least:

- auth
- projects
- meetings
- tasks
- videos
- organizations
- analytics

That gives the project a stronger maturity signal than the lack of a public README might suggest. The tests are validating actual workflows, not just isolated utility functions.

## Notable Implementation Details

- The app is genuinely multi-tenant through organization membership and token-based org switching.
- The frontend has a strong separation between sales pipeline work (`/jobs`) and delivery work (`/projects`, `/tasks`, `/qa-reviews`).
- The extension is tightly integrated with the backend and core business process.
- The project service contains real workflow rules, especially around review gating.
- Analytics are not cosmetic; they are based on stage math and conversion-rate calculations.
- The video upload story is partially implemented: metadata handling exists, but signed upload generation is still placeholder-level.
- `ASSIGNED` remains in the schema and some analytics contracts, but much of the current pipeline logic treats it as legacy/backward-compat state.

## Overall Assessment

This repository is an **internal operating platform for an agency that acquires work on Upwork and delivers that work through coordinated internal teams**. Its strongest capabilities are:

- modeling the agency's actual sales-to-delivery lifecycle,
- keeping business context inside one system,
- supporting multiple orgs/service lines,
- integrating directly with Upwork through a browser extension,
- combining operational execution with management analytics.

In practical terms, this project is best understood as a mix of:

- CRM for Upwork-sourced leads,
- proposal workflow manager,
- light PM system,
- internal QA tracker,
- communication sync layer,
- agency performance dashboard.

That combination is what makes the project distinctive.
