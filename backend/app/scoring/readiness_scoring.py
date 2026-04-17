def compute_readiness(rule_results, llm_results):
    score = 100
    reasons = []

    if rule_results.get("missing_documents"):
        score -= 25
        reasons.append("Missing required documents")

    if rule_results.get("kyc_issues"):
        score -= 20
        reasons.append("KYC incomplete")

    if rule_results.get("field_mismatches"):
        score -= 20
        reasons.append("Document-to-system mismatch detected")

    if rule_results.get("cross_doc_mismatch"):
        score -= 20
        reasons.append("Cross-document inconsistency detected")

    if rule_results.get("sla_breach"):
        score -= 10
        reasons.append("Workflow SLA breached")

    blockers = llm_results.get("blockers", [])
    if blockers:
        score -= min(15, 5 * len(blockers))
        reasons.append("Operational blockers found in communications/notes")

    score = max(0, score)

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