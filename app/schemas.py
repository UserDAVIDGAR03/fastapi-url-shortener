from pydantic import BaseModel, HttpUrl
from datetime import datetime

# Esquema de Entrada: Lo que el usuario nos manda al hacer POST
class URLCreate(BaseModel):
    original_url: HttpUrl # HttpUrl valida que sea un enlace web válido automáticamente

# Esquema de Salida: Lo que nosotros le respondemos al usuario
class URLInfo(BaseModel):
    original_url: str
    short_url: str
    clicks: int
    created_at: datetime

    # Esta configuración es necesaria para que Pydantic pueda leer
    # los datos directamente desde el modelo de SQLAlchemy (ORM)
    class Config:
        from_attributes = True