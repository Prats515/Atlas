from datetime import datetime

from .models import MemoryRecord


class MemoryService:
    def __init__(self) -> None:
        self._records: list[MemoryRecord] = []
        self._next_id = 1

    def create_memory(self, source_type: str, source_id: int, summary: str, subject: str, sender: str, received_at: str) -> MemoryRecord:
        record = MemoryRecord(
            id=self._next_id,
            source_type=source_type,
            source_id=source_id,
            summary=summary,
            subject=subject,
            sender=sender,
            received_at=received_at,
            created_at=datetime.utcnow(),
        )
        self._next_id += 1
        self._records.append(record)
        return record

    def list_memories(self) -> list[MemoryRecord]:
        return list(self._records)


memory_service = MemoryService()
