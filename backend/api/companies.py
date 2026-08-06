from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.models.company import Company
from backend.repositories.company_repository import (
    create_company,
    delete_company,
    get_company_by_id,
    get_company_by_name,
    list_companies,
    update_company,
)

router = APIRouter(prefix="/companies", tags=["companies"])


class CompanyCreate(BaseModel):
    name: str = Field(..., min_length=1)
    website: Optional[str] = None
    industry: Optional[str] = None
    career_page: Optional[str] = None
    linkedin_url: Optional[str] = None
    location: Optional[str] = None


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    career_page: Optional[str] = None
    linkedin_url: Optional[str] = None
    location: Optional[str] = None


class CompanyRead(BaseModel):
    id: int
    name: str
    website: Optional[str]
    industry: Optional[str]
    career_page: Optional[str]
    linkedin_url: Optional[str]
    location: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


@router.post("/", response_model=CompanyRead, status_code=201)
def create_company_endpoint(
    company_in: CompanyCreate,
    db: Session = Depends(get_db),
):
    existing = get_company_by_name(db, company_in.name)
    if existing:
        raise HTTPException(status_code=400, detail="Company already exists")
    company = create_company(db, company_in.dict(exclude_unset=True))
    return company


@router.get("/", response_model=List[CompanyRead])
def list_companies_endpoint(db: Session = Depends(get_db)):
    return list_companies(db)


@router.get("/{company_id}", response_model=CompanyRead)
def get_company_endpoint(
    company_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
):
    company = get_company_by_id(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.patch("/{company_id}", response_model=CompanyRead)
def update_company_endpoint(
    company_id: int = Path(..., ge=1),
    company_in: CompanyUpdate = None,
    db: Session = Depends(get_db),
):
    company = get_company_by_id(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    updated = update_company(db, company_id, company_in.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Company not found")
    return updated


@router.delete("/{company_id}", status_code=204)
def delete_company_endpoint(
    company_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
):
    deleted = delete_company(db, company_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Company not found")
    return None
