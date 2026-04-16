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
            mismatches.append("share_count_mismatch")

        if "seller_legal_name" in fields and fields["seller_legal_name"] != ctx.seller.name:
            mismatches.append("seller_name_mismatch")

    return mismatches


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
        "kyc_issues": check_kyc_status(ctx),
    }