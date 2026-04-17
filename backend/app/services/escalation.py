def compute_escalation(rule_results):
    if rule_results.get("cross_doc_mismatch"):
        return {
            "needed": True,
            "owner": "legal",
            "reason": "document inconsistency"
        }
    return {"needed": False}