# TECHVAULT (PROTO1)

TECHVAULT is a personal interactive knowledge vault.

PROTO1 includes:

- Website navigation
- Documentation hierarchy
- Topic creation inside the app
- Block-based topic editor
- Explanation blocks (TipTap rich text)
- Code blocks (Monaco editor)
- Block reordering (move up/down)
- Slash commands (`/code`, `/text`)
- Cheat sheet section
- Interactive Python code execution on topic pages

## Project Structure

```text
techvault/
  backend/
    main.py
    database.py
    models.py
    code_executor.py
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

- Data is stored in SQLite at `techvault/techvault.db`.
- `topics` table stores topic metadata.
- `blocks` table stores explanation/code blocks in ordered positions.
- Cheat sheets are markdown files in `content/cheatsheets/`.
- Code execution is sandboxed for prototype usage with a timeout and limited builtins.
- Python execution is supported for code blocks in PROTO1; other languages are syntax-highlighted only.
