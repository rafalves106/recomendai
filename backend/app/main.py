from __future__ import annotations

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import DATABASE_URL, SessionLocal, init_db
from app.routes.events import router as events_router
from app.routes.products import router as products_router

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv(os.path.join(BASE_DIR, ".env.example"))

allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000",
)
origins = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]

app = FastAPI(
    title="Recomenda.AI API",
    description="Motor de recomendação com IA para e-commerce",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    print("🚀 Recomenda.AI API iniciada com sucesso")
    print(f"📦 Banco de dados: {DATABASE_URL}")


app.include_router(products_router, prefix="/api")
app.include_router(events_router, prefix="/api")


@app.get("/")
def read_root() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "Recomenda.AI API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check() -> dict[str, str]:
    try:
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            return {"status": "healthy", "database": "connected"}
        finally:
            db.close()
    except Exception:
        return {"status": "error", "database": "error"}
