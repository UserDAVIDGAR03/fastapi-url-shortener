import redis
import string
import random
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter()

# Conexión a Redis para caché
redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

def generate_short_id(length=6):
    """Genera un ID alfanumérico aleatorio."""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def increment_click_count_bg(short_id: str):
    """Tarea en segundo plano para actualizar los clics."""
    db_session = next(get_db())
    try:
        url_entry = db_session.query(models.URLItem).filter(models.URLItem.short_id == short_id).first()
        if url_entry:
            url_entry.clicks += 1
            db_session.commit()
    finally:
        db_session.close()

@router.post("/api/shorten", response_model=schemas.URLInfo, status_code=status.HTTP_201_CREATED)
def create_short_url(request: Request, url_data: schemas.URLCreate, db: Session = Depends(get_db)):
    """Crea un nuevo código corto para la URL proporcionada."""
    existing_url = db.query(models.URLItem).filter(models.URLItem.original_url == str(url_data.original_url)).first()
    if existing_url:
        return existing_url

    short_id = generate_short_id()
    while db.query(models.URLItem).filter(models.URLItem.short_id == short_id).first():
        short_id = generate_short_id()

    db_url = models.URLItem(original_url=str(url_data.original_url), short_id=short_id)
    db.add(db_url)
    db.commit()
    db.refresh(db_url)

    redis_client.set(f"url:{short_id}", db_url.original_url, ex=86400)
    return db_url

@router.get("/{short_id}")
def redirect_to_target(short_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Redirige al enlace original utilizando la caché de Redis."""
    cached_url = redis_client.get(f"url:{short_id}")

    if cached_url:
        background_tasks.add_task(increment_click_count_bg, short_id)
        return RedirectResponse(url=cached_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)

    db_url = db.query(models.URLItem).filter(models.URLItem.short_id == short_id).first()
    if not db_url:
        raise HTTPException(status_code=404, detail="URL no encontrada")

    redis_client.set(f"url:{short_id}", db_url.original_url, ex=86400)
    background_tasks.add_task(increment_click_count_bg, short_id)

    return RedirectResponse(url=db_url.original_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)

@router.get("/api/analytics/{short_id}", response_model=schemas.URLInfo)
def get_url_analytics(short_id: str, db: Session = Depends(get_db)):
    """Obtiene las métricas y el contador de clics."""
    db_url = db.query(models.URLItem).filter(models.URLItem.short_id == short_id).first()
    if not db_url:
        raise HTTPException(status_code=404, detail="URL no encontrada")
    return db_url