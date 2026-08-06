"""Repository helper for user persistence."""

from sqlalchemy.orm import Session

from backend.models.user import User


def create_or_update_user(db: Session, email: str, profile: dict) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.profile = profile
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    user = User(email=email, profile=profile)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
