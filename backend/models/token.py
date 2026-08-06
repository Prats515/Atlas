"""Token model storing Gmail OAuth tokens securely."""

from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from backend.database.base import Base


class Token(Base):
    __tablename__ = "tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=True)
    scope = Column(String, nullable=True)
    token_type = Column(String, nullable=True)
    expiry = Column(String, nullable=True)
    history_id = Column(String, nullable=True)

    user = relationship("User", back_populates="token")
