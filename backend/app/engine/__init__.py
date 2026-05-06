"""Recommendation engine package for Recomenda.AI."""

from __future__ import annotations

from app.engine.hybrid import get_hybrid_recommendations
from app.engine.hybrid import get_product_details
from app.engine.popularity import get_popular_products
from app.engine.cooccurrence import get_similar_products
from app.engine.cooccurrence import get_frequently_bought_together
from app.engine.user_profile import get_personalized_recommendations
from app.engine.user_profile import get_user_category_preferences

__all__ = [
    "get_hybrid_recommendations",
    "get_product_details",
    "get_popular_products",
    "get_similar_products",
    "get_frequently_bought_together",
    "get_personalized_recommendations",
    "get_user_category_preferences",
]
