from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime


# ---------- Core Entities ----------

class Deal(BaseModel):
    deal_id: str
    company_name: str
    asset_type: str
    buyer_id: str
    seller_id: str
    deal_size_usd: float
    share_count: int
    price_per_share: float
    current_stage: str
    priority: str
    created_at: datetime
    last_stage_change_at: datetime
    deadline_at: datetime
    rofr_required: bool
    rofr_deadline_at: Optional[datetime]
    jurisdiction: str
    status: str


class Counterparty(BaseModel):
    counterparty_id: str
    name: str
    type: str
    entity_type: str
    accredited_investor_status: str
    kyc_status: str
    email: str
    jurisdiction: str


class StageEvent(BaseModel):
    event_id: str
    deal_id: str
    from_stage: Optional[str]
    to_stage: str
    changed_at: datetime
    changed_by: str


class WorkflowTemplate(BaseModel):
    template_id: str
    stage: str
    required_docs: List[str]
    required_fields: List[str]
    sla_hours: int


class Document(BaseModel):
    document_id: str
    deal_id: str
    doc_type: str
    stage: str
    uploaded_at: datetime
    status: str
    extracted_fields: Dict
    source_file: str


class Communication(BaseModel):
    message_id: str
    deal_id: str
    channel: str
    sender_role: str
    timestamp: datetime
    subject: str
    body: str


class Note(BaseModel):
    note_id: str
    deal_id: str
    created_at: datetime
    author_role: str
    body: str