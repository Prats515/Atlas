from datetime import datetime
from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SQLEnum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from backend.database.base import Base


class ApplicationStatus(str, Enum):
    APPLIED = "APPLIED"
    SCREENING = "SCREENING"
    INTERVIEW = "INTERVIEW"
    ASSESSMENT = "ASSESSMENT"
    OFFER = "OFFER"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"


class ApplicationSource(str, Enum):
    LINKEDIN = "LinkedIn"
    NAUKRI = "Naukri"
    INDEED = "Indeed"
    REFERRAL = "Referral"
    CAREER_PAGE = "Career Page"
    OTHER = "Other"


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    company_name = Column(String, nullable=True)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id"), nullable=True)
    position = Column(String, nullable=False)
    status = Column(SQLEnum(ApplicationStatus, name="application_status"), nullable=False)
    source = Column(SQLEnum(ApplicationSource, name="application_source"), nullable=False)
    recruiter_name = Column(String, nullable=True)
    recruiter_email = Column(String, nullable=True)
    applied_date = Column(DateTime, nullable=True)
    last_updated = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="applications")
    company = relationship("Company", back_populates="applications")
    recruiter = relationship("Recruiter", back_populates="applications")
