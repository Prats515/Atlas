from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.models.application import ApplicationSource, ApplicationStatus
from backend.repositories.application_repository import (
    create_application,
    delete_application,
    filter_applications_by_company,
    filter_applications_by_status,
    get_application_by_id,
    list_applications,
    update_application,
)
from backend.repositories.company_repository import get_company_by_id as get_company_by_id_repo
from backend.repositories.recruiter_repository import get_recruiter_by_id as get_recruiter_by_id_repo

router = APIRouter(prefix="/applications", tags=["applications"])


class ApplicationCreate(BaseModel):
    user_id: int
    company_id: int
    recruiter_id: Optional[int] = None
    position: str = Field(..., min_length=1)
    status: ApplicationStatus
    source: ApplicationSource
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    applied_date: Optional[datetime] = None
    last_updated: Optional[datetime] = None
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    company_id: Optional[int] = None
    recruiter_id: Optional[int] = None
    position: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    source: Optional[ApplicationSource] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    applied_date: Optional[datetime] = None
    last_updated: Optional[datetime] = None
    notes: Optional[str] = None


class ApplicationRead(BaseModel):
    id: int
    user_id: int
    company_id: Optional[int]
    company_name: Optional[str]
    recruiter_id: Optional[int]
    position: str
    status: ApplicationStatus
    source: ApplicationSource
    recruiter_name: Optional[str]
    recruiter_email: Optional[str]
    applied_date: Optional[datetime]
    last_updated: Optional[datetime]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


@router.post("/", response_model=ApplicationRead, status_code=201)
def create_application_endpoint(
    application_in: ApplicationCreate,
    db: Session = Depends(get_db),
):
    company = get_company_by_id_repo(db, application_in.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    application_data = application_in.dict(exclude_unset=True)
    application_data["company_name"] = company.name

    if application_data.get("recruiter_id") is not None:
        recruiter = get_recruiter_by_id_repo(db, application_data["recruiter_id"])
        if not recruiter:
            raise HTTPException(status_code=404, detail="Recruiter not found")
        application_data["recruiter_name"] = recruiter.name
        application_data["recruiter_email"] = recruiter.email

    application = create_application(db, application_data)
    return application


@router.get("/", response_model=List[ApplicationRead])
def list_application_endpoint(
    status: Optional[ApplicationStatus] = Query(None),
    company: Optional[str] = Query(None, min_length=1),
    source: Optional[ApplicationSource] = Query(None),
    db: Session = Depends(get_db),
):
    if status is not None:
        return filter_applications_by_status(db, status)
    if company is not None:
        return filter_applications_by_company(db, company)
    if source is not None:
        return list_applications(db, source=source)
    return list_applications(db)


@router.get("/{application_id}", response_model=ApplicationRead)
def get_application_endpoint(
    application_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
):
    application = get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.patch("/{application_id}", response_model=ApplicationRead)
def update_application_endpoint(
    application_id: int = Path(..., ge=1),
    application_in: ApplicationUpdate = None,
    db: Session = Depends(get_db),
):
    application = get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    update_data = application_in.dict(exclude_unset=True)
    if update_data.get("company_id") is not None:
        company = get_company_by_id_repo(db, update_data["company_id"])
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        update_data["company_name"] = company.name

    if update_data.get("recruiter_id") is not None:
        recruiter = get_recruiter_by_id_repo(db, update_data["recruiter_id"])
        if not recruiter:
            raise HTTPException(status_code=404, detail="Recruiter not found")
        update_data["recruiter_name"] = recruiter.name
        update_data["recruiter_email"] = recruiter.email

    updated = update_application(db, application_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Application not found")
    return updated


@router.delete("/{application_id}", status_code=204)
def delete_application_endpoint(
    application_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
):
    deleted = delete_application(db, application_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Application not found")
    return None
