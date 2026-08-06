"""Gmail API endpoints for fetching message previews and syncing metadata."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.services.gmail_service import fetch_latest_message_metadata, sync_latest_emails, sync_incremental_emails
from backend.repositories.token_repository import get_token_by_user_id
from backend.models.user import User

router = APIRouter(prefix="/gmail", tags=["gmail"])


@router.get("/test")
def gmail_test(email: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = get_token_by_user_id(db, user.id)
    if not token:
        raise HTTPException(status_code=404, detail="Gmail credentials not found")

    token_data = {
        "access_token": token.access_token,
        "refresh_token": token.refresh_token,
        "scope": token.scope,
        "token_type": token.token_type,
        "expiry": token.expiry,
    }

    messages = fetch_latest_message_metadata(token_data)
    return messages


@router.post("/sync")
def gmail_sync(email: str = Query(...), limit: int = Query(100, ge=1, le=500), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        stats = sync_latest_emails(db, user, limit=limit)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to sync Gmail messages: {exc}")

    return stats


@router.post("/sync/incremental")
def gmail_sync_incremental(email: str = Query(...), limit: int = Query(100, ge=1, le=500), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        stats = sync_incremental_emails(db, user, limit=limit)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to run incremental Gmail sync: {exc}")

    return stats
