from __future__ import annotations

import argparse
import json
import os
import random
import sys
import time
import uuid
from datetime import datetime, timedelta
from typing import Any

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from sqlalchemy import delete, func, select

from app.database import SessionLocal, init_db
from app.models.tables import EventModel, ProductModel

PROFILE_CONFIGS: dict[str, dict[str, Any]] = {
    "tech_enthusiast": {
        "category_weights": {
            "electronics": 0.70,
            "sports": 0.20,
            "books": 0.10,
        },
        "views_per_session": (4, 8),
        "cart_rate": 0.35,
        "purchase_rate": 0.40,
        "sessions_range": (10, 20),
        "prefers_discounts": False,
    },
    "fashion_shopper": {
        "category_weights": {
            "fashion": 0.80,
            "home": 0.15,
            "books": 0.05,
        },
        "views_per_session": (3, 7),
        "cart_rate": 0.50,
        "purchase_rate": 0.55,
        "sessions_range": (12, 25),
        "prefers_discounts": False,
    },
    "home_decor_lover": {
        "category_weights": {
            "home": 0.75,
            "fashion": 0.15,
            "books": 0.10,
        },
        "views_per_session": (2, 5),
        "cart_rate": 0.45,
        "purchase_rate": 0.65,
        "sessions_range": (8, 18),
        "prefers_discounts": False,
    },
    "bargain_hunter": {
        "category_weights": {
            "electronics": 0.30,
            "fashion": 0.30,
            "sports": 0.25,
            "home": 0.15,
        },
        "views_per_session": (5, 10),
        "cart_rate": 0.60,
        "purchase_rate": 0.20,
        "sessions_range": (15, 30),
        "prefers_discounts": True,
    },
    "loyal_customer": {
        "category_weights": {
            "electronics": 0.50,
            "home": 0.30,
            "books": 0.20,
        },
        "views_per_session": (3, 6),
        "cart_rate": 0.40,
        "purchase_rate": 0.70,
        "sessions_range": (20, 40),
        "prefers_discounts": False,
    },
}

PROFILE_NAME_POOLS: dict[str, list[str]] = {
    "tech_enthusiast": [
        "João Silva",
        "Rafael Costa",
        "Lucas Almeida",
        "Bruno Souza",
        "Thiago Santos",
        "Pedro Oliveira",
        "Guilherme Lima",
        "Felipe Rocha",
        "Vitor Pereira",
        "André Martins",
    ],
    "fashion_shopper": [
        "Mariana Alves",
        "Ana Beatriz",
        "Camila Ribeiro",
        "Juliana Ferreira",
        "Larissa Gomes",
        "Sofia Carvalho",
        "Carolina Mendes",
        "Isabela Dias",
        "Fernanda Barros",
        "Beatriz Nogueira",
    ],
    "home_decor_lover": [
        "Patrícia Azevedo",
        "Renata Cardoso",
        "Cláudia Monteiro",
        "Débora Freitas",
        "Bianca Pires",
        "Tatiane Couto",
        "Juliana Moraes",
        "Adriana Teixeira",
        "Eliane Ramos",
        "Vanessa Soares",
    ],
    "bargain_hunter": [
        "Carlos Henrique",
        "Diego Fernandes",
        "Marcos Vinícius",
        "Rodrigo Batista",
        "Gustavo Mendes",
        "Leandro Nunes",
        "Alex Santos",
        "Ricardo Faria",
        "Daniel Araujo",
        "Paulo Cesar",
    ],
    "loyal_customer": [
        "Roberto Lima",
        "Sandra Melo",
        "Paula Tavares",
        "Marcelo Rezende",
        "Adriana Freitas",
        "Mônica Lemos",
        "Sérgio Carvalho",
        "Vanessa Duarte",
        "Eduardo Pinto",
        "Tânia Ribeiro",
    ],
}

SIMULATED_USERS: list[dict[str, str]] = []
for profile_type, names in PROFILE_NAME_POOLS.items():
    prefix = profile_type[:4]
    for index, name in enumerate(names, start=1):
        SIMULATED_USERS.append(
            {
                "id": f"sim-user-{prefix}-{index:02d}",
                "name": name,
                "profile_type": profile_type,
            }
        )

_CATEGORY_CACHE: dict[str, list[ProductModel]] = {}
_ALL_PRODUCTS_CACHE: list[ProductModel] | None = None


def get_products_by_category(db, category: str) -> list[ProductModel]:
    """Return all in-stock products for a category, caching the result."""
    if category in _CATEGORY_CACHE:
        return _CATEGORY_CACHE[category]

    statement = (
        select(ProductModel)
        .where(ProductModel.category == category)
        .where(ProductModel.in_stock.is_(True))
        .order_by(ProductModel.rating.desc(), ProductModel.review_count.desc())
    )
    products = list(db.scalars(statement).all())
    _CATEGORY_CACHE[category] = products
    return products


