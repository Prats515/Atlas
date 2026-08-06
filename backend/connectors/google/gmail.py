"""Google Gmail API connector utilities."""

from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

from backend.core.config import settings


def build_gmail_credentials(token_data: dict) -> Credentials:
    return Credentials(
        token=token_data.get("access_token"),
        refresh_token=token_data.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        scopes=["https://www.googleapis.com/auth/gmail.readonly"],
    )


def refresh_credentials(creds: Credentials) -> Credentials:
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    return creds


def get_user_profile(creds: Credentials) -> dict:
    service = build("gmail", "v1", credentials=creds)
    profile = service.users().getProfile(userId="me").execute()
    return profile


def list_labels(creds: Credentials) -> list[dict]:
    service = build("gmail", "v1", credentials=creds)
    labels = service.users().labels().list(userId="me").execute().get("labels", [])
    return labels


def fetch_latest_messages(creds: Credentials, max_results: int = 10) -> list[dict]:
    service = build("gmail", "v1", credentials=creds)
    message_list = service.users().messages().list(userId="me", maxResults=max_results).execute()
    messages = []
    for item in message_list.get("messages", []):
        msg = service.users().messages().get(
            userId="me",
            id=item["id"],
            format="metadata",
            metadataHeaders=["Subject", "From", "Date"],
        ).execute()
        payload = {header["name"]: header["value"] for header in msg.get("payload", {}).get("headers", [])}
        messages.append({
            "subject": payload.get("Subject", ""),
            "sender": payload.get("From", ""),
            "received_date": payload.get("Date", ""),
        })
    return messages
