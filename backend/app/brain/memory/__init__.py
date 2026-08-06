from typing import Any

from backend.app.brain.events import EMAIL_SYNCED, event_bus
from backend.database.database import SessionLocal
from backend.models.email import Email
from .service import memory_service

__all__ = ["MemoryRecord", "MemoryService", "memory_service"]


def _handle_email_synced(event_name: str, payload: Any) -> None:
    if not isinstance(payload, dict):
        return

    email_id = payload.get("email_id")
    if email_id is None:
        return

    with SessionLocal() as db:
        email = db.query(Email).filter(Email.id == email_id).first()
        if not email:
            return

        memory_service.create_memory(
            "email",
            email.id,
            email.subject or "",
            email.subject or "",
            email.sender or "",
            email.received_at or "",
        )


event_bus.subscribe(EMAIL_SYNCED, _handle_email_synced)
