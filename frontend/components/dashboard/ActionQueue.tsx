"use client";

import { useMemo, useState } from "react";

export type ActionItem = {
  deal_id: string;
  company_name: string;
  current_stage: string;
  priority: string;
  readiness_status: string;
  readiness_score: number;
  main_blocker: string | null;
  next_action: string | null;
  escalation_needed: boolean;
  escalation_owner: string | null;
  sla_breach: boolean;
};

const STATUS_COLORS: Record<string, string> = {
  blocked: "bg-red-100 text-red-700",
  at_risk: "bg-yellow-100 text-yellow-700",
  ready: "bg-green-100 text-green-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-50 text-red-600",
  medium: "bg-yellow-50 text-yellow-600",
  low: "bg-slate-100 text-slate-500",
};

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <label className="text-xs text-slate-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-slate-200 rounded-md px-2 py-1 text-xs bg-white outline-none focus:ring-2 focus:ring-slate-300"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ActionQueue({ data }: { data: ActionItem[] }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const stages = useMemo(
    () => [...new Set(data.map((d) => d.current_stage))].sort(),
    [data]
  );

  const filtered = useMemo(() => {
    let result = data;
    if (statusFilter) result = result.filter((d) => d.readiness_status === statusFilter);
    if (stageFilter) result = result.filter((d) => d.current_stage === stageFilter);
    if (priorityFilter) result = result.filter((d) => d.priority === priorityFilter);
    return result;
  }, [data, statusFilter, stageFilter, priorityFilter]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Filter bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-200 bg-slate-50 flex-wrap">
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={["blocked", "at_risk", "ready"]}
        />
        <FilterSelect
          label="Stage"
          value={stageFilter}
          onChange={setStageFilter}
          options={stages}
        />
        <FilterSelect
          label="Priority"
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={["high", "medium", "low"]}
        />
        <span className="text-xs text-slate-400 ml-auto tabular-nums">
          {filtered.length} of {data.length} deals
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Deal</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stage</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Score</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Main Blocker</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Next Action</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Esc.</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">SLA</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.deal_id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="px-4 py-2 font-mono text-xs text-slate-600">{d.deal_id}</td>
                <td className="px-3 py-2 font-medium text-slate-800">{d.company_name}</td>
                <td className="px-3 py-2 text-slate-600 capitalize">{d.current_stage.replace(/_/g, " ")}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[d.readiness_status] || "bg-slate-100 text-slate-600"}`}>
                    {d.readiness_status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          d.readiness_score >= 80
                            ? "bg-green-400"
                            : d.readiness_score >= 50
                            ? "bg-yellow-400"
                            : "bg-red-400"
                        }`}
                        style={{ width: `${d.readiness_score}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-slate-600 w-6 text-right">{d.readiness_score}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-slate-600 max-w-[200px] truncate">
                  {d.main_blocker || <span className="text-slate-300">--</span>}
                </td>
                <td className="px-3 py-2 text-xs text-slate-600 max-w-[200px] truncate">
                  {d.next_action || <span className="text-slate-300">--</span>}
                </td>
                <td className="px-3 py-2 text-center">
                  {d.escalation_needed ? (
                    <span className="text-red-500 text-xs font-semibold" title={`Owner: ${d.escalation_owner}`}>
                      YES
                    </span>
                  ) : (
                    <span className="text-slate-300">--</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {d.sla_breach ? (
                    <span className="inline-block w-2 h-2 rounded-full bg-red-400" title="SLA Breached" />
                  ) : (
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400" title="Within SLA" />
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">
                  No deals match the selected filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
