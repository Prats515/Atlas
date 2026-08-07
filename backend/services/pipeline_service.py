from sqlalchemy.orm import Session
from backend.models.application import Application
from backend.models.company import Company
from backend.models.recruiter import Recruiter
from backend.models.email import Email

def update_application_pipeline(db: Session, email: Email, analysis: dict):
    if analysis.get("classification") not in ["Recruiter", "Job Application", "Interview", "Offer", "Rejection"]:
        return

    company_name = analysis.get("company_name")
    if not company_name:
        return

    # Find or create company
    company = db.query(Company).filter(Company.name.ilike(company_name)).first()
    if not company:
        company = Company(name=company_name)
        db.add(company)
        db.commit()
        db.refresh(company)

    # Find or create application
    application = db.query(Application).filter(
        Application.company_name.ilike(company_name)
    ).first()

    if not application:
        application = Application(
            company_name=company.name,
            job_title=analysis.get("job_title"),
            application_status=analysis.get("classification"),
            source_email_id=email.id
        )
        db.add(application)
    else:
        # Update status if new status is "later" in pipeline
        application.application_status = analysis.get("classification")
        application.last_activity = email.created_at
        
    db.commit()
    db.refresh(application)
