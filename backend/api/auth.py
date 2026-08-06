"""Authentication router for Google OAuth login and callback."""

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from backend.connectors.google.oauth import get_authorization_url, fetch_token, parse_id_token
from backend.connectors.google.gmail import build_gmail_credentials, refresh_credentials
from backend.database.database import get_db
from backend.repositories.user_repository import create_or_update_user
from backend.repositories.token_repository import create_or_update_token
from backend.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/google/login")
def google_login(redirect: str = "/auth/success"):
    auth_url = get_authorization_url()
    response = RedirectResponse(url=auth_url)
    response.set_cookie(
        key="oauth_redirect",
        value=redirect,
        httponly=True,
        samesite="lax",
    )
    return response


@router.get("/google/callback")
def google_callback(request: Request, db: Session = Depends(get_db)):
    full_url = str(request.url)
    try:
        credentials = fetch_token(state=request.query_params.get("state"), authorization_response=full_url)
        user_info = parse_id_token(credentials.id_token)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Google OAuth failed: {exc}")

    user = create_or_update_user(db, email=user_info.get("email"), profile=user_info)
    token_data = {
        "access_token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "scope": credentials.scopes and " ".join(credentials.scopes),
        "token_type": credentials.token_uri,
        "expiry": credentials.expiry.isoformat() if credentials.expiry else None,
    }
    create_or_update_token(db, user_id=user.id, token_data=token_data)

    redirect_path = request.cookies.get("oauth_redirect") or "/auth/success"
    frontend_url = settings.FRONTEND_URL

    response = RedirectResponse(url=f"{frontend_url}{redirect_path}?email={user.email}")
    response.delete_cookie("oauth_redirect")
    return response
