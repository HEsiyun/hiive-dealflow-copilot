from datetime import datetime

PIPELINE_STAGES = [
    "intake",
    "kyc_review",
    "docs_pending",
    "rofr_review",
    "signature",
    "settlement",
    "closed",
]


def compute_readiness(ctx):
    """
    Readiness measures deal PROGRESS toward closing — independent of risk.
    Three components:
      - Document completion  (0–50 pts): how many required docs are submitted
      - Stage progression    (0–30 pts): how far along the pipeline
      - Deadline buffer      (0–20 pts): how much time remains relative to total duration
    """

    # ── Document Completion (50 pts) ──────────────────────────────
    if ctx.workflow_template and ctx.workflow_template.required_docs:
        required = set(ctx.workflow_template.required_docs)
        submitted = set(d.doc_type for d in ctx.documents)
        matched = required & submitted
        doc_ratio = len(matched) / len(required)
        doc_score = round(doc_ratio * 50)
        doc_detail = f"{len(matched)}/{len(required)} docs"
    else:
        matched, required = set(), set()
        doc_score = 50  # no template — assume complete
        doc_detail = "No requirements defined"

    # ── Stage Progression (30 pts) ────────────────────────────────
    stage = ctx.deal.current_stage.lower()
    if stage in PIPELINE_STAGES:
        stage_idx = PIPELINE_STAGES.index(stage)
        # Normalize: intake=0, closed=30
        stage_score = round((stage_idx / (len(PIPELINE_STAGES) - 1)) * 30)
        stage_detail = f"{stage} ({stage_idx + 1}/{len(PIPELINE_STAGES)})"
    else:
        # on_hold or unknown — no progression credit
        stage_score = 0
        stage_detail = f"{stage} (on hold)"

    # ── Deadline Buffer (20 pts) ──────────────────────────────────
    # Closed deals have completed — deadline expiry is expected, not a penalty
    if stage == "closed":
        deadline_score = 20
        deadline_detail = "Deal closed"
    else:
        now = datetime.utcnow()
        deadline = ctx.deal.deadline_at.replace(tzinfo=None) if ctx.deal.deadline_at.tzinfo else ctx.deal.deadline_at
        created = ctx.deal.created_at.replace(tzinfo=None) if ctx.deal.created_at.tzinfo else ctx.deal.created_at

        total_secs = (deadline - created).total_seconds()
        remaining_secs = (deadline - now).total_seconds()

        if total_secs > 0 and remaining_secs > 0:
            buffer_ratio = min(remaining_secs / total_secs, 1.0)
            deadline_score = round(buffer_ratio * 20)
        else:
            deadline_score = 0

        days_remaining = max(0, round(remaining_secs / 86400))
        deadline_detail = f"{days_remaining}d remaining"

    # ── Total ─────────────────────────────────────────────────────
    total = doc_score + stage_score + deadline_score

    if total >= 70:
        status = "ready"
    elif total >= 40:
        status = "at_risk"
    else:
        status = "blocked"

    return {
        "readiness_score": total,
        "readiness_status": status,
        "readiness_reasons": [doc_detail, stage_detail, deadline_detail],
        "readiness_breakdown": {
            "docs_score": doc_score,
            "docs_max": 50,
            "docs_detail": doc_detail,
            "stage_score": stage_score,
            "stage_max": 30,
            "stage_detail": stage_detail,
            "deadline_score": deadline_score,
            "deadline_max": 20,
            "deadline_detail": deadline_detail,
        },
    }
