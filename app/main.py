from fastapi import FastAPI
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routes import router
from app.database import engine, Base

# Crear las tablas en SQLite al arrancar
Base.metadata.create_all(bind=engine)

# Configurar el Limitador de Peticiones por IP del cliente
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="URL Shortener & Analytics API",
    description="API robusta de acortador de URLs con almacenamiento en Redis, tareas en segundo plano y Rate Limiting.",
    version="1.0.0"
)

# Registrar el manejador de límite de peticiones
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Incluir las rutas de la API
app.include_router(router)

@app.get("/")
def read_root():
    return {"status": "online", "message": "API de Acortador de URLs activa"}