from typing import List

from sqlalchemy.orm import Session

from backend.models.recruiter import Recruiter


def create_recruiter(db: Session, recruiter_data: dict) -> Recruiter:
    recruiter = Recruiter(**recruiter_data)
    db.add(recruiter)
    db.commit()
    db.refresh(recruiter)
    return recruiter


def update_recruiter(db: Session, recruiter_id: int, recruiter_data: dict) -> Recruiter | None:
    recruiter = db.query(Recruiter).filter(Recruiter.id == recruiter_id).first()
    if not recruiter:
        return None
    for field, value in recruiter_data.items():
        setattr(recruiter, field, value)
    db.add(recruiter)
    db.commit()
    db.refresh(recruiter)
    return recruiter


def delete_recruiter(db: Session, recruiter_id: int) -> bool:
    recruiter = db.query(Recruiter).filter(Recruiter.id == recruiter_id).first()
    if not recruiter:
        return False
    db.delete(recruiter)
    db.commit()
    return True


def get_recruiter_by_id(db: Session, recruiter_id: int) -> Recruiter | None:
    return db.query(Recruiter).filter(Recruiter.id == recruiter_id).first()


def list_recruiters(db: Session) -> List[Recruiter]:
    return db.query(Recruiter).order_by(Recruiter.created_at.desc()).all()
