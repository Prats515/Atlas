from typing import List

from sqlalchemy.orm import Session

from backend.models.company import Company


def create_company(db: Session, company_data: dict) -> Company:
    company = Company(**company_data)
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def update_company(db: Session, company_id: int, company_data: dict) -> Company | None:
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        return None
    for field, value in company_data.items():
        setattr(company, field, value)
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def delete_company(db: Session, company_id: int) -> bool:
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        return False
    db.delete(company)
    db.commit()
    return True


def get_company_by_id(db: Session, company_id: int) -> Company | None:
    return db.query(Company).filter(Company.id == company_id).first()


def get_company_by_name(db: Session, name: str) -> Company | None:
    return db.query(Company).filter(Company.name == name).first()


def list_companies(db: Session) -> List[Company]:
    return db.query(Company).order_by(Company.name.asc()).all()
