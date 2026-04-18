import type { RuleIssues } from "@/types/deal";

export default function AlertCards({ ruleIssues }: { ruleIssues: RuleIssues }) {
  const hasStageConflicts = ruleIssues?.stage_conflicts?.length > 0;
  const hasCommFlags = ruleIssues?.communication_flags?.length > 0;

  if (!hasStageConflicts && !hasCommFlags) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {hasStageConflicts && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <h2 className="text-xs font-semibold text-red-700 mb-1.5 uppercase tracking-wide">
            Stage Conflict
          </h2>
          <ul className="space-y-0.5">
            {ruleIssues.stage_conflicts.map((c, i) => (
              <li key={i} className="text-sm text-red-600 flex gap-1.5">
                <span className="shrink-0">-</span>{c}
              </li>
            ))}
          </ul>
        </div>
      )}
      {hasCommFlags && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <h2 className="text-xs font-semibold text-yellow-800 mb-1.5 uppercase tracking-wide">
            Comm Signals
          </h2>
          <ul className="space-y-0.5">
            {ruleIssues.communication_flags.map((f, i) => (
              <li key={i} className="text-sm text-yellow-700 flex gap-1.5">
                <span className="shrink-0">-</span>{f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
