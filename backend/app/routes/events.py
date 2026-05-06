from __future__ import annotations

import json
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.tables import EventModel, ProductModel
from app.schemas.models import EventCreate, EventResponse, LiveEventResponse

router = APIRouter(prefix="/events", tags=["Eventos"])


@router.post("", response_model=EventResponse, status_code=201)
def create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
) -> EventResponse:
    event = EventModel(
        id=str(uuid4()),
        user_id=payload.user_id,
        session_id=payload.session_id,
        product_id=payload.product_id,
        event_type=payload.event_type,
        timestamp=payload.timestamp or datetime.utcnow().isoformat(),
        metadata_json=json.dumps(payload.metadata) if payload.metadata is not None else None,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return EventResponse.model_validate(
        {
            "id": event.id,
            "user_id": event.user_id,
            "session_id": event.session_id,
            "product_id": event.product_id,
            "event_type": event.event_type,
            "timestamp": event.timestamp,
            "metadata": payload.metadata,
        }
    )


@router.get("/live", response_model=list[LiveEventResponse])
def get_live_events(db: Session = Depends(get_db)) -> list[LiveEventResponse]:
    statement = (
        select(EventModel, ProductModel.name)
        .join(ProductModel, ProductModel.id == EventModel.product_id)
        .order_by(EventModel.timestamp.desc())
        .limit(20)
    )
    rows = db.execute(statement).all()

    live_events: list[LiveEventResponse] = []
    for event, product_name in rows:
        live_events.append(
            LiveEventResponse(
                id=event.id,
                user_id=event.user_id,
                product_id=event.product_id,
                product_name=product_name,
                event_type=event.event_type,
                timestamp=event.timestamp,
                user_label=f"Usuário #{hash(event.user_id) % 100 + 1}",
            )
        )

    return live_events


@router.get("/stats")
def get_event_stats(db: Session = Depends(get_db)) -> dict[str, int]:
    statement = (
        select(EventModel.event_type, func.count(EventModel.id))
        .group_by(EventModel.event_type)
    )
    rows = db.execute(statement).all()
    return {event_type: count for event_type, count in rows}


@router.get("/user/{user_id}", response_model=list[EventResponse])
def get_user_events(
    user_id: str,
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
) -> list[EventResponse]:
    statement = (
        select(EventModel)
        .where(EventModel.user_id == user_id)
        .order_by(EventModel.timestamp.desc())
        .limit(limit)
    )
    events = db.scalars(statement).all()

    response: list[EventResponse] = []
    for event in events:
        response.append(
            EventResponse.model_validate(
                {
                    "id": event.id,
                    "user_id": event.user_id,
                    "session_id": event.session_id,
                    "product_id": event.product_id,
                    "event_type": event.event_type,
                    "timestamp": event.timestamp,
                    "metadata": json.loads(event.metadata_json) if event.metadata_json else None,
                }
            )
        )

    return response
