def compute_readiness(rule_results, llm_results):
    score = 100
    reasons = []

    # -------------------------
    # HARD BLOCKERS（most severe)
    # -------------------------

    if rule_results.get("accreditation_issues"):
        score -= 30
        reasons.append("Counterparty not accredited")

    if rule_results.get("kyc_issues"):
        score -= 20
        reasons.append("KYC incomplete")

    if rule_results.get("stage_conflicts"):
        score -= 25
        reasons.append("Deal progressed despite unresolved issues")

    # -------------------------
    # DOCUMENT RISKS
    # -------------------------

    if rule_results.get("cross_doc_mismatch"):
        score -= 20
        reasons.append("Cross-document inconsistency")

    if rule_results.get("field_mismatches"):
        score -= 15
        reasons.append("Document-to-system mismatch")

    if rule_results.get("missing_documents"):
        score -= 15
        reasons.append("Missing required documents")

    # -------------------------
    # PROCESS / SOFT SIGNALS
    # -------------------------

    if rule_results.get("sla_breach"):
        score -= 10
        reasons.append("SLA breach")

    if rule_results.get("communication_flags"):
        score -= 5
        reasons.append("Risk signals from communications")

    # -------------------------
    # LLM signals
    # -------------------------

    blockers = llm_results.get("blockers", [])
    if blockers:
        score -= min(15, 5 * len(blockers))
        reasons.append("Operational blockers identified")

    score = max(0, score)

    # -------------------------
    # STATUS
    # -------------------------

    if score >= 80:
        status = "ready"
    elif score >= 50:
        status = "at_risk"
    else:
        status = "blocked"

    return {
        "readiness_score": score,
        "readiness_status": status,
        "readiness_reasons": reasons
    }