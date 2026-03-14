# 🍺 Job.Bar — AI Powered Job Search & Auto Application Platform

A full-stack SaaS platform where job seekers can upload their resume, search real job listings, generate AI-tailored resumes and cover letters, auto-apply with Playwright, and track all applications in one dashboard.

---

## Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Frontend    | Next.js 14, React, TailwindCSS, Framer Motion |
| Backend     | Node.js, Express.js                    |
| Database    | PostgreSQL via Supabase                |
| Auth        | Supabase Auth (Google OAuth)           |
| AI          | OpenAI GPT-4o                          |
| Job API     | Adzuna API                             |
| Automation  | Playwright                             |
| Deploy FE   | Vercel                                 |
| Deploy BE   | Railway                                |

---

## Project Structure

```
jobbar/
├── frontend/                   # Next.js 14 app
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css
│   │   ├── dashboard/page.tsx
│   │   ├── jobs/page.tsx
│   │   ├── resume/page.tsx
│   │   ├── applications/page.tsx
│   │   └── assistant/page.tsx
│   ├── components/
│   │   ├── AuthProvider.tsx
│   │   ├── Navbar.tsx
│   │   ├── JobCard.tsx
│   │   ├── ApplicationTable.tsx
│   │   ├── ResumeUploader.tsx
│   │   ├── AIAssistant.tsx
│   │   └── DashboardCard.tsx
│   └── lib/
│       ├── supabaseClient.ts
│       └── api.ts
│
├── backend/                    # Express.js API
│   ├── server.js
│   ├── routes/
│   │   ├── jobs.js
│   │   ├── users.js
│   │   ├── resume.js
│   │   └── applications.js
│   ├── services/
│   │   ├── jobSearchService.js
│   │   ├── resumeParser.js
│   │   ├── aiService.js
│   │   └── autoApplyService.js
│   ├── automation/
│   │   └── applyBot.js
│   ├── middleware/
│   │   └── auth.js
│   └── database/
│       └── schema.sql
│
└── README.md
```

---

## Prerequisites

