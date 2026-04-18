from app.services.deal_context import DealContext
from openai import OpenAI

client = OpenAI()

def format_mismatch(rule_results):
    lines = []

    # field mismatch
    for m in rule_results.get("field_mismatches", []):
        lines.append(
            f"- Document {m['document_id']} shows {m['actual']} shares (expected {m['expected']})"
        )

    # cross doc
    cross = rule_results.get("cross_doc_mismatch")
    if cross:
        majority = cross.get("majority_value")
        for g in cross.get("groups", []):
            if g["value"] != majority:
                docs = ", ".join(g["document_ids"])
                lines.append(
                    f"- Documents [{docs}] have conflicting value {g['value']} (majority is {majority})"
                )

    return "\n".join(lines)


def build_client_email_prompt(ctx, rule_results):
    mismatch_text = format_mismatch(rule_results)

    return f"""
You are a deal operations specialist.

Write a professional follow-up email to counterparties.

--- DEAL ---
Company: {ctx.deal.company_name}
Stage: {ctx.deal.current_stage}

--- ISSUES ---
{mismatch_text}

--- OTHER RISKS ---
KYC issues: {rule_results.get("kyc_issues")}
Missing docs: {rule_results.get("missing_documents")}

Instructions:
- Be concise and professional
- Reference specific document inconsistencies
- Ask for confirmation of correct values and updated documents
- Avoid generic greetings like "I hope this message finds you well"
- Do NOT assume deal is closed unless explicitly stated
- Sound like a transaction operations team
- Do NOT expose internal risk scores, rule engine outputs, or analysis methodology

Return plain email text.
"""


def build_internal_email_prompt(ctx, rule_results):
    mismatch_text = format_mismatch(rule_results)

    kyc_issues = rule_results.get("kyc_issues", [])
    missing_docs = rule_results.get("missing_documents", [])
    sla_breach = rule_results.get("sla_breach", False)
    stage_conflicts = rule_results.get("stage_conflicts", [])
    accreditation = rule_results.get("accreditation_issues", [])
    comm_flags = rule_results.get("communication_flags", [])

    return f"""
You are a deal operations specialist writing an internal status summary for your team.

--- DEAL ---
Company: {ctx.deal.company_name}
Deal ID: {ctx.deal.deal_id}
Stage: {ctx.deal.current_stage}
Priority: {ctx.deal.priority}
Deadline: {ctx.deal.deadline_at}

--- DOCUMENT ISSUES ---
{mismatch_text}

--- RULE ENGINE FINDINGS ---
KYC issues: {kyc_issues}
Missing documents: {missing_docs}
SLA breached: {sla_breach}
Stage conflicts: {stage_conflicts}
Accreditation issues: {accreditation}
Communication flags: {comm_flags}

Instructions:
- Write a concise internal summary email addressed to the deal team
- Start with a one-line status (e.g. "Deal D-1005 requires attention before advancing to settlement")
- List the key findings grouped by severity: blockers first, then warnings
- End with a clear recommended action and who should own it
- Use direct internal language, no need for external politeness
- Reference specific document IDs and field values where relevant
- Include SLA status if breached

Return plain email text with a Subject line on the first line.
"""


def generate_email_with_llm(ctx: DealContext, rule_results, mode="internal"):
    if mode == "client":
        prompt = build_client_email_prompt(ctx, rule_results)
    else:
        prompt = build_internal_email_prompt(ctx, rule_results)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a deal operations specialist writing professional emails."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4
    )

    return response.choices[0].message.content