def compute_risk(rule_results, llm_results):

    score = 0

    # document issues
    if rule_results.get("missing_documents"):
        score += 20
    if rule_results.get("cross_doc_mismatch"):
        score += 15
    if rule_results.get("field_mismatches"):
        score += 15

    # compliance
    if rule_results.get("kyc_issues"):
        score += 10
    if rule_results.get("accreditation_issues"):
        score += 10

    # workflow
    if rule_results.get("sla_breach"):
        score += 20
    if rule_results.get("stage_conflicts"):
        score += 15

    # llm
    score += len(llm_results.get("blockers", [])) * 10

    if score > 100:
        score = 100

    if score >= 70:
        level = "high"
    elif score >= 40:
        level = "medium"
    else:
        level = "low"

    return score, level