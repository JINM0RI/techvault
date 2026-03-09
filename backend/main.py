from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from backend.code_executor import execute_python_code
from backend.database import execute, fetch_all, fetch_one, init_db
from backend.models import RunCodeRequest, RunCodeResponse
from backend.notebook_parser import parse_notebook

app = FastAPI(title="TECHVAULT API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
CONTENT_DIR = BASE_DIR / "content"
DOCS_DIR = CONTENT_DIR / "documentation"
CHEAT_SHEETS_DIR = CONTENT_DIR / "cheatsheets"


def _slugify(value: str) -> str:
    return "-".join(value.strip().lower().split())


def _seed_example_topic() -> None:
    example_path = DOCS_DIR / "tech" / "python" / "python_lists.ipynb"
    if not example_path.exists():
        return

    relative_path = example_path.relative_to(BASE_DIR).as_posix()
    existing = fetch_one("SELECT id FROM topics WHERE file_path = ?", (relative_path,))
    if existing:
        return

    execute(
        """
        INSERT INTO topics (title, category, technology, file_path)
        VALUES (?, ?, ?, ?)
        """,
        ("Python Lists", "tech", "python", relative_path),
    )


@app.on_event("startup")
def startup_event() -> None:
    init_db()
    _seed_example_topic()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/documentation/categories")
def get_categories() -> dict[str, list[str]]:
    rows = fetch_all("SELECT DISTINCT category FROM topics ORDER BY category")
    return {"categories": [row["category"] for row in rows]}


@app.get("/documentation/{category}/technologies")
def get_technologies(category: str) -> dict[str, list[str]]:
    rows = fetch_all(
        "SELECT DISTINCT technology FROM topics WHERE category = ? ORDER BY technology",
        (category,),
    )
    return {"technologies": [row["technology"] for row in rows]}


@app.get("/documentation/{category}/{technology}/topics")
def get_topics(category: str, technology: str) -> dict[str, list[dict[str, str | int]]]:
    rows = fetch_all(
        """
        SELECT id, title, category, technology, created_at
        FROM topics
        WHERE category = ? AND technology = ?
        ORDER BY created_at DESC
        """,
        (category, technology),
    )
    return {
        "topics": [
            {
                "id": row["id"],
                "title": row["title"],
                "category": row["category"],
                "technology": row["technology"],
                "created_at": row["created_at"],
            }
            for row in rows
        ]
    }


@app.get("/topics/{topic_id}")
def get_topic(topic_id: int) -> dict[str, object]:
    row = fetch_one("SELECT * FROM topics WHERE id = ?", (topic_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Topic not found")

    notebook_path = BASE_DIR / row["file_path"]
    if not notebook_path.exists():
        raise HTTPException(status_code=404, detail="Notebook file missing")

    cells = parse_notebook(notebook_path)
    return {
        "id": row["id"],
        "title": row["title"],
        "category": row["category"],
        "technology": row["technology"],
        "file_path": row["file_path"],
        "created_at": row["created_at"],
        "cells": cells,
    }


@app.post("/upload")
async def upload_notebook(
    category: str = Form(...),
    technology: str = Form(...),
    topic_title: str = Form(...),
    notebook_file: UploadFile = File(...),
) -> dict[str, object]:
    if not notebook_file.filename.endswith(".ipynb"):
        raise HTTPException(status_code=400, detail="Only .ipynb files are supported")

    category_slug = _slugify(category)
    technology_slug = _slugify(technology)
    topic_slug = _slugify(topic_title)

    storage_dir = DOCS_DIR / category_slug / technology_slug
    storage_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{topic_slug}-{uuid4().hex[:8]}.ipynb"
    destination = storage_dir / filename

    file_content = await notebook_file.read()
    destination.write_bytes(file_content)

    relative_path = destination.relative_to(BASE_DIR).as_posix()
    topic_id = execute(
        """
        INSERT INTO topics (title, category, technology, file_path)
        VALUES (?, ?, ?, ?)
        """,
        (topic_title, category_slug, technology_slug, relative_path),
    )

    return {"id": topic_id, "message": "Notebook uploaded successfully"}


@app.post("/run-code", response_model=RunCodeResponse)
def run_code(payload: RunCodeRequest) -> RunCodeResponse:
    output = execute_python_code(payload.code)
    return RunCodeResponse(output=output)


@app.get("/cheatsheets")
def list_cheat_sheets() -> dict[str, list[dict[str, str]]]:
    items: list[dict[str, str]] = []
    if CHEAT_SHEETS_DIR.exists():
        for file in sorted(CHEAT_SHEETS_DIR.glob("*.md")):
            items.append(
                {
                    "title": file.stem.replace("-", " ").title(),
                    "slug": file.stem,
                }
            )

    return {"cheatsheets": items}


@app.get("/cheatsheets/{slug}")
def get_cheat_sheet(slug: str) -> dict[str, str]:
    path = CHEAT_SHEETS_DIR / f"{slug}.md"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Cheat sheet not found")

    return {
        "title": path.stem.replace("-", " ").title(),
        "slug": slug,
        "content": path.read_text(encoding="utf-8"),
    }
