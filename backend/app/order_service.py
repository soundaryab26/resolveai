"""Mock order lookup and the delay rule. No web code lives here."""
import json
import re
from datetime import date
from functools import lru_cache

from . import config
from .models import DelayCheck, Order, OrderStatus

ORDER_ID_PATTERN = re.compile(r"ORD\d{3,6}")

# Statuses where the parcel is still on its way, so a missed estimate matters.
_IN_FLIGHT = {OrderStatus.PLACED, OrderStatus.SHIPPED, OrderStatus.OUT_FOR_DELIVERY}


def normalise_order_id(raw: str) -> str:
    """'  ord101 ' -> 'ORD101'."""
    return raw.strip().upper()


def is_valid_order_id(order_id: str) -> bool:
    return ORDER_ID_PATTERN.fullmatch(order_id) is not None


@lru_cache(maxsize=1)
def _load_orders() -> dict[str, Order]:
    raw = json.loads(config.ORDERS_FILE.read_text(encoding="utf-8"))
    orders = [Order.model_validate(item) for item in raw]  # fails fast on bad data
    return {order.order_id: order for order in orders}


def load_orders() -> dict[str, Order]:
    return _load_orders()


def list_orders() -> list[Order]:
    return list(_load_orders().values())


def get_order(order_id: str) -> Order | None:
    return _load_orders().get(normalise_order_id(order_id))


def check_delay(order: Order, today: date | None = None) -> DelayCheck:
    today = today or config.today()

    days_past = 0
    if (order.status in _IN_FLIGHT or order.status == OrderStatus.DELAYED) and (
        order.estimated_delivery is not None
    ):
        days_past = max(0, (today - order.estimated_delivery).days)

    if order.status == OrderStatus.DELAYED:
        return DelayCheck(
            is_delayed=True,
            days_past_estimate=days_past,
            reason="Order status is Delayed.",
        )

    if order.status in _IN_FLIGHT and days_past > config.DELAY_THRESHOLD_DAYS:
        return DelayCheck(
            is_delayed=True,
            days_past_estimate=days_past,
            reason=(
                f"Order is {days_past} days past its estimated delivery date "
                f"(threshold is {config.DELAY_THRESHOLD_DAYS} days)."
            ),
        )

    return DelayCheck(is_delayed=False, days_past_estimate=days_past, reason=None)
