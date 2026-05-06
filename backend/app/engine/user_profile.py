"""User profile based recommendation engine for Recomenda.AI."""

from __future__ import annotations

from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.tables import EventModel, ProductModel
from app.engine.popularity import get_popular_products

EVENT_WEIGHTS = {
    "purchase": 5,
    "add_to_cart": 3,
    "click": 2,
    "view": 1,
}

CATEGORY_NAMES = {
    "electronics": "Eletrônicos",
    "fashion": "Moda",
    "home": "Casa & Decoração",
    "sports": "Esportes",
    "books": "Livros",
}


def get_user_category_preferences(
    db: Session,
    user_id: str,
) -> list[tuple[str, float]]:
    """
    Get user's preferred categories based on their event history.

    Args:
        db: Database session
        user_id: User ID

    Returns:
        List of (category_id, score) tuples, sorted by score descending
    """
    # Get all user events (excluding search and remove_from_cart)
    stmt = select(EventModel).where(
        (EventModel.user_id == user_id)
        & (~EventModel.event_type.in_(["search", "remove_from_cart"]))
    )

    events = db.execute(stmt).scalars().all()

    if not events:
        return []

    # Get product categories and score them
    product_ids = [e.product_id for e in events]

    stmt = select(ProductModel.id, ProductModel.category).where(
        ProductModel.id.in_(product_ids)
    )

    products = db.execute(stmt).fetchall()
    product_categories = {p.id: p.category for p in products}

    # Score categories by event weights
    category_scores: dict[str, float] = defaultdict(float)

    for event in events:
        category = product_categories.get(event.product_id)
        if category:
            weight = EVENT_WEIGHTS.get(event.event_type, 1)
            category_scores[category] += weight

    # Return sorted by score
    return sorted(category_scores.items(), key=lambda x: x[1], reverse=True)


def get_user_viewed_products(
    db: Session,
    user_id: str,
) -> set[str]:
    """
    Get all products the user has already interacted with.

    Args:
        db: Database session
        user_id: User ID

    Returns:
        Set of product IDs
    """
    stmt = select(EventModel.product_id.distinct()).where(
        EventModel.user_id == user_id
    )

    return set(db.execute(stmt).scalars().all())


def get_personalized_recommendations(
    db: Session,
    user_id: str,
    limit: int = 10,
    exclude_ids: list[str] | None = None,
) -> list[dict]:
    """
    Get personalized recommendations for a user based on their category preferences.

    Falls back to popular products if user has no history.

    Args:
        db: Database session
        user_id: User ID
        limit: Maximum number of products to return
        exclude_ids: Product IDs to exclude from results

    Returns:
        List of dicts with keys: product_id, score, reason
    """
    exclude_ids = exclude_ids or []

    # Get user preferences
    preferences = get_user_category_preferences(db, user_id)

    if not preferences:
        # New user: use popular products
        return get_popular_products(db, limit, exclude_ids)

    # Get products user already viewed
    viewed = get_user_viewed_products(db, user_id)
    exclude_set = set(exclude_ids) | viewed

    results = []

    # Recommend from top 2 categories, alternating
    for i, (category, score) in enumerate(preferences[:2]):
        stmt = (
            select(ProductModel.id, ProductModel.rating)
            .where(
                (ProductModel.category == category)
                & (~ProductModel.id.in_(exclude_set))
            )
            .order_by(ProductModel.rating.desc(), ProductModel.review_count.desc())
            .limit(limit)
        )

        products = db.execute(stmt).fetchall()

        category_name = get_category_display_name(category)

        for product in products:
            if len(results) >= limit:
                break
            results.append({
                "product_id": product.id,
                "score": float(product.rating),
                "reason": f"Baseado no seu interesse em {category_name}",
            })
            exclude_set.add(product.id)

    return results[:limit]


def get_category_display_name(category_id: str) -> str:
    """Get display name for a category ID."""
    return CATEGORY_NAMES.get(category_id, category_id)
