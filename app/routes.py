import uuid
import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import URLItem
from app.schemas import URLCreate, URLInfo

router = APIRouter()
BASE_URL = os.getenv("BASE_URL")

@router.post("/api/shorten", response_model=URLInfo, status_code=status.HTTP_201_CREATED)
def create_short_url(url_data: URLCreate, db: Session = Depends(get_db)):
    # 1. Generar un identificador corto y único
    short_id = str(uuid.uuid4())[:6]
    
    # 2. Verificar que no exista una colisión (que el ID no esté repetido)
    while db.query(URLItem).filter(URLItem.short_id == short_id).first():
        short_id = str(uuid.uuid4())[:6]

    # 3. Guardar en la base de datos
    db_url = URLItem(original_url=str(url_data.original_url), short_id=short_id)
    db.add(db_url)
    db.commit()
    db.refresh(db_url)

    # 4. Devolver la respuesta con el formato de URLInfo
    return URLInfo(
        original_url=db_url.original_url,
        short_url=f"{BASE_URL}/{db_url.short_id}",
        clicks=db_url.clicks,
        created_at=db_url.created_at
    )

@router.get("/{short_id}")
def redirect_to_original(short_id: str, db: Session = Depends(get_db)):
    # 1. Buscar la URL en la base de datos
    db_url = db.query(URLItem).filter(URLItem.short_id == short_id).first()
    
    if not db_url:
        raise HTTPException(status_code=404, detail="URL no encontrada")
    
    # 2. Registrar el clic sumando 1 al contador
    db_url.clicks += 1
    db.commit()
    
    # 3. Redirigir al usuario a la página original
    return RedirectResponse(url=db_url.original_url)