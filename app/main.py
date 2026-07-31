from fastapi import FastAPI
from app.database import engine, Base
from app.routes import router

# Esto lee tus modelos y crea automáticamente el archivo de la base de datos SQLite
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Acortador de URLs API",
    description="API profunda para acortar enlaces y medir analíticas de clics.",
    version="1.0.0"
)

# Integrar las rutas que creamos en routes.py
app.include_router(router)