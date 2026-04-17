"use client";

import { useEffect, useMemo, useState } from "react";
import CrossDocViz from "@/components/CrossDocViz";
import EmailGenerator from "@/components/EmailGenerator";
import Timeline from "@/components/Timeline";
import AuditPanel from "@/components/AuditPanel";

type DealSummary = {
  deal_id: string;
  company_name: string;
  current_stage: string;
  priority?: string;
  status?: string;
};

const STAGE_ORDER = ["new", "screening", "review", "signature", "settlement", "closed", "hold"];

function stageGroupSortKey(stage: string) {
  const s = stage.toLowerCase();
  for (let i = 0; i < STAGE_ORDER.length; i++) {
    if (s.includes(STAGE_ORDER[i])) return i;
  }
  return STAGE_ORDER.length;
}

function SectionGroupHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 border-t border-slate-200" />
    </div>
  );
}

export default function Home() {
  const [selectedDeal, setSelectedDeal] = useState("D-1005");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [forceFallback, setForceFallback] = useState(false);
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

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

  const filteredDeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter(
      (deal) =>
        deal.deal_id?.toLowerCase().includes(q) ||
        deal.company_name?.toLowerCase().includes(q) ||
        deal.current_stage?.toLowerCase().includes(q) ||
        deal.priority?.toLowerCase().includes(q)
    );
  }, [deals, search]);

  const groupedDeals = useMemo(() => {
    const map: Record<string, DealSummary[]> = {};
    filteredDeals.forEach((deal) => {
      const key = deal.current_stage || "Unknown";
      if (!map[key]) map[key] = [];
      map[key].push(deal);
    });
    return Object.entries(map).sort(
      ([a], [b]) => stageGroupSortKey(a) - stageGroupSortKey(b)
    );
  }, [filteredDeals]);

  const toggleGroup = (stage: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(stage)) next.delete(stage);
      else next.add(stage);
      return next;
    });
  };

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
        rule_issues: {},
        blockers: [],
        readiness_status: "unknown",
        readiness_score: 0,
        readiness_reasons: [],
        stage_events: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const readinessStatus = data?.readiness_status || "unknown";

  const readinessBadgeClass =
    readinessStatus === "ready"
      ? "bg-green-100 text-green-700"
      : readinessStatus === "at_risk"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  const readinessBarClass =
    readinessStatus === "ready"
      ? "bg-green-500"
      : readinessStatus === "at_risk"
      ? "bg-yellow-400"
      : "bg-red-400";

  const priorityBadgeClass = (priority?: string) => {
    const p = (priority || "").toLowerCase();
    if (p === "high") return "bg-red-100 text-red-700";
    if (p === "medium") return "bg-yellow-100 text-yellow-700";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="h-screen flex bg-slate-50">
      {/* ── LEFT PANEL ── */}
      <div className="w-72 border-r bg-white flex flex-col shrink-0">
        {/* Header */}
        <div className="px-4 py-4 border-b">
          <h2 className="text-xs font-semibold tracking-widest text-slate-800 uppercase">
            Deal Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a deal to run readiness analysis
          </p>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, company, or stage…"
            className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-slate-300 placeholder:text-slate-400"
          />
        </div>

        {/* Fallback toggle */}
        <div className="px-4 py-2.5 border-b">
          <label className="flex gap-2 items-center text-xs text-slate-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={forceFallback}
              onChange={(e) => setForceFallback(e.target.checked)}
              className="accent-slate-700"
            />
            Fallback Mode
          </label>
        </div>

        {/* Grouped deal list */}
        <div className="flex-1 overflow-y-auto py-2">
          {dealsLoading && (
            <div className="px-4 py-3 text-xs text-slate-400">Loading deals…</div>
          )}
          {!dealsLoading && filteredDeals.length === 0 && (
            <div className="px-4 py-3 text-xs text-slate-400">No deals found.</div>
          )}

          {groupedDeals.map(([stage, stageDeals]) => {
            const isCollapsed = collapsedGroups.has(stage);
            return (
              <div key={stage} className="mb-1">
                {/* Stage group header */}
                <button
                  onClick={() => toggleGroup(stage)}
                  className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-slate-50 transition text-left"
                >
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {stage}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 tabular-nums">{stageDeals.length}</span>
                    <span className="text-slate-300 text-xs">{isCollapsed ? "▶" : "▼"}</span>
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="px-2 space-y-0.5 pb-1">
                    {stageDeals.map((deal) => {
                      const isSelected = selectedDeal === deal.deal_id;
                      return (
                        <div
                          key={deal.deal_id}
                          onClick={() => analyze(deal.deal_id)}
                          className={`rounded-md px-3 py-2.5 cursor-pointer transition ${
                            isSelected
                              ? "bg-slate-900 text-white"
                              : "hover:bg-slate-50 border border-transparent hover:border-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs font-mono ${
                                isSelected ? "text-slate-400" : "text-slate-400"
                              }`}
                            >
                              {deal.deal_id}
                            </span>
                            {deal.priority && (
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                  isSelected
                                    ? "bg-white/15 text-white"
                                    : priorityBadgeClass(deal.priority)
                                }`}
                              >
                                {deal.priority}
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-sm font-medium mt-0.5 ${
                              isSelected ? "text-white" : "text-slate-800"
                            }`}
                          >
                            {deal.company_name}
                          </div>
                          {deal.status && (
                            <div
                              className={`text-xs mt-0.5 ${
                                isSelected ? "text-slate-400" : "text-slate-400"
                              }`}
                            >
                              {deal.status}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 overflow-y-auto">
        {!data && !loading && (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Select a deal to begin analysis
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Analyzing deal…
          </div>
        )}

        {data && !loading && (
          <div className="max-w-4xl mx-auto px-8 py-8 space-y-10">
            {/* ── DEAL HEADER ── */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Deal</p>
                <h1 className="text-2xl font-bold text-slate-900">{data.deal_id}</h1>
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                  {data.source}
                </span>
                {data.source === "fallback" && (
                  <span className="px-2.5 py-1 rounded bg-orange-100 text-orange-700 text-xs font-medium">
                    Fallback Mode
                  </span>
                )}
                <span className="px-2.5 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-medium">
                  {data.risk_level}
                </span>
              </div>
            </div>

            {data.error && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 rounded-lg text-sm text-red-700">
                <b>Error:</b> {data.error}
              </div>
            )}

            {/* ══ GROUP 1: OVERVIEW ══ */}
            <section>
              <SectionGroupHeader label="Overview" />
              <div className="space-y-3">
                {/* Readiness */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-semibold text-slate-800">Deal Readiness</h2>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${readinessBadgeClass}`}
                    >
                      {readinessStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${readinessBarClass}`}
                        style={{ width: `${data.readiness_score ?? 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 tabular-nums w-16 text-right">
                      {data.readiness_score ?? 0} / 100
                    </span>
                  </div>
                  {data.readiness_reasons?.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                        Gaps
                      </p>
                      <ul className="space-y-1">
                        {data.readiness_reasons.map((r: string, i: number) => (
                          <li key={i} className="text-sm text-slate-600 flex gap-2">
                            <span className="text-red-400 shrink-0">•</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h2 className="text-sm font-semibold text-slate-800 mb-2">Summary</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{data.llm_summary}</p>
                </div>

                {/* Next Action */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h2 className="text-sm font-semibold text-slate-800 mb-2">Next Action</h2>
                  <p className="text-sm text-slate-600">{data.next_action}</p>
                </div>
              </div>
            </section>

            {/* ══ GROUP 2: RISK & COMPLIANCE ══ */}
            <section>
              <SectionGroupHeader label="Risk & Compliance" />
              <div className="space-y-3">
                {/* Stage Conflicts */}
                {data.rule_issues?.stage_conflicts?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h2 className="text-sm font-semibold text-red-700 mb-2">
                      Stage Readiness Conflict
                    </h2>
                    <ul className="space-y-1">
                      {data.rule_issues.stage_conflicts.map((c: string, i: number) => (
                        <li key={i} className="text-sm text-red-600 flex gap-2">
                          <span className="shrink-0">•</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Communication Signals */}
                {data.rule_issues?.communication_flags?.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h2 className="text-sm font-semibold text-yellow-800 mb-2">
                      Communication Signals
                    </h2>
                    <ul className="space-y-1">
                      {data.rule_issues.communication_flags.map((f: string, i: number) => (
                        <li key={i} className="text-sm text-yellow-700 flex gap-2">
                          <span className="shrink-0">•</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Blockers */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h2 className="text-sm font-semibold text-slate-800 mb-2">Blockers</h2>
                  {data.blockers?.length ? (
                    <ul className="space-y-1">
                      {data.blockers.map((b: string, i: number) => (
                        <li key={i} className="text-sm text-slate-600 flex gap-2">
                          <span className="text-orange-400 shrink-0">•</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400">No blockers</p>
                  )}
                </div>

                {/* Risk Signals — consolidated card */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h2 className="text-sm font-semibold text-slate-800 mb-4">Risk Signals</h2>
                  <div className="divide-y divide-slate-100 space-y-0">
                    {/* Missing Documents */}
                    <div className="pb-4">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        Missing Documents
                      </h3>
                      {data.rule_issues?.missing_documents?.length ? (
                        <ul className="space-y-1">
                          {data.rule_issues.missing_documents.map((d: string, i: number) => (
                            <li key={i} className="text-sm text-slate-600 flex gap-2">
                              <span className="text-red-400 shrink-0">•</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-400">None</p>
                      )}
                    </div>

                    {/* SLA */}
                    <div className="py-4">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        SLA Status
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                          data.rule_issues?.sla_breach ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full inline-block shrink-0 ${
                            data.rule_issues?.sla_breach ? "bg-red-400" : "bg-green-400"
                          }`}
                        />
                        {data.rule_issues?.sla_breach ? "Breached" : "Within SLA"}
                      </span>
                    </div>

                    {/* KYC */}
                    <div className="py-4">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        KYC Issues
                      </h3>
                      {data.rule_issues?.kyc_issues?.length ? (
                        <ul className="space-y-1">
                          {data.rule_issues.kyc_issues.map((k: string, i: number) => (
                            <li key={i} className="text-sm text-slate-600 flex gap-2">
                              <span className="text-orange-400 shrink-0">•</span>
                              {k}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-400">None</p>
                      )}
                    </div>

                    {/* Field Mismatches */}
                    <div className="py-4">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        Field Mismatches
                      </h3>
                      {data.rule_issues?.field_mismatches?.length ? (
                        <div className="space-y-2">
                          {data.rule_issues.field_mismatches.map((m: any, i: number) => (
                            <div
                              key={i}
                              className="text-sm border border-slate-100 rounded-md p-2.5 bg-slate-50"
                            >
                              <div className="font-medium text-slate-700">{m.type}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                Doc: {m.document_id}
                              </div>
                              <div className="text-xs text-slate-600 mt-0.5">
                                Expected <b>{m.expected}</b> · Got <b>{m.actual}</b>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">None</p>
                      )}
                    </div>

                    {/* Cross-Document Consistency */}
                    <div className="pt-4">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        Cross-Document Consistency
                      </h3>
                      <CrossDocViz data={data.rule_issues?.cross_doc_mismatch} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ══ GROUP 3: DEAL ACTIVITY ══ */}
            <section>
              <SectionGroupHeader label="Deal Activity" />
              <div className="space-y-3">
                <Timeline events={data.stage_events || []} />
                {data.audit_trail && <AuditPanel audit={data.audit_trail} />}
              </div>
            </section>

            {/* ══ GROUP 4: OUTREACH ══ */}
            <section>
              <SectionGroupHeader label="Outreach" />
              <div className="space-y-3">
                {data.escalation?.needed && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h2 className="text-sm font-semibold text-red-700 mb-2">
                      Escalation Required
                    </h2>
                    <div className="text-sm text-red-600 space-y-1">
                      <p>
                        <span className="font-medium">Owner:</span> {data.escalation.owner}
                      </p>
                      <p>
                        <span className="font-medium">Reason:</span> {data.escalation.reason}
                      </p>
                    </div>
                  </div>
                )}
                <EmailGenerator data={data} />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
