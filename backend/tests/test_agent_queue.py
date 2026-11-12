
import pytest

from app import agent_queue, database


@pytest.fixture
def setup_database(tmp_path, monkeypatch):
    # Use a temporary database so tests don't affect real project data.
    test_db = tmp_path / "test_resolveai.db"
    monkeypatch.setattr(database, "DB_PATH", test_db)

    database.initialize_database()


def test_create_ticket(setup_database):
    ticket = agent_queue.create_ticket(
        message="I want a refund for my order",
        order_id="ORD101",
        handoff_reason="Customer requested a refund"
    )

    assert ticket["ticket_id"].startswith("TKT-")
    assert ticket["message"] == "I want a refund for my order"
    assert ticket["order_id"] == "ORD101"
    assert ticket["status"] == "open"
    assert ticket["agent_id"] is None


def test_get_tickets(setup_database):
    agent_queue.create_ticket(
        message="I need a refund",
        order_id="ORD101",
        handoff_reason="Refund requested"
    )

    tickets = agent_queue.get_tickets()

    assert len(tickets) == 1
    assert tickets[0]["order_id"] == "ORD101"
    assert tickets[0]["status"] == "open"


def test_claim_ticket(setup_database):
    ticket = agent_queue.create_ticket(
        message="My order is delayed",
        order_id="ORD105",
        handoff_reason="Order status is delayed"
    )

    claimed_ticket = agent_queue.claim_ticket(
        ticket_id=ticket["ticket_id"],
        agent_id="AGENT001"
    )

    assert claimed_ticket["status"] == "claimed"
    assert claimed_ticket["agent_id"] == "AGENT001"


def test_resolve_ticket(setup_database):
    ticket = agent_queue.create_ticket(
        message="My order is delayed",
        order_id="ORD105",
        handoff_reason="Order status is delayed"
    )

    agent_queue.claim_ticket(
        ticket_id=ticket["ticket_id"],
        agent_id="AGENT001"
    )

    resolved_ticket = agent_queue.resolve_ticket(
        ticket_id=ticket["ticket_id"],
        agent_id="AGENT001"
    )

    assert resolved_ticket["status"] == "resolved"
    assert resolved_ticket["agent_id"] == "AGENT001"
    assert resolved_ticket["resolved_at"] is not None


def test_wrong_agent_cannot_resolve_ticket(setup_database):
    ticket = agent_queue.create_ticket(
        message="I need help with my order",
        order_id="ORD101",
        handoff_reason="Customer requested assistance"
    )

    agent_queue.claim_ticket(
        ticket_id=ticket["ticket_id"],
        agent_id="AGENT001"
    )

    result = agent_queue.resolve_ticket(
        ticket_id=ticket["ticket_id"],
        agent_id="AGENT002"
    )

    assert result is None

    tickets = agent_queue.get_tickets()

    assert tickets[0]["status"] == "claimed"
    assert tickets[0]["agent_id"] == "AGENT001"


def test_ticket_cannot_be_claimed_twice(setup_database):
    ticket = agent_queue.create_ticket(
        message="I need help with my order",
        order_id="ORD101",
        handoff_reason="Customer needs assistance"
    )

    agent_queue.claim_ticket(
        ticket_id=ticket["ticket_id"],
        agent_id="AGENT001"
    )

    with pytest.raises(ValueError):
        agent_queue.claim_ticket(
            ticket_id=ticket["ticket_id"],
            agent_id="AGENT002"
        )
