from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from backend.api.auth import router as auth_router
from backend.api.gmail import router as gmail_router
from backend.api.applications import router as applications_router
from backend.api.companies import router as companies_router
from backend.api.recruiters import router as recruiters_router
from backend.api.brain import router as brain_router
from backend.database.base import Base
from backend.database.database import engine
from backend.core.config import settings
import backend.models
import backend.app.brain.memory
from sqlalchemy import inspect, text

# Validate configuration on startup
settings.validate()

app = FastAPI()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."},
    )

app.include_router(auth_router)
app.include_router(gmail_router)
app.include_router(applications_router)
app.include_router(companies_router)
app.include_router(recruiters_router)
app.include_router(brain_router)

Base.metadata.create_all(bind=engine)


def ensure_company_id_column():
    inspector = inspect(engine)
    if "applications" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("applications")]
        if "company_id" not in columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE applications ADD COLUMN company_id INTEGER"))


def ensure_recruiter_id_column():
    inspector = inspect(engine)
    if "applications" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("applications")]
        if "recruiter_id" not in columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE applications ADD COLUMN recruiter_id INTEGER"))


ensure_company_id_column()
ensure_recruiter_id_column()

@app.get("/")
def read_root():
    return {"message": "Atlas Backend is running!"}
