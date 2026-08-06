from dataclasses import dataclass
from datetime import datetime


@dataclass
class MemoryRecord:
    id: int
    source_type: str
    source_id: int
    summary: str
    subject: str
    sender: str
    received_at: str
    created_at: datetime
