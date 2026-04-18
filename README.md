# Hiive Dealflow Copilot

A **production-ready AI copilot for secondary market deal operations**. It layers rule-based compliance checks, LLM-powered risk analysis, and progress-based readiness scoring into a unified pipeline — surfacing what needs attention, in what order, and why.

## Core Architecture

Analysis runs through four sequential layers:

1. **Rule Engine** — Validates KYC status, accreditation, document completeness, cross-document field consistency, SLA adherence, and stage-readiness conflicts
2. **LLM Analysis** — Sends structured deal context and rule findings to GPT-4o-mini for blockers, risk summary, and recommended next action
3. **Dual Scoring** — Combines rule signals and LLM output into two independent scores: risk (violation severity) and readiness (deal progress toward close)
4. **Audit Trail** — Records evidence, decision trace, and communication signals for explainability

## Key Capabilities

The system handles a range of deal operations scenarios:

- **False Readiness Detection**: "This deal reached settlement but buyer KYC is incomplete and three documents have conflicting share counts"
- **Document Inconsistency Analysis**: "The subscription agreement shows 2100 shares, the draft shows 1800 — majority value across documents is 2000"
- **Pipeline Prioritization**: Ranks deals by readiness status (blocked → at risk → ready), priority, and score for the action queue
- **Escalation Routing**: Flags cross-document mismatches to legal; suppresses alerts for closed deals
- **Operational Email Generation**: Drafts client-facing or internal follow-up emails referencing specific detected issues, counterparty names, and suggested next actions

## Scoring Systems

**Risk Score (0–100)** measures compliance violation severity:

| Signal | Points |
|---|---|
| Missing required documents | +20 |
| SLA breach | +20 |
| Cross-document field conflict | +15 |
| Document vs. deal record mismatch | +15 |
| Stage conflict (critical gap but deal advanced) | +15 |
| KYC incomplete | +10 |
| Accreditation not verified | +10 |
| LLM-identified blockers | +10 each |

**Readiness Score (0–100)** measures deal progress toward close:

| Component | Max Points |
|---|---|
| Document completion (submitted / required for stage) | 50 |
| Stage progression (intake → closed pipeline position) | 30 |
| Deadline buffer (time remaining as % of total duration) | 20 |

The two scores are intentionally independent: a deal can be high-readiness (near closing) and high-risk (critical violations unresolved) simultaneously — which is exactly the false-readiness case the system is designed to surface.

## Rule Checks

Eight validation checks run on every deal:

1. Missing documents — compared against per-stage workflow template requirements; cumulative check for closed deals
2. SLA breach — hours elapsed in current stage vs. template threshold
3. Field mismatches — extracted document fields vs. deal record (share count, seller legal name)
4. Cross-document consistency — groups documents by field value, identifies majority vs. outliers
5. KYC status — buyer and seller independently checked
6. Accreditation verification — both counterparties must be verified investors
7. Stage readiness conflicts — late-stage deals (signature / settlement / closed) checked for unmet critical requirements
8. Communication blockers — keyword detection across message threads (waiting, missing, issue, delay, consent, approval)

## Technical Stack

- **Backend**: FastAPI (Python 3.10), Pydantic, Uvicorn
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **LLM**: OpenAI GPT-4o-mini (analysis and email generation, with rule-based fallback)
- **Data**: JSON flat files loaded into memory at startup

## Running Locally

```bash
# 1. Create environment
conda env create -f env.yml
conda activate hiive

# 2. Start backend (port 8000)
cd backend
uvicorn app.main:app --reload

# 3. Start frontend (port 3000)
cd frontend
npm install && npm run dev
```

API docs available at `http://localhost:8000/docs`.

## API Reference

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/deals` | List all deals |
| POST | `/deals/{deal_id}/analyze` | Full analysis pipeline: rules → LLM → scoring → audit |
| POST | `/generate-email` | Generate follow-up email (`mode`: client or internal) |
| GET | `/dashboard/overview` | KPI summary across all deals |
| GET | `/dashboard/pipeline` | Per-stage breakdown with SLA and readiness counts |
| GET | `/dashboard/action-queue` | Filtered and sorted action queue |

## Design Philosophy

The system is explicit by design. Every risk signal has a named source — a specific document, a field value, a SLA timestamp. LLM output is layered on top of deterministic rules, not in place of them, so results are reproducible and auditable. The audit trail records not just what was flagged, but the evidence behind each flag — making it suitable for compliance-sensitive operations where explainability matters.
