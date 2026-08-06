from fastapi import APIRouter, Depends
from pydantic import BaseModel
import google.generativeai as genai
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import datetime, timedelta

from backend.core.config import settings
from backend.database.database import get_db
from backend.models.email import Email
from backend.models.company import Company
from backend.models.recruiter import Recruiter
from backend.models.application import Application

router = APIRouter(prefix="/brain", tags=["brain"])

genai.configure(api_key=settings.GEMINI_API_KEY)

class ChatRequest(BaseModel):
    message: str

def _get_gemini_response(prompt: str) -> str:
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        system_instructions = (
            "You are Atlas, the user's personal AI assistant. "
            "Answer ONLY using the supplied context. "
            "Never invent facts. "
            "If the answer cannot be determined from the supplied information, clearly say that there is insufficient information. "
            "\n\nWhenever possible:\n"
            "- Explain which email(s) or application(s) support your answer.\n"
            "- Mention company names.\n"
            "- Mention recruiter names if available.\n"
            "- Mention dates when relevant.\n"
            "- Keep responses concise.\n"
            "- Prefer bullet points for multiple findings.\n"
            "\nIf multiple possible answers exist, state the uncertainty."
        )
        
        response = model.generate_content(
            f"{system_instructions}\n\n{prompt}"
        )
        return response.text
    except Exception:
        return "Sorry, Atlas couldn't reach the AI service."

def _get_date_range(msg: str):
    now = datetime.utcnow()
    msg = msg.lower()

    if "today" in msg:
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return start, now
    if "yesterday" in msg:
        start = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        end = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return start, end
    if "this week" in msg:
        start = now - timedelta(days=now.weekday())
        return start.replace(hour=0, minute=0, second=0, microsecond=0), now
    if "last week" in msg:
        start = now - timedelta(days=now.weekday() + 7)
        end = start + timedelta(days=7)
        return start.replace(hour=0, minute=0, second=0, microsecond=0), end.replace(hour=0, minute=0, second=0, microsecond=0)
    if "last 7 days" in msg:
        start = now - timedelta(days=7)
        return start, now
    if "this month" in msg:
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return start, now
    if "last month" in msg:
        # Simple approximation for last month
        first_day_curr = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end = first_day_curr - timedelta(seconds=1)
        start = end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return start, end
    return None, None

def _detect_intent(msg: str) -> str:
    if any(kw in msg for kw in ["summarize", "summary"]): return "summary"
    if any(kw in msg for kw in ["recruiter", "recruiting", "talent"]): return "recruiter_search"
    if any(kw in msg for kw in ["interview", "onsite", "screening"]): return "interview_search"
    if "offer" in msg: return "offer_search"
    if any(kw in msg for kw in ["today", "yesterday", "who emailed"]): return "sender_list"
    if any(kw in msg for kw in ["application", "applied", "status", "pending", "rejected", "accepted", "interview"]): return "application_search"
    return "generic_chat"

