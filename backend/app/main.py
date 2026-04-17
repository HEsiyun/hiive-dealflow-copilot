from fastapi import FastAPI
from app.db.data_loader import DataStore
from app.services.context_builder import DealContextBuilder
from app.rules.basic_rules import run_all_checks
from app.llm.extractor import analyze_with_llm
from app.llm.email_generator import generate_email_with_llm
from app.scoring.risk_scoring import compute_risk
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.services.audit_builder import build_audit_trail
from app.services.escalation import compute_escalation
from app.scoring.readiness_scoring import compute_readiness
import os

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.31.6:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Data Init ----------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")

store = DataStore(data_dir=DATA_DIR)
builder = DealContextBuilder(store)

# ---------------- Schemas ----------------
class EmailRequest(BaseModel):
    deal_id: str


# ---------------- APIs ----------------

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
def analyze_deal(deal_id: str, force_fallback: bool = False):
    ctx = builder.build(deal_id)

    # rule layer
    rule_results = run_all_checks(ctx)

    # llm layer
    llm_results = analyze_with_llm(ctx, rule_results, force_fallback)

    # risk scoring
    score, level = compute_risk(rule_results, llm_results)
   
    # readiness scoring
    readiness = compute_readiness(rule_results, llm_results)
   
    # escalation
    escalation = compute_escalation(rule_results)

    # audit trail
    audit = build_audit_trail(ctx, rule_results, llm_results, score, level)
    return {
        "deal_id": deal_id,
        "risk_score": score,
        "risk_level": level,

        "readiness_score": readiness["readiness_score"],
        "readiness_status": readiness.get("readiness_status", "unknown"),
        "readiness_reasons": readiness["readiness_reasons"],

        # explainability
        "rule_issues": rule_results,
        "audit_trail": audit,

        # llm outputs
        "llm_summary": llm_results.get("summary"),
        "blockers": llm_results.get("blockers", []),
        "next_action": llm_results.get("next_action"),

        # escalation（action layer）
        "escalation": escalation,

        # metadata
        "source": llm_results.get("source", "unknown"),
        "error": llm_results.get("error"),

        # for timeline
        "stage_events": ctx.stage_events if hasattr(ctx, "stage_events") else []
    }


# ---------------- Email Generation ----------------

@app.post("/generate-email")
def generate_email(req: EmailRequest):
    ctx = builder.build(req.deal_id)

    # reuse same rule logic
    rule_results = run_all_checks(ctx)

    try:
        email = generate_email_with_llm(ctx, rule_results)
        return {
            "email": email,
            "source": "llm"
        }

    except Exception as e:
        # fallback email
        fallback_email = f"""
Subject: Follow-up on Deal {req.deal_id}

Hi,

We noticed a few outstanding issues that need attention:

- Document inconsistencies detected
- KYC verification incomplete
- Pending confirmations required

Please review and advise on next steps.

Best,
Deal Operations
"""
        return {
            "email": fallback_email,
            "source": "fallback",
            "error": str(e)
        }


# test at:
# http://127.0.0.1:8000/docs