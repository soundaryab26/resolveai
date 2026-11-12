"""Central settings for the backend.

Everything is read from environment variables so the demo can be tuned
without touching code.
"""
import os
from datetime import date
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Where the mock orders live.
ORDERS_FILE = Path(os.getenv("ORDERS_FILE", BASE_DIR / "data" / "orders.json"))

# An in-flight order this many days past its estimated delivery date (or more)
# counts as stuck. The PRD rule is "more than 3 days", so 3 is the default.
DELAY_THRESHOLD_DAYS = int(os.getenv("DELAY_THRESHOLD_DAYS", "3"))

# The mock data is written around this date, so the demo behaves the same
# every time. Set DEMO_TODAY=today to use the real date, or any ISO date
# (for example 2026-11-20) to test other scenarios.
_DEFAULT_DEMO_DATE = "2026-11-11"


def today() -> date:
    raw = os.getenv("DEMO_TODAY", _DEFAULT_DEMO_DATE).strip().lower()
    if raw == "today":
        return date.today()
    return date.fromisoformat(raw)
