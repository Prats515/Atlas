from enum import Enum
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.base import Base

class ApplicationSource(str, Enum):
    EMAIL = "email"
    MANUAL = "manual"

class ApplicationStatus(str, Enum):
    APPLIED = "applied"
    INTERVIEW = "interview"
    OFFER = "offer"
    REJECTED = "rejected"

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String, nullable=True)
    location = Column(String, nullable=True)
    application_status = Column(String, default="Applied")
    priority_score = Column(Integer, index=True, default=0)
    applied_date = Column(DateTime, nullable=True)
    last_activity = Column(DateTime, default=datetime.utcnow)
    next_deadline = Column(DateTime, index=True, nullable=True)
    
    source_email_id = Column(Integer, ForeignKey("emails.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    email = relationship("Email")
    user = relationship("User", back_populates="applications")
    company = relationship("Company", back_populates="applications")
    recruiter = relationship("Recruiter", back_populates="applications")