def _get_all_in_stock_products(db) -> list[ProductModel]:
    global _ALL_PRODUCTS_CACHE
    if _ALL_PRODUCTS_CACHE is not None:
        return _ALL_PRODUCTS_CACHE

    statement = (
        select(ProductModel)
        .where(ProductModel.in_stock.is_(True))
        .order_by(ProductModel.rating.desc(), ProductModel.review_count.desc())
    )
    _ALL_PRODUCTS_CACHE = list(db.scalars(statement).all())
    return _ALL_PRODUCTS_CACHE


def _choose_product_from_pool(
    pool: list[ProductModel],
    prefers_discounts: bool,
    seen_ids: set[str],
) -> ProductModel:
    candidates = [product for product in pool if product.id not in seen_ids]
    if not candidates:
        candidates = list(pool)

    if prefers_discounts:
        discounted = [product for product in candidates if product.original_price is not None]
        if discounted and random.random() < 0.8:
            candidates = discounted

    return random.choice(candidates)


def pick_products_for_session(
    db,
    profile_config: dict[str, Any],
    n: int,
) -> list[ProductModel]:
    """Select products for a session using the profile's category weights."""
    category_weights = profile_config["category_weights"]
    prefers_discounts = bool(profile_config.get("prefers_discounts", False))

    available_categories = [
        category
        for category in category_weights
        if get_products_by_category(db, category)
    ]

    if not available_categories:
        available_categories = [product.category for product in _get_all_in_stock_products(db)]

    selected: list[ProductModel] = []
    seen_ids: set[str] = set()

    weights = [category_weights.get(category, 1.0) for category in available_categories]
    attempts = 0
    max_attempts = max(n * 8, 12)

    while len(selected) < n and attempts < max_attempts:
        attempts += 1
        category = random.choices(available_categories, weights=weights, k=1)[0]
        pool = get_products_by_category(db, category)
        if not pool:
            pool = _get_all_in_stock_products(db)
        if not pool:
            break

        product = _choose_product_from_pool(pool, prefers_discounts, seen_ids)
        selected.append(product)
        seen_ids.add(product.id)

    if len(selected) < n:
        fallback_pool = _get_all_in_stock_products(db)
        while len(selected) < n and fallback_pool:
            product = _choose_product_from_pool(fallback_pool, prefers_discounts, seen_ids)
            selected.append(product)
            seen_ids.add(product.id)

    return selected[:n]


def random_timestamp(days_ago_min: int, days_ago_max: int) -> str:
    """Return a random ISO timestamp in the requested date range."""
    if days_ago_min > days_ago_max:
        days_ago_min, days_ago_max = days_ago_max, days_ago_min

    days_ago = random.randint(days_ago_min, days_ago_max)
    seconds = random.randint(0, 24 * 60 * 60 - 1)
    timestamp = datetime.utcnow() - timedelta(days=days_ago, seconds=seconds)
    return timestamp.isoformat()


def _build_event(
    user: dict[str, str],
    session_id: str,
    product_id: str,
    event_type: str,
    timestamp: datetime,
) -> EventModel:
    return EventModel(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        session_id=session_id,
        product_id=product_id,
        event_type=event_type,
        timestamp=timestamp.isoformat(),
        metadata_json=None,
    )


def simulate_session(
    db,
    user: dict[str, str],
    profile_config: dict[str, Any],
    session_timestamp_base: str,
    dry_run: bool = False,
) -> list[EventModel]:
    """Simulate one browsing session for a user."""

    session_id = str(uuid.uuid4())
    views_min, views_max = profile_config["views_per_session"]
    num_products = random.randint(views_min, views_max)
    base_timestamp = datetime.fromisoformat(session_timestamp_base)
    products = pick_products_for_session(
        db,
        profile_config,
        num_products,
    )
    events: list[EventModel] = []
    current_time = base_timestamp

    for product in products:
        view_time = current_time + timedelta(seconds=random.randint(0, 30))
        events.append(_build_event(user, session_id, product.id, "view", view_time))

        last_time = view_time
        clicked = False
        if random.random() < 0.70:
            click_time = view_time + timedelta(seconds=2)
            events.append(_build_event(user, session_id, product.id, "click", click_time))
            last_time = click_time
            clicked = True

        if clicked and random.random() < profile_config["cart_rate"]:
            add_time = last_time + timedelta(seconds=5)
            events.append(
                _build_event(user, session_id, product.id, "add_to_cart", add_time)
            )
            last_time = add_time

            if random.random() < profile_config["purchase_rate"]:
                purchase_time = add_time + timedelta(seconds=random.randint(30, 120))
                events.append(
                    _build_event(user, session_id, product.id, "purchase", purchase_time)
                )
                last_time = purchase_time
            elif random.random() < 0.30:
                remove_time = add_time + timedelta(seconds=random.randint(20, 60))
                events.append(
                    _build_event(
                        user,
                        session_id,
                        product.id,
                        "remove_from_cart",
                        remove_time,
                    )
                )
                last_time = remove_time

        current_time = last_time + timedelta(seconds=random.randint(10, 30))

    return events


