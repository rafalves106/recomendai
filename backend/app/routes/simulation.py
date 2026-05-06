"""Simulation control routes for Recomenda.AI."""

from __future__ import annotations

import logging
import threading
import time
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import desc, func, select, delete
from sqlalchemy.orm import Session

from app.database import SessionLocal, get_db
from app.models.tables import EventModel, ProductModel
from app.schemas.models import LiveEventResponse

router = APIRouter(prefix="/simulation", tags=["Simulação"])

_simulation_running: bool = False

logger = logging.getLogger(__name__)


def _import_simulation_script():
    try:
        from scripts.simulate_users import SIMULATED_USERS, run_batch_simulation

        return SIMULATED_USERS, run_batch_simulation
    except Exception as exc:  # pragma: no cover - defensive import fallback
        logger.warning("Unable to import simulation script: %s", exc)
        return None, None


def _batch_worker(clear: bool) -> None:
    global _simulation_running
    _simulation_running = True
    start_time = time.time()

    SIMULATED_USERS, run_batch_simulation = _import_simulation_script()
    if SIMULATED_USERS is None or run_batch_simulation is None:
        _simulation_running = False
        return

    db = SessionLocal()
    try:
        run_batch_simulation(db, SIMULATED_USERS, clear_existing=clear, verbose=True)
        elapsed = time.time() - start_time
        logger.info("Simulation batch completed in %.1fs", elapsed)
    except Exception as exc:  # pragma: no cover - runtime guard
        logger.exception("Simulation batch failed: %s", exc)
    finally:
        db.close()
        _simulation_running = False


def run_batch_bg(clear: bool) -> None:
    thread = threading.Thread(target=_batch_worker, args=(clear,), daemon=True)
    thread.start()


@router.post("/batch")
def trigger_batch(
  background_tasks: BackgroundTasks,
  clear: bool = False,
  delay: float = 0.05,      # ← adiciona (default já é 0.05 = modo demo)
  db: Session = Depends(get_db),
) -> dict[str, str]:
  def run_batch_bg() -> None:
      try:
          from scripts.simulate_users import SIMULATED_USERS, run_batch_simulation
          with SessionLocal() as bg_db:
              run_batch_simulation(
                  bg_db,
                  SIMULATED_USERS,
                  clear_existing=clear,
                  verbose=True,
                  delay=delay,    # ← passa o delay
              )
      except Exception as exc:
          print(f"[simulation] erro no background: {exc}")

  background_tasks.add_task(run_batch_bg)
  return {"status": "started", "message": f"Simulação iniciada (delay={delay}s)"}


@router.get("/status")
def get_simulation_status(db: Session = Depends(get_db)) -> dict[str, object]:
    total_events = db.scalar(select(func.count(EventModel.id))) or 0
    simulated_events = db.scalar(
        select(func.count(EventModel.id)).where(EventModel.user_id.like("sim-user-%"))
    ) or 0
    real_events = db.scalar(
        select(func.count(EventModel.id)).where(~EventModel.user_id.like("sim-user-%"))
    ) or 0
    unique_simulated_users = db.scalar(
        select(func.count(func.distinct(EventModel.user_id))).where(
            EventModel.user_id.like("sim-user-%")
        )
    ) or 0

    events_by_type_rows = db.execute(
        select(EventModel.event_type, func.count(EventModel.id)).group_by(
            EventModel.event_type
        )
    ).all()
    events_by_type = {event_type: count for event_type, count in events_by_type_rows}

    most_viewed_row = db.execute(
        select(
            EventModel.product_id,
            ProductModel.name,
            func.count(EventModel.id).label("views"),
        )
        .join(ProductModel, ProductModel.id == EventModel.product_id)
        .where(EventModel.event_type == "view")
        .group_by(EventModel.product_id, ProductModel.name)
        .order_by(desc(func.count(EventModel.id)))
        .limit(1)
    ).first()

    most_viewed_product: dict[str, object] | None = None
    if most_viewed_row:
        product_id, product_name, views = most_viewed_row
        most_viewed_product = {
            "product_id": product_id,
            "product_name": product_name,
            "views": int(views),
        }

    return {
        "total_events": int(total_events),
        "simulated_events": int(simulated_events),
        "real_events": int(real_events),
        "events_by_type": events_by_type,
        "unique_simulated_users": int(unique_simulated_users),
        "most_viewed_product": most_viewed_product,
        "simulation_running": _simulation_running,
    }


@router.delete("/clear")
def clear_simulated_events(db: Session = Depends(get_db)) -> dict[str, object]:
    result = db.execute(
        delete(EventModel).where(EventModel.user_id.like("sim-user-%"))
    )
    db.commit()
    deleted = int(result.rowcount or 0)
    return {
        "deleted": deleted,
        "message": f"{deleted} eventos simulados removidos",
    }


@router.get("/users")
def get_simulated_users(db: Session = Depends(get_db)) -> list[dict[str, object]]:
    try:
        from scripts.simulate_users import SIMULATED_USERS
    except Exception:
        fallback_users: list[dict[str, object]] = []
        profile_types = [
            "tech_enthusiast",
            "fashion_shopper",
            "home_decor_lover",
            "bargain_hunter",
            "loyal_customer",
        ]
        for profile_type in profile_types:
            for index in range(1, 11):
                fallback_users.append(
                    {
                        "id": f"sim-user-{profile_type[:4]}-{index:02d}",
                        "name": f"Usuário {index:02d}",
                        "profile_type": profile_type,
                    }
                )
        SIMULATED_USERS = fallback_users

    results: list[dict[str, object]] = []
    for user in SIMULATED_USERS:
        user_id = user["id"]

        total_events = db.scalar(
            select(func.count(EventModel.id)).where(EventModel.user_id == user_id)
        ) or 0
        total_purchases = db.scalar(
            select(func.count(EventModel.id)).where(
                EventModel.user_id == user_id,
                EventModel.event_type == "purchase",
            )
        ) or 0

        favorite_row = db.execute(
            select(ProductModel.category, func.count(EventModel.id).label("count"))
            .join(ProductModel, ProductModel.id == EventModel.product_id)
            .where(EventModel.user_id == user_id)
            .group_by(ProductModel.category)
            .order_by(desc(func.count(EventModel.id)))
            .limit(1)
        ).first()

        favorite_category = favorite_row[0] if favorite_row else None

        results.append(
            {
                "id": user["id"],
                "name": user["name"],
                "profile_type": user["profile_type"],
                "total_events": int(total_events),
                "total_purchases": int(total_purchases),
                "favorite_category": favorite_category,
            }
        )

    return results
