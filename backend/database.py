import sqlite3
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "techvault.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_connection() as conn:
        # Keep table creation migration-friendly for existing local databases.
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS topics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                technology TEXT NOT NULL,
                language TEXT NOT NULL DEFAULT 'python',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

        topic_columns = {
            row["name"] for row in conn.execute("PRAGMA table_info(topics)").fetchall()
        }

        # Migrate legacy schema that still has topics.file_path (from notebook upload flow).
        if "file_path" in topic_columns:
            language_select = "COALESCE(language, 'python')" if "language" in topic_columns else "'python'"
            created_at_select = "created_at" if "created_at" in topic_columns else "CURRENT_TIMESTAMP"

            conn.execute("PRAGMA foreign_keys = OFF")
            conn.execute(
                """
                CREATE TABLE topics_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    category TEXT NOT NULL,
                    technology TEXT NOT NULL,
                    language TEXT NOT NULL DEFAULT 'python',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.execute(
                f"""
                INSERT INTO topics_new (id, title, category, technology, language, created_at)
                SELECT id, title, category, technology, {language_select}, {created_at_select}
                FROM topics
                """
            )
            conn.execute("DROP TABLE topics")
            conn.execute("ALTER TABLE topics_new RENAME TO topics")
            conn.execute("PRAGMA foreign_keys = ON")

            topic_columns = {
                row["name"] for row in conn.execute("PRAGMA table_info(topics)").fetchall()
            }

        if "language" not in topic_columns:
            conn.execute(
                "ALTER TABLE topics ADD COLUMN language TEXT NOT NULL DEFAULT 'python'"
            )

        block_indexes = conn.execute("PRAGMA index_list(blocks)").fetchall()
        block_index_names = {row["name"] for row in block_indexes}
        if "idx_blocks_topic_position" not in block_index_names:
            conn.execute(
                "CREATE INDEX idx_blocks_topic_position ON blocks(topic_id, position)"
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
