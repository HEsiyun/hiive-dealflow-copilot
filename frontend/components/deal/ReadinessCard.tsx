import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DealAnalysis } from "@/types/deal";

const STATUS_BADGE: Record<string, string> = {
  ready:   "bg-green-100 text-green-700 border-green-200",
  at_risk: "bg-yellow-100 text-yellow-700 border-yellow-200",
  blocked: "bg-red-100 text-red-700 border-red-200",
};

const RISK_BADGE: Record<string, string> = {
  high:   "bg-red-100 text-red-700 border-red-200",
  medium: "bg-orange-100 text-orange-700 border-orange-200",
  low:    "bg-green-100 text-green-700 border-green-200",
};

const RISK_BAR: Record<string, string> = {
  high:   "bg-red-500",
  medium: "bg-orange-400",
  low:    "bg-green-400",
};

function getRiskFactors(data: DealAnalysis): { label: string; pts: number }[] {
  const f: { label: string; pts: number }[] = [];
  if (data.rule_issues?.missing_documents?.length)    f.push({ label: "Missing documents",    pts: 20 });
  if (data.rule_issues?.cross_doc_mismatch)           f.push({ label: "Cross-doc conflict",   pts: 15 });
  if (data.rule_issues?.field_mismatches?.length)     f.push({ label: "Field mismatches",     pts: 15 });
  if (data.rule_issues?.kyc_issues?.length)           f.push({ label: "KYC issues",           pts: 10 });
  if (data.rule_issues?.accreditation_issues?.length) f.push({ label: "Accreditation issues", pts: 10 });
  if (data.rule_issues?.sla_breach)                   f.push({ label: "SLA breach",           pts: 20 });
  if (data.rule_issues?.stage_conflicts?.length)      f.push({ label: "Stage conflicts",      pts: 15 });
  if (data.blockers?.length)                          f.push({ label: `${data.blockers.length} LLM blocker(s)`, pts: data.blockers.length * 10 });
  return f;
}

function BarRow({
  label,
  score,
  max,
  barColor,
}: {
  label: string;
  score: number;
  max: number;
  barColor: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        <span className="text-xs tabular-nums font-semibold text-slate-700">{score}/{max}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${(score / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function ReadinessCard({ data }: { data: DealAnalysis }) {
  const status = data.readiness_status || "unknown";
  const badgeCls = STATUS_BADGE[status] ?? STATUS_BADGE.blocked;
  const riskBar  = RISK_BAR[data.risk_level]  ?? "bg-slate-300";
  const riskBadge = RISK_BADGE[data.risk_level] ?? "bg-slate-100 text-slate-600 border-slate-200";
  const bd = data.readiness_breakdown;
  const riskFactors = getRiskFactors(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Deal Health</CardTitle>
        <CardAction className="flex gap-1.5">
          <Badge className={`border ${badgeCls}`}>
            {status.replace(/_/g, " ").toUpperCase()}
          </Badge>
          {data.risk_level && (
            <Badge className={`border ${riskBadge}`}>
              {data.risk_level.charAt(0).toUpperCase() + data.risk_level.slice(1)} Risk
            </Badge>
          )}
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-6">

          {/* ── Left: score bars ── */}
          <div className="space-y-4">
            {/* Readiness */}
            <div className="space-y-2.5">
              <BarRow
                label="Readiness"
                score={data.readiness_score ?? 0}
                max={100}
                barColor="bg-blue-500"
              />
              <p className="text-[10px] text-slate-400 leading-snug">
                Progress toward close: docs · stage · deadline
              </p>
            </div>

            <div className="border-t border-slate-100" />

            {/* Risk */}
            <div className="space-y-2.5">
              <BarRow
                label="Risk"
                score={data.risk_score ?? 0}
                max={100}
                barColor={riskBar}
              />
              <p className="text-[10px] text-slate-400 leading-snug">
                Compliance violations: higher = more dangerous
              </p>
            </div>
          </div>

          {/* ── Right: breakdowns ── */}
          <div className="space-y-4">
            {/* Readiness breakdown */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Readiness Breakdown
              </p>
              {bd ? (
                <div className="space-y-1">
                  {[
                    { label: "Documents", score: bd.docs_score, max: bd.docs_max, detail: bd.docs_detail },
                    { label: "Stage",     score: bd.stage_score, max: bd.stage_max, detail: bd.stage_detail },
                    { label: "Deadline",  score: bd.deadline_score, max: bd.deadline_max, detail: bd.deadline_detail },
                  ].map(({ label, score, max, detail }) => (
                    <div key={label} className="flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <span className="text-slate-500">{label}</span>
                        <span className="text-slate-400 ml-1 text-[10px] truncate">— {detail}</span>
                      </div>
                      <span className="tabular-nums text-blue-600 font-medium shrink-0">
                        {score}/{max}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">—</p>
              )}
            </div>

            <div className="border-t border-slate-100" />

            {/* Risk breakdown */}
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  Risk Factors
                </p>
                {riskFactors.length > 0 && (
                  <span className="text-[10px] text-slate-400 italic">capped at 100</span>
                )}
              </div>
              {riskFactors.length ? (
                <ul className="space-y-1">
                  {riskFactors.map((f) => (
                    <li key={f.label} className="flex items-start justify-between gap-2 text-xs">
                      <span className="text-slate-600">{f.label}</span>
                      <span className="tabular-nums text-orange-600 font-semibold shrink-0">+{f.pts}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-green-600">No violations</p>
              )}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
