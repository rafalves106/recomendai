"""Recommendations API routes for Recomenda.AI."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.tables import ProductModel
from app.services.product_service import product_service
from app.engine import (
    get_popular_products,
    get_similar_products,
    get_personalized_recommendations,
    get_product_details,
    get_hybrid_recommendations,
    get_user_category_preferences,
)

router = APIRouter(prefix="/recommendations", tags=["Recomendações"])


def serialize_with_meta(
    product: ProductModel,
    score: float,
    strategy: str,
    reason: str,
) -> dict:
    """Serialize a product with recommendation metadata."""
    data = product_service.serialize(product)
    data.update({
        "score": score,
        "strategy": strategy,
        "reason": reason,
    })
    return data


@router.get("/popular")
async def get_popular(
    limit: int = 10,
    db: Session = Depends(get_db),
) -> list[dict]:
    """
    Get the most popular products based on event history.

    Products are scored by weighted events:
    - purchase: 5
    - add_to_cart: 3
    - click: 2
    - view: 1
    - remove_from_cart: -1
    """
    results = get_popular_products(db, limit=limit)

    output = []
    for rec in results:
        product = db.query(ProductModel).filter(
            ProductModel.id == rec["product_id"]
        ).first()
        if product:
            output.append(serialize_with_meta(
                product,
                rec["score"],
                "popular",
                rec["reason"],
            ))

    return output


@router.get("/user/{user_id}")
async def get_user_recommendations(
    user_id: str,
    limit: int = 10,
    product_id: Optional[str] = None,
    db: Session = Depends(get_db),
) -> list[dict]:
    """
    Get personalized recommendations for a user.

    Uses hybrid strategy combining:
    - User's category preferences
    - Item similarity (if product_id provided)
    - Popular products as fallback
    """
    results = get_hybrid_recommendations(
        db,
        user_id,
        product_id=product_id,
        limit=limit,
    )

    output = []
    for rec in results:
        product = db.query(ProductModel).filter(
            ProductModel.id == rec["product_id"]
        ).first()
        if product:
            output.append(serialize_with_meta(
                product,
                rec["score"],
                rec.get("strategy", "hybrid"),
                rec["reason"],
            ))

    return output


@router.get("/item/{product_id}")
async def get_item_recommendations(
    product_id: str,
    limit: int = 8,
    db: Session = Depends(get_db),
) -> list[dict]:
    """
    Get products similar to the given product (co-occurrence based).

    Falls back to popular products if not enough data.
    """
    results = get_similar_products(db, product_id, limit=limit)

    if not results:
        # Fallback to popular products
        results = get_popular_products(db, limit=limit, exclude_ids=[product_id])
        strategy = "popular"
        reason = "Também muito comprado na loja"
    else:
        strategy = "item_similarity"
        reason = None

    output = []
    for rec in results:
        product = db.query(ProductModel).filter(
            ProductModel.id == rec["product_id"]
        ).first()
        if product:
            output.append(serialize_with_meta(
                product,
                rec["score"],
                strategy,
                reason or rec["reason"],
            ))

    return output


@router.get("/category/{category_id}")
async def get_category_recommendations(
    category_id: str,
    limit: int = 10,
    exclude_id: Optional[str] = None,
    db: Session = Depends(get_db),
) -> list[dict]:
    """
    Get top products in a category by rating and review count.
    """
    query = db.query(ProductModel).filter(ProductModel.category == category_id)

    if exclude_id:
        query = query.filter(ProductModel.id != exclude_id)

    products = query.order_by(
        ProductModel.review_count.desc(),
        ProductModel.rating.desc(),
    ).limit(limit).all()

    output = []
    for product in products:
        output.append(serialize_with_meta(
            product,
            float(product.rating),
            "popular",
            "Top da categoria",
        ))

    return output


@router.get("/user/{user_id}/profile")
async def get_user_profile(
    user_id: str,
    db: Session = Depends(get_db),
) -> list[dict]:
    """
    Get the user's detected category preferences.

    Returns categories the user has shown interest in, with scores.
    """
    preferences = get_user_category_preferences(db, user_id)

    category_names = {
        "electronics": "Eletrônicos",
        "fashion": "Moda",
        "home": "Casa & Decoração",
        "sports": "Esportes",
        "books": "Livros",
    }

    output = []
    for category_id, score in preferences:
        output.append({
            "category": category_id,
            "score": score,
            "display_name": category_names.get(category_id, category_id),
        })

    return output
