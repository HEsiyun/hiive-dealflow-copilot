def compute_risk(rule_results, llm_results):

    score = 0

    # rules
    if rule_results["missing_documents"]:
        score += 20
    if rule_results["sla_breach"]:
        score += 20
    if rule_results["field_mismatches"]:
        score += 15
    if rule_results["kyc_issues"]:
        score += 10

    # llm
    score += len(llm_results["blockers"]) * 10

    if score > 100:
        score = 100

    if score >= 70:
        level = "high"
    elif score >= 40:
        level = "medium"
    else:
        level = "low"

    return score, level