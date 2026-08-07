"""Repository for storing Gmail email metadata."""

from sqlalchemy.orm import Session

from backend.models.email import Email


def get_email_by_gmail_message_id(db: Session, gmail_message_id: str):
    return db.query(Email).filter(Email.gmail_message_id == gmail_message_id).first()


def insert_email(db: Session, email_data: dict) -> Email:
    email = Email(**email_data)
    db.add(email)
    db.commit()
    db.refresh(email)
    return email


def bulk_insert_emails(db: Session, emails: list[dict]) -> list[int]:
    if not emails:
        return []
    existing_ids = {row[0] for row in db.query(Email.gmail_message_id).filter(Email.gmail_message_id.in_([e["gmail_message_id"] for e in emails])).all()}
    new_emails = [Email(**email_data) for email_data in emails if email_data["gmail_message_id"] not in existing_ids]
    if not new_emails:
        return []
    db.add_all(new_emails)
    db.commit()
    for email in new_emails:
        db.refresh(email)
    return [email.id for email in new_emails]


def update_email_labels(db: Session, gmail_message_id: str, label_ids: str) -> bool:
    email = get_email_by_gmail_message_id(db, gmail_message_id)
    if not email:
        return False
    email.label_ids = label_ids
    db.add(email)
    db.commit()
    db.refresh(email)
    return True


def update_email_analysis(db: Session, email_id: int, analysis_data: dict) -> bool:
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email:
        return False
    for key, value in analysis_data.items():
        if hasattr(email, key):
            setattr(email, key, value)
    db.add(email)
    db.commit()
    db.refresh(email)
    return True
