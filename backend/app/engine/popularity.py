"""Popularity-based recommendation engine for Recomenda.AI."""

from __future__ import annotations

from sqlalchemy import select, func, text
from sqlalchemy.orm import Session

from app.models.tables import EventModel, ProductModel

EVENT_WEIGHTS = {
    "purchase": 5,
    "add_to_cart": 3,
    "click": 2,
    "view": 1,
    "remove_from_cart": -1,
}


def get_popular_products(
    db: Session,
    limit: int = 10,
    exclude_ids: list[str] | None = None,
) -> list[dict]:
    """
    Get the most popular products based on weighted event history.

    Products are scored by summing event weights:
    - purchase: 5
    - add_to_cart: 3
    - click: 2
    - view: 1
    - remove_from_cart: -1

    Args:
        db: Database session
        limit: Maximum number of products to return
        exclude_ids: Product IDs to exclude from results

    Returns:
        List of dicts with keys: product_id, score, reason
    """
    exclude_ids = exclude_ids or []

    # Query events with weighted scoring
    query = text("""
        SELECT product_id,
               SUM(CASE event_type
                   WHEN 'purchase' THEN 5
                   WHEN 'add_to_cart' THEN 3
                   WHEN 'click' THEN 2
                   WHEN 'view' THEN 1
                   WHEN 'remove_from_cart' THEN -1
                   ELSE 0
               END) as score
        FROM events
        GROUP BY product_id
        HAVING score > 0
        ORDER BY score DESC
        LIMIT :fetch_limit
    """)

    result = db.execute(query, {"fetch_limit": limit * 3})
    rows = result.fetchall()

    products = []
    for row in rows:
        product_id = row[0]
        if product_id not in exclude_ids:
            products.append({
                "product_id": product_id,
                "score": float(row[1]),
                "reason": "Muito popular na loja",
            })
            if len(products) >= limit:
                break

    # If not enough results, fill with top-rated products
    if len(products) < limit:
        existing_ids = {p["product_id"] for p in products} | set(exclude_ids)

        stmt = (
            select(ProductModel.id, ProductModel.rating)
            .order_by(ProductModel.review_count.desc(), ProductModel.rating.desc())
        )

        remaining_products = db.execute(stmt).fetchall()

        for product in remaining_products:
            if product.id not in existing_ids:
                products.append({
                    "product_id": product.id,
                    "score": float(product.rating),
                    "reason": "Bem avaliado na loja",
                })
                if len(products) >= limit:
                    break

    return products[:limit]
