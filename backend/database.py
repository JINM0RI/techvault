import sqlite3
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "techvault.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _table_exists(conn: sqlite3.Connection, table_name: str) -> bool:
    row = conn.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
        (table_name,),
    ).fetchone()
    return row is not None


def _create_proto1_schema(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            technology TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            note_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            language TEXT NOT NULL DEFAULT 'python',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS blocks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic_id INTEGER NOT NULL,
            block_type TEXT NOT NULL CHECK(block_type IN ('explanation', 'code')),
            content TEXT NOT NULL,
            language TEXT,
            position INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
        )
        """
    )


def _migrate_legacy_topics(conn: sqlite3.Connection) -> None:
    topic_columns = {row["name"] for row in conn.execute("PRAGMA table_info(topics)").fetchall()}

    if "note_id" in topic_columns:
        return

    legacy_rows = conn.execute(
        """
        SELECT id, title, category, technology,
               COALESCE(language, 'python') AS language,
               COALESCE(created_at, CURRENT_TIMESTAMP) AS created_at
        FROM topics
        ORDER BY id
        """
    ).fetchall()

    conn.execute(
        """
        CREATE TABLE topics_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            note_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            language TEXT NOT NULL DEFAULT 'python',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
        )
        """
    )

    category_cache: dict[str, int] = {}
    note_cache: dict[tuple[int, str], int] = {}

    for row in legacy_rows:
        category_name = str(row["category"] or "General").strip() or "General"
        technology_name = str(row["technology"] or "General").strip() or "General"

        category_id = category_cache.get(category_name)
        if category_id is None:
            existing_category = conn.execute(
                "SELECT id FROM categories WHERE name = ?",
                (category_name,),
            ).fetchone()
            if existing_category:
                category_id = int(existing_category["id"])
            else:
                cursor = conn.execute(
                    "INSERT INTO categories (name) VALUES (?)",
                    (category_name,),
                )
                category_id = int(cursor.lastrowid)
            category_cache[category_name] = category_id

        note_key = (category_id, technology_name)
        note_id = note_cache.get(note_key)
        if note_id is None:
            existing_note = conn.execute(
                "SELECT id FROM notes WHERE category_id = ? AND name = ?",
                (category_id, technology_name),
            ).fetchone()
            if existing_note:
                note_id = int(existing_note["id"])
            else:
                cursor = conn.execute(
                    "INSERT INTO notes (category_id, name, technology) VALUES (?, ?, ?)",
                    (category_id, technology_name, technology_name),
                )
                note_id = int(cursor.lastrowid)
            note_cache[note_key] = note_id

        conn.execute(
            """
            INSERT INTO topics_new (id, note_id, title, language, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                int(row["id"]),
                note_id,
                str(row["title"]),
                str(row["language"] or "python").strip().lower() or "python",
                row["created_at"],
            ),
        )

    conn.execute("DROP TABLE topics")
    conn.execute("ALTER TABLE topics_new RENAME TO topics")


def init_db() -> None:
    with get_connection() as conn:
        conn.execute("PRAGMA foreign_keys = ON")

        if not _table_exists(conn, "topics"):
            _create_proto1_schema(conn)
        else:
            _create_proto1_schema(conn)
            _migrate_legacy_topics(conn)

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category_id)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_topics_note ON topics(note_id)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_blocks_topic_position ON blocks(topic_id, position)"
        )

        conn.commit()


def fetch_all(query: str, params: tuple[Any, ...] = ()) -> list[sqlite3.Row]:
    with get_connection() as conn:
        cursor = conn.execute(query, params)
        return list(cursor.fetchall())


def fetch_one(query: str, params: tuple[Any, ...] = ()) -> sqlite3.Row | None:
    with get_connection() as conn:
        cursor = conn.execute(query, params)
        return cursor.fetchone()


def execute(query: str, params: tuple[Any, ...] = ()) -> int:
    with get_connection() as conn:
        cursor = conn.execute(query, params)
        conn.commit()
        return cursor.lastrowid
