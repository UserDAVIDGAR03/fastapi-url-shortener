from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    urls = relationship("URLItem", back_populates="owner", cascade="all, delete-orphan")


class URLItem(Base):
    __tablename__ = "urls"

    id = Column(Integer, primary_key=True, index=True)
    short_id = Column(String(50), unique=True, index=True, nullable=False)
    original_url = Column(Text, nullable=False)
    clicks = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    guest_id = Column(String(64), nullable=True, index=True)

    owner = relationship("User", back_populates="urls")
    click_events = relationship("ClickEvent", back_populates="url_item", cascade="all, delete-orphan")


class ClickEvent(Base):
    __tablename__ = "click_events"

    id = Column(Integer, primary_key=True, index=True)
    url_id = Column(Integer, ForeignKey("urls.id", ondelete="CASCADE"), nullable=False, index=True)
    clicked_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    user_agent = Column(Text, nullable=True)
    referer = Column(Text, nullable=True)

    url_item = relationship("URLItem", back_populates="click_events")