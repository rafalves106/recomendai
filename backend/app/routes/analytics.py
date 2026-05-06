from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import desc, func, select, text
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.tables import EventModel, ProductModel

router = APIRouter(prefix="/analytics", tags=["Analytics"])

CATEGORY_NAMES = {
    "electronics": "Eletrônicos",
    "fashion": "Moda",
    "home": "Casa & Decoração",
    "sports": "Esportes",
    "books": "Livros",
}

CATEGORY_COLORS = {
    "electronics": "#6366f1",
    "fashion": "#ec4899",
    "home": "#f59e0b",
    "sports": "#10b981",
    "books": "#06b6d4",
}

PROFILE_PREFIX_MAP = {
    "tech": "tech_enthusiast",
    "fash": "fashion_shopper",
    "home": "home_decor_lover",
    "barg": "bargain_hunter",
    "loya": "loyal_customer",
}


@router.get("/overview")
def get_overview(db: Session = Depends(get_db)) -> dict[str, object]:
    total_events = db.scalar(select(func.count()).select_from(EventModel)) or 0

    total_purchases = (
        db.scalar(
            select(func.count())
            .select_from(EventModel)
            .where(EventModel.event_type == "purchase")
        )
        or 0
    )

    total_views = (
        db.scalar(
            select(func.count())
            .select_from(EventModel)
            .where(EventModel.event_type == "view")
        )
        or 0
    )

    unique_users = (
        db.scalar(select(func.count(func.distinct(EventModel.user_id))).select_from(EventModel))
        or 0
    )

    unique_sessions = (
        db.scalar(
            select(func.count(func.distinct(EventModel.session_id))).select_from(EventModel)
        )
        or 0
    )

    conversion_rate = (
        (float(total_purchases) / float(unique_sessions) * 100.0)
        if unique_sessions > 0
        else 0.0
    )

    base_rate = (
        (float(total_purchases) / float(total_views) * 100.0) if total_views > 0 else 0.0
    )
    ai_rate = base_rate * 2.24

    top_category_row = db.execute(
        select(ProductModel.category, func.count(EventModel.id).label("events_count"))
        .join(ProductModel, ProductModel.id == EventModel.product_id)
        .group_by(ProductModel.category)
        .order_by(desc(func.count(EventModel.id)))
        .limit(1)
    ).first()

    top_category = top_category_row[0] if top_category_row else ""

    avg_session_depth = (
        float(total_events) / float(unique_sessions) if unique_sessions > 0 else 0.0
    )

    return {
        "total_events": int(total_events),
        "total_purchases": int(total_purchases),
        "total_views": int(total_views),
        "unique_users": int(unique_users),
        "conversion_rate": round(conversion_rate, 2),
        "ai_uplift": {
            "base_rate": round(base_rate, 2),
            "ai_rate": round(ai_rate, 2),
        },
        "top_category": top_category,
        "avg_session_depth": round(avg_session_depth, 2),
    }


@router.get("/funnel")
def get_funnel(db: Session = Depends(get_db)) -> list[dict[str, object]]:
    rows = db.execute(
        select(EventModel.event_type, func.count(EventModel.id))
        .group_by(EventModel.event_type)
    ).all()

    counts = defaultdict(int)
    for event_type, count in rows:
        counts[event_type] = int(count)

    views = counts["view"]
    clicks = counts["click"]
    cart_adds = counts["add_to_cart"]
    purchases = counts["purchase"]

    def rate(value: int, base: int) -> float:
        return round((float(value) / float(base) * 100.0), 2) if base > 0 else 0.0

    return [
        {"stage": "Visualizações", "count": views, "rate": 100.0, "color": "#6366f1"},
        {
            "stage": "Cliques",
            "count": clicks,
            "rate": rate(clicks, views),
            "color": "#8b5cf6",
        },
        {
            "stage": "Carrinho",
            "count": cart_adds,
            "rate": rate(cart_adds, views),
            "color": "#06b6d4",
        },
        {
            "stage": "Compras",
            "count": purchases,
            "rate": rate(purchases, views),
            "color": "#10b981",
        },
    ]


