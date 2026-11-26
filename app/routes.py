import os
import random
import string
from datetime import datetime, timedelta, timezone
from typing import List

import redis
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import Actor, get_current_actor
from app.database import get_db

router = APIRouter()

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)

GUEST_MAX_URLS = 1


def generate_short_id(length=6):
    return "".join(random.choices(string.ascii_letters + string.digits, k=length))


def calculate_ttl_seconds(expires_at: datetime | None) -> int:
    if not expires_at:
        return 86400
    now = datetime.now(timezone.utc)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    remaining = int((expires_at - now).total_seconds())
    return max(remaining, 1)


def record_click_bg(short_id: str, user_agent: str, referer: str):
    """Guarda el evento detallado del clic e incrementa el contador en PostgreSQL."""
    db_session = next(get_db())
    try:
        url_entry = db_session.query(models.URLItem).filter(models.URLItem.short_id == short_id).first()
        if url_entry:
            url_entry.clicks += 1
            event = models.ClickEvent(
                url_id=url_entry.id,
                user_agent=user_agent[:255] if user_agent else "Desconocido",
                referer=referer[:255] if referer else "Directo",
            )
            db_session.add(event)
            db_session.commit()
    finally:
        db_session.close()


def _owns_url(db_url: models.URLItem, actor: Actor) -> bool:
    if actor.user is not None:
        return db_url.user_id == actor.user.id
    if actor.guest_id is not None:
        return db_url.guest_id == actor.guest_id
    return False


@router.get("/api/urls", response_model=List[schemas.URLResponse])
def get_all_urls(
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    if actor.user is not None:
        return (
            db.query(models.URLItem)
            .filter(models.URLItem.user_id == actor.user.id)
            .order_by(models.URLItem.id.desc())
            .all()
        )
    return (
        db.query(models.URLItem)
        .filter(models.URLItem.guest_id == actor.guest_id)
        .order_by(models.URLItem.id.desc())
        .all()
    )


@router.post("/api/shorten", response_model=schemas.URLResponse, status_code=status.HTTP_201_CREATED)
def create_short_url(
    request: Request,
    url_data: schemas.URLCreate,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    if actor.is_guest:
        guest_urls_count = (
            db.query(models.URLItem)
            .filter(models.URLItem.guest_id == actor.guest_id)
            .count()
        )
        if guest_urls_count >= GUEST_MAX_URLS:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="En modo invitado solo puedes tener 1 enlace. Elimina el actual o crea una cuenta para añadir más.",
            )

    raw_url = str(url_data.original_url).strip()
    if not raw_url.startswith(("http://", "https://")):
        raw_url = f"https://{raw_url}"

    if url_data.custom_slug:
        slug_exists = (
            db.query(models.URLItem)
            .filter(models.URLItem.short_id == url_data.custom_slug)
            .first()
        )
        if slug_exists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El alias '{url_data.custom_slug}' ya está en uso.",
            )
        short_id = url_data.custom_slug
    else:
        if not url_data.expires_in_hours:
            owner_filter = (
                models.URLItem.user_id == actor.user.id
                if actor.user is not None
                else models.URLItem.guest_id == actor.guest_id
            )
            existing_url = (
                db.query(models.URLItem)
                .filter(
                    owner_filter,
                    models.URLItem.original_url == raw_url,
                    models.URLItem.is_active == True,
                    models.URLItem.expires_at == None,
                )
                .first()
            )
            if existing_url:
                return existing_url

        short_id = generate_short_id()
        while db.query(models.URLItem).filter(models.URLItem.short_id == short_id).first():
            short_id = generate_short_id()

    expires_at = None
    if url_data.expires_in_hours:
        expires_at = datetime.now(timezone.utc) + timedelta(hours=url_data.expires_in_hours)

    db_url = models.URLItem(
        original_url=raw_url,
        short_id=short_id,
        expires_at=expires_at,
        user_id=actor.user.id if actor.user is not None else None,
        guest_id=actor.guest_id if actor.is_guest else None,
    )
    db.add(db_url)
    db.commit()
    db.refresh(db_url)

    ttl = calculate_ttl_seconds(expires_at)
    redis_client.set(f"url:{short_id}", db_url.original_url, ex=ttl)
    return db_url


@router.patch("/api/urls/{short_id}/toggle", response_model=schemas.URLResponse)
def toggle_url_status(
    short_id: str,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    db_url = db.query(models.URLItem).filter(models.URLItem.short_id == short_id).first()
    if not db_url or not _owns_url(db_url, actor):
        raise HTTPException(status_code=404, detail="URL no encontrada")

    db_url.is_active = not db_url.is_active
    db.commit()
    db.refresh(db_url)

    if db_url.is_active:
        ttl = calculate_ttl_seconds(db_url.expires_at)
        redis_client.set(f"url:{short_id}", db_url.original_url, ex=ttl)
    else:
        redis_client.delete(f"url:{short_id}")

    return db_url


@router.delete("/api/urls/{short_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_url(
    short_id: str,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    db_url = db.query(models.URLItem).filter(models.URLItem.short_id == short_id).first()
    if not db_url or not _owns_url(db_url, actor):
        raise HTTPException(status_code=404, detail="URL no encontrada")

    db.delete(db_url)
    db.commit()
    redis_client.delete(f"url:{short_id}")
    return None


@router.get("/api/urls/{short_id}/analytics")
def get_url_analytics(
    short_id: str,
    actor: Actor = Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    db_url = db.query(models.URLItem).filter(models.URLItem.short_id == short_id).first()
    if not db_url or not _owns_url(db_url, actor):
        raise HTTPException(status_code=404, detail="URL no encontrada")

    events = (
        db.query(models.ClickEvent)
        .filter(models.ClickEvent.url_id == db_url.id)
        .order_by(models.ClickEvent.id.desc())
        .limit(50)
        .all()
    )
    return {
        "short_id": db_url.short_id,
        "clicks": db_url.clicks,
        "events": [
            {
                "id": e.id,
                "clicked_at": e.clicked_at,
                "user_agent": e.user_agent,
                "referer": e.referer,
            }
            for e in events
        ],
    }


@router.get("/{short_id}")
def redirect_to_target(
    short_id: str,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user_agent = request.headers.get("user-agent", "Desconocido")
    referer = request.headers.get("referer", "Directo")

    cached_url = redis_client.get(f"url:{short_id}")
    if cached_url:
        background_tasks.add_task(record_click_bg, short_id, user_agent, referer)
        return RedirectResponse(url=cached_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)

    db_url = db.query(models.URLItem).filter(models.URLItem.short_id == short_id).first()
    if not db_url:
        raise HTTPException(status_code=404, detail="URL no encontrada")

    if not db_url.is_active:
        raise HTTPException(status_code=410, detail="Este enlace ha sido pausado por su propietario.")

    if db_url.expires_at:
        exp = (
            db_url.expires_at.replace(tzinfo=timezone.utc)
            if db_url.expires_at.tzinfo is None
            else db_url.expires_at
        )
        if datetime.now(timezone.utc) >= exp:
            raise HTTPException(status_code=410, detail="Este enlace ha expirado.")

    ttl = calculate_ttl_seconds(db_url.expires_at)
    redis_client.set(f"url:{short_id}", db_url.original_url, ex=ttl)
    background_tasks.add_task(record_click_bg, short_id, user_agent, referer)

    return RedirectResponse(url=db_url.original_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)