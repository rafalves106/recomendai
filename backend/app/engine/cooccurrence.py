"""Co-occurrence based recommendation engine for Recomenda.AI."""

from __future__ import annotations

from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.tables import EventModel

EVENT_WEIGHTS = {
    "purchase": 5,
    "add_to_cart": 3,
    "click": 2,
    "view": 1,
}


def get_similar_products(
    db: Session,
    product_id: str,
    limit: int = 8,
    exclude_ids: list[str] | None = None,
) -> list[dict]:
    """
    Get products similar to the given product based on session co-occurrence.

    Products that appear in the same session are considered similar.

    Args:
        db: Database session
        product_id: Product to find similar items for
        limit: Maximum number of products to return
        exclude_ids: Product IDs to exclude from results

    Returns:
        List of dicts with keys: product_id, score, reason
    """
    exclude_ids = exclude_ids or []

    # Find sessions containing the product
    stmt = select(EventModel.session_id.distinct()).where(
        (EventModel.product_id == product_id)
        & (EventModel.event_type.in_(["view", "click", "add_to_cart", "purchase"]))
    )

    sessions = db.execute(stmt).scalars().all()

    if not sessions:
        return []

    # Find co-occurring products in those sessions
    stmt = select(
        EventModel.product_id,
        EventModel.event_type,
    ).where(
        (EventModel.session_id.in_(sessions))
        & (EventModel.product_id != product_id)
        & (EventModel.event_type.in_(["view", "click", "add_to_cart", "purchase"]))
    )

    events = db.execute(stmt).fetchall()

    # Score co-occurrences
    co_scores: dict[str, float] = defaultdict(float)
    for event in events:
        product, event_type = event
        co_scores[product] += EVENT_WEIGHTS.get(event_type, 1)

    # Normalize by session count
    session_count = len(sessions)
    for product in co_scores:
        co_scores[product] /= session_count

    # Filter, sort, and return
    results = [
        {
            "product_id": pid,
            "score": score,
            "reason": "Quem viu este produto também viu este",
        }
        for pid, score in sorted(co_scores.items(), key=lambda x: x[1], reverse=True)
        if pid not in exclude_ids
    ]

    return results[:limit]


def get_frequently_bought_together(
    db: Session,
    product_id: str,
    limit: int = 5,
) -> list[dict]:
    """
    Get products frequently bought together with the given product.

    Only considers 'purchase' events.

    Args:
        db: Database session
        product_id: Product to find frequently bought together items for
        limit: Maximum number of products to return

    Returns:
        List of dicts with keys: product_id, score, reason
    """
    # Find sessions with purchase events containing the product
    stmt = select(EventModel.session_id.distinct()).where(
        (EventModel.product_id == product_id)
        & (EventModel.event_type == "purchase")
    )

    sessions = db.execute(stmt).scalars().all()

    if not sessions:
        return []

    # Find other products in purchase sessions
    stmt = select(EventModel.product_id).where(
        (EventModel.session_id.in_(sessions))
        & (EventModel.product_id != product_id)
        & (EventModel.event_type == "purchase")
    )

    products = db.execute(stmt).scalars().all()

    # Count occurrences
    from collections import Counter
    product_counts = Counter(products)

    # Return sorted by count
    results = [
        {
            "product_id": pid,
            "score": float(count),
            "reason": "Frequentemente comprado junto",
        }
        for pid, count in product_counts.most_common(limit)
    ]

    return results
