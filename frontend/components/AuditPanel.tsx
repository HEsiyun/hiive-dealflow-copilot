"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, MessageSquare } from "lucide-react";
import type { AuditTrail } from "@/types/deal";

const TAG_STYLES: Record<string, { label: string; cls: string }> = {
  field_mismatch:       { label: "MISMATCH",    cls: "bg-orange-100 text-orange-700 border-orange-200" },
  cross_doc_mismatch:   { label: "CONFLICT",    cls: "bg-red-100 text-red-700 border-red-200" },
  kyc_issue:            { label: "KYC",         cls: "bg-purple-100 text-purple-700 border-purple-200" },
  missing_document:     { label: "MISSING DOC", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  sla_breach:           { label: "SLA",         cls: "bg-red-100 text-red-700 border-red-200" },
  accreditation_issue:  { label: "ACCREDIT",    cls: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  stage_conflict:       { label: "STAGE",       cls: "bg-rose-100 text-rose-700 border-rose-200" },
  communication_flag:   { label: "COMMS",       cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
};

export default function AuditPanel({ audit }: { audit: AuditTrail }) {
  const [open, setOpen] = useState(false);

  if (!audit) return null;

  const itemCount = (audit.evidence?.length || 0) + (audit.key_risks?.length || 0);

  return (
    <Card className="overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 h-auto rounded-none"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="size-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="size-3.5 text-slate-400" />
          )}
          <span className="text-sm font-semibold text-slate-800">Audit Trail</span>
          <Badge variant="secondary" className="text-xs">{itemCount} items</Badge>
        </div>
        <span className="text-xs text-slate-400">{open ? "Hide" : "Show"}</span>
      </Button>

      {open && (
        <CardContent className="border-t border-slate-100 p-0 text-sm">

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">

            {/* Key Risks */}
            <div className="px-4 py-3">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Key Risks
              </p>
              {audit.key_risks?.length ? (
                <ul className="space-y-1">
                  {audit.key_risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                        {i + 1}
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">None identified</p>
              )}
            </div>

            {/* Decision Trace */}
            <div className="px-4 py-3">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Decision Trace
              </p>
              {audit.decision_trace?.length ? (
                <div className="flex flex-col gap-1">
                  {audit.decision_trace.map((d, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <span className="text-slate-300 shrink-0 mt-px">
                        {i === 0 ? "①" : i === 1 ? "②" : "③"}
                      </span>
                      {d}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Evidence */}
          {audit.evidence?.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Evidence
              </p>
              <div className="space-y-2">
                {audit.evidence.map((e, i) => {
                  const tag = TAG_STYLES[e.type] || {
                    label: e.type.toUpperCase(),
                    cls: "bg-slate-100 text-slate-600 border-slate-200",
                  };
                  const isComm = e.type === "communication_flag";
                  const detail =
                    e.type === "cross_doc_mismatch"
                      ? `${e.value} — ${e.documents?.join(", ")}`
                      : e.type === "field_mismatch"
                      ? `${e.document_id}: ${e.detail}`
                      : e.detail;

                  return (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex items-start gap-2 text-xs">
                        <Badge className={`shrink-0 mt-0.5 border text-[10px] px-1.5 py-0 ${tag.cls}`}>
                          {tag.label}
                        </Badge>
                        <span className="text-slate-600 leading-snug">{detail}</span>
                      </div>
                      {isComm && e.snippet && (
                        <div className="ml-[52px] border-l-2 border-yellow-300 pl-2.5 py-0.5">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <MessageSquare className="size-2.5 text-slate-400" />
                            <span className="text-[10px] text-slate-400">
                              {e.sender_role} · {e.channel}
                              {e.subject ? ` · "${e.subject}"` : ""}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 italic leading-snug">
                            "{e.snippet}"
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </CardContent>
      )}
    </Card>
  );
}
