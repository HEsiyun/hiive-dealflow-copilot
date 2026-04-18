import type { RuleIssues } from "@/types/deal";

export default function AlertCards({ ruleIssues }: { ruleIssues: RuleIssues }) {
  if (!ruleIssues?.stage_conflicts?.length) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
      <h2 className="text-xs font-semibold text-red-700 mb-1.5 uppercase tracking-wide">
        Stage Conflict
      </h2>
      <ul className="space-y-0.5">
        {ruleIssues.stage_conflicts.map((c, i) => (
          <li key={i} className="text-sm text-red-600 flex gap-1.5">
            <span className="shrink-0">–</span>{c.replace(/_/g, " ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
