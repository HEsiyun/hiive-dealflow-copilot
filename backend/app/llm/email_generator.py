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


def build_email_prompt(ctx, rule_results):
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

Return plain email text.
"""


def generate_email_with_llm(ctx: DealContext, rule_results):
    prompt = build_email_prompt(ctx, rule_results)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a deal operations specialist writing professional emails."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4
    )

    return response.choices[0].message.content