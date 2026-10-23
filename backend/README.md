# StudyPilot backend

StudyPilot's JSON API provides Supabase-backed account authentication and per-user study data, plus optional study-material tools through an OpenAI-compatible chat completions provider.

## Requirements

- Node.js 20 or newer.
- A Supabase project with email/password authentication enabled.
- An AI provider key for the AI endpoints (optional; all other API features work without one).

## Run locally

1. Copy `.env.example` to `.env` and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from the Supabase project's API settings. The service role key is used only to securely validate and revoke sessions; it never leaves the server.
2. In Supabase SQL Editor, run `supabase/schema.sql` once.
3. From this directory run `npm install`, then `npm run dev`. For production use `npm start` and set `NODE_ENV=production`.
4. Set `FRONTEND_ORIGIN` to the exact frontend origin(s), comma separated, such as `https://app.example.com`. Do not use a wildcard.
5. Configure `AI_PROVIDER_API_KEY` to enable the AI endpoints. Configure `AI_PROVIDER_BASE_URL` and `AI_MODEL` for a compatible provider.

The server listens on `PORT` (default `8080`) and binds to `0.0.0.0`. Check `GET /api/health` for a readiness response. API responses use `{ "success": true, "data": ... }`; failures use `{ "success": false, "error": { "code": ..., "message": ... } }`.

## Routes

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | No | Health check |
| POST | `/api/auth/signup` | No | Create an email/password account; returns confirmation requirement |
| POST | `/api/auth/login` | No | Sign in; returns Supabase access and refresh tokens |
| POST | `/api/auth/refresh` | No | Exchange a refresh token for a new session |
| GET | `/api/auth/me` | Bearer | Get the current account |
| POST | `/api/auth/logout` | Bearer | Revoke the current session |
| POST | `/api/account/recover` | Bearer | Restore an account in its 30-day recovery window |
| GET | `/api/dashboard` | Bearer | Counts, upcoming tasks, and recent study sessions |
| GET, POST | `/api/subjects` | Bearer | List or create subjects |
| GET, PATCH, DELETE | `/api/subjects/:id` | Bearer | Read, update, or delete a subject |
| GET, POST | `/api/tasks` | Bearer | List or create study tasks |
| GET, PATCH, DELETE | `/api/tasks/:id` | Bearer | Read, update, or delete a task |
| GET, POST | `/api/notes` | Bearer | List or create notes |
| GET, PATCH, DELETE | `/api/notes/:id` | Bearer | Read, update, or delete a note |
| GET, POST | `/api/flashcards` | Bearer | List or create flashcards |
| GET, PATCH, DELETE | `/api/flashcards/:id` | Bearer | Read, update, or delete a flashcard |
| GET, POST | `/api/study_sessions` | Bearer | List or record completed study sessions |
| GET, PATCH, DELETE | `/api/study_sessions/:id` | Bearer | Read, update, or delete a study session |
| POST | `/api/ai/summarize` | Bearer | Summarize study material |
| POST | `/api/ai/explain` | Bearer | Explain study material |
| POST | `/api/ai/quiz` | Bearer | Generate a structured quiz |
| POST | `/api/ai/flashcards` | Bearer | Generate structured flashcards |
| POST | `/api/ai/plan` | Bearer | Generate a structured study plan |

Data collection endpoints accept `limit` (1–100, default 50), `offset` (default 0), and exact-match filters on their fields. Authenticated endpoints require `Authorization: Bearer <access_token>`. AI requests accept a JSON body with `material` or `text`; study plans can also use `goal`, `availableMinutes`, and `background`.

All database calls use the caller's Supabase token. Row-level security in `supabase/schema.sql` isolates data to its owner. The server applies JSON size limits, input checks, restricted CORS, and generic server/database error responses.
