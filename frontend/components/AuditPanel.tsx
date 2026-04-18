"use client";

import { useState } from "react";

export default function AuditPanel({ audit }: any) {
  const [open, setOpen] = useState(false);

  if (!audit) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-800">Audit Trail</h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            {(audit.evidence?.length || 0) + (audit.key_risks?.length || 0)} items
          </span>
        </div>
        <span className="text-xs text-slate-400">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="border-t border-slate-100">
          {/* Why this score — highlighted */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Score Rationale
            </h3>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {audit.why_this_score}
            </p>
          </div>

          <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Risks */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Key Risks
              </h3>
              {audit.key_risks?.length ? (
                <div className="space-y-1.5">
                  {audit.key_risks.map((r: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-slate-700">{r}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">None identified</p>
              )}
            </div>

            {/* Evidence */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Evidence
              </h3>
              {audit.evidence?.length ? (
                <div className="space-y-1.5">
                  {audit.evidence.map((e: any, i: number) => {
                    const labelMap: Record<string, { label: string; cls: string }> = {
                      field_mismatch: { label: "MISMATCH", cls: "bg-orange-100 text-orange-700" },
                      cross_doc_mismatch: { label: "CONFLICT", cls: "bg-red-100 text-red-700" },
                      kyc_issue: { label: "KYC", cls: "bg-purple-100 text-purple-700" },
                      missing_document: { label: "MISSING DOC", cls: "bg-amber-100 text-amber-700" },
                      sla_breach: { label: "SLA", cls: "bg-red-100 text-red-700" },
                      accreditation_issue: { label: "ACCREDIT", cls: "bg-indigo-100 text-indigo-700" },
                      stage_conflict: { label: "STAGE", cls: "bg-rose-100 text-rose-700" },
                      communication_flag: { label: "COMMS", cls: "bg-yellow-100 text-yellow-700" },
                    };
                    const tag = labelMap[e.type] || { label: e.type.toUpperCase(), cls: "bg-slate-100 text-slate-600" };

                    const detail =
                      e.type === "cross_doc_mismatch"
                        ? `${e.value} — ${e.documents.join(", ")}`
                        : e.type === "field_mismatch"
                        ? `${e.document_id}: ${e.detail}`
                        : e.detail;

                    return (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className={`shrink-0 px-1.5 py-0.5 rounded text-xs font-semibold mt-0.5 ${tag.cls}`}>
                          {tag.label}
                        </span>
                        <span className="text-slate-600">{detail}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No evidence collected</p>
              )}
            </div>
          </div>

          {/* Decision Trace — numbered steps */}
          {audit.decision_trace?.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Decision Trace
              </h3>
              <div className="space-y-1">
                {audit.decision_trace.map((d: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-xs text-slate-400 tabular-nums font-mono shrink-0 mt-0.5 w-4 text-right">
                      {i + 1}.
                    </span>
                    <span className="text-slate-600">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
