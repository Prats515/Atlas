import os
from google_auth_oauthlib.flow import Flow
print(f"OAUTHLIB_INSECURE_TRANSPORT: {os.environ.get('OAUTHLIB_INSECURE_TRANSPORT')}")
flow = Flow.from_client_config(
    {"web": {"client_id": "dummy", "client_secret": "dummy", "auth_uri": "https://auth", "token_uri": "https://token"}},
    scopes=[],
    redirect_uri="http://localhost"
)
try:
    # This should trigger an error if insecure transport is not allowed
    flow.fetch_token(authorization_response="http://localhost/callback?code=dummy")
except Exception as e:
    print(f"Caught expected error: {e}")
