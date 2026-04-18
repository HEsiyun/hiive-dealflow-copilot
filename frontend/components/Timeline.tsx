export default function Timeline({ events }: any) {
  if (!events || events.length === 0) return null;

  const getStageLabel = (e: any) => e.to_stage || e.stage || "unknown";
  const getTimestamp = (e: any) => e.changed_at || e.timestamp || "";

  const getDotColor = (stage: string) => {
    const s = stage.toLowerCase();
    if (s.includes("settlement") || s.includes("closed") || s.includes("signed"))
      return "bg-green-500";
    if (s.includes("review") || s.includes("pending") || s.includes("signature"))
      return "bg-yellow-400";
    if (s.includes("issue") || s.includes("hold"))
      return "bg-red-500";
    return "bg-slate-400";
  };

  const formatDate = (ts: string) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getDuration = (prevTs: string, curTs: string) => {
    if (!prevTs || !curTs) return "";
    const diff = Math.round(
      (new Date(curTs).getTime() - new Date(prevTs).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 0) return "<1d";
    return `${diff}d`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h2 className="text-sm font-semibold text-slate-800 mb-5">Deal Timeline</h2>

      <div className="overflow-x-auto pb-2">
        <div className="flex items-start min-w-max">
          {events.map((e: any, i: number) => {
            const stage = getStageLabel(e);
            const ts = getTimestamp(e);
            const prev = events[i - 1];
            const duration = prev ? getDuration(getTimestamp(prev), ts) : "";

            return (
              <div key={i} className="flex items-start">
                {/* Connector + duration */}
                {i > 0 && (
                  <div className="flex flex-col items-center" style={{ marginTop: '8px' }}>
                    <div className="h-0.5 w-16 bg-slate-300" />
                    {duration && (
                      <span className="text-xs text-slate-500 font-medium tabular-nums mt-1">
                        +{duration}
                      </span>
                    )}
                  </div>
                )}

                {/* Node + label */}
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
    </div>
  );
}
