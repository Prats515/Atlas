from collections import defaultdict
from typing import Any, Callable

Handler = Callable[[str, Any], None]

class EventBus:
    def __init__(self) -> None:
        self._handlers: dict[str, list[Handler]] = defaultdict(list)

    def subscribe(self, event_name: str, handler: Handler) -> None:
        self._handlers[event_name].append(handler)

    def publish(self, event_name: str, payload: Any) -> None:
        for handler in list(self._handlers.get(event_name, [])):
            handler(event_name, payload)


event_bus = EventBus()
