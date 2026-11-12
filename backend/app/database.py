
import sqlite3
from pathlib import Path

# Store the database file in the backend directory.
DB_PATH = Path(__file__).resolve().parent.parent / "resolveai.db"


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS agent_tickets (
                ticket_id TEXT PRIMARY KEY,
                message TEXT NOT NULL,
                order_id TEXT,
                handoff_reason TEXT NOT NULL,
                created_at TEXT NOT NULL,
                status TEXT NOT NULL,
                agent_id TEXT,
                resolved_at TEXT
            )
        """)
