from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:
    from .code_executor import execute_python_code
    from .database import execute, fetch_all, fetch_one, get_connection, init_db
    from .models import (
        CreateBlockRequest,
        CreateCategoryRequest,
        CreateNoteRequest,
        CreateTopicRequest,
        ReorderBlockRequest,
        RunCodeRequest,
        RunCodeResponse,
        UpdateBlockRequest,
        UpdateCategoryRequest,
        UpdateNoteRequest,
        UpdateTopicRequest,
    )
except ImportError:
    from code_executor import execute_python_code
    from database import execute, fetch_all, fetch_one, get_connection, init_db
    from models import (
        CreateBlockRequest,
        CreateCategoryRequest,
        CreateNoteRequest,
        CreateTopicRequest,
        ReorderBlockRequest,
        RunCodeRequest,
        RunCodeResponse,
        UpdateBlockRequest,
        UpdateCategoryRequest,
        UpdateNoteRequest,
        UpdateTopicRequest,
    )

app = FastAPI(title="TECHVAULT API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
CHEAT_SHEETS_DIR = BASE_DIR / "content" / "cheatsheets"


def _topic_exists(topic_id: int) -> bool:
    return fetch_one("SELECT id FROM topics WHERE id = ?", (topic_id,)) is not None


def _normalize_language(value: str | None) -> str:
    if not value:
        return "python"
    normalized = value.strip().lower()
    return normalized or "python"


def _next_position(topic_id: int) -> int:
    row = fetch_one(
        "SELECT COALESCE(MAX(position), 0) AS max_position FROM blocks WHERE topic_id = ?",
        (topic_id,),
    )
    return int(row["max_position"]) + 1 if row else 1


def _seed_example_data() -> None:
    category = fetch_one("SELECT id FROM categories WHERE name = ?", ("Python",))
    if category:
        category_id = int(category["id"])
    else:
        category_id = execute("INSERT INTO categories (name) VALUES (?)", ("Python",))

    note = fetch_one(
        "SELECT id FROM notes WHERE category_id = ? AND name = ?",
        (category_id, "Python Basics"),
    )
    if note:
        note_id = int(note["id"])
    else:
        note_id = execute(
            "INSERT INTO notes (category_id, name, technology) VALUES (?, ?, ?)",
            (category_id, "Python Basics", "Python"),
        )

    topic = fetch_one(
        "SELECT id FROM topics WHERE note_id = ? AND title = ?",
        (note_id, "Python Lists"),
    )
    if topic:
        topic_id = int(topic["id"])
    else:
        topic_id = execute(
            "INSERT INTO topics (note_id, title, language) VALUES (?, ?, ?)",
            (note_id, "Python Lists", "python"),
        )

    block_count = fetch_one("SELECT COUNT(*) AS total FROM blocks WHERE topic_id = ?", (topic_id,))
    if block_count and int(block_count["total"]) > 0:
        return

    execute(
        """
        INSERT INTO blocks (topic_id, block_type, content, language, position)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            topic_id,
            "explanation",
            "<h2>Python Lists</h2><p>Lists store multiple values in one variable.</p>",
            None,
            1,
        ),
    )
    execute(
        """
        INSERT INTO blocks (topic_id, block_type, content, language, position)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            topic_id,
            "code",
            "numbers = [1, 2, 3]\nnumbers.append(4)\nnumbers",
            "python",
            2,
        ),
    )


@app.on_event("startup")
def startup_event() -> None:
    init_db()
    _seed_example_data()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/categories")
def list_categories() -> dict[str, list[dict[str, object]]]:
    rows = fetch_all("SELECT id, name, created_at FROM categories ORDER BY created_at DESC")
    return {
        "categories": [
            {
                "id": row["id"],
                "name": row["name"],
                "created_at": row["created_at"],
            }
            for row in rows
        ]
    }


@app.post("/categories")
def create_category(payload: CreateCategoryRequest) -> dict[str, object]:
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Category name is required")

    existing = fetch_one("SELECT id FROM categories WHERE lower(name) = lower(?)", (name,))
    if existing:
        raise HTTPException(status_code=409, detail="Category already exists")

    category_id = execute("INSERT INTO categories (name) VALUES (?)", (name,))
    category = fetch_one("SELECT id, name, created_at FROM categories WHERE id = ?", (category_id,))
    if not category:
        raise HTTPException(status_code=500, detail="Category creation failed")

    return {
        "id": category["id"],
        "name": category["name"],
        "created_at": category["created_at"],
    }


