from fastapi import APIRouter

from backend.app.brain.memory import memory_service

router = APIRouter(prefix="/brain", tags=["brain"])


def _normalize_company(sender: str) -> str | None:
    if "@" not in sender:
        return None
    domain = sender.split("@", 1)[1].lower().removeprefix("www.")
    parts = domain.split(".")
    if len(parts) >= 2:
        return parts[-2].capitalize()
    return domain.capitalize()


def _matches_keywords(text: str, keywords: list[str]) -> bool:
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in keywords)


@router.get("/inbox-summary")
def inbox_summary() -> dict:
    records = memory_service.list_memories()
    email_records = [record for record in records if record.source_type == "email"]

    recruiter_keywords = ["recruiter", "recruiting", "recruitment", "talent"]
    interview_keywords = ["interview", "interviewing", "onsite", "screening"]
    reply_keywords = ["reply", "respond", "follow up", "follow-up", "thanks"]

    companies = []
    seen_companies = set()
    for record in email_records:
        if record.sender:
            company = _normalize_company(record.sender)
            if company and company not in seen_companies:
                seen_companies.add(company)
                companies.append(company)

    needs_reply = [
        record.summary
        for record in email_records
        if record.summary and _matches_keywords(record.summary, reply_keywords)
    ]

    latest_subjects = [record.subject or "" for record in sorted(email_records, key=lambda record: record.id, reverse=True)[:10]]

    return {
        "total_emails": len(email_records),
        "recruiter_emails": sum(
            1
            for record in email_records
            if (record.subject and _matches_keywords(record.subject, recruiter_keywords))
            or (record.sender and _matches_keywords(record.sender, recruiter_keywords))
        ),
        "interview_emails": sum(
            1
            for record in email_records
            if (record.subject and _matches_keywords(record.subject, interview_keywords))
            or (record.summary and _matches_keywords(record.summary, interview_keywords))
        ),
        "companies": companies,
        "needs_reply": needs_reply,
        "latest_subjects": latest_subjects,
    }
