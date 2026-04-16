import json
from pathlib import Path
from typing import List

from app.models.models import (
    Deal, Counterparty, StageEvent,
    WorkflowTemplate, Document, Communication, Note
)


class DataStore:
    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir)

        self.deals = self._load("deals.json", Deal)
        self.counterparties = self._load("counterparties.json", Counterparty)
        self.stage_events = self._load("stage_events.json", StageEvent)
        self.workflow_templates = self._load("workflow_templates.json", WorkflowTemplate)
        self.documents = self._load("documents.json", Document)
        self.communications = self._load("communications.json", Communication)
        self.notes = self._load("notes.json", Note)

    def _load(self, filename, model):
        with open(self.data_dir / filename) as f:
            raw = json.load(f)
        return [model(**item) for item in raw]