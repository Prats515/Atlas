# Atlas

Atlas is a modern applicant tracking platform.

## Setup Instructions

1. Install dependencies:
   - Frontend: `cd frontend && npm install`
   - Backend: `cd backend && pip install -r requirements.txt`

2. Configure environment:
   - Copy `.env.example` to `.env`.
   - Update `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`.

3. Run:
   - Backend: `uvicorn backend.main:app --reload`
   - Frontend: `cd frontend && npm run dev`

## Environment Variables
- `DATABASE_URL`: SQLite database path.
- `GEMINI_API_KEY`: API key for email analysis.
- `GOOGLE_CLIENT_ID`: OAuth client ID.
- `GOOGLE_CLIENT_SECRET`: OAuth client secret.
