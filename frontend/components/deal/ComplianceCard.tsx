import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, UserCheck, CheckCircle2 } from "lucide-react";
import type { RuleIssues } from "@/types/deal";

export default function ComplianceCard({ ruleIssues }: { ruleIssues: RuleIssues }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Quick Checks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* SLA */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <Clock className="size-3 text-slate-400" />
            SLA
          </h3>
          <div className="group relative inline-flex">
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-medium cursor-default ${
                ruleIssues?.sla_breach ? "text-red-600" : "text-green-600"
              }`}
            >
              {ruleIssues?.sla_breach ? (
                <span className="w-2 h-2 rounded-full shrink-0 bg-red-400" />
              ) : (
                <CheckCircle2 className="size-3.5 text-green-500" />
              )}
              {ruleIssues?.sla_breach ? "Breached" : "Within SLA"}
            </span>
            {ruleIssues?.sla_detail && (
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-slate-800 text-white text-xs rounded-md px-3 py-2 whitespace-nowrap shadow-lg">
                  <div>Allowed: {ruleIssues.sla_detail.sla_hours}h</div>
                  <div>Elapsed: {ruleIssues.sla_detail.elapsed_hours}h</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KYC */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <UserCheck className="size-3 text-slate-400" />
            KYC
          </h3>
          {ruleIssues?.kyc_issues?.length ? (
            <ul className="space-y-0.5">
              {ruleIssues.kyc_issues.map((k, i) => (
                <li key={i} className="text-sm text-slate-600 flex gap-1.5">
                  <span className="text-orange-400 shrink-0">-</span>{k}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-green-500" />
              Clear
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
