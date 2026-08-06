# Atlas Repository Specification

## Project Vision
Atlas is a modern applicant tracking platform that unifies job applications, company relationships, recruiter contacts, and Gmail-driven communication into a single workflow. The product is designed to help users manage application pipelines, track employer and recruiter interactions, and surface relevant email sync details within a simple SaaS dashboard.

## Tech Stack

### Frontend
- Next.js 16.3.0 with the App Router
- React with client and server components
- TypeScript
- Tailwind CSS and custom UI components
- Frontend communicates with backend through `NEXT_PUBLIC_BACKEND_URL`

### Backend
- FastAPI-based Python backend
- SQLAlchemy ORM for database modeling and repositories
- Alembic for migrations
- Modular backend layout with services, repositories, connectors, and workflows

### Database
- SQLite for local development and persistence
- Alembic migrations configured in `backend/alembic`
- Core models stored under `backend/models`

### Authentication
- OAuth login routes under frontend auth pages
- Token-based login support implied by backend `Token` model and user management
- Frontend login flow exists but current spec focuses on implemented pages and shell

### AI
- AI-related backend and frontend folders exist (`backend/ai`, `frontend/app/features/ai_chat`) implying planned AI features
- Current working scope does not include explicit AI functionality beyond structure

### Deployment
- Standard Next.js build for frontend
- Backend deploys as FastAPI service
- Environment variables and `NEXT_PUBLIC_BACKEND_URL` coordinate frontend/backend URL

## Folder Structure

- `backend/`: Python API and service implementation
  - `api/`: FastAPI route definitions
  - `services/`: business logic for application domains
  - `repositories/`: persistence and data access abstractions
  - `models/`: SQLAlchemy ORM models
  - `connectors/`: external integrations such as Gmail sync
  - `database/`: DB engine and session setup
  - `scheduler/`: scheduled background jobs
  - `workflows/`: domain workflows and orchestration

- `frontend/`: Next.js application
  - `app/`: page routes and layout components
  - `components/`: shared UI components like app shell
  - `services/`: reusable API fetch utilities
  - `lib/`, `hooks/`, `store/`, `types/`, `styles/`: supporting frontend structure

- `alembic.ini`: migration configuration
- `package.json`: frontend package metadata and scripts
- `.env` / `.env.example`: environment configuration

## Current Features

- Infrastructure: Frontend and backend scaffolding with app shell, API services, and build support
- OAuth: Auth pages and login route exist for user authentication flow
- Gmail: Gmail test route and integration folder present for email sync testing
- Email Sync: Gmail history sync is part of backend integration design
- Applications: Application listing page and creation form available
- Companies: Company domain support with company list page
- Recruiters: Recruiter domain support with recruiter list page
- Dashboard: Root dashboard page displays counts and links to key sections
- Application Shell: Shared sidebar and header shell used across frontend pages

## API Summary

- `GET /applications`: Retrieve application records
- `POST /applications`: Create a new application
- `GET /companies`: Retrieve company records
- `GET /recruiters`: Retrieve recruiter records
- `GET /gmail/test`: Gmail integration test endpoint or page route
- `GET /auth/login`: Frontend login page
- `GET /auth/success`: Frontend auth success callback

## Database Models

### User
Represents an application user, owning applications and authentication state.

### Token
Stores authentication tokens or session tokens for auth flows.

### Email
Represents synced Gmail messages or email metadata linked to users.

### Application
Tracks job applications, including company reference, position, status, source, and applied date.

### Company
Stores employer data and is referenced by applications.

### Recruiter
Stores recruiter contact data and can optionally be linked to applications.

## Frontend Pages

- `Dashboard`: `/`
- `Applications`: `/applications`
- `Companies`: `/companies`
- `Recruiters`: `/recruiters`
- `Settings`: `/settings`
- `Gmail Test`: `/gmail/test`
- `Login`: `/auth/login`
- `Auth Success`: `/auth/success`

## Coding Rules

- Never scan the repository for implementation changes.
- Modify only requested files.
- Keep changes minimal and targeted.
- Reuse existing code where possible.
- Avoid unnecessary abstractions.
- Do not create placeholder implementations.

## Development Workflow

- One sprint.
- One feature.
- One verification.
- Stop.
