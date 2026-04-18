import type { OverviewData } from "@/types/deal";
export type { OverviewData };

const progressCards: {
  key: keyof OverviewData;
  label: string;
  border: string;
  text: string;
}[] = [
  { key: "total_deals",      label: "Total Deals",   border: "border-l-slate-400",  text: "text-slate-700" },
  { key: "near_close_count", label: "Near Close",    border: "border-l-green-500",  text: "text-green-700" },
  { key: "active_count",     label: "Active",        border: "border-l-yellow-400", text: "text-yellow-700" },
  { key: "early_count",      label: "Early",         border: "border-l-slate-400",  text: "text-slate-600" },
];

const opsCards: {
  key: keyof OverviewData;
  label: string;
  border: string;
  text: string;
}[] = [
  { key: "sla_breach_count",       label: "SLA Breaches",      border: "border-l-red-500",    text: "text-red-600" },
  { key: "escalation_count",       label: "Escalations",       border: "border-l-orange-400", text: "text-orange-600" },
  { key: "kyc_issue_count",        label: "KYC Issues",        border: "border-l-purple-400", text: "text-purple-700" },
  { key: "document_conflict_count", label: "Doc Conflicts",    border: "border-l-rose-400",   text: "text-rose-600" },
];

function KpiCard({
  value,
  label,
  border,
  text,
}: {
  value: number;
  label: string;
  border: string;
  text: string;
}) {
  return (
    <div className={`bg-white border border-slate-200 border-l-4 ${border} rounded-lg px-4 py-3`}>
      <div className={`text-2xl font-bold tabular-nums ${text}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

export default function KpiCards({ data }: { data: OverviewData }) {
  return (
    <div className="space-y-3">
      {/* Row 1: Deal progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {progressCards.map((c) => (
          <KpiCard
            key={c.key}
            value={data[c.key] as number}
            label={c.label}
            border={c.border}
            text={c.text}
          />
        ))}
      </div>
      {/* Row 2: Operational figures */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {opsCards.map((c) => (
          <KpiCard
            key={c.key}
            value={data[c.key] as number}
            label={c.label}
            border={c.border}
            text={c.text}
          />
        ))}
      </div>
    </div>
  );
}
