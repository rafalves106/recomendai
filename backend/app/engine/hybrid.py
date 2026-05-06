"""Hybrid recommendation engine combining multiple strategies for Recomenda.AI."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.tables import ProductModel
from app.engine.popularity import get_popular_products
from app.engine.cooccurrence import get_similar_products
from app.engine.user_profile import get_personalized_recommendations

STRATEGY_WEIGHTS = {
    "item_similarity": 0.40,
    "user_profile": 0.40,
    "popular": 0.20,
}


def get_hybrid_recommendations(
    db: Session,
    user_id: str,
    product_id: str | None = None,
    limit: int = 10,
    exclude_ids: list[str] | None = None,
) -> list[dict]:
    """
    Get hybrid recommendations combining multiple strategies.

    Combines:
    - User profile recommendations (40%)
    - Item similarity recommendations (40%)
    - Popular products (20%)

    Args:
        db: Database session
        user_id: User ID
        product_id: Optional product ID to find similar items for
        limit: Maximum number of products to return
        exclude_ids: Product IDs to exclude from results

    Returns:
        List of dicts with keys: product_id, score, reason, strategy
    """
    exclude_ids = exclude_ids or []

    # Collect results from each strategy
    popular_results = get_popular_products(db, limit=limit * 2, exclude_ids=exclude_ids)
    profile_results = get_personalized_recommendations(
        db, user_id, limit=limit * 2, exclude_ids=exclude_ids
    )
    similarity_results = []
    if product_id:
        similarity_results = get_similar_products(
            db, product_id, limit=limit * 2, exclude_ids=exclude_ids
        )

    # Merge scores with weights
    merged: dict[str, dict] = {}

    # Add popular results
    for item in popular_results:
        pid = item["product_id"]
        weight = STRATEGY_WEIGHTS["popular"]
        if pid not in merged:
            merged[pid] = {
                "score": 0.0,
                "reason": item["reason"],
                "strategies": [],
            }
        merged[pid]["score"] += item["score"] * weight
        merged[pid]["strategies"].append("popular")

    # Add profile results (higher priority)
    for item in profile_results:
        pid = item["product_id"]
        weight = STRATEGY_WEIGHTS["user_profile"]
        if pid not in merged:
            merged[pid] = {
                "score": 0.0,
                "reason": item["reason"],
                "strategies": [],
            }
        merged[pid]["score"] += item["score"] * weight
        if item["reason"] != "Popular na loja":
            merged[pid]["reason"] = item["reason"]
        merged[pid]["strategies"].append("user_profile")

    # Add similarity results (highest priority)
    for item in similarity_results:
        pid = item["product_id"]
        weight = STRATEGY_WEIGHTS["item_similarity"]
        if pid not in merged:
            merged[pid] = {
                "score": 0.0,
                "reason": item["reason"],
                "strategies": [],
            }
        merged[pid]["score"] += item["score"] * weight
        merged[pid]["reason"] = item["reason"]
        merged[pid]["strategies"].append("item_similarity")

    # Filter exclude_ids and sort
    final_results = [
        {
            "product_id": pid,
            "score": data["score"],
            "reason": data["reason"],
            "strategy": "hybrid",
        }
        for pid, data in merged.items()
        if pid not in exclude_ids
    ]

    final_results.sort(key=lambda x: x["score"], reverse=True)

    return final_results[:limit]


def get_product_details(
    db: Session,
    recommendation_dicts: list[dict],
) -> list[dict]:
    """
    Enrich recommendation dicts with full product data from the database.

    Args:
        db: Database session
        recommendation_dicts: List of dicts with at least 'product_id' key

    Returns:
        List of dicts with all product fields + recommendation metadata
    """
    product_ids = [r["product_id"] for r in recommendation_dicts]

    if not product_ids:
        return []

    stmt = select(ProductModel).where(ProductModel.id.in_(product_ids))
    products = db.execute(stmt).scalars().all()

    product_map = {p.id: p for p in products}

    results = []
    for rec in recommendation_dicts:
        product = product_map.get(rec["product_id"])
        if product:
            # Enrich with product data
            enriched = {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": product.price,
                "original_price": product.original_price,
                "category": product.category,
                "image_url": product.image_url,
                "tags": product.tags,
                "rating": product.rating,
                "review_count": product.review_count,
                "in_stock": product.in_stock,
                # Add recommendation metadata
                "score": rec.get("score", 0.0),
                "reason": rec.get("reason", ""),
                "strategy": rec.get("strategy", "hybrid"),
            }
            results.append(enriched)

    return results