@router.post("/chat")
def chat(request: ChatRequest, db: Session = Depends(get_db)) -> dict:
    msg = request.message.lower()
    intent = _detect_intent(msg)
    start_date, end_date = _get_date_range(msg)
    
    # 1. Resolve Entities
    matched_companies = db.query(Company).filter(or_(Company.name.ilike(f"%{kw}%") for kw in msg.split() if len(kw) > 3)).all()
    matched_recruiters = db.query(Recruiter).filter(or_(Recruiter.name.ilike(f"%{kw}%") for kw in msg.split() if len(kw) > 3)).all()
    
    print(f"Detected intent: {intent}, Date range: {start_date} to {end_date}")
    
    # 2. Build structured context (Emails + optional Applications)
    query = db.query(Email)
    if start_date and end_date:
        query = query.filter(Email.created_at >= start_date, Email.created_at <= end_date)
    
    # Entity filters for emails
    filters = []
    for company in matched_companies:
        filters.extend([Email.sender.ilike(f"%{company.name}%"), Email.subject.ilike(f"%{company.name}%"), Email.snippet.ilike(f"%{company.name}%")])
    for recruiter in matched_recruiters:
        filters.extend([Email.sender.ilike(f"%{recruiter.name}%"), Email.subject.ilike(f"%{recruiter.name}%"), Email.snippet.ilike(f"%{recruiter.name}%")])
        if recruiter.email: filters.append(Email.sender.ilike(f"%{recruiter.email}%"))

    # Intent-specific email filters
    if not filters:
        if intent == "recruiter_search": filters.append(or_(Email.sender.ilike("%recruiter%"), Email.subject.ilike("%recruiter%"), Email.snippet.ilike("%recruiter%")))
        elif intent == "interview_search": filters.append(or_(Email.sender.ilike("%interview%"), Email.subject.ilike("%interview%"), Email.snippet.ilike("%interview%")))
        elif intent == "offer_search": filters.append(or_(Email.sender.ilike("%offer%"), Email.subject.ilike("%offer%"), Email.snippet.ilike("%offer%")))
        elif intent != "summary":
            keywords = [word for word in msg.split() if len(word) > 3]
            for kw in keywords:
                filters.extend([Email.sender.ilike(f"%{kw}%"), Email.subject.ilike(f"%{kw}%"), Email.snippet.ilike(f"%{kw}%")])
    
    if filters: query = query.filter(or_(*filters))
    # 4. Fetch matched emails
    emails = query.order_by(Email.created_at.desc()).limit(10).all()

    # Structured context building
    context_parts = []

    # Application context
    if intent == "application_search":
        app_query = db.query(Application)
        if matched_companies: app_query = app_query.filter(Application.company_id.in_([c.id for c in matched_companies]))
        applications = app_query.all()
        if applications:
            apps_context = "=== APPLICATIONS ===\n\n"
            for app in applications:
                apps_context += f"- Company: {app.company.name if app.company else 'N/A'}\n"
                apps_context += f"  Status: {app.status}\n"
                apps_context += f"  Applied Date: {app.applied_date or 'N/A'}\n"
                apps_context += f"  Recruiter: {app.recruiter.name if app.recruiter else 'N/A'}\n"
                apps_context += f"  Source: {app.source}\n"
                if app.notes:
                    apps_context += f"  Notes: {app.notes}\n"
                apps_context += "\n"
            context_parts.append(apps_context)

    # Email context
    if emails:
        emails_context = "=== EMAILS ===\n\n"
        for email in emails:
            emails_context += f"- Sender: {email.sender or 'Unknown'}\n"
            emails_context += f"  Subject: {email.subject or 'No Subject'}\n"
            emails_context += f"  Date: {email.received_at or 'Unknown'}\n"
            emails_context += f"  Snippet: {email.snippet or 'No snippet'}\n\n"
        context_parts.append(emails_context)

    # 6. Build prompt
    prompt = "\n".join(context_parts)
    prompt += f"\n=== USER QUESTION ===\n\n{request.message}"

    return {"reply": _get_gemini_response(prompt)}

@router.post("/inbox-intelligence")
def inbox_intelligence(db: Session = Depends(get_db)) -> dict:
    # 1. Fetch recent emails (last 20 for broader context)
    recent_emails = db.query(Email).order_by(Email.created_at.desc()).limit(20).all()
    
    # 2. Format emails
    email_context = "=== EMAILS ===\n\n"
    for email in recent_emails:
        email_context += f"- Sender: {email.sender or 'Unknown'}\n"
        email_context += f"  Subject: {email.subject or 'No Subject'}\n"
        email_context += f"  Date: {email.received_at or 'Unknown'}\n"
        email_context += f"  Snippet: {email.snippet or 'No snippet'}\n\n"
    
    # 3. Build prompt
    prompt = f"{email_context}\n=== TASK ===\n\nProvide an inbox summary including: Total recent emails, Recruiter emails, Interview-related emails, Offer-related emails, Assessment emails, Follow-up candidates, High-priority emails, and Suggested next actions based on the provided emails."
    
    return {"summary": _get_gemini_response(prompt)}

@router.post("/suggest-reply")
def suggest_reply(email_id: int, db: Session = Depends(get_db)) -> dict:
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email:
        return {"error": "Email not found"}
    
    prompt = f"Write a professional, concise email reply to the following email:\nSender: {email.sender}\nSubject: {email.subject}\nSnippet: {email.snippet}\n\nPreserve key details. Do not invent dates, names, or commitments. If information is missing, leave placeholders (e.g., [Date]). Return only the reply text."
    
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    return {"reply": response.text.strip()}
