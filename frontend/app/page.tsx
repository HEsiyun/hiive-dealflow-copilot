"use client";

import { useState } from "react";
import CrossDocViz from "@/components/CrossDocViz";
import EmailGenerator from "@/components/EmailGenerator";
import Timeline from "@/components/Timeline";
import AuditPanel from "@/components/AuditPanel";

const DEALS = ["D-1001", "D-1002", "D-1003", "D-1005"];

export default function Home() {
  const [selectedDeal, setSelectedDeal] = useState("D-1005");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [forceFallback, setForceFallback] = useState(false);

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
      });
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex bg-slate-50">

      {/* LEFT PANEL */}
      <div className="w-64 border-r bg-white p-4">
        <h2 className="text-lg font-semibold mb-4">Deals</h2>

        <div className="space-y-2">
          {DEALS.map((deal) => (
            <div
              key={deal}
              onClick={() => analyze(deal)}
              className={`p-2 rounded cursor-pointer ${
                selectedDeal === deal
                  ? "bg-black text-white"
                  : "hover:bg-slate-100"
              }`}
            >
              {deal}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <label className="flex gap-2 items-center text-sm">
            <input
              type="checkbox"
              checked={forceFallback}
              onChange={(e) => setForceFallback(e.target.checked)}
            />
            Fallback Mode
          </label>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-6 overflow-y-auto">

        {!data && <p>Select a deal to analyze</p>}
        {loading && <p>Loading...</p>}

        {data && (
          <div className="space-y-4">

            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">
                Deal {data.deal_id}
              </h1>

              <div className="flex gap-2">
                <span className="px-3 py-1 rounded bg-gray-200">
                  {data.source}
                </span>

                {data.source === "fallback" && (
                  <span className="px-3 py-1 rounded bg-orange-200">
                    Fallback Mode
                  </span>
                )}

                <span className="px-3 py-1 rounded bg-yellow-200">
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

            {/* SUMMARY */}
            <div className="border p-4 rounded">
              <h2 className="font-semibold mb-2">Summary</h2>
              <p>{data.llm_summary}</p>
            </div>

            {/* BLOCKERS */}
            <div className="border p-4 rounded">
              <h2 className="font-semibold mb-2">Blockers</h2>
              <ul>
                {data.blockers?.map((b: string, i: number) => (
                  <li key={i}>• {b}</li>
                ))}
              </ul>
            </div>

            {/* RISK SIGNALS */}
            <div className="border p-4 rounded">
              <h2 className="font-semibold mb-3">Risk Signals (Rule Engine)</h2>

              {/* Missing Docs */}
              <div className="mb-4">
                <h3 className="font-medium">Missing Documents</h3>
                {data.rule_issues.missing_documents?.length ? (
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
                <p>{data.rule_issues.sla_breach ? "⚠ Breached" : "OK"}</p>
              </div>

              {/* KYC */}
              <div className="mb-4">
                <h3 className="font-medium">KYC Issues</h3>
                {data.rule_issues.kyc_issues?.length ? (
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
                {data.rule_issues.field_mismatches?.length ? (
                  data.rule_issues.field_mismatches.map((m: any, i: number) => (
                    <div key={i} className="p-3 border rounded mb-2">
                      <div className="font-medium">{m.type}</div>
                      <div className="text-sm text-gray-600">
                        Doc: {m.document_id}
                      </div>
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
                <CrossDocViz data={data.rule_issues.cross_doc_mismatch} />
              </div>
            </div>

            {/* NEXT ACTION */}
            <div className="border p-4 rounded">
              <h2 className="font-semibold mb-2">Next Action</h2>
              <p>{data.next_action}</p>
            </div>

            {/* TIMELINE */}
            <Timeline events={data.stage_events || []} />

            {/* AUDIT */}
            {data.audit_trail && <AuditPanel audit={data.audit_trail} />}

            {/* EMAIL GENERATOR */}
            <EmailGenerator data={data} />

          </div>
        )}
      </div>
    </div>
  );
}