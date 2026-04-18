import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StageEvent } from "@/types/deal";

function getStageLabel(e: StageEvent) {
  return e.to_stage || "unknown";
}

function getDotColor(stage: string) {
  const s = stage.toLowerCase();
  if (s.includes("settlement") || s.includes("closed") || s.includes("signed"))
    return "bg-green-500";
  if (s.includes("review") || s.includes("pending") || s.includes("signature"))
    return "bg-yellow-400";
  if (s.includes("issue") || s.includes("hold"))
    return "bg-red-500";
  return "bg-slate-400";
}

function formatDate(ts: string) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDuration(prevTs: string, curTs: string) {
  if (!prevTs || !curTs) return "";
  const diff = Math.round(
    (new Date(curTs).getTime() - new Date(prevTs).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "<1d";
  return `${diff}d`;
}

export default function Timeline({ events }: { events: StageEvent[] }) {
  if (!events || events.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Deal Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-2">
          <div className="flex items-start min-w-max">
            {events.map((e, i) => {
              const stage = getStageLabel(e);
              const ts = e.changed_at;
              const prev = events[i - 1];
              const duration = prev ? getDuration(prev.changed_at, ts) : "";

              return (
                <div key={i} className="flex items-start">
                  {i > 0 && (
                    <div className="flex flex-col items-center" style={{ marginTop: "8px" }}>
                      <div className="h-0.5 w-16 bg-slate-200" />
                      {duration && (
                        <span className="text-xs text-slate-400 font-medium tabular-nums mt-1">
                          +{duration}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col items-center w-[90px]">
                    <div className={`w-4 h-4 rounded-full ${getDotColor(stage)} border-2 border-white shadow-sm`} />
                    <div className="text-xs font-medium text-slate-700 leading-tight text-center mt-1.5">
                      {stage}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{formatDate(ts)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
