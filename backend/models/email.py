"""Email model storing Gmail metadata in the local database."""

from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from backend.database.base import Base


class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    gmail_message_id = Column(String, unique=True, index=True, nullable=False)
    thread_id = Column(String, index=True, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender = Column(String, nullable=True)
    subject = Column(String, nullable=True)
    snippet = Column(Text, nullable=True)
    received_at = Column(String, nullable=True)
    label_ids = Column(Text, nullable=True)
    internal_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # AI Analysis Fields
    classification = Column(String, nullable=True)
    priority_score = Column(Integer, index=True, nullable=True)
    summary_short = Column(String, nullable=True)
    summary_long = Column(Text, nullable=True)
    action_required = Column(String, nullable=True)
    deadline = Column(DateTime, index=True, nullable=True)
    company_name = Column(String, index=True, nullable=True)
    recruiter_name = Column(String, index=True, nullable=True)
    suggested_reply = Column(Text, nullable=True)

    user = relationship("User", back_populates="emails")
