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

export default function Home() {
  const [selectedDeal, setSelectedDeal] = useState("D-1005");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [forceFallback, setForceFallback] = useState(false);

  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [search, setSearch] = useState("");

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

    return deals.filter((deal) => {
      return (
        deal.deal_id?.toLowerCase().includes(q) ||
        deal.company_name?.toLowerCase().includes(q) ||
        deal.current_stage?.toLowerCase().includes(q) ||
        deal.priority?.toLowerCase().includes(q)
      );
    });
  }, [deals, search]);

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

  const stageBadgeClass = (stage?: string) => {
    const s = (stage || "").toLowerCase();

    if (s.includes("closed") || s.includes("settlement")) {
      return "bg-green-100 text-green-700";
    }
    if (s.includes("review") || s.includes("signature")) {
      return "bg-yellow-100 text-yellow-700";
    }
    if (s.includes("hold")) {
      return "bg-red-100 text-red-700";
    }
    return "bg-slate-100 text-slate-700";
  };

  const priorityBadgeClass = (priority?: string) => {
    const p = (priority || "").toLowerCase();

    if (p === "high") return "bg-red-100 text-red-700";
    if (p === "medium") return "bg-yellow-100 text-yellow-700";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="h-screen flex bg-slate-50">
      {/* LEFT PANEL */}
      <div className="w-80 border-r bg-white p-4 flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Deal Pipeline</h2>
          <p className="text-sm text-gray-500 mt-1">
            Browse active deals and run readiness analysis.
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deal, company, stage..."
            className="w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {/* Fallback Toggle */}
        <div className="mb-4">
          <label className="flex gap-2 items-center text-sm">
            <input
              type="checkbox"
              checked={forceFallback}
              onChange={(e) => setForceFallback(e.target.checked)}
            />
            Fallback Mode
          </label>
        </div>

        {/* Deal List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {dealsLoading && (
            <div className="text-sm text-gray-500">Loading deals...</div>
          )}

          {!dealsLoading && filteredDeals.length === 0 && (
            <div className="text-sm text-gray-500">No deals found.</div>
          )}

          {filteredDeals.map((deal) => {
            const isSelected = selectedDeal === deal.deal_id;

            return (
              <div
                key={deal.deal_id}
                onClick={() => analyze(deal.deal_id)}
                className={`rounded-lg border p-3 cursor-pointer transition ${
                  isSelected
                    ? "bg-black text-white border-black"
                    : "bg-white hover:bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{deal.deal_id}</div>
                    <div
                      className={`text-sm ${
                        isSelected ? "text-slate-200" : "text-gray-600"
                      }`}
                    >
                      {deal.company_name}
                    </div>
                  </div>

                  {deal.priority && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : priorityBadgeClass(deal.priority)
                      }`}
                    >
                      {deal.priority}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      isSelected
                        ? "bg-white/15 text-white"
                        : stageBadgeClass(deal.current_stage)
                    }`}
                  >
                    {deal.current_stage}
                  </span>

                  {deal.status && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {deal.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-6 overflow-y-auto">
        {!data && !loading && (
          <div className="text-gray-500">
            Select a deal from the left panel to analyze.
          </div>
        )}

        {loading && <p>Loading...</p>}

        {data && !loading && (
          <div className="space-y-4">
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Deal {data.deal_id}</h1>

              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 rounded bg-gray-200 text-sm">
                  {data.source}
                </span>

                {data.source === "fallback" && (
                  <span className="px-3 py-1 rounded bg-orange-200 text-sm">
                    Fallback Mode
                  </span>
                )}

                <span className="px-3 py-1 rounded bg-yellow-200 text-sm">
                  {data.risk_level}
                </span>
              </div>
            </div>

            {/* ERROR */}
            {data.error && (
              <div className="border border-red-300 bg-red-50 p-3 rounded">
                <b>Error:</b> {data.error}
              </div>
            )}

            {/* READINESS PANEL */}
            <div className="border p-4 rounded bg-white">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">Deal Readiness</h2>

                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${readinessBadgeClass}`}
                >
                  {readinessStatus.toUpperCase()}
                </span>
              </div>

              <p className="text-sm mb-3">
                Score: <b>{data.readiness_score ?? 0}</b> / 100
              </p>

              {data.readiness_reasons?.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-1">Why not ready:</div>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {data.readiness_reasons.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* SUMMARY */}
            <div className="border p-4 rounded bg-white">
              <h2 className="font-semibold mb-2">Summary</h2>
              <p>{data.llm_summary}</p>
            </div>

            {/* BLOCKERS */}
            <div className="border p-4 rounded bg-white">
              <h2 className="font-semibold mb-2">Blockers</h2>
              <ul>
                {data.blockers?.map((b: string, i: number) => (
                  <li key={i}>• {b}</li>
                ))}
              </ul>
            </div>

            {/* RISK SIGNALS */}
            <div className="border p-4 rounded bg-white">
              <h2 className="font-semibold mb-3">Risk Signals (Rule Engine)</h2>

              {/* Missing Docs */}
              <div className="mb-4">
                <h3 className="font-medium">Missing Documents</h3>
                {data.rule_issues?.missing_documents?.length ? (
                  <ul className="list-disc pl-5">
                    {data.rule_issues.missing_documents.map((d: string, i: number) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">None</p>
                )}
              </div>

              {/* SLA */}
              <div className="mb-4">
                <h3 className="font-medium">SLA Breach</h3>
                <p>{data.rule_issues?.sla_breach ? "⚠ Breached" : "OK"}</p>
              </div>

              {/* KYC */}
              <div className="mb-4">
                <h3 className="font-medium">KYC Issues</h3>
                {data.rule_issues?.kyc_issues?.length ? (
                  <ul className="list-disc pl-5">
                    {data.rule_issues.kyc_issues.map((k: string, i: number) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">None</p>
                )}
              </div>

              {/* Field Mismatch */}
              <div className="mb-4">
                <h3 className="font-medium">Field Mismatches</h3>
                {data.rule_issues?.field_mismatches?.length ? (
                  data.rule_issues.field_mismatches.map((m: any, i: number) => (
                    <div key={i} className="p-3 border rounded mb-2">
                      <div className="font-medium">{m.type}</div>
                      <div className="text-sm text-gray-600">Doc: {m.document_id}</div>
                      <div className="text-sm">
                        Expected: {m.expected} | Actual: {m.actual}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">None</p>
                )}
              </div>

              {/* Cross Doc */}
              <div>
                <h3 className="font-medium mb-2">Cross Document Consistency</h3>
                <CrossDocViz data={data.rule_issues?.cross_doc_mismatch} />
              </div>
            </div>

            {/* TIMELINE */}
            <Timeline events={data.stage_events || []} />

            {/* AUDIT */}
            {data.audit_trail && <AuditPanel audit={data.audit_trail} />}

            {/* ESCALATION */}
            {data.escalation?.needed && (
              <div className="border p-4 rounded bg-red-50">
                <h2 className="font-semibold text-red-700">Escalation Needed</h2>
                <p>Owner: {data.escalation.owner}</p>
                <p>Reason: {data.escalation.reason}</p>
              </div>
            )}

            {/* NEXT ACTION */}
            <div className="border p-4 rounded bg-white">
              <h2 className="font-semibold mb-2">Next Action</h2>
              <p>{data.next_action}</p>
            </div>

            {/* EMAIL GENERATOR */}
            <EmailGenerator data={data} />
          </div>
        )}
      </div>
    </div>
  );
}