def _simulate_live_events(
    db,
    user: dict[str, str],
    profile_config: dict[str, Any],
) -> tuple[list[tuple[EventModel, ProductModel]], str]:
    session_id = str(uuid.uuid4())
    product = pick_products_for_session(db, profile_config, 1)[0]
    base_timestamp = datetime.utcnow()

    view_time = base_timestamp
    events: list[tuple[EventModel, ProductModel]] = [
        (_build_event(user, session_id, product.id, "view", view_time), product)
    ]

    last_time = view_time
    if random.random() < 0.70:
        click_time = view_time + timedelta(seconds=2)
        events.append((_build_event(user, session_id, product.id, "click", click_time), product))
        last_time = click_time

    if random.random() < profile_config["cart_rate"] and len(events) < 3:
        add_time = last_time + timedelta(seconds=5)
        events.append(
            (_build_event(user, session_id, product.id, "add_to_cart", add_time), product)
        )

    return events[: random.randint(1, min(3, len(events)))], product.id


def run_batch_simulation(
    db,
    users: list[dict[str, str]],
    clear_existing: bool = False,
    verbose: bool = True,
) -> int:
    """Generate historical events for all simulated users."""
    total_events = 0

    if clear_existing:
        result = db.execute(
            delete(EventModel).where(EventModel.user_id.like("sim-user-%"))
        )
        db.commit()
        if verbose:
            print("🗑️  Eventos simulados anteriores removidos.")
        _ = result.rowcount

    for index, user in enumerate(users, start=1):
        profile_config = PROFILE_CONFIGS[user["profile_type"]]
        session_count = random.randint(*profile_config["sessions_range"])
        session_times = sorted(
            datetime.utcnow() - timedelta(days=random.uniform(1, 30))
            for _ in range(session_count)
        )

        user_events = 0
        for session_time in session_times:
            session_events = simulate_session(
                db,
                user,
                profile_config,
                session_time.isoformat(),
            )
            db.add_all(session_events)
            user_events += len(session_events)
            total_events += len(session_events)

        if index % 10 == 0:
            db.commit()

        if verbose:
            print(
                f"[{index:02d}/{len(users):02d}] {user['name']} "
                f"({user['profile_type']}) — {session_count} sessões, {user_events} eventos"
            )

    db.commit()
    return total_events


def run_live_simulation(
    db,
    interval_seconds: float = 2.0,
) -> None:
    """Generate events continuously until Ctrl+C."""
    try:
        while True:
            user = random.choice(SIMULATED_USERS)
            profile_config = PROFILE_CONFIGS[user["profile_type"]]
            live_events, _ = _simulate_live_events(db, user, profile_config)

            db.add_all([event for event, _ in live_events])
            db.commit()

            for event, product in live_events:
                timestamp = datetime.fromisoformat(event.timestamp).strftime("%H:%M:%S")
                user_number = user["id"].split("-")[-1]
                print(
                    f"⚡ [{timestamp}] Usuário #{user_number} ({user['profile_type']}) "
                    f"→ {event.event_type.upper()} → {product.name}"
                )

            jitter = random.uniform(-0.5, 0.5)
            time.sleep(max(0.1, interval_seconds + jitter))
    except KeyboardInterrupt:
        print("\n⏹️  Simulação ao vivo encerrada.")


def _print_header(mode: str) -> None:
    print("🤖 Recomenda.AI — Simulação de Usuários")
    if mode == "batch":
        print("Modo: BATCH | Usuários: 50 | Período: últimos 30 dias")
    else:
        print("Modo: LIVE")


def main() -> None:
    parser = argparse.ArgumentParser(description="Simulação de usuários da Recomenda.AI")
    parser.add_argument("--mode", choices=["batch", "live"], default="batch")
    parser.add_argument("--clear", action="store_true")
    parser.add_argument("--interval", type=float, default=2.0)
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    init_db()
    _print_header(args.mode)

    with SessionLocal() as db:
        if args.mode == "batch":
            start_time = time.time()
            total_events = run_batch_simulation(
                db,
                SIMULATED_USERS,
                clear_existing=args.clear,
                verbose=args.verbose,
            )
            elapsed = time.time() - start_time
            print(f"✅ Simulação concluída em {elapsed:.1f}s")
            print(f"📊 Total de eventos gerados: {total_events}")
            print(f"👥 Usuários simulados: {len(SIMULATED_USERS)}")
            print("🔄 Agora rode o servidor e veja as recomendações melhorarem!")
        else:
            print(f"Gerando eventos a cada {args.interval}s | Ctrl+C para parar")
            run_live_simulation(db, args.interval)


if __name__ == "__main__":
    main()
