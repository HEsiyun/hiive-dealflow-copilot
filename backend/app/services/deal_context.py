from typing import List, Optional
from app.models.models import (
    Deal, Counterparty, StageEvent,
    WorkflowTemplate, Document, Communication, Note
)


class DealContext:
    def __init__(
        self,
        deal: Deal,
        buyer: Counterparty,
        seller: Counterparty,
        stage_events: List[StageEvent],
        documents: List[Document],
        communications: List[Communication],
        notes: List[Note],
        workflow_template: Optional[WorkflowTemplate],
        all_workflow_templates: Optional[List[WorkflowTemplate]] = None,
    ):
        self.deal = deal
        self.buyer = buyer
        self.seller = seller
        self.stage_events = stage_events
        self.documents = documents
        self.communications = communications
        self.notes = notes
        self.workflow_template = workflow_template
        self.all_workflow_templates = all_workflow_templates or []