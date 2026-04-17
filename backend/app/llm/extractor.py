from typing import List
from app.services.deal_context import DealContext
from openai import OpenAI
import json

client = OpenAI()

def build_llm_prompt(ctx, rule_results) -> str:

    emails = "\n\n".join([
        f"[{c.sender_role}] {c.body}" for c in ctx.communications[:5]
    ])

    notes = "\n\n".join([
        n.body for n in ctx.notes[:3]
    ])

    return f"""
You are an AI assistant helping a transaction operations team.

Your job is to analyze the deal and explain risks based on structured signals and communication context.

--- DEAL ---
Company: {ctx.deal.company_name}
Stage: {ctx.deal.current_stage}
Deadline: {ctx.deal.deadline_at}

--- RULE-BASED FINDINGS ---
{rule_results}

--- EMAILS ---
{emails}

--- INTERNAL NOTES ---
{notes}

Instructions:
1. Explain the key risks clearly
2. Reference the findings if relevant
3. Suggest next action for the operations team

Respond in JSON:
{{
  "summary": "...",
  "blockers": ["..."],
  "next_action": "...",
  "confidence": "high/medium/low"
}}
"""

def mock_llm_call(prompt: str):
    return {
        "summary": "Multiple document inconsistencies detected. Share count differs across documents and from system records, indicating potential versioning or data integrity issues. Buyer KYC is incomplete.",
        "blockers": [
            "Conflicting share count across documents",
            "Mismatch between documents and system-of-record",
            "Buyer KYC incomplete"
        ],
        "next_action": "Identify the correct agreement version, confirm share count with counterparties, and complete buyer KYC verification.",
        "confidence": "high"
    }

def call_llm(prompt: str):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a transaction risk analysis assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    content = response.choices[0].message.content

    try:
        return json.loads(content)
    except:
        return {
            "summary": content,
            "blockers": [],
            "next_action": "",
            "confidence": "low"
        }

def analyze_with_llm(ctx, rule_results):
    prompt = build_llm_prompt(ctx, rule_results)
    result = call_llm(prompt)
    return result