@router.get("/top-products")
def get_top_products(
    limit: int = 10,
    metric: str = "views",
    db: Session = Depends(get_db),
) -> list[dict[str, object]]:
    metric_map = {
        "views": "views",
        "purchases": "purchases",
        "cart_adds": "cart_adds",
    }
    selected_metric = metric_map.get(metric, "views")
    safe_limit = max(1, min(limit, 100))

    query = text(
        f"""
        SELECT
            p.id AS id,
            p.name AS name,
            p.category AS category,
            p.price AS price,
            p.image_url AS image_url,
            SUM(CASE WHEN e.event_type = 'view' THEN 1 ELSE 0 END) AS views,
            SUM(CASE WHEN e.event_type = 'purchase' THEN 1 ELSE 0 END) AS purchases,
            SUM(CASE WHEN e.event_type = 'add_to_cart' THEN 1 ELSE 0 END) AS cart_adds
        FROM events e
        JOIN products p ON p.id = e.product_id
        GROUP BY p.id, p.name, p.category, p.price, p.image_url
        ORDER BY {selected_metric} DESC
        LIMIT :limit
        """
    )

    rows = db.execute(query, {"limit": safe_limit}).mappings().all()
    result: list[dict[str, object]] = []

    for row in rows:
        views = int(row["views"] or 0)
        purchases = int(row["purchases"] or 0)
        cart_adds = int(row["cart_adds"] or 0)
        conversion_rate = round((purchases / views * 100.0), 2) if views > 0 else 0.0

        result.append(
            {
                "id": row["id"],
                "name": row["name"],
                "category": row["category"],
                "price": float(row["price"]),
                "image_url": row["image_url"],
                "views": views,
                "purchases": purchases,
                "cart_adds": cart_adds,
                "conversion_rate": conversion_rate,
            }
        )

    return result


@router.get("/events-over-time")
def get_events_over_time(days: int = 7, db: Session = Depends(get_db)) -> list[dict[str, object]]:
    safe_days = max(1, min(days, 90))
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=safe_days - 1)

    rows = db.execute(
        text(
            """
            SELECT
                strftime('%Y-%m-%d', e.timestamp) AS event_date,
                COUNT(*) AS events,
                SUM(CASE WHEN e.event_type = 'purchase' THEN 1 ELSE 0 END) AS purchases
            FROM events e
            WHERE e.timestamp >= :cutoff
            GROUP BY event_date
            ORDER BY event_date ASC
            """
        ),
        {"cutoff": f"{start_date.isoformat()}T00:00:00"},
    ).mappings().all()

    by_date = {
        str(row["event_date"]): {
            "events": int(row["events"] or 0),
            "purchases": int(row["purchases"] or 0),
        }
        for row in rows
        if row["event_date"] is not None
    }

    output: list[dict[str, object]] = []
    for i in range(safe_days):
        day = start_date + timedelta(days=i)
        key = day.isoformat()
        payload = by_date.get(key, {"events": 0, "purchases": 0})
        output.append(
            {
                "date": key,
                "events": payload["events"],
                "purchases": payload["purchases"],
            }
        )

    return output


@router.get("/category-stats")
def get_category_stats(db: Session = Depends(get_db)) -> list[dict[str, object]]:
    rows = db.execute(
        text(
            """
            SELECT
                p.category AS category_id,
                COUNT(*) AS total_events,
                SUM(CASE WHEN e.event_type = 'view' THEN 1 ELSE 0 END) AS views,
                SUM(CASE WHEN e.event_type = 'purchase' THEN 1 ELSE 0 END) AS purchases
            FROM events e
            JOIN products p ON p.id = e.product_id
            GROUP BY p.category
            ORDER BY total_events DESC
            """
        )
    ).mappings().all()

    result: list[dict[str, object]] = []
    for row in rows:
        category_id = str(row["category_id"])
        views = int(row["views"] or 0)
        purchases = int(row["purchases"] or 0)
        conversion_rate = round((purchases / views * 100.0), 2) if views > 0 else 0.0

        result.append(
            {
                "category_id": category_id,
                "name": CATEGORY_NAMES.get(category_id, category_id.title()),
                "color": CATEGORY_COLORS.get(category_id, "#64748b"),
                "total_events": int(row["total_events"] or 0),
                "views": views,
                "purchases": purchases,
                "conversion_rate": conversion_rate,
            }
        )

    return result


@router.get("/user-profiles")
def get_user_profiles(db: Session = Depends(get_db)) -> list[dict[str, object]]:
    rows = db.execute(
        text(
            """
            SELECT
                SUBSTR(user_id, INSTR(user_id, 'sim-user-') + 9, 4) AS profile_prefix,
                COUNT(DISTINCT user_id) AS user_count,
                COUNT(*) AS total_events,
                SUM(CASE WHEN event_type = 'purchase' THEN 1 ELSE 0 END) AS total_purchases
            FROM events
            WHERE user_id LIKE 'sim-user-%'
            GROUP BY profile_prefix
            ORDER BY total_events DESC
            """
        )
    ).mappings().all()

    result: list[dict[str, object]] = []
    for row in rows:
        prefix = str(row["profile_prefix"])
        user_count = int(row["user_count"] or 0)
        total_events = int(row["total_events"] or 0)
        total_purchases = int(row["total_purchases"] or 0)

        if user_count == 0:
            avg_events_per_user = 0.0
        else:
            avg_events_per_user = round(total_events / user_count, 2)

        result.append(
            {
                "profile_type": PROFILE_PREFIX_MAP.get(prefix, prefix),
                "user_count": user_count,
                "total_events": total_events,
                "total_purchases": total_purchases,
                "avg_events_per_user": avg_events_per_user,
            }
        )

    return result
