export type DealSummary = {
  deal_id: string;
  company_name: string;
  current_stage: string;
  priority?: string;
  status?: string;
};

export type FieldMismatch = {
  type: string;
  document_id: string;
  detail: string;
  expected: string;
  actual: string;
};

export type CrossDocGroup = {
  value: string;
  document_ids: string[];
};

export type CrossDocMismatch = {
  majority_value: string;
  groups: CrossDocGroup[];
};

export type SlaDetail = {
  elapsed_hours: number;
  sla_hours: number;
};

export type RuleIssues = {
  missing_documents: string[];
  sla_breach: boolean;
  field_mismatches: FieldMismatch[];
  kyc_issues: string[];
  cross_doc_mismatch: CrossDocMismatch | null;
  accreditation_issues: string[];
  stage_conflicts: string[];
  communication_flags: string[];
  sla_detail: SlaDetail | null;
};

export type AuditEvidence = {
  type: string;
  document_id?: string;
  detail?: string;
  value?: string;
  documents?: string[];
};

export type AuditTrail = {
  why_this_score: string;
  key_risks: string[];
  evidence: AuditEvidence[];
  decision_trace: string[];
};

export type Escalation = {
  needed: boolean;
  owner: string | null;
  reason: string | null;
};

export type StageEvent = {
  event_id: string;
  deal_id: string;
  from_stage: string | null;
  to_stage: string;
  changed_at: string;
  changed_by: string;
};

export type DealAnalysis = {
  deal_id: string;
  risk_score: number;
  risk_level: string;
  readiness_score: number;
  readiness_status: string;
  readiness_reasons: string[];
  rule_issues: RuleIssues;
  audit_trail: AuditTrail;
  llm_summary: string | null;
  blockers: string[];
  next_action: string | null;
  escalation: Escalation;
  source: string;
  error: string | null;
  stage_events: StageEvent[];
};

export type OverviewData = {
  total_deals: number;
  ready_count: number;
  at_risk_count: number;
  blocked_count: number;
  sla_breach_count: number;
  escalation_count: number;
  kyc_issue_count: number;
  document_conflict_count: number;
};
