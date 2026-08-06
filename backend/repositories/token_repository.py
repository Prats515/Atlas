"""Repository for storing user OAuth tokens."""

from sqlalchemy.orm import Session

from backend.models.token import Token


def get_token_by_user_id(db: Session, user_id: int) -> Token | None:
    return db.query(Token).filter(Token.user_id == user_id).first()


def update_token_history_id(db: Session, user_id: int, history_id: str) -> Token | None:
    token = get_token_by_user_id(db, user_id)
    if token:
        token.history_id = history_id
        db.add(token)
        db.commit()
        db.refresh(token)
    return token


def create_or_update_token(db: Session, user_id: int, token_data: dict) -> Token:
    token = get_token_by_user_id(db, user_id)
    if token:
        token.access_token = token_data.get("access_token")
        token.refresh_token = token_data.get("refresh_token")
        token.scope = token_data.get("scope")
        token.token_type = token_data.get("token_type")
        token.expiry = token_data.get("expiry")
        token.history_id = token_data.get("history_id")
        db.add(token)
        db.commit()
        db.refresh(token)
        return token

    token = Token(
        user_id=user_id,
        access_token=token_data.get("access_token"),
        refresh_token=token_data.get("refresh_token"),
        scope=token_data.get("scope"),
        token_type=token_data.get("token_type"),
        expiry=token_data.get("expiry"),
        history_id=token_data.get("history_id"),
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token