@app.get("/categories/{category_id}")
def get_category(category_id: int) -> dict[str, object]:
    category = fetch_one("SELECT id, name, created_at FROM categories WHERE id = ?", (category_id,))
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return {
        "id": category["id"],
        "name": category["name"],
        "created_at": category["created_at"],
    }


@app.put("/categories/{category_id}")
def update_category(category_id: int, payload: UpdateCategoryRequest) -> dict[str, object]:
    category = fetch_one("SELECT id FROM categories WHERE id = ?", (category_id,))
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Category name is required")

    duplicate = fetch_one(
        "SELECT id FROM categories WHERE lower(name) = lower(?) AND id != ?",
        (name, category_id),
    )
    if duplicate:
        raise HTTPException(status_code=409, detail="Category name already exists")

    execute("UPDATE categories SET name = ? WHERE id = ?", (name, category_id))
    updated = fetch_one("SELECT id, name, created_at FROM categories WHERE id = ?", (category_id,))
    if not updated:
        raise HTTPException(status_code=500, detail="Category update failed")

    return {
        "id": updated["id"],
        "name": updated["name"],
        "created_at": updated["created_at"],
    }


@app.delete("/categories/{category_id}")
def delete_category(category_id: int) -> dict[str, str]:
    category = fetch_one("SELECT id FROM categories WHERE id = ?", (category_id,))
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    execute("DELETE FROM categories WHERE id = ?", (category_id,))
    return {"message": "Category deleted"}


@app.get("/categories/{category_id}/notes")
def list_notes(category_id: int) -> dict[str, list[dict[str, object]]]:
    category = fetch_one("SELECT id FROM categories WHERE id = ?", (category_id,))
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    rows = fetch_all(
        """
        SELECT id, category_id, name, technology, created_at
        FROM notes
        WHERE category_id = ?
        ORDER BY created_at DESC
        """,
        (category_id,),
    )
    return {
        "notes": [
            {
                "id": row["id"],
                "category_id": row["category_id"],
                "name": row["name"],
                "technology": row["technology"],
                "created_at": row["created_at"],
            }
            for row in rows
        ]
    }


@app.post("/categories/{category_id}/notes")
def create_note(category_id: int, payload: CreateNoteRequest) -> dict[str, object]:
    category = fetch_one("SELECT id FROM categories WHERE id = ?", (category_id,))
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Note name is required")

    technology = payload.technology.strip() if payload.technology else None
    note_id = execute(
        "INSERT INTO notes (category_id, name, technology) VALUES (?, ?, ?)",
        (category_id, name, technology),
    )

    note = fetch_one(
        "SELECT id, category_id, name, technology, created_at FROM notes WHERE id = ?",
        (note_id,),
    )
    if not note:
        raise HTTPException(status_code=500, detail="Note creation failed")

    return {
        "id": note["id"],
        "category_id": note["category_id"],
        "name": note["name"],
        "technology": note["technology"],
        "created_at": note["created_at"],
    }


