from fastapi import FastAPI
from app.db.data_loader import DataStore
from app.services.context_builder import DealContextBuilder
from app.rules.basic_rules import run_all_checks
from app.llm.extractor import analyze_with_llm
from app.scoring.risk_scoring import compute_risk
import os

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")
store = DataStore(data_dir=DATA_DIR)
builder = DealContextBuilder(store)


@app.get("/deals")
def list_deals():
    return store.deals


@app.get("/deals/{deal_id}")
def get_deal(deal_id: str):
    ctx = builder.build(deal_id)
    return {
        "deal": ctx.deal,
        "buyer": ctx.buyer,
        "seller": ctx.seller,
        "documents": ctx.documents,
        "notes": ctx.notes,
    }


@app.post("/deals/{deal_id}/analyze")
def analyze_deal(deal_id: str):
    ctx = builder.build(deal_id)

    rule_results = run_all_checks(ctx)
    llm_results = analyze_with_llm(ctx, rule_results)

    score, level = compute_risk(rule_results, llm_results)

    return {
        "deal_id": deal_id,
        "risk_score": score,
        "risk_level": level,
        "rule_issues": rule_results,
        "llm_summary": llm_results["summary"],
        "blockers": llm_results["blockers"],
        "next_action": llm_results["next_action"]
    }
# test at: http://127.0.0.1:8000/docs