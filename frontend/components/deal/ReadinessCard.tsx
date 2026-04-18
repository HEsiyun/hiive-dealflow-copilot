import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DealAnalysis } from "@/types/deal";

function getReadinessStyles(status: string) {
  if (status === "ready")
    return { badge: "bg-green-100 text-green-700 border-green-200", bar: "bg-green-500", border: "border-l-green-500" };
  if (status === "at_risk")
    return { badge: "bg-yellow-100 text-yellow-700 border-yellow-200", bar: "bg-yellow-400", border: "border-l-yellow-400" };
  return { badge: "bg-red-100 text-red-700 border-red-200", bar: "bg-red-400", border: "border-l-red-400" };
}

export default function ReadinessCard({ data }: { data: DealAnalysis }) {
  const status = data.readiness_status || "unknown";
  const styles = getReadinessStyles(status);

  return (
    <Card className={`border-l-4 ${styles.border}`}>
      <CardHeader>
        <CardTitle className="text-sm">Deal Readiness</CardTitle>
        <CardAction>
          <Badge className={`border ${styles.badge}`}>
            {status.toUpperCase()}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all ${styles.bar}`}
              style={{ width: `${data.readiness_score ?? 0}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-700 tabular-nums w-16 text-right">
            {data.readiness_score ?? 0}/100
          </span>
        </div>
        {data.readiness_reasons?.length > 0 && (
          <ul className="space-y-0.5">
            {data.readiness_reasons.map((r, i) => (
              <li key={i} className="text-xs text-slate-500 flex gap-1.5">
                <span className="text-red-400 shrink-0">-</span>{r}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
