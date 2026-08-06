from typing import List

from sqlalchemy.orm import Session

from backend.models.application import Application, ApplicationSource, ApplicationStatus


def create_application(db: Session, application_data: dict) -> Application:
    application = Application(**application_data)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def update_application(db: Session, application_id: int, application_data: dict) -> Application | None:
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        return None
    for field, value in application_data.items():
        setattr(application, field, value)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def delete_application(db: Session, application_id: int) -> bool:
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        return False
    db.delete(application)
    db.commit()
    return True


def get_application_by_id(db: Session, application_id: int) -> Application | None:
    return db.query(Application).filter(Application.id == application_id).first()


def list_applications(db: Session, source: ApplicationSource | None = None) -> List[Application]:
    query = db.query(Application)
    if source is not None:
        query = query.filter(Application.source == source)
    return query.order_by(Application.created_at.desc()).all()


def filter_applications_by_status(db: Session, status: ApplicationStatus) -> List[Application]:
    return db.query(Application).filter(Application.status == status).order_by(Application.created_at.desc()).all()


def filter_applications_by_company(db: Session, company: str) -> List[Application]:
    return db.query(Application).filter(Application.company_name.ilike(f"%{company}%")).order_by(Application.created_at.desc()).all()
