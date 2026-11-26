from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str


class URLCreate(BaseModel):
    original_url: str
    custom_slug: str | None = None
    expires_in_hours: int | None = None


class URLResponse(BaseModel):
    id: int
    short_id: str
    original_url: str
    clicks: int
    is_active: bool
    expires_at: datetime | None = None
    created_at: datetime

    class Config:
        from_attributes = True