- Node.js >= 18
- npm >= 9
- A [Supabase](https://supabase.com) account — **free tier**
- A [Google Gemini](https://aistudio.google.com/app/apikey) API key — **free tier** (no credit card)
- A [Jooble](https://jooble.org/api/about) API key — **free** (email api@jooble.org)
- A Google Cloud OAuth 2.0 client — **free**

**Total cost: $0**

---

## Step 1 — Supabase Setup (Free)

### 1.1 Create a new Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project (free tier)
2. Note your **Project URL** and **anon key** from Project Settings → API
3. Also copy the **service_role key** (keep this secret)

### 1.2 Run the database schema

1. Supabase Dashboard → SQL Editor
2. Open `backend/database/schema.sql`, paste and click **Run**

### 1.3 Enable Google OAuth

1. Supabase Dashboard → Authentication → Providers → Enable **Google**
2. [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
3. Create an OAuth 2.0 Client ID (Web application)
4. Authorized redirect URI: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
5. Paste Client ID and Secret into Supabase

---

## Step 2 — Get Free API Keys

### Gemini AI (free — no credit card)
1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **Create API key** — instant, no billing required
3. Free limits: 15 requests/min, 1M tokens/day

### Jooble Job API (free)
1. Email **api@jooble.org** with subject "API Key Request"
2. Write: "Hi, I'm building a job search app and would like a free API key."
3. They reply within 1–2 business days with your key
4. Alternative: register at [jooble.org/api/about](https://jooble.org/api/about)

---

## Step 3 — Local Development

### 3.1 Backend

```bash
cd backend
npm install
npx playwright install chromium
cp .env.example .env
# Edit .env and fill in: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
#                         GEMINI_API_KEY, JOOBLE_API_KEY, JWT_SECRET
npm run dev
# → Running at http://localhost:5000
```

### 3.2 Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local and fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
# → Running at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step 4 — Feature Walkthrough

### Authentication
- Click **Continue with Google** on the landing page
- Supabase handles OAuth; user profile is auto-created in the database

### Resume Upload
1. Go to **Resume** in the sidebar
2. Drag and drop a PDF or DOCX resume
3. Gemini AI extracts name, email, phone, skills, education, experience

### Job Search
1. Go to **Find Jobs**
2. Enter keywords and location
3. Click **Match My Skills** to rank results by your resume's skills
4. Each job card: **AI Resume** (Gemini), **Auto Apply** (Playwright), **Log Applied**

### Applications Dashboard
- Go to **Applications** to track all applications
- Change status: Applied → Under Review → Interview → Offer → Rejected

### AI Career Coach
- Go to **AI Assistant**
- Chat with Gemini for interview prep, resume tips, salary negotiation

---

## Step 5 — API Reference

All routes require `Authorization: Bearer <supabase_jwt>` header.

```
GET  /health

GET  /api/jobs?keywords=python&location=remote&page=1
GET  /api/jobs/search-with-profile

POST /api/resume/upload          (multipart/form-data, field: resume)
GET  /api/resume
POST /api/resume/generate        { jobTitle, jobDescription, company }
POST /api/resume/export-pdf      { content, filename }

GET    /api/applications
POST   /api/applications         { company, role, location, applyUrl }
PATCH  /api/applications/:id/status  { status }
DELETE /api/applications/:id
POST   /api/applications/auto-apply  { job }
GET    /api/applications/stats

GET  /api/users/profile
PUT  /api/users/profile
POST /api/users/chat             { messages: [{role, content}] }
GET  /api/users/chat/history
```

---

## Step 6 — Free Deployment

### 6.1 Deploy Backend to Render.com (free)

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo, set root directory to `backend`
3. Build command: `npm install && npx playwright install chromium`
4. Start command: `npm start`
5. Add all environment variables from `backend/.env`
6. Note your service URL: `https://jobbar-backend.onrender.com`

> **Note:** Render free tier spins down after 15 min of inactivity. First request after sleep takes ~30 seconds. This is fine for development/demos.

### 6.2 Deploy Frontend to Vercel (free)

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set root directory to `frontend`
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_BACKEND_URL=https://jobbar-backend.onrender.com
   NEXT_PUBLIC_APP_URL=https://jobbar.vercel.app
   ```
4. Click Deploy

### 6.3 Update Supabase redirect URLs

Authentication → URL Configuration:
- Site URL: `https://jobbar.vercel.app`
- Redirect URLs: `https://jobbar.vercel.app/dashboard`

---

## Environment Variables Summary

### Backend (all free)

| Variable | Where to get it | Free? |
|---|---|---|
| `SUPABASE_URL` | Supabase project settings | ✅ |
| `SUPABASE_ANON_KEY` | Supabase project settings | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings | ✅ |
| `GEMINI_API_KEY` | aistudio.google.com/app/apikey | ✅ |
| `JOOBLE_API_KEY` | Email api@jooble.org | ✅ |
| `JWT_SECRET` | Any random 32+ char string | ✅ |
| `FRONTEND_URL` | Your Vercel URL | ✅ |

### Frontend (all free)

| Variable | Where to get it | Free? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings | ✅ |
| `NEXT_PUBLIC_BACKEND_URL` | Your Render service URL | ✅ |

---

## Troubleshooting

**Gemini AI not responding**
- Check `GEMINI_API_KEY` is set correctly in `.env`
- Verify at [aistudio.google.com](https://aistudio.google.com) the key is active
- Free tier: if you hit 15 req/min, wait 60 seconds and retry

**Jobs not loading**
- Jooble key not set: email api@jooble.org for a free key
- Check backend logs for the exact error

**Google OAuth not working**
- Verify redirect URI in Google Cloud Console matches Supabase exactly
- Check Supabase Google provider is enabled with the correct client ID/secret

**Render backend slow on first request**
- Free tier sleeps after 15 min — first wake-up takes ~30s
- This is normal; subsequent requests are fast

**Auto-apply not working**
- Run `npx playwright install chromium` in backend directory
- Form submission is disabled by default in `applyBot.js` (safety feature)
- Read the comments in `applyBot.js` to enable actual submission

---

## License

MIT — built for developers. Fork it, customize it, ship it. 🚀


---

## Step 1 — Supabase Setup

### 1.1 Create a new Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **anon key** from Project Settings → API

### 1.2 Run the database schema

1. Go to Supabase Dashboard → SQL Editor
2. Open `backend/database/schema.sql`
3. Paste the entire content and click **Run**

### 1.3 Enable Google OAuth

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Google**
3. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
4. Create an OAuth 2.0 Client ID (Web application)
5. Add Authorized redirect URI: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret back into Supabase Google provider settings

---

## Step 2 — Adzuna API Setup

1. Register at [developer.adzuna.com](https://developer.adzuna.com)
2. Create an app and get your **App ID** and **App Key**
3. Free tier supports 250 requests/day

---

## Step 3 — Local Development

### 3.1 Clone and install

```bash
git clone https://github.com/yourusername/jobbar.git
cd jobbar
```

### 3.2 Backend setup

```bash
cd backend
npm install

# Install Playwright browsers
npx playwright install chromium

# Copy and fill environment variables
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# Supabase
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-...

# Adzuna
ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key
ADZUNA_COUNTRY=us

# JWT
JWT_SECRET=your_random_secret_at_least_32_chars

# Frontend
FRONTEND_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev
# Backend running at http://localhost:5000
```

### 3.3 Frontend setup

```bash
cd ../frontend
npm install

cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
# Frontend running at http://localhost:3000
```

### 3.4 Access the app

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step 4 — Feature Walkthrough

### Authentication
- Click **Continue with Google** on the landing page
- Supabase handles OAuth; user profile is auto-created in the database

### Resume Upload
1. Go to **Resume** in the sidebar
2. Drag and drop a PDF or DOCX resume
3. AI extracts name, email, phone, skills, education, experience
4. Skills are used for job ranking

### Job Search
1. Go to **Find Jobs**
2. Enter keywords (e.g. "Python Developer") and location
3. Click **Match My Skills** to use your resume's skills for ranking
4. Each job card has:
   - **AI Resume** — generates a tailored resume + cover letter
   - **Auto Apply** — Playwright bot fills and submits the application
   - **Log Applied** — manually tracks the application

### Applications Dashboard
- Go to **Applications** to see all tracked applications
- Change status via dropdown: Applied → Under Review → Interview → Offer → Rejected
- Filter by status using the tab bar

### AI Career Coach
- Go to **AI Assistant**
- Chat with GPT-4o for interview prep, resume tips, salary negotiation, etc.

---

## Step 5 — API Reference

### Health check
```
GET /health
```

### Jobs
```
GET  /api/jobs?keywords=python&location=remote&page=1
GET  /api/jobs/search-with-profile?location=remote
```

### Resume
```
POST /api/resume/upload          (multipart/form-data, field: resume)
GET  /api/resume
POST /api/resume/generate        { jobTitle, jobDescription, company }
POST /api/resume/export-pdf      { content, filename }
```

### Applications
```
GET    /api/applications?status=Applied&page=1
POST   /api/applications         { company, role, location, applyUrl }
PATCH  /api/applications/:id/status  { status }
DELETE /api/applications/:id
POST   /api/applications/auto-apply  { job: { title, company, applyUrl, ... } }
GET    /api/applications/stats
```

### Users
```
GET  /api/users/profile
PUT  /api/users/profile          { full_name, phone, location, ... }
POST /api/users/chat             { messages: [{role, content}] }
GET  /api/users/chat/history
```

All routes (except `/health`) require `Authorization: Bearer <supabase_jwt>` header.

---

## Step 6 — Deployment

### 6.1 Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the `jobbar` repo, set root directory to `backend`
3. Add environment variables (all from `backend/.env`)
4. Railway auto-detects Node.js and runs `npm start`
5. Note the generated URL (e.g. `https://jobbar-backend.railway.app`)

### 6.2 Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select the `jobbar` repo, set root directory to `frontend`
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_BACKEND_URL=https://jobbar-backend.railway.app
   NEXT_PUBLIC_APP_URL=https://jobbar.vercel.app
   ```
4. Click Deploy

### 6.3 Update Supabase redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://jobbar.vercel.app`
- Redirect URLs: `https://jobbar.vercel.app/dashboard`

### 6.4 Update backend CORS

In `backend/.env` on Railway:
```
FRONTEND_URL=https://jobbar.vercel.app
```

---

## Environment Variables Summary

### Backend (`backend/.env`)

| Variable                  | Description                          |
|---------------------------|--------------------------------------|
| `PORT`                    | Server port (default 5000)           |
| `SUPABASE_URL`            | Your Supabase project URL            |
| `SUPABASE_ANON_KEY`       | Supabase anon/public key             |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret) |
| `OPENAI_API_KEY`          | OpenAI API key                       |
| `ADZUNA_APP_ID`           | Adzuna job API app ID                |
| `ADZUNA_APP_KEY`          | Adzuna job API key                   |
| `ADZUNA_COUNTRY`          | Country code (us, gb, au, etc.)      |
| `JWT_SECRET`              | Secret for JWT signing               |
| `FRONTEND_URL`            | Frontend URL for CORS                |

### Frontend (`frontend/.env.local`)

| Variable                       | Description                     |
|--------------------------------|---------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`     | Supabase project URL            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase anon key               |
| `NEXT_PUBLIC_BACKEND_URL`      | Backend API URL                 |
| `NEXT_PUBLIC_APP_URL`          | Frontend app URL                |

---

## Troubleshooting

**Resume upload fails**
- Check file is PDF or DOCX under 5MB
- Ensure `backend/uploads/resumes/` directory exists
- Check Supabase service role key is correct

**Jobs not loading**
- Verify `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` are set
- Check Adzuna account is active (free tier: 250 req/day)
- Check backend logs: `npm run dev`

**Google OAuth not working**
- Verify redirect URI in Google Cloud Console matches Supabase callback URL exactly
- Check Supabase Google provider is enabled

**Auto-apply not working**
- Run `npx playwright install chromium` in backend directory
- Check the job has a valid `applyUrl`
- Note: actual form submission is disabled by default — see `applyBot.js` to enable

**AI features not working**
- Verify `OPENAI_API_KEY` is valid and has credits
- GPT-4o requires a paid OpenAI account

---

## License

MIT — built for developers. Fork it, customize it, ship it. 🚀
