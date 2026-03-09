from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.code_executor import execute_python_code
from backend.database import execute, fetch_all, fetch_one, get_connection, init_db
from backend.models import (
    CreateBlockRequest,
    CreateTopicRequest,
    CreateTopicResponse,
    ReorderBlockRequest,
    RunCodeRequest,
    RunCodeResponse,
    UpdateBlockRequest,
)

app = FastAPI(title="TECHVAULT API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
CHEAT_SHEETS_DIR = BASE_DIR / "content" / "cheatsheets"


def _normalize_slug(value: str) -> str:
    return "-".join(value.strip().lower().split())


def _next_position(topic_id: int) -> int:
    row = fetch_one(
        "SELECT COALESCE(MAX(position), 0) AS max_position FROM blocks WHERE topic_id = ?",
        (topic_id,),
    )
    return int(row["max_position"]) + 1 if row else 1


def _topic_exists(topic_id: int) -> bool:
    return fetch_one("SELECT id FROM topics WHERE id = ?", (topic_id,)) is not None


def _seed_example_topic() -> None:
    existing = fetch_one(
        "SELECT id FROM topics WHERE title = ? AND category = ? AND technology = ?",
        ("Python Lists", "tech", "python"),
    )
    if existing:
        topic_id = int(existing["id"])
    else:
        topic_id = execute(
            """
            INSERT INTO topics (title, category, technology, language)
            VALUES (?, ?, ?, ?)
            """,
            ("Python Lists", "tech", "python", "python"),
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
            "<h1>Python Lists</h1><p>Lists store multiple values in one variable.</p>",
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
        SELECT id, title, category, technology, language, created_at
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
                "language": row["language"],
                "created_at": row["created_at"],
            }
            for row in rows
        ]
    }


@app.post("/topics", response_model=CreateTopicResponse)
def create_topic(payload: CreateTopicRequest) -> CreateTopicResponse:
    category = _normalize_slug(payload.category)
    technology = _normalize_slug(payload.technology)
    language = payload.language.strip().lower()

    topic_id = execute(
        """
        INSERT INTO topics (title, category, technology, language)
        VALUES (?, ?, ?, ?)
        """,
        (payload.title.strip(), category, technology, language),
    )
    return CreateTopicResponse(id=topic_id, message="Topic created")


@app.get("/topics/{topic_id}")
def get_topic(topic_id: int) -> dict[str, object]:
    topic = fetch_one("SELECT * FROM topics WHERE id = ?", (topic_id,))
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

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
        "title": topic["title"],
        "category": topic["category"],
        "technology": topic["technology"],
        "language": topic["language"],
        "created_at": topic["created_at"],
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


@app.post("/topics/{topic_id}/blocks")
def create_block(topic_id: int, payload: CreateBlockRequest) -> dict[str, object]:
    if not _topic_exists(topic_id):
        raise HTTPException(status_code=404, detail="Topic not found")

    position = _next_position(topic_id)
    language = payload.language.strip().lower() if payload.language else None

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

    language = payload.language.strip().lower() if payload.language else block["language"]
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
