from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.tables import ProductModel
from app.schemas.models import ProductResponse
from app.services.product_service import product_service

router = APIRouter(prefix="/products", tags=["Produtos"])


def serialize_product(product: ProductModel) -> ProductResponse:
    return ProductResponse.model_validate(product_service.serialize(product))


@router.get("/featured", response_model=list[ProductResponse])
def get_featured_products(
    db: Session = Depends(get_db),
    limit: int = Query(default=8, ge=1, le=50),
) -> list[ProductResponse]:
    products = product_service.get_featured(db, limit=limit)
    return [serialize_product(product) for product in products]


@router.get("/category/{category_id}", response_model=list[ProductResponse])
def get_products_by_category(
    category_id: str,
    db: Session = Depends(get_db),
) -> list[ProductResponse]:
    products = product_service.get_by_category(db, category_id)
    return [serialize_product(product) for product in products]


@router.get("/{product_id}", response_model=ProductResponse)
def get_product_by_id(
    product_id: str,
    db: Session = Depends(get_db),
) -> ProductResponse:
    product = product_service.get_by_id(db, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return serialize_product(product)


@router.get("", response_model=list[ProductResponse])
def get_products(
    category: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None),
    in_stock: Optional[bool] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> list[ProductResponse]:
    products = product_service.get_all(
        db,
        category=category,
        q=q,
        in_stock=in_stock,
        limit=limit,
        offset=offset,
    )
    return [serialize_product(product) for product in products]
