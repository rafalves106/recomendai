from __future__ import annotations

from datetime import datetime
from typing import Annotated, Literal, Optional, Union

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProductBase(BaseModel):
    """Dados base de um produto exibido na loja."""

    name: str
    description: str
    price: float
    original_price: Optional[float] = None
    category: str
    image_url: str
    tags: list[str]
    rating: float = 0
    review_count: int = 0
    in_stock: bool = True


class ProductCreate(ProductBase):
    """Payload para criação de produtos."""

    id: str


class ProductResponse(ProductBase):
    """Representação completa de um produto retornado pela API."""

    id: str
    created_at: str
    model_config = ConfigDict(from_attributes=True)

    @field_validator("tags", mode="before")
    @classmethod
    def validate_tags(cls, value: object) -> list[str]:
        if value is None:
            return []
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        raise TypeError("tags deve ser uma lista ou string separada por vírgulas")


class EventCreate(BaseModel):
    """Evento de comportamento enviado pelo frontend."""

    user_id: str
    session_id: str
    product_id: str
    event_type: Literal[
        "view",
        "search",
        "click",
        "add_to_cart",
        "purchase",
        "remove_from_cart",
    ]
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    metadata: Optional[dict[str, object]] = None


class EventResponse(EventCreate):
    """Evento persistido retornado pela API."""

    id: str
    model_config = ConfigDict(from_attributes=True)


class RecommendationResponse(BaseModel):
    """Produto recomendado com explicação da estratégia aplicada."""

    product: ProductResponse
    score: float
    strategy: Literal["popular", "collaborative", "item_similarity", "hybrid"]
    reason: str


class RecommendationSectionResponse(BaseModel):
    """Bloco de recomendações agrupado por contexto ou estratégia."""

    title: str
    subtitle: Optional[str] = None
    recommendations: list[RecommendationResponse]
    strategy: str


class KPIResponse(BaseModel):
    """Indicador-chave exibido no dashboard administrativo."""

    label: str
    value: Union[str, int, float]
    change: float
    change_type: Literal["increase", "decrease", "neutral"]
    icon: str
    unit: Optional[str] = None


class TopProductResponse(BaseModel):
    """Produto de maior destaque nas análises do admin."""

    product: ProductResponse
    views: int
    purchases: int
    cart_adds: int
    conversion_rate: float


class LiveEventResponse(BaseModel):
    """Linha do feed ao vivo com nome do produto e rótulo amigável do usuário."""

    id: str
    user_id: str
    product_id: str
    product_name: str
    event_type: str
    timestamp: str
    user_label: str
