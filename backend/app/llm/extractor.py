from typing import List
from app.services.deal_context import DealContext


def build_llm_prompt(ctx: DealContext) -> str:
    emails = "\n\n".join([
        f"[{c.sender_role}] {c.body}" for c in ctx.communications[:5]
    ])

    notes = "\n\n".join([
        n.body for n in ctx.notes[:3]
    ])

    return f"""
You are an AI assistant helping a transaction operations team.

Analyze the following deal context and identify:
1. Key blockers or risks
2. Missing steps or actions
3. What should be done next

--- DEAL ---
Company: {ctx.deal.company_name}
Stage: {ctx.deal.current_stage}
Deadline: {ctx.deal.deadline_at}

--- EMAILS ---
{emails}

--- INTERNAL NOTES ---
{notes}

Respond in JSON format:
{{
  "summary": "...",
  "blockers": ["..."],
  "next_action": "..."
}}
"""

def mock_llm_call(prompt: str):
    return {
        "summary": "Deal appears delayed due to missing seller consent and potential document mismatch.",
        "blockers": [
            "Missing seller consent",
            "Possible share count inconsistency"
        ],
        "next_action": "Follow up with seller to obtain signed consent and confirm agreement details."
    }

def analyze_with_llm(ctx: DealContext):
    prompt = build_llm_prompt(ctx)
    result = mock_llm_call(prompt)
    return result