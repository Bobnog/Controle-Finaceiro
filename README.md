FINANCE PROJECT (FastAPI backend + React frontend)
-------------------------------------------------

Project structure:
- backend/: FastAPI backend (SQLite)
- frontend/: React frontend (minimal)

Included image (your uploaded image) copied to:
frontend/public/logo.png

HOW TO RUN (step-by-step)

1) Backend (FastAPI)
--------------------
- Open VS Code and a terminal in the 'backend' folder:
  cd backend

- Create virtual env and activate:
  python -m venv .venv
  # Windows:
  .venv\Scripts\activate
  # macOS / Linux:
  source .venv/bin/activate

- Install dependencies:
  pip install -r requirements.txt

- Start the server:
  uvicorn app.main:app --reload

- Open the API docs:
  http://127.0.0.1:8000/docs

2) Frontend (React)
-------------------
- Open a new terminal in the 'frontend' folder:
  cd frontend

- Install dependencies:
  npm install

- Start the dev server:
  npm start

- The frontend will open at:
  http://localhost:3000

NOTES
- Register a user via backend POST /auth/register (use Swagger /docs) before logging in on the frontend.
- The example SECRET_KEY in backend/app/auth.py should be changed to a secure random string for production.
- Database is SQLite file at backend/finance.db
- If you want the frontend to build for production, run 'npm run build' and serve the build folder.

