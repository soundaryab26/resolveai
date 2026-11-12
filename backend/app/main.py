"""FastAPI app: health check and mock order lookup (Step 2)."""
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from . import agent_queue

from fastapi.middleware.cors import CORSMiddleware

from . import chat_service
from .models import ChatRequest, ChatResponse

from . import config, order_service
from .models import (
    ErrorDetail,
    HealthResponse,
    Order,
    OrderLookupResponse,
)

from . import database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load and validate the mock data at startup so bad data fails immediately.
    order_service.load_orders()
    database.initialize_database()
    yield


app = FastAPI(
    title="AI Customer Support Assistant",
    description="Order tracking with human handoff (MVP). Step 2: mock order lookup.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        orders_loaded=len(order_service.load_orders()),
        reference_date=config.today(),
        delay_threshold_days=config.DELAY_THRESHOLD_DAYS,
    )


@app.get("/orders", response_model=list[Order], tags=["orders"])
def list_orders() -> list[Order]:
    """All mock orders. Handy for the demo and for manual testing."""
    return order_service.list_orders()


@app.get(
    "/orders/{order_id}",
    response_model=OrderLookupResponse,
    responses={
        404: {"model": ErrorDetail, "description": "Order ID not found"},
        422: {"model": ErrorDetail, "description": "Order ID is not in a valid format"},
    },
    tags=["orders"],
)
def get_order(order_id: str) -> OrderLookupResponse:
    """Look up one order and run the delay check on it."""
    normalised = order_service.normalise_order_id(order_id)

    if not order_service.is_valid_order_id(normalised):
        raise HTTPException(
            status_code=422,
            detail={
                "error": "invalid_order_id",
                "message": "Order IDs look like ORD101 (ORD followed by 3 to 6 digits).",
            },
        )

    order = order_service.get_order(normalised)
    if order is None:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "order_not_found",
                "message": f"No order found with ID {normalised}.",
            },
        )

    return OrderLookupResponse(order=order, delay=order_service.check_delay(order))

@app.post("/chat", response_model=ChatResponse, tags = ["chat"])
def chat(request: ChatRequest) -> ChatResponse:
    """Process a customer message and return th assistant's response."""
    return chat_service.process_message(request.message)

@app.get("/agent-queue", tags=["agent"])
def view_agent_queue(
    status: str | None = None,
    agent_id: str | None = None
) -> list[dict]:
    """View support tickets with optional status and agent filters."""

    return agent_queue.get_tickets(
        status=status,
        agent_id=agent_id
    )

@app.patch("/agent-queue/{ticket_id}/claim", tags=["agent"])
def claim_agent_ticket(ticket_id: str, agent_id: str):

    try:
        ticket = agent_queue.claim_ticket(ticket_id, agent_id)

    except LookupError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=409,
            detail=str(e)
        )

    return ticket

@app.patch("/agent-queue/{ticket_id}/resolve", tags=["agent"])
def resolve_agent_ticket(ticket_id: str, agent_id: str):

    ticket = agent_queue.resolve_ticket(ticket_id, agent_id)

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found, not claimed, or assigned to another agent."
        )

    return ticket