from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.base import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=True)
    job_title = Column(String, nullable=True)
    recruiter_name = Column(String, nullable=True)
    recruiter_email = Column(String, nullable=True)
    location = Column(String, nullable=True)
    application_status = Column(String, default="Applied")
    priority_score = Column(Integer, default=0)
    applied_date = Column(DateTime, nullable=True)
    last_activity = Column(DateTime, default=datetime.utcnow)
    next_deadline = Column(DateTime, nullable=True)
    source_email_id = Column(Integer, ForeignKey("emails.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    email = relationship("Email")
