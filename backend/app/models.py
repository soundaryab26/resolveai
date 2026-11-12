"""Pydantic models: the shape of orders and of every API response."""
from datetime import date
from enum import Enum
from typing import Literal


from pydantic import BaseModel, Field


class OrderStatus(str, Enum):
    PLACED = "Placed"
    SHIPPED = "Shipped"
    OUT_FOR_DELIVERY = "Out for Delivery"
    DELIVERED = "Delivered"
    DELAYED = "Delayed"
    CANCELLED = "Cancelled"
    RETURNED = "Returned"


class OrderItem(BaseModel):
    name: str
    quantity: int = Field(ge=1)


class Order(BaseModel):
    order_id: str
    customer_name: str
    items: list[OrderItem]
    status: OrderStatus
    order_date: date
    estimated_delivery: date | None = None
    delivered_on: date | None = None
    cancelled_on: date | None = None
    returned_on: date | None = None
    status_note: str | None = None


class DelayCheck(BaseModel):
    """Result of the delay rule from the PRD: status is Delayed, or an
    in-flight order is more than the threshold past its estimated date."""

    is_delayed: bool
    days_past_estimate: int = Field(
        ge=0, description="Days past the estimated delivery date (0 if not past)."
    )
    reason: str | None = None


class OrderLookupResponse(BaseModel):
    order: Order
    delay: DelayCheck


class ErrorDetail(BaseModel):
    error: str
    message: str


class HealthResponse(BaseModel):
    status: str
    orders_loaded: int
    reference_date: date
    delay_threshold_days: int

class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=2000,
        description="Customer's message"
    )

class ChatResponse(BaseModel):
    reply: str
    status: Literal["resolved", "needs_info", "escalated"]
    order_id: str | None = None
    handoff_reason: str | None = None