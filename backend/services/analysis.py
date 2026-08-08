import json
import logging
import google.generativeai as genai
from sqlalchemy.orm import Session
from backend.core.config import settings
from backend.models.email import Email

logger = logging.getLogger("backend")
genai.configure(api_key=settings.GEMINI_API_KEY)

def analyze_email(db: Session, email: Email) -> dict:
    try:
        prompt = f"""
        Analyze the following email:
        Sender: {email.sender}
        Subject: {email.subject}
        Snippet: {email.snippet}

        Classify into: Recruiter, Job Application, Interview, Offer, Rejection, Company Update, Personal, Newsletter, Promotion, Finance, Other.
        Assign a priority score (0-100).
        Provide a one-line summary.
        Provide a detailed summary.
        Detect required actions (Reply, Apply, Schedule Interview, Upload Documents, Complete Assessment, Follow Up, Ignore, Other).
        Detect deadlines (ISO datetime format or null).
        Extract company name and recruiter name if available.
        Generate a professional reply if appropriate (or null).

        Return JSON with fields: classification, priority_score, summary_short, summary_long, action_required, deadline, company_name, recruiter_name, suggested_reply, job_title, location.
        """
        
        model = genai.GenerativeModel("gemini-1.5-flash", generation_config={"response_mime_type": "application/json"})
        response = model.generate_content(prompt)
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Failed to analyze email {email.id}: {e}")
        return {"classification": "Other", "priority_score": 0}
