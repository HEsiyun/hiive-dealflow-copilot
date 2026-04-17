def build_audit_trail(ctx, rule_results, llm_results, score, level):
    evidence = []
    decision_trace = []
    key_risks = []

    # ---------- RULE EVIDENCE ----------
    for m in rule_results.get("field_mismatches", []):
        evidence.append({
            "type": "field_mismatch",
            "document_id": m["document_id"],
            "detail": f"{m['actual']} vs expected {m['expected']}"
        })

    cross = rule_results.get("cross_doc_mismatch")
    if cross:
        majority = cross.get("majority_value")
        for g in cross.get("groups", []):
            if g["value"] != majority:
                evidence.append({
                    "type": "cross_doc_mismatch",
                    "value": g["value"],
                    "documents": g["document_ids"]
                })

    # ---------- KYC ----------
    if rule_results.get("kyc_issues"):
        key_risks.append("KYC incomplete")

    # ---------- LLM SIGNALS ----------
    for b in llm_results.get("blockers", []):
        key_risks.append(b)

    # ---------- DECISION TRACE ----------
    decision_trace.append("Rule engine detected structured inconsistencies")
    decision_trace.append("LLM validated and summarized key risks")

    if score > 70:
        decision_trace.append("High risk due to multiple critical issues")
    elif score > 40:
        decision_trace.append("Moderate risk due to some inconsistencies")
    else:
        decision_trace.append("Low risk")

    # ---------- WHY THIS SCORE ----------
    why = f"""
Risk level is {level} with score {score}.
This is driven by:
- {len(evidence)} document inconsistencies
- {len(rule_results.get('kyc_issues', []))} KYC issues
- LLM-identified blockers
"""

    return {
        "why_this_score": why.strip(),
        "key_risks": list(set(key_risks)),
        "evidence": evidence,
        "decision_trace": decision_trace
    }