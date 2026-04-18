import { Badge } from "@/components/ui/badge";
import type { DealAnalysis } from "@/types/deal";

export default function DealHeader({ data }: { data: DealAnalysis }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-0.5">Deal</p>
        <h1 className="text-xl font-bold text-slate-900">{data.deal_id}</h1>
      </div>
      <div className="flex gap-1.5 flex-wrap items-center">
        {data.source === "fallback" && (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200 border">
            Fallback Mode
          </Badge>
        )}
        {data.risk_level && (
          <Badge
            className={`border ${
              data.risk_level === "high"
                ? "bg-red-100 text-red-700 border-red-200"
                : data.risk_level === "medium"
                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                : "bg-green-100 text-green-700 border-green-200"
            }`}
          >
            {data.risk_level.charAt(0).toUpperCase() + data.risk_level.slice(1)} Risk
          </Badge>
        )}
      </div>
    </div>
  );
}
