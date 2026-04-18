"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  XOctagon,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import type { OverviewData } from "@/types/deal";

const METRICS: {
  key: keyof OverviewData;
  label: string;
  icon: typeof Layers;
  color: string;
}[] = [
  { key: "total_deals", label: "Total", icon: Layers, color: "text-slate-600" },
  { key: "ready_count", label: "Ready", icon: CheckCircle2, color: "text-green-600" },
  { key: "at_risk_count", label: "At Risk", icon: AlertTriangle, color: "text-yellow-600" },
  { key: "blocked_count", label: "Blocked", icon: XOctagon, color: "text-red-600" },
  { key: "sla_breach_count", label: "SLA", icon: Clock, color: "text-red-500" },
  { key: "escalation_count", label: "Escalations", icon: ArrowUpRight, color: "text-orange-600" },
];

export default function DealKpiStrip() {
  const [data, setData] = useState<OverviewData | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/dashboard/overview")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {METRICS.map(({ key, label, icon: Icon, color }) => (
        <div
          key={key}
          className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2"
        >
          <Icon className={`size-3.5 ${color} shrink-0`} />
          <div className="min-w-0">
            <div className={`text-base font-bold tabular-nums leading-none ${color}`}>
              {data[key]}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
