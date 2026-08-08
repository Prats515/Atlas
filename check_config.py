from backend.core.config import settings
print(f"GOOGLE_CLIENT_ID: '{settings.GOOGLE_CLIENT_ID}'")
print(f"GOOGLE_CLIENT_SECRET: '{settings.GOOGLE_CLIENT_SECRET}'")
try:
    settings.validate()
    print("Settings validated successfully")
except Exception as e:
    print(f"Validation failed: {e}")
