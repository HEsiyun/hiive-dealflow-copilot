from datetime import datetime
from typing import List, Optional

from app.services.context_builder import DealContextBuilder
from app.rules.basic_rules import run_all_checks
from app.scoring.readiness_scoring import compute_readiness
from app.scoring.risk_scoring import compute_risk
from app.services.escalation import compute_escalation
from app.services.fallback_builder import build_fallback_response
from app.models.models import Deal


STATUS_SORT = {"early": 0, "active": 1, "near_close": 2}
RISK_SORT = {"high": 0, "medium": 1, "low": 2}
PRIORITY_SORT = {"high": 0, "medium": 1, "low": 2}


def analyze_deal_lightweight(builder: DealContextBuilder, deal: Deal) -> dict:
    """Run rule-based analysis on a single deal without LLM."""
    ctx = builder.build(deal.deal_id)
    rule_results = run_all_checks(ctx)
    fallback = build_fallback_response(rule_results)
    readiness = compute_readiness(ctx)
    risk_score, risk_level = compute_risk(rule_results, {"blockers": []})
    escalation = compute_escalation(rule_results, stage=deal.current_stage)

    days_in_stage = (datetime.utcnow() - deal.last_stage_change_at).total_seconds() / 86400

    return {
        "deal_id": deal.deal_id,
        "company_name": deal.company_name,
        "current_stage": deal.current_stage,
        "priority": deal.priority,
        "readiness_status": readiness["readiness_status"],
        "readiness_score": readiness["readiness_score"],
        "readiness_reasons": readiness["readiness_reasons"],
        "risk_score": risk_score,
        "risk_level": risk_level,
        "sla_breach": rule_results.get("sla_breach", False),
        "kyc_issues": rule_results.get("kyc_issues", []),
        "cross_doc_mismatch": rule_results.get("cross_doc_mismatch"),
        "escalation_needed": escalation.get("needed", False),
        "escalation_owner": escalation.get("owner"),
        "escalation_reason": escalation.get("reason"),
        "main_blocker": readiness["readiness_reasons"][0] if readiness["readiness_reasons"] else None,
        "next_action": fallback.get("next_action"),
        "days_in_stage": round(days_in_stage, 1),
    }


def _analyze_all(builder: DealContextBuilder, deals: List[Deal]) -> List[dict]:
    return [analyze_deal_lightweight(builder, deal) for deal in deals]


# ──────────────────────────────────────────────
# Endpoint 1: GET /dashboard/overview
# ──────────────────────────────────────────────

def get_overview(builder: DealContextBuilder, deals: List[Deal]) -> dict:
    results = _analyze_all(builder, deals)

    return {
        "total_deals": len(results),
        "near_close_count": sum(1 for r in results if r["readiness_status"] == "near_close"),
        "active_count": sum(1 for r in results if r["readiness_status"] == "active"),
        "early_count": sum(1 for r in results if r["readiness_status"] == "early"),
        "sla_breach_count": sum(1 for r in results if r["sla_breach"]),
        "escalation_count": sum(1 for r in results if r["escalation_needed"]),
        "kyc_issue_count": sum(1 for r in results if r["kyc_issues"]),
        "document_conflict_count": sum(1 for r in results if r["cross_doc_mismatch"]),
    }


# ──────────────────────────────────────────────
# Endpoint 2: GET /dashboard/pipeline
# ──────────────────────────────────────────────

def get_pipeline(builder: DealContextBuilder, deals: List[Deal]) -> dict:
    results = _analyze_all(builder, deals)

    stage_map: dict[str, list] = {}
    for r in results:
        stage_map.setdefault(r["current_stage"], []).append(r)

    stages = []
    for stage, items in sorted(stage_map.items()):
        stages.append({
            "stage": stage,
            "total": len(items),
            "early": sum(1 for i in items if i["readiness_status"] == "early"),
            "active": sum(1 for i in items if i["readiness_status"] == "active"),
            "near_close": sum(1 for i in items if i["readiness_status"] == "near_close"),
            "avg_days_in_stage": round(
                sum(i["days_in_stage"] for i in items) / len(items), 1
            ),
            "sla_breaches": sum(1 for i in items if i["sla_breach"]),
        })

    return {"stages": stages}


# ──────────────────────────────────────────────
# Endpoint 3: GET /dashboard/action-queue
# ──────────────────────────────────────────────

def get_action_queue(
    builder: DealContextBuilder,
    deals: List[Deal],
    status: Optional[str] = None,
    stage: Optional[str] = None,
    priority: Optional[str] = None,
    only_escalated: bool = False,
    only_sla_breach: bool = False,
) -> list:
    results = _analyze_all(builder, deals)

    # Apply filters
    if status:
        results = [r for r in results if r["readiness_status"] == status]
    if stage:
        results = [r for r in results if r["current_stage"] == stage]
    if priority:
        results = [r for r in results if r["priority"] == priority]
    if only_escalated:
        results = [r for r in results if r["escalation_needed"]]
    if only_sla_breach:
        results = [r for r in results if r["sla_breach"]]

    # Sort: early > active > near_close, then high > medium > low risk, then high > medium > low priority, then lower score first
    results.sort(key=lambda r: (
        STATUS_SORT.get(r["readiness_status"], 9),
        RISK_SORT.get(r["risk_level"], 9),
        PRIORITY_SORT.get(r["priority"], 9),
        r["readiness_score"],
    ))

    return [
        {
            "deal_id": r["deal_id"],
            "company_name": r["company_name"],
            "current_stage": r["current_stage"],
            "priority": r["priority"],
            "readiness_status": r["readiness_status"],
            "readiness_score": r["readiness_score"],
            "risk_score": r["risk_score"],
            "risk_level": r["risk_level"],
            "main_blocker": r["main_blocker"],
            "next_action": r["next_action"],
            "escalation_needed": r["escalation_needed"],
            "escalation_owner": r["escalation_owner"],
            "sla_breach": r["sla_breach"],
        }
        for r in results
    ]
