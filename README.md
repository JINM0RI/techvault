# TECHVAULT (PROTO1)

TECHVAULT is a personal interactive knowledge documentation platform.

PROTO1 includes:

- Website navigation
- Documentation hierarchy
- Cheat sheet section
- Notebook upload and ingestion
- Interactive Python code execution on topic pages

## Project Structure

```text
techvault/
  backend/
  frontend/
  content/
    documentation/
    cheatsheets/
```

## Backend Setup (FastAPI)

```bash
cd techvault
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

API base URL: `http://localhost:8000`

## Frontend Setup (Next.js)

```bash
cd techvault/frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:3000`

## Environment Variables

Create `frontend/.env.local` from `frontend/.env.local.example`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Notes

- Uploaded notebooks are stored under `content/documentation/{category}/{technology}/`.
- Metadata is stored in SQLite at `techvault/techvault.db`.
- Cheat sheets are markdown files in `content/cheatsheets/`.
- Code execution is sandboxed for prototype usage with a timeout and limited builtins.
