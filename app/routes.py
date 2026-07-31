import uuid
import os
import json
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTask
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import URLItem
from app.schemas import URLCreate, URLInfo
import redis

router = APIRouter()
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

# Conexión a cliente de Redis (Caché en memoria)
# En caso de no tener Redis instalado localmente, la API seguirá funcionando con fallback a DB
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping()
    REDIS_AVAILABLE = True
except Exception:
    REDIS_AVAILABLE = False


def register_click_in_background(db: Session, short_id: str):
    """Función que se ejecuta en segundo plano para no demorar la redirección del usuario."""
    db_url = db.query(URLItem).filter(URLItem.short_id == short_id).first()
    if db_url:
        db_url.clicks += 1
        db.commit()


@router.post("/api/shorten", response_model=URLInfo, status_code=status.HTTP_201_CREATED)
def create_short_url(url_data: URLCreate, db: Session = Depends(get_db)):
    short_id = str(uuid.uuid4())[:6]
    
    while db.query(URLItem).filter(URLItem.short_id == short_id).first():
        short_id = str(uuid.uuid4())[:6]

    db_url = URLItem(original_url=str(url_data.original_url), short_id=short_id)
    db.add(db_url)
    db.commit()
    db.refresh(db_url)

    # Guardar también en la Caché de Redis con tiempo de vida (TTL) de 24 horas
    if REDIS_AVAILABLE:
        redis_client.setex(name=short_id, time=86400, value=db_url.original_url)

    return URLInfo(
        original_url=db_url.original_url,
        short_url=f"{BASE_URL}/{db_url.short_id}",
        clicks=db_url.clicks,
        created_at=db_url.created_at
    )


@router.get("/{short_id}")
def redirect_to_original(short_id: str, db: Session = Depends(get_db)):
    target_url = None

    # 1. INTENTAR LEER DESDE LA CACHÉ (REDIS) -> Estrategia Cache-Aside
    if REDIS_AVAILABLE:
        target_url = redis_client.get(short_id)

    # 2. SI NO ESTÁ EN REDIS, BUSCAR EN LA BASE DE DATOS (FALLBACK)
    if not target_url:
        db_url = db.query(URLItem).filter(URLItem.short_id == short_id).first()
        if not db_url:
            raise HTTPException(status_code=404, detail="URL no encontrada")
        
        target_url = db_url.original_url
        
        # Guardar en Redis para las próximas peticiones
        if REDIS_AVAILABLE:
            redis_client.setex(name=short_id, time=86400, value=target_url)

    # 3. REDIRECCIÓN INSTANTÁNEA + REGISTRO DE CLIC EN SEGUNDO PLANO
    return RedirectResponse(
        url=target_url, 
        background=BackgroundTask(register_click_in_background, db, short_id)
    )