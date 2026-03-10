# TECHVAULT (PROTO1)

TECHVAULT is a personal interactive knowledge vault.

PROTO1 includes:

- Dynamic user-created categories
- Notes inside categories
- Topics inside notes
- Interactive block-based topic editor
- Explanation blocks (BlockNote rich editor)
- Code blocks (Monaco IDE-style cell)
- Block reordering (move up/down)
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
    app/
      documentation/
      notes/
      topic/
    components/
      DocumentationManager.tsx
      NotesListManager.tsx
      TopicListManager.tsx
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

Alternative from `backend/` directory:

```bash
uvicorn main:app --reload --port 8000
```

API base URL: `http://localhost:8000`

## Frontend Setup (Next.js)

```bash
cd techvault/frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:3000`

## Frontend Routes

- `/` Home page
- `/documentation` Categories page with Add Category modal
- `/documentation/[category]` Notes page for selected category with Add Note modal
- `/notes/[note_id]` Topics page for selected note with Add Topic form
- `/topic/[id]` Interactive topic editor for explanation and code blocks

Editor behavior:

- Code blocks are always editable (no edit modal).
- Code blocks include language dropdown + Save on the top-right, Run button under the editor, and persistent output panel.
- Explanation blocks use BlockNote with modern document-style formatting controls and Save on the top-right.

## Backend APIs

- Categories CRUD:
  - `GET /categories`
  - `GET /categories/{category_id}`
  - `POST /categories`
  - `PUT /categories/{category_id}`
  - `DELETE /categories/{category_id}`
- Notes CRUD:
  - `GET /categories/{category_id}/notes`
  - `POST /categories/{category_id}/notes`
  - `GET /notes/{note_id}`
  - `PUT /notes/{note_id}`
  - `DELETE /notes/{note_id}`
- Topics CRUD:
  - `GET /notes/{note_id}/topics`
  - `POST /notes/{note_id}/topics`
  - `GET /topics/{topic_id}`
  - `PUT /topics/{topic_id}`
  - `DELETE /topics/{topic_id}`
- Blocks CRUD:
  - `POST /topics/{topic_id}/blocks`
  - `PUT /blocks/{block_id}`
  - `DELETE /blocks/{block_id}`
  - `POST /blocks/{block_id}/move`
- Code execution:
  - `POST /run-code`

## SQLite Schema

- `categories(id, name, created_at)`
- `notes(id, category_id, name, technology, created_at)`
- `topics(id, note_id, title, language, created_at)`
- `blocks(id, topic_id, block_type, content, language, position, created_at)`

`block_type` values: `explanation`, `code`.
Blocks are rendered in ascending `position` order.

## Environment Variables

Create `frontend/.env.local` from `frontend/.env.local.example`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Notes

- Data is stored in SQLite at `techvault/techvault.db`.
- Database init includes legacy migration support from the previous topic schema.
- Seed data is created at startup for first-run testing (Python -> Python Basics -> Python Lists).
- Cheat sheets are markdown files in `content/cheatsheets/`.
- Code execution is sandboxed for prototype usage with a timeout and limited builtins.
- Python execution is supported for code blocks in PROTO1; other languages are syntax-highlighted only.
