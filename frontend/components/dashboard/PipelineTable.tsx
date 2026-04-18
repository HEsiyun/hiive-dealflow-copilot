export type PipelineStage = {
  stage: string;
  total: number;
  early: number;
  active: number;
  near_close: number;
  avg_days_in_stage: number;
  sla_breaches: number;
};

function StatusBar({ early, active, near_close, total }: PipelineStage) {
  if (total === 0) return <div className="h-2 w-full bg-slate-100 rounded-full" />;
  const ePct = (early / total) * 100;
  const aPct = (active / total) * 100;
  const nPct = (near_close / total) * 100;

  return (
    <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100">
      {ePct > 0 && <div className="bg-slate-300" style={{ width: `${ePct}%` }} />}
      {aPct > 0 && <div className="bg-yellow-400" style={{ width: `${aPct}%` }} />}
      {nPct > 0 && <div className="bg-green-400" style={{ width: `${nPct}%` }} />}
    </div>
  );
}

export default function PipelineTable({ stages }: { stages: PipelineStage[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stage</th>
            <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Deals</th>
            <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-40">Progress Distribution</th>
            <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Early</th>
            <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Active</th>
            <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Near Close</th>
            <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg Days</th>
            <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">SLA</th>
          </tr>
        </thead>
        <tbody>
          {stages.map((s) => (
            <tr key={s.stage} className="border-b border-slate-100 hover:bg-slate-50 transition">
              <td className="px-4 py-2.5 font-medium text-slate-800 capitalize">{s.stage.replace(/_/g, " ")}</td>
              <td className="text-center px-3 py-2.5 tabular-nums text-slate-700">{s.total}</td>
              <td className="px-3 py-2.5">
                <StatusBar {...s} />
              </td>
              <td className="text-center px-3 py-2.5 tabular-nums">
                <span className={s.early > 0 ? "text-slate-600 font-medium" : "text-slate-400"}>{s.early}</span>
              </td>
              <td className="text-center px-3 py-2.5 tabular-nums">
                <span className={s.active > 0 ? "text-yellow-600 font-medium" : "text-slate-400"}>{s.active}</span>
              </td>
              <td className="text-center px-3 py-2.5 tabular-nums">
                <span className={s.near_close > 0 ? "text-green-600 font-medium" : "text-slate-400"}>{s.near_close}</span>
              </td>
              <td className="text-center px-3 py-2.5 tabular-nums text-slate-600">{s.avg_days_in_stage}d</td>
              <td className="text-center px-3 py-2.5 tabular-nums">
                {s.sla_breaches > 0 ? (
                  <span className="text-red-600 font-medium">{s.sla_breaches}</span>
                ) : (
                  <span className="text-slate-400">0</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
