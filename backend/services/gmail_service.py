"""Gmail service for fetching and syncing Gmail metadata."""

from datetime import datetime
from typing import Any

from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials

from backend.core.config import settings
from backend.app.brain.events import EMAIL_SYNCED, event_bus
from backend.repositories.email_repository import bulk_insert_emails, update_email_labels
from backend.repositories.token_repository import get_token_by_user_id, update_token_history_id
from backend.models.user import User


def _parse_expiry(expiry: str | None) -> datetime | None:
    if expiry is None:
        return None
    if isinstance(expiry, datetime):
        return expiry
    try:
        return datetime.fromisoformat(expiry)
    except ValueError:
        return None


def build_gmail_credentials(token_data: dict) -> Credentials:
    expiry = _parse_expiry(token_data.get("expiry"))
    return Credentials(
        token=token_data.get("access_token"),
        refresh_token=token_data.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        scopes=["https://www.googleapis.com/auth/gmail.readonly"],
        expiry=expiry,
    )


def refresh_credentials(creds: Credentials) -> Credentials:
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    return creds


def build_gmail_service(token_data: dict) -> Any:
    creds = build_gmail_credentials(token_data)
    creds = refresh_credentials(creds)
    return build("gmail", "v1", credentials=creds)


def _fetch_message_metadata(service: Any, message_id: str) -> dict:
    msg = service.users().messages().get(
        userId="me",
        id=message_id,
        format="metadata",
        metadataHeaders=["Subject", "From", "Date"],
    ).execute()
    payload = {header["name"]: header["value"] for header in msg.get("payload", {}).get("headers", [])}
    return {
        "gmail_message_id": msg.get("id"),
        "thread_id": msg.get("threadId"),
        "sender": payload.get("From", ""),
        "subject": payload.get("Subject", ""),
        "snippet": msg.get("snippet", ""),
        "received_at": payload.get("Date", ""),
        "label_ids": ",".join(msg.get("labelIds", [])),
        "internal_date": msg.get("internalDate", ""),
    }


def _get_current_history_id(service: Any) -> str | None:
    profile = service.users().getProfile(userId="me").execute() or {}
    history_id = profile.get("historyId")
    return str(history_id) if history_id is not None else None


def _fetch_history_entries(service: Any, start_history_id: str) -> tuple[list[dict], str | None]:
    histories: list[dict] = []
    latest_history_id = None
    request = service.users().history().list(userId="me", startHistoryId=start_history_id)
    while request is not None:
        response = request.execute() or {}
        latest_history_id = response.get("historyId") or latest_history_id
        histories.extend(response.get("history", []))
        next_page_token = response.get("nextPageToken")
        if next_page_token:
            request = service.users().history().list(
                userId="me",
                startHistoryId=start_history_id,
                pageToken=next_page_token,
            )
        else:
            request = None
    return histories, latest_history_id


def _collect_history_message_ids(histories: list[dict]) -> tuple[set[str], set[str]]:
    message_ids: set[str] = set()
    label_change_ids: set[str] = set()
    for history in histories:
        for entry in history.get("messagesAdded", []):
            message = entry.get("message")
            if message and message.get("id"):
                message_ids.add(message["id"])
        for entry in history.get("labelsAdded", []):
            message = entry.get("message")
            if message and message.get("id"):
                message_ids.add(message["id"])
                label_change_ids.add(message["id"])
        for entry in history.get("labelsRemoved", []):
            message = entry.get("message")
            if message and message.get("id"):
                message_ids.add(message["id"])
                label_change_ids.add(message["id"])
        # messagesDeleted is intentionally not processed for storage cleanup in this milestone.
    return message_ids, label_change_ids


def fetch_latest_message_metadata(token_data: dict, max_results: int = 100) -> list[dict]:
    service = build_gmail_service(token_data)
    message_list = service.users().messages().list(userId="me", maxResults=max_results).execute() or {}
    messages = []
    for item in message_list.get("messages", []):
        messages.append(_fetch_message_metadata(service, item["id"]))
    return messages


