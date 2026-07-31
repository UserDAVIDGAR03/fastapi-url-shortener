import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Cargar variables del archivo .env
load_dotenv()

# Si no hay una URL de base de datos definida, por defecto usa SQLite local
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./shortener.db")

# Configurar el motor de la base de datos (con soporte especial si es SQLite o PostgreSQL)
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependencia de sesión de base de datos para FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()