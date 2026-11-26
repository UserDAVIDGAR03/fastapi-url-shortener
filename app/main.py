from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.auth import create_access_token, hash_password, verify_password
from app.database import Base, engine, get_db
from app.models import User
from app.schemas import AuthResponse, UserLogin, UserRegister
from app import routes

Base.metadata.create_all(bind=engine)

# Asegura columnas user_id y guest_id si la tabla urls ya existía
with engine.begin() as conn:
    conn.execute(text("ALTER TABLE urls ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"))
    conn.execute(text("ALTER TABLE urls ADD COLUMN IF NOT EXISTS guest_id VARCHAR(64)"))

app = FastAPI(title="Fast URL Shortener")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    normalized_email = payload.email.strip().lower()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta registrada con ese correo.",
        )

    user = User(
        email=normalized_email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, user.email)
    return AuthResponse(access_token=token, email=user.email)


@app.post("/auth/login", response_model=AuthResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    normalized_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
        )

    token = create_access_token(user.id, user.email)
    return AuthResponse(access_token=token, email=user.email)


app.include_router(routes.router)