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
    for issue in rule_results.get("kyc_issues", []):
        evidence.append({
            "type": "kyc_issue",
            "detail": issue
        })
        key_risks.append("KYC incomplete")

    # ---------- MISSING DOCUMENTS ----------
    for doc in rule_results.get("missing_documents", []):
        evidence.append({
            "type": "missing_document",
            "detail": doc
        })

    # ---------- SLA ----------
    if rule_results.get("sla_breach"):
        sla_detail = rule_results.get("sla_detail")
        detail = "SLA breached"
        if sla_detail:
            detail = f"SLA breached: {sla_detail['elapsed_hours']}h elapsed (allowed {sla_detail['sla_hours']}h)"
        evidence.append({
            "type": "sla_breach",
            "detail": detail
        })

    # ---------- ACCREDITATION ----------
    for issue in rule_results.get("accreditation_issues", []):
        evidence.append({
            "type": "accreditation_issue",
            "detail": issue
        })

    # ---------- STAGE CONFLICTS ----------
    for conflict in rule_results.get("stage_conflicts", []):
        evidence.append({
            "type": "stage_conflict",
            "detail": conflict
        })

    # ---------- COMMUNICATION FLAGS (with snippets) ----------
    for flag in rule_results.get("communication_flags", []):
        kw = flag.replace("communication_mentions_", "")
        matching = [c for c in ctx.communications if kw in c.body.lower()]
        if matching:
            comm = matching[0]
            snippet = comm.body if len(comm.body) <= 140 else comm.body[:137] + "..."
            evidence.append({
                "type": "communication_flag",
                "detail": flag,
                "snippet": snippet,
                "channel": comm.channel,
                "sender_role": comm.sender_role,
                "subject": comm.subject,
            })
        else:
            evidence.append({
                "type": "communication_flag",
                "detail": flag
            })

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
