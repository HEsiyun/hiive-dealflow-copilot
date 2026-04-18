def compute_escalation(rule_results, stage: str = ""):
    # Closed deals need no further action
    if stage == "closed":
        return {"needed": False, "owner": None, "reason": None}

    if rule_results.get("cross_doc_mismatch"):
        return {
            "needed": True,
            "owner": "legal",
            "reason": "document inconsistency"
        }
    return {"needed": False, "owner": None, "reason": None}