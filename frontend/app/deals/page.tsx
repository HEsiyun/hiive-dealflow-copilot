"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutDashboard, ShieldAlert, Activity, Send, ArrowLeft, ChevronRight } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import SectionHeader from "@/components/layout/SectionHeader";
import DealSidebar from "@/components/deal/DealSidebar";
import DealEmptyState from "@/components/deal/DealEmptyState";
import DealHeader from "@/components/deal/DealHeader";
import DealKpiStrip from "@/components/deal/DealKpiStrip";
import EscalationBanner from "@/components/deal/EscalationBanner";
import ReadinessCard from "@/components/deal/ReadinessCard";
import SummaryNextActionRow from "@/components/deal/SummaryNextActionRow";
import AlertCards from "@/components/deal/AlertCards";
import BlockersCard from "@/components/deal/BlockersCard";
import ComplianceCard from "@/components/deal/ComplianceCard";
import DocumentCards from "@/components/deal/DocumentCards";
import Timeline from "@/components/Timeline";
import AuditPanel from "@/components/AuditPanel";
import EmailGenerator from "@/components/EmailGenerator";

import type { DealSummary, DealAnalysis } from "@/types/deal";

export default function DealsPage() {
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState("D-1005");
  const [data, setData] = useState<DealAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [forceFallback, setForceFallback] = useState(false);
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [dealsLoading, setDealsLoading] = useState(false);

  useEffect(() => {
    const fetchDeals = async () => {
      setDealsLoading(true);
      try {
        const res = await fetch("http://localhost:8000/deals");
        const json = await res.json();
        setDeals(json);
      } catch (err) {
        console.error("Failed to load deals", err);
      } finally {
        setDealsLoading(false);
      }
    };
    fetchDeals();
  }, []);

  useEffect(() => {
    const dealId = searchParams.get("deal");
    if (dealId) {
      setSidebarOpen(false);
      analyze(dealId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const analyze = async (dealId: string) => {
    setLoading(true);
    setSelectedDeal(dealId);
    try {
      const res = await fetch(
        `http://localhost:8000/deals/${dealId}/analyze?force_fallback=${forceFallback}`,
        { method: "POST" }
      );
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setData({
        deal_id: dealId,
        error: err.message,
        source: "frontend-error",
        rule_issues: {
          missing_documents: [],
          sla_breach: false,
          field_mismatches: [],
          kyc_issues: [],
          cross_doc_mismatch: null,
          accreditation_issues: [],
          stage_conflicts: [],
          communication_flags: [],
          sla_detail: null,
        },
        blockers: [],
        readiness_status: "unknown",
        readiness_score: 0,
        readiness_reasons: [],
        stage_events: [],
        risk_score: 0,
        risk_level: "unknown",
        audit_trail: { why_this_score: "", key_risks: [], evidence: [], decision_trace: [] },
        llm_summary: null,
        next_action: null,
        escalation: { needed: false, owner: null, reason: null },
      });
    } finally {
      setLoading(false);
    }
  };

  const collapsedSidebar = (
    <div className="w-9 border-r border-slate-200 bg-white flex flex-col items-center pt-3 shrink-0">
      <button
        onClick={() => setSidebarOpen(true)}
        title="Open deal pipeline"
        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );

  return (
    <AppShell
      sidebar={
        sidebarOpen ? (
          <DealSidebar
            deals={deals}
            dealsLoading={dealsLoading}
            selectedDeal={selectedDeal}
            forceFallback={forceFallback}
            onSelectDeal={(id) => { analyze(id); }}
            onToggleFallback={setForceFallback}
            onClose={() => setSidebarOpen(false)}
          />
        ) : (
          collapsedSidebar
        )
      }
    >
      {/* Top header bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 py-2.5 flex items-center gap-3">
        <a
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="size-3.5" />
          Dashboard
        </a>
        <span className="text-slate-200">|</span>
        <span className="text-xs font-semibold text-slate-700">Deal Analysis</span>
      </div>

      {!data && !loading ? (
        <DealEmptyState loading={false} />
      ) : loading ? (
        <DealEmptyState loading />
      ) : data ? (
        <div className="max-w-5xl mx-auto px-8 py-6 space-y-8">
          {/* KPI overview strip */}
          <DealKpiStrip />

          {/* Deal header */}
          <DealHeader data={data} />

          {data.error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 rounded-lg text-sm text-red-700">
              <b>Error:</b> {data.error}
            </div>
          )}

          {/* Escalation banner — at top for visibility */}
          <EscalationBanner escalation={data.escalation} />

          {/* Overview */}
          <section>
            <SectionHeader icon={LayoutDashboard} label="Overview" />
            <div className="space-y-3">
              <ReadinessCard data={data} />
              <SummaryNextActionRow data={data} />
            </div>
          </section>

          {/* Risk & Compliance */}
          <section>
            <SectionHeader icon={ShieldAlert} label="Risk & Compliance" />
            <div className="space-y-3">
              <AlertCards ruleIssues={data.rule_issues} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <BlockersCard blockers={data.blockers} />
                <ComplianceCard ruleIssues={data.rule_issues} />
              </div>
              <DocumentCards ruleIssues={data.rule_issues} />
            </div>
          </section>

          {/* Deal Activity */}
          <section>
            <SectionHeader icon={Activity} label="Deal Activity" />
            <div className="space-y-3">
              <Timeline events={data.stage_events || []} />
              {data.audit_trail && <AuditPanel audit={data.audit_trail} />}
            </div>
          </section>

          {/* Outreach */}
          <section>
            <SectionHeader icon={Send} label="Outreach" />
            <div className="space-y-3">
              <EmailGenerator data={data} />
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