def sync_latest_emails(db, user: User, limit: int = 100) -> dict:
    token = get_token_by_user_id(db, user.id)
    if not token:
        raise ValueError("Gmail credentials not found for user")

    token_data = {
        "access_token": token.access_token,
        "refresh_token": token.refresh_token,
        "scope": token.scope,
        "token_type": token.token_type,
        "expiry": token.expiry,
    }

    messages = fetch_latest_message_metadata(token_data, max_results=limit)
    inserted_ids = bulk_insert_emails(db, [
        {
            "gmail_message_id": msg["gmail_message_id"],
            "thread_id": msg["thread_id"],
            "user_id": user.id,
            "sender": msg["sender"],
            "subject": msg["subject"],
            "snippet": msg["snippet"],
            "received_at": msg["received_at"],
            "label_ids": msg["label_ids"],
            "internal_date": msg["internal_date"],
        }
        for msg in messages
    ])
    for email_id in inserted_ids:
        # Trigger analysis
        email = db.query(Email).filter(Email.id == email_id).first()
        if email:
            analysis = analyze_email(db, email)
            update_email_analysis(db, email_id, analysis)
            update_application_pipeline(db, email, analysis)
        event_bus.publish(EMAIL_SYNCED, {"email_id": email_id})
    return {
        "downloaded": len(messages),
        "inserted": len(inserted_ids),
        "skipped": len(messages) - len(inserted_ids),
    }


def sync_incremental_emails(db, user: User, limit: int = 100) -> dict:
    token = get_token_by_user_id(db, user.id)
    if not token:
        raise ValueError("Gmail credentials not found for user")

    token_data = {
        "access_token": token.access_token,
        "refresh_token": token.refresh_token,
        "scope": token.scope,
        "token_type": token.token_type,
        "expiry": token.expiry,
    }

    service = build_gmail_service(token_data)
    if not token.history_id:
        stats = sync_latest_emails(db, user, limit=limit)
        history_id = _get_current_history_id(service)
        if history_id:
            update_token_history_id(db, user.id, history_id)
        return {
            "history_processed": 0,
            **stats,
        }

    try:
        histories, latest_history_id = _fetch_history_entries(service, token.history_id)
    except HttpError as exc:
        status = getattr(exc.resp, "status", None)
        if status in (404, 410):
            stats = sync_latest_emails(db, user, limit=limit)
            history_id = _get_current_history_id(service)
            if history_id:
                update_token_history_id(db, user.id, history_id)
            return {
                "history_processed": 0,
                **stats,
            }
        raise

    message_ids, label_change_ids = _collect_history_message_ids(histories)
    downloaded = 0
    inserted = 0

    if message_ids:
        metadata_list = [_fetch_message_metadata(service, message_id) for message_id in sorted(message_ids)]
        downloaded = len(metadata_list)
        inserted_ids = bulk_insert_emails(db, [
            {
                "gmail_message_id": msg["gmail_message_id"],
                "thread_id": msg["thread_id"],
                "user_id": user.id,
                "sender": msg["sender"],
                "subject": msg["subject"],
                "snippet": msg["snippet"],
                "received_at": msg["received_at"],
                "label_ids": msg["label_ids"],
                "internal_date": msg["internal_date"],
            }
            for msg in metadata_list
        ])
        for email_id in inserted_ids:
            # Trigger analysis
            email = db.query(Email).filter(Email.id == email_id).first()
            if email:
                analysis = analyze_email(db, email)
                update_email_analysis(db, email_id, analysis)
            event_bus.publish(EMAIL_SYNCED, {"email_id": email_id})
        inserted = len(inserted_ids)

    for message_id in sorted(label_change_ids):
        metadata = _fetch_message_metadata(service, message_id)
        update_email_labels(db, message_id, metadata["label_ids"])

    if latest_history_id:
        update_token_history_id(db, user.id, latest_history_id)

    return {
        "history_processed": len(histories),
        "downloaded": downloaded,
        "inserted": inserted,
        "skipped": downloaded - inserted,
    }
