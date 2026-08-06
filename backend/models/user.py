"""User model storing authenticated Google user email and profile."""

from sqlalchemy import Column, Integer, String, JSON
from sqlalchemy.orm import relationship

from backend.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    profile = Column(JSON, nullable=False)
    token = relationship("Token", back_populates="user", uselist=False)
    emails = relationship("Email", back_populates="user")
    applications = relationship("Application", back_populates="user")
