
from datetime import datetime, timezone
from uuid import uuid4
from contextlib import closing

from .database import get_connection


def create_ticket(
    message: str,
    order_id: str | None,
    handoff_reason: str
) -> dict:
    ticket = {
        "ticket_id": f"TKT-{uuid4().hex[:8].upper()}",
        "message": message,
        "order_id": order_id,
        "handoff_reason": handoff_reason,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "open",
        "agent_id": None,
        "resolved_at": None
    }

    with closing(get_connection()) as connection:
        with connection:
            connection.execute(
                """
                INSERT INTO agent_tickets (
                    ticket_id, message, order_id, handoff_reason,
                    created_at, status, agent_id, resolved_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    ticket["ticket_id"],
                    ticket["message"],
                    ticket["order_id"],
                    ticket["handoff_reason"],
                    ticket["created_at"],
                    ticket["status"],
                    ticket["agent_id"],
                    ticket["resolved_at"]
                )
            )

    return ticket


def get_tickets(
    status: str | None = None,
    agent_id: str | None = None
) -> list[dict]:
    query = "SELECT * FROM agent_tickets WHERE 1=1"
    params = []

    if status:
        query += " AND status = ?"
        params.append(status)

    if agent_id:
        query += " AND agent_id = ?"
        params.append(agent_id)

    query += " ORDER BY created_at DESC"

    with closing(get_connection()) as connection:
        rows = connection.execute(query, params).fetchall()

    return [dict(row) for row in rows]


def claim_ticket(ticket_id: str, agent_id: str) -> dict:
    with closing(get_connection()) as connection:
        with connection:
            row = connection.execute(
                "SELECT * FROM agent_tickets WHERE ticket_id = ?",
                (ticket_id,)
            ).fetchone()

            if row is None:
                raise LookupError("Ticket not found.")

            if row["status"] != "open":
                raise ValueError("Ticket is not available for claiming.")

            cursor = connection.execute(
                """
                UPDATE agent_tickets
                SET status = 'claimed', agent_id = ?
                WHERE ticket_id = ? AND status = 'open'
                """,
                (agent_id, ticket_id)
            )

            if cursor.rowcount == 0:
                raise ValueError("Ticket is not available for claiming.")

            updated_ticket = connection.execute(
                "SELECT * FROM agent_tickets WHERE ticket_id = ?",
                (ticket_id,)
            ).fetchone()

            return dict(updated_ticket)


def resolve_ticket(ticket_id: str, agent_id: str) -> dict | None:
    resolved_at = datetime.now(timezone.utc).isoformat()

    with closing(get_connection()) as connection:
        with connection:
            cursor = connection.execute(
                """
                UPDATE agent_tickets
                SET status = 'resolved', resolved_at = ?
                WHERE ticket_id = ?
                  AND status = 'claimed'
                  AND agent_id = ?
                """,
                (resolved_at, ticket_id, agent_id)
            )

            if cursor.rowcount == 0:
                return None

            row = connection.execute(
                "SELECT * FROM agent_tickets WHERE ticket_id = ?",
                (ticket_id,)
            ).fetchone()

            return dict(row)
