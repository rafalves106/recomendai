from __future__ import annotations

from typing import Optional

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.models.tables import ProductModel
from app.schemas.models import ProductResponse


class ProductService:
    @staticmethod
    def _build_query(
        category: Optional[str] = None,
        q: Optional[str] = None,
        in_stock: Optional[bool] = None,
    ) -> Select[tuple[ProductModel]]:
        statement = select(ProductModel)

        if category is not None:
            statement = statement.where(ProductModel.category == category)

        if q:
            pattern = f"%{q}%"
            statement = statement.where(
                ProductModel.name.ilike(pattern)
                | ProductModel.description.ilike(pattern)
                | ProductModel.tags.ilike(pattern)
            )

        if in_stock is not None:
            statement = statement.where(ProductModel.in_stock == in_stock)

        return statement

    @staticmethod
    def get_all(
        db: Session,
        category: Optional[str] = None,
        q: Optional[str] = None,
        in_stock: Optional[bool] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[ProductModel]:
        statement = (
            ProductService._build_query(category=category, q=q, in_stock=in_stock)
            .order_by(ProductModel.name.asc())
            .limit(limit)
            .offset(offset)
        )
        return list(db.scalars(statement).all())

    @staticmethod
    def get_by_id(db: Session, product_id: str) -> Optional[ProductModel]:
        statement = select(ProductModel).where(ProductModel.id == product_id)
        return db.scalar(statement)

    @staticmethod
    def get_by_category(db: Session, category_id: str) -> list[ProductModel]:
        statement = (
            select(ProductModel)
            .where(ProductModel.category == category_id)
            .order_by(ProductModel.name.asc())
        )
        return list(db.scalars(statement).all())

    @staticmethod
    def get_featured(db: Session, limit: int = 8) -> list[ProductModel]:
        statement = (
            select(ProductModel)
            .order_by(ProductModel.rating.desc(), ProductModel.review_count.desc())
            .limit(limit)
        )
        return list(db.scalars(statement).all())

    @staticmethod
    def get_popular(db: Session, limit: int = 10) -> list[ProductModel]:
        statement = (
            select(ProductModel)
            .order_by(ProductModel.review_count.desc(), ProductModel.rating.desc())
            .limit(limit)
        )
        return list(db.scalars(statement).all())

    @staticmethod
    def serialize(product: ProductModel) -> dict[str, object]:
        return {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "original_price": product.original_price,
            "category": product.category,
            "image_url": product.image_url,
            "tags": [tag.strip() for tag in product.tags.split(",") if tag.strip()],
            "rating": product.rating,
            "review_count": product.review_count,
            "in_stock": product.in_stock,
            "created_at": product.created_at,
        }


product_service = ProductService()
