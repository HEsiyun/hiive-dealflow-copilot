from app.services.deal_context import DealContext
from datetime import datetime


def check_missing_documents(ctx: DealContext):
    if not ctx.workflow_template:
        return []

    required = set(ctx.workflow_template.required_docs)
    existing = set(d.doc_type for d in ctx.documents)

    missing = required - existing

    return list(missing)


def check_sla_breach(ctx: DealContext):
    if not ctx.workflow_template:
        return False

    now = datetime.utcnow()
    elapsed_hours = (now - ctx.deal.last_stage_change_at).total_seconds() / 3600

    return elapsed_hours > ctx.workflow_template.sla_hours


def check_field_mismatch(ctx: DealContext):
    mismatches = []

    for doc in ctx.documents:
        fields = doc.extracted_fields

        if "share_count" in fields and fields["share_count"] != ctx.deal.share_count:
            mismatches.append({
                "type": "share_count_mismatch",
                "document_id": doc.document_id,
                "expected": ctx.deal.share_count,
                "actual": fields["share_count"]
            })

        if "seller_legal_name" in fields and fields["seller_legal_name"] != ctx.seller.name:
            mismatches.append({
                "type": "seller_name_mismatch",
                "document_id": doc.document_id,
                "expected": ctx.seller.name,
                "actual": fields["seller_legal_name"]
            })

    return mismatches

def check_cross_doc_consistency(ctx):
    value_map = {}

    for doc in ctx.documents:
        if "share_count" in doc.extracted_fields:
            val = doc.extracted_fields["share_count"]
            if val not in value_map:
                value_map[val] = []
            value_map[val].append(doc.document_id)

    if len(value_map) > 1:
        groups = [
            {
                "value": v,
                "document_ids": ids
            }
            for v, ids in value_map.items()
        ]

        groups = sorted(groups, key=lambda x: len(x["document_ids"]), reverse=True)

        return {
            "type": "cross_document_mismatch",
            "groups": groups,
            "majority_value": groups[0]["value"],
            "outlier_values": [g["value"] for g in groups[1:]],
            "severity": "high" if len(groups) > 2 else "medium"
        }

    return None

def check_kyc_status(ctx: DealContext):
    issues = []
    if ctx.buyer.kyc_status != "complete":
        issues.append("buyer_kyc_incomplete")
    if ctx.seller.kyc_status != "complete":
        issues.append("seller_kyc_incomplete")
    return issues


def run_all_checks(ctx: DealContext):
    return {
        "missing_documents": check_missing_documents(ctx),
        "sla_breach": check_sla_breach(ctx),
        "field_mismatches": check_field_mismatch(ctx),
        "cross_doc_mismatch": check_cross_doc_consistency(ctx),
        "kyc_issues": check_kyc_status(ctx),
    }