@app.get("/notes/{note_id}")
def get_note(note_id: int) -> dict[str, object]:
    note = fetch_one(
        "SELECT id, category_id, name, technology, created_at FROM notes WHERE id = ?",
        (note_id,),
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    return {
        "id": note["id"],
        "category_id": note["category_id"],
        "name": note["name"],
        "technology": note["technology"],
        "created_at": note["created_at"],
    }


@app.put("/notes/{note_id}")
def update_note(note_id: int, payload: UpdateNoteRequest) -> dict[str, object]:
    note = fetch_one("SELECT id FROM notes WHERE id = ?", (note_id,))
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Note name is required")

    technology = payload.technology.strip() if payload.technology else None
    execute(
        "UPDATE notes SET name = ?, technology = ? WHERE id = ?",
        (name, technology, note_id),
    )

    updated = fetch_one(
        "SELECT id, category_id, name, technology, created_at FROM notes WHERE id = ?",
        (note_id,),
    )
    if not updated:
        raise HTTPException(status_code=500, detail="Note update failed")

    return {
        "id": updated["id"],
        "category_id": updated["category_id"],
        "name": updated["name"],
        "technology": updated["technology"],
        "created_at": updated["created_at"],
    }


@app.delete("/notes/{note_id}")
def delete_note(note_id: int) -> dict[str, str]:
    note = fetch_one("SELECT id FROM notes WHERE id = ?", (note_id,))
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    execute("DELETE FROM notes WHERE id = ?", (note_id,))
    return {"message": "Note deleted"}


@app.get("/notes/{note_id}/topics")
def list_topics(note_id: int) -> dict[str, list[dict[str, object]]]:
    note = fetch_one("SELECT id FROM notes WHERE id = ?", (note_id,))
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    rows = fetch_all(
        """
        SELECT id, note_id, title, language, created_at
        FROM topics
        WHERE note_id = ?
        ORDER BY created_at DESC
        """,
        (note_id,),
    )

    return {
        "topics": [
            {
                "id": row["id"],
                "note_id": row["note_id"],
                "title": row["title"],
                "language": row["language"],
                "created_at": row["created_at"],
            }
            for row in rows
        ]
    }


@app.post("/notes/{note_id}/topics")
def create_topic(note_id: int, payload: CreateTopicRequest) -> dict[str, object]:
    note = fetch_one("SELECT id FROM notes WHERE id = ?", (note_id,))
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Topic title is required")

    topic_id = execute(
        "INSERT INTO topics (note_id, title, language) VALUES (?, ?, ?)",
        (note_id, title, _normalize_language(payload.language)),
    )

    topic = fetch_one(
        "SELECT id, note_id, title, language, created_at FROM topics WHERE id = ?",
        (topic_id,),
    )
    if not topic:
        raise HTTPException(status_code=500, detail="Topic creation failed")

    return {
        "id": topic["id"],
        "note_id": topic["note_id"],
        "title": topic["title"],
        "language": topic["language"],
        "created_at": topic["created_at"],
    }


@app.get("/topics/{topic_id}")
def get_topic(topic_id: int) -> dict[str, object]:
    topic = fetch_one("SELECT id, note_id, title, language, created_at FROM topics WHERE id = ?", (topic_id,))
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    note = fetch_one(
        "SELECT id, category_id, name, technology FROM notes WHERE id = ?",
        (topic["note_id"],),
    )
    category = None
    if note:
        category = fetch_one("SELECT id, name FROM categories WHERE id = ?", (note["category_id"],))

    blocks = fetch_all(
        """
        SELECT id, topic_id, block_type, content, language, position, created_at
        FROM blocks
        WHERE topic_id = ?
        ORDER BY position ASC
        """,
        (topic_id,),
    )

    return {
        "id": topic["id"],
        "note_id": topic["note_id"],
        "title": topic["title"],
        "language": topic["language"],
        "created_at": topic["created_at"],
        "note": {
            "id": note["id"],
            "name": note["name"],
            "technology": note["technology"],
        }
        if note
        else None,
        "category": {
            "id": category["id"],
            "name": category["name"],
        }
        if category
        else None,
        "blocks": [
            {
                "id": block["id"],
                "topic_id": block["topic_id"],
                "block_type": block["block_type"],
                "content": block["content"],
                "language": block["language"],
                "position": block["position"],
                "created_at": block["created_at"],
            }
            for block in blocks
        ],
    }


@app.put("/topics/{topic_id}")
def update_topic(topic_id: int, payload: UpdateTopicRequest) -> dict[str, object]:
    topic = fetch_one("SELECT id FROM topics WHERE id = ?", (topic_id,))
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Topic title is required")

    execute(
        "UPDATE topics SET title = ?, language = ? WHERE id = ?",
        (title, _normalize_language(payload.language), topic_id),
    )

    updated = fetch_one(
        "SELECT id, note_id, title, language, created_at FROM topics WHERE id = ?",
        (topic_id,),
    )
    if not updated:
        raise HTTPException(status_code=500, detail="Topic update failed")

    return {
        "id": updated["id"],
        "note_id": updated["note_id"],
        "title": updated["title"],
        "language": updated["language"],
        "created_at": updated["created_at"],
    }


@app.delete("/topics/{topic_id}")
def delete_topic(topic_id: int) -> dict[str, str]:
    topic = fetch_one("SELECT id FROM topics WHERE id = ?", (topic_id,))
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    execute("DELETE FROM topics WHERE id = ?", (topic_id,))
    return {"message": "Topic deleted"}


@app.post("/topics/{topic_id}/blocks")
def create_block(topic_id: int, payload: CreateBlockRequest) -> dict[str, object]:
    if not _topic_exists(topic_id):
        raise HTTPException(status_code=404, detail="Topic not found")

    position = _next_position(topic_id)
    language = _normalize_language(payload.language) if payload.language else None

    block_id = execute(
        """
        INSERT INTO blocks (topic_id, block_type, content, language, position)
        VALUES (?, ?, ?, ?, ?)
        """,
        (topic_id, payload.block_type, payload.content, language, position),
    )

    block = fetch_one("SELECT * FROM blocks WHERE id = ?", (block_id,))
    if not block:
        raise HTTPException(status_code=500, detail="Block creation failed")

    return {
        "id": block["id"],
        "topic_id": block["topic_id"],
        "block_type": block["block_type"],
        "content": block["content"],
        "language": block["language"],
        "position": block["position"],
        "created_at": block["created_at"],
    }


@app.put("/blocks/{block_id}")
def update_block(block_id: int, payload: UpdateBlockRequest) -> dict[str, object]:
    block = fetch_one("SELECT * FROM blocks WHERE id = ?", (block_id,))
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")

    language = _normalize_language(payload.language) if payload.language else block["language"]
    execute(
        "UPDATE blocks SET content = ?, language = ? WHERE id = ?",
        (payload.content, language, block_id),
    )

    updated = fetch_one("SELECT * FROM blocks WHERE id = ?", (block_id,))
    if not updated:
        raise HTTPException(status_code=500, detail="Block update failed")

    return {
        "id": updated["id"],
        "topic_id": updated["topic_id"],
        "block_type": updated["block_type"],
        "content": updated["content"],
        "language": updated["language"],
        "position": updated["position"],
        "created_at": updated["created_at"],
    }


@app.delete("/blocks/{block_id}")
def delete_block(block_id: int) -> dict[str, str]:
    block = fetch_one("SELECT * FROM blocks WHERE id = ?", (block_id,))
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")

    topic_id = int(block["topic_id"])
    removed_position = int(block["position"])

    with get_connection() as conn:
        conn.execute("DELETE FROM blocks WHERE id = ?", (block_id,))
        conn.execute(
            """
            UPDATE blocks
            SET position = position - 1
            WHERE topic_id = ? AND position > ?
            """,
            (topic_id, removed_position),
        )
        conn.commit()

    return {"message": "Block deleted"}


@app.post("/blocks/{block_id}/move")
def move_block(block_id: int, payload: ReorderBlockRequest) -> dict[str, str]:
    block = fetch_one("SELECT id, topic_id, position FROM blocks WHERE id = ?", (block_id,))
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")

    topic_id = int(block["topic_id"])
    current_position = int(block["position"])
    target_position = current_position - 1 if payload.direction == "up" else current_position + 1

    swap = fetch_one(
        "SELECT id, position FROM blocks WHERE topic_id = ? AND position = ?",
        (topic_id, target_position),
    )
    if not swap:
        return {"message": "No movement applied"}

    with get_connection() as conn:
        conn.execute("UPDATE blocks SET position = ? WHERE id = ?", (target_position, block_id))
        conn.execute("UPDATE blocks SET position = ? WHERE id = ?", (current_position, swap["id"]))
        conn.commit()

    return {"message": "Block moved"}


@app.post("/run-code", response_model=RunCodeResponse)
def run_code(payload: RunCodeRequest) -> RunCodeResponse:
    output = execute_python_code(payload.code)
    return RunCodeResponse(output=output)


@app.get("/cheatsheets")
def list_cheat_sheets() -> dict[str, list[dict[str, str]]]:
    items: list[dict[str, str]] = []
    if CHEAT_SHEETS_DIR.exists():
        for file in sorted(CHEAT_SHEETS_DIR.glob("*.md")):
            items.append({"title": file.stem.replace("-", " ").title(), "slug": file.stem})

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
