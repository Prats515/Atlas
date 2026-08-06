from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.models.recruiter import Recruiter
from backend.repositories.company_repository import get_company_by_id
from backend.repositories.recruiter_repository import (
    create_recruiter,
    delete_recruiter,
    get_recruiter_by_id,
    list_recruiters,
    update_recruiter,
)

router = APIRouter(prefix="/recruiters", tags=["recruiters"])


class RecruiterCreate(BaseModel):
    company_id: int
    name: str = Field(..., min_length=1)
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    designation: Optional[str] = None
    notes: Optional[str] = None


class RecruiterUpdate(BaseModel):
    company_id: Optional[int] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    designation: Optional[str] = None
    notes: Optional[str] = None


class RecruiterRead(BaseModel):
    id: int
    company_id: int
    name: str
    email: Optional[str]
    phone: Optional[str]
    linkedin_url: Optional[str]
    designation: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


@router.post("/", response_model=RecruiterRead, status_code=201)
def create_recruiter_endpoint(
    recruiter_in: RecruiterCreate,
    db: Session = Depends(get_db),
):
    company = get_company_by_id(db, recruiter_in.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    recruiter = create_recruiter(db, recruiter_in.dict(exclude_unset=True))
    return recruiter


@router.get("/", response_model=List[RecruiterRead])
def list_recruiters_endpoint(db: Session = Depends(get_db)):
    return list_recruiters(db)


@router.get("/{recruiter_id}", response_model=RecruiterRead)
def get_recruiter_endpoint(
    recruiter_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
):
    recruiter = get_recruiter_by_id(db, recruiter_id)
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    return recruiter


@router.patch("/{recruiter_id}", response_model=RecruiterRead)
def update_recruiter_endpoint(
    recruiter_id: int = Path(..., ge=1),
    recruiter_in: RecruiterUpdate = None,
    db: Session = Depends(get_db),
):
    recruiter = get_recruiter_by_id(db, recruiter_id)
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    update_data = recruiter_in.dict(exclude_unset=True)
    if update_data.get("company_id") is not None:
        company = get_company_by_id(db, update_data["company_id"])
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
    updated = update_recruiter(db, recruiter_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    return updated


@router.delete("/{recruiter_id}", status_code=204)
def delete_recruiter_endpoint(
    recruiter_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
):
    deleted = delete_recruiter(db, recruiter_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    return None
