from app.db.data_loader import DataStore
from app.services.deal_context import DealContext

class DealContextBuilder:

    def __init__(self, store: DataStore):
        self.store = store

    def build(self, deal_id: str) -> DealContext:
        deal = next(d for d in self.store.deals if d.deal_id == deal_id)

        buyer = next(c for c in self.store.counterparties if c.counterparty_id == deal.buyer_id)
        seller = next(c for c in self.store.counterparties if c.counterparty_id == deal.seller_id)

        stage_events = [e for e in self.store.stage_events if e.deal_id == deal_id]
        documents = [d for d in self.store.documents if d.deal_id == deal_id]
        communications = [c for c in self.store.communications if c.deal_id == deal_id]
        notes = [n for n in self.store.notes if n.deal_id == deal_id]

        workflow_template = next(
            (t for t in self.store.workflow_templates if t.stage == deal.current_stage),
            None
        )

        return DealContext(
            deal=deal,
            buyer=buyer,
            seller=seller,
            stage_events=stage_events,
            documents=documents,
            communications=communications,
            notes=notes,
            workflow_template=workflow_template
        )