Section 1: Quick start

Quick start
- Prerequisites
  - Python 3.11+
  - Node 18+ and Yarn
  - MongoDB (local or cloud)
- Backend setup
  - conda create -n interprepai_latest python=3.11
  - conda activate interprepai_latest
  - cd backend
  - pip install -r requirements.txt
  - cp .env.example .env  # fill values (MONGODB_URI, POSTHOG_API_KEY, etc.)
  - uvicorn server:app --reload  # runs at http://127.0.0.1:8000
- Frontend setup
  - cd frontend
  - yarn install
  - cp .env.example .env  # set VITE_API_BASE_URL to http://localhost:8000
  - yarn start  # dev server at http://localhost:5173 (or 3000)
- Verify
  - Open the frontend and perform a basic action to see API responses.
  - Check backend logs to confirm requests are received.

Section 2: Architecture

Architecture
- Tech stack
  - Backend: FastAPI + Uvicorn, Python 3.11
  - Database: MongoDB
  - Frontend: React + Vite + Yarn
  - Analytics: PostHog (optional)
- Service layout
  - Backend runs at http://127.0.0.1:8000
  - Frontend dev server runs at http://localhost:5173
  - Frontend calls backend using VITE_API_BASE_URL
- Configuration
  - Backend env: backend/.env (see backend/.env.example)
    - MONGODB_URI: Mongo connection string
    - POSTHOG_API_KEY, POSTHOG_HOST: analytics (optional)
    - BACKEND_HOST, BACKEND_PORT: server bind/port
    - CORS_ORIGINS: comma‑separated list of allowed origins (include frontend URL)
  - Frontend env: frontend/.env (see frontend/.env.example)
    - VITE_API_BASE_URL: backend base URL
    - VITE_POSTHOG_KEY, VITE_POSTHOG_HOST: optional analytics
- Dev flow
  - Start backend (Uvicorn), then start frontend (Vite)
  - Adjust CORS_ORIGINS if you change frontend port
- Tests
  - Backend: pytest from backend/
  - CI: GitHub Actions run Python and Node workflows on pushes/PRs to main

Section 3: Features (link early)
Add this line near the top of README, right after the project description.

See the full feature list in FEATURES.md.

Section 4: Troubleshooting

Troubleshooting
- CORS error in browser
  - Ensure BACKEND CORS_ORIGINS includes your frontend origin (e.g., http://localhost:5173)
  - Restart backend after changing env
- Frontend cannot reach backend
  - Check VITE_API_BASE_URL in frontend/.env
  - Verify backend is running at http://127.0.0.1:8000 and no firewall blocks
- MongoDB connection failed
  - Verify MONGODB_URI; if local, ensure mongod is running
  - For cloud (Atlas), allow your IP in network access and use correct user/password
- PostHog not sending events
  - Confirm POSTHOG_API_KEY/VITE_POSTHOG_KEY and POSTHOG_HOST
  - Skip analytics by leaving keys empty (feature is optional)
- Port already in use
  - Change BACKEND_PORT or close the process using the port
  - For frontend, Vite will suggest an alternate port automatically

Section 5: Contributing (short link)

Contributions welcome! See CONTRIBUTING.md and CODE_OF_CONDUCT.md

Optional: Badges (add later once CI passes)
- Python CI and Node CI status badges
- License badge (MIT)
- PRs welcome badge
