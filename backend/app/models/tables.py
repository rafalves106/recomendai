from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ProductModel(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    original_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    category: Mapped[str] = mapped_column(String, nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String, nullable=False)
    tags: Mapped[str] = mapped_column(Text, nullable=False)
    rating: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    review_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    in_stock: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default=lambda: datetime.utcnow().isoformat(),
    )

    def __repr__(self) -> str:
        return f"ProductModel(id={self.id!r}, name={self.name!r}, category={self.category!r})"


class EventModel(Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    session_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    product_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    timestamp: Mapped[str] = mapped_column(String, nullable=False, index=True)
    metadata_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:
        return (
            "EventModel("
            f"id={self.id!r}, user_id={self.user_id!r}, product_id={self.product_id!r}, "
            f"event_type={self.event_type!r})"
        )


class RecommendationCacheModel(Base):
    __tablename__ = "recommendation_cache"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    product_id: Mapped[str] = mapped_column(String, nullable=False)
    strategy: Mapped[str] = mapped_column(String, nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    computed_at: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default=lambda: datetime.utcnow().isoformat(),
    )

    def __repr__(self) -> str:
        return (
            "RecommendationCacheModel("
            f"id={self.id!r}, user_id={self.user_id!r}, product_id={self.product_id!r}, "
            f"strategy={self.strategy!r})"
        )
