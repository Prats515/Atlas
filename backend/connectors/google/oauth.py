"""Google OAuth utilities using the official OAuth client libraries."""

from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from google.auth.transport import requests

from backend.core.config import settings

SCOPES = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/gmail.readonly",
]

CLIENT_CONFIG = {
    "web": {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": [settings.GOOGLE_OAUTH_REDIRECT_URI],
    }
}


def create_flow():
    return Flow.from_client_config(
        CLIENT_CONFIG,
        scopes=SCOPES,
        redirect_uri=settings.GOOGLE_OAUTH_REDIRECT_URI,
    )


def get_authorization_url():
    flow = create_flow()
    auth_url, _ = flow.authorization_url(prompt="consent", access_type="offline", include_granted_scopes="true")
    return auth_url


def fetch_token(state: str, authorization_response: str):
    flow = create_flow()
    if state:
        flow.state = state
    flow.fetch_token(authorization_response=authorization_response)
    return flow.credentials


def parse_id_token(id_token_str: str):
    request = requests.Request()
    return id_token.verify_oauth2_token(id_token_str, request, settings.GOOGLE_CLIENT_ID)
