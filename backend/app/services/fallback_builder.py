def extract_blockers_from_rules(rule_results):
    blockers = []

    if rule_results.get("missing_documents"):
        blockers.append("Missing required documents")

    if rule_results.get("cross_doc_mismatch"):
        blockers.append("Conflicting values across documents")

    if rule_results.get("field_mismatches"):
        blockers.append("Document field mismatches detected")

    if rule_results.get("kyc_issues"):
        blockers.append("KYC incomplete")

    if rule_results.get("accreditation_issues"):
        blockers.append("Accreditation not verified")

    if rule_results.get("sla_breach"):
        blockers.append("Workflow SLA breached")

    if rule_results.get("stage_conflicts"):
        for conflict in rule_results["stage_conflicts"]:
            blockers.append(conflict.replace("_", " ").capitalize())

    return blockers


def build_fallback_response(rule_results):
    blockers = extract_blockers_from_rules(rule_results)

    summary = "Rule-based analysis detected the following issues: " + ", ".join(blockers)

    return {
        "summary": summary,
        "blockers": blockers,
        "next_action": "Review the identified issues and resolve them before proceeding.",
        "confidence": "low",
        "source": "fallback"
    }