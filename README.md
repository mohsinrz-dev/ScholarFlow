# StudyPilot — Frontend

**Study smarter. Stay consistent. Reach further.**

AI-powered personalized learning and study-planning platform built with React + Vite + Tailwind CSS.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Auth | Supabase Auth (via @supabase/supabase-js) |
| Charts | Recharts |
| Icons | Lucide React |
| Animations | Framer Motion (ready to use) |
| HTTP | Native fetch with centralized API client |

---

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd studypilot
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_API_BASE_URL=http://localhost:8080
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

- `VITE_API_BASE_URL` — your backend server URL
- `VITE_SUPABASE_URL` — from your Supabase project settings
- `VITE_SUPABASE_ANON_KEY` — the public anon key (safe to expose in frontend)

### 3. Run locally

```bash
npm run dev
```

App opens at `http://localhost:5173`.

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## Project structure

```
src/
├── App.jsx                  # Route definitions
├── main.jsx                 # React entry point
├── styles/
│   └── globals.css          # Tailwind directives + custom tokens
├── context/
│   ├── AuthContext.jsx      # Session state via Supabase
│   └── ThemeContext.jsx     # Dark/light mode
├── services/
│   ├── supabase.js          # Supabase client init
│   ├── api.js               # Centralized API client + endpoint map
│   └── auth.js              # Auth helpers (signIn, signUp, etc.)
├── hooks/
│   └── useApi.js            # Data fetching hook + useDebounce
├── utils/
│   └── index.js             # Formatting, class merging, helpers
├── components/
│   ├── ui/                  # Button, Input, Card, Modal, Toast, Badge
│   ├── layout/              # AppLayout, Sidebar, MobileNav, PageHeader
│   └── auth/                # ProtectedRoute, PublicRoute
└── pages/
    ├── Landing.jsx
    ├── Onboarding.jsx
    ├── Dashboard.jsx
    ├── Planner.jsx
    ├── TaskDetail.jsx
    ├── Tutor.jsx
    ├── LearningHistory.jsx
    ├── Revisions.jsx
    ├── Analytics.jsx
    ├── Settings.jsx
    ├── NotFound.jsx
    └── auth/
        ├── SignIn.jsx
        ├── SignUp.jsx
        ├── ForgotPassword.jsx
        └── AuthLayout.jsx
```

---

## Backend API contract

The frontend expects these endpoints on `VITE_API_BASE_URL` (default `http://localhost:8080`). All authenticated requests send:

```
Authorization: Bearer <supabase_access_token>
```

### Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /api/health | Health check |
| GET | /api/profile | Get current user profile |
| PATCH | /api/profile | Update profile fields |
| GET | /api/dashboard | Dashboard summary (tasks, stats, suggestions) |
| GET | /api/tasks | List tasks (supports `?status=`, `?priority=`) |
| POST | /api/tasks | Create task |
| GET | /api/tasks/:id | Get single task |
| PATCH | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/study-sessions | List study sessions |
| POST | /api/study-sessions | Create session |
| GET | /api/learning-history | List learning history entries |
| GET | /api/revisions | List revision items |
| POST | /api/revisions | Create revision item |
| PATCH | /api/revisions/:id | Update revision (mark reviewed, set next date) |
| GET | /api/analytics | Analytics data (completions, subjects, sessions) |
| POST | /api/ai/tutor | Send message to AI tutor |
| GET | /api/ai/conversations | List AI conversations |
| GET | /api/ai/conversations/:id | Get conversation with messages |
| DELETE | /api/ai/conversations/:id | Delete conversation |

### Expected response shapes

**GET /api/dashboard**
```json
{
  "tasks": [...],
  "completed_today": 2,
  "pending_count": 5,
  "subjects": ["Physics", "Maths"],
  "revisions_due": 3,
  "recent_activity": [{ "title": "...", "created_at": "..." }],
  "suggested_action": { "message": "...", "link": "/revisions", "label": "Start revision" }
}
```

**GET /api/tasks**
```json
[{
  "id": "uuid",
  "title": "Complete chapter 5 notes",
  "subject": "Physics",
  "topic": "Chapter 5",
  "priority": "high",
  "status": "pending",
  "due_date": "2026-10-25T00:00:00Z",
  "estimated_minutes": 45,
  "notes": "..."
}]
```

**POST /api/ai/tutor**

Request:
```json
{
  "message": "Explain Newton's second law",
  "subject": "Physics",
  "language": "english",
  "mode": "explain",
  "conversation_id": "uuid-or-null"
}
```

Response:
```json
{
  "message": "Newton's second law states...",
  "conversation_id": "uuid"
}
```

**GET /api/analytics**
```json
{
  "total_completed": 42,
  "completed_this_week": 8,
  "total_sessions": 15,
  "unique_topics": 12,
  "daily_completions": [{ "date": "Oct 15", "count": 3 }],
  "subject_breakdown": [{ "subject": "Physics", "completed": 10, "pending": 4 }],
  "subject_distribution": [{ "subject": "Physics", "value": 10 }]
}
```

---

## Authentication flow

1. User signs up via Supabase Auth → email confirmation sent
2. After confirmation, user signs in → Supabase session established
3. All API requests include `Authorization: Bearer <access_token>`
4. On 401 response, session is cleared and user is redirected to `/signin`
5. Password reset uses Supabase's built-in email flow

Account deletion is handled by the backend's 30-day soft-delete flow; do not create a public `delete_user` RPC.

---

## What requires backend configuration

Before the app is fully functional, you need:

- [ ] Supabase project created with email auth enabled
- [ ] Backend server running on `VITE_API_BASE_URL`
- [ ] All API endpoints implemented and returning documented shapes
- [ ] `delete_user` RPC function in Supabase (for account deletion)
- [ ] CORS configured on backend to allow the frontend origin
- [ ] AI provider key configured server-side only (never in this frontend)

---

## Test checklist

### Auth
- [ ] Sign up creates account and sends confirmation email
- [ ] Confirmed user can sign in
- [ ] Forgot password sends reset email
- [ ] Protected routes redirect to /signin when logged out
- [ ] Sign out clears session and redirects to /signin
- [ ] 401 API response triggers automatic sign-out

### Dashboard
- [ ] Welcome message shows authenticated user's name
- [ ] Stats reflect real API data (not hardcoded)
- [ ] Empty state shown for new users
- [ ] Quick action links navigate correctly

### Planner
- [ ] Tasks load from API
- [ ] New task form validates (title required)
- [ ] Task saved only after API success
- [ ] Edit task pre-fills form
- [ ] Delete shows confirmation modal before proceeding
- [ ] Marking complete updates task status via API
- [ ] Search and filters work client-side

### AI Tutor
- [ ] Sending a message calls /api/ai/tutor
- [ ] Response appears in conversation
- [ ] Error state shows retry option
- [ ] No fake AI responses shown while awaiting real response
- [ ] Conversation history loads from API
- [ ] Deleting conversation removes it

### Learning History
- [ ] History items load from API
- [ ] Search filters results
- [ ] Grouped by date correctly
- [ ] Empty state shown when no history

### Revision Center
- [ ] Revisions load from API
- [ ] Due/overdue items flagged correctly
- [ ] Mark as reviewed calls API and updates UI
- [ ] New revision item saves via API
- [ ] Tab filters (Due, All, Reviewed) work

### Analytics
- [ ] Charts render from API data
- [ ] Empty state shown when no data
- [ ] No fabricated values in charts

### Settings
- [ ] Profile form loads current data
- [ ] Save updates profile via API
- [ ] Theme toggle works and persists
- [ ] Password change validates length
- [ ] Account deletion shows confirmation before proceeding

### Navigation
- [ ] Sidebar collapses and expands
- [ ] Mobile bottom nav works
- [ ] Active route is highlighted
- [ ] 404 page shown for unknown routes

### Accessibility + UX
- [ ] Forms have accessible labels
- [ ] Focus states visible on keyboard navigation
- [ ] Loading skeletons shown while fetching
- [ ] Error states have retry actions
- [ ] Toasts appear for success and error actions
- [ ] Modals close on Escape key
- [ ] Reduced motion respected
