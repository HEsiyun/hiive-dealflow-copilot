import type { OverviewData } from "@/types/deal";
export type { OverviewData };

const cards: {
  key: keyof OverviewData;
  label: string;
  border: string;
  text: string;
}[] = [
  { key: "total_deals", label: "Total Deals", border: "border-l-slate-400", text: "text-slate-700" },
  { key: "ready_count", label: "Ready", border: "border-l-green-500", text: "text-green-700" },
  { key: "at_risk_count", label: "At Risk", border: "border-l-yellow-400", text: "text-yellow-700" },
  { key: "blocked_count", label: "Blocked", border: "border-l-red-500", text: "text-red-700" },
  { key: "sla_breach_count", label: "SLA Breaches", border: "border-l-red-400", text: "text-red-600" },
  { key: "escalation_count", label: "Escalations", border: "border-l-orange-400", text: "text-orange-600" },
];

export default function KpiCards({ data }: { data: OverviewData }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <div
          key={c.key}
          className={`bg-white border border-slate-200 border-l-4 ${c.border} rounded-lg px-4 py-3`}
        >
          <div className={`text-2xl font-bold tabular-nums ${c.text}`}>
            {data[c.key]}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
