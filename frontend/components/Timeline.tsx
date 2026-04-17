export default function Timeline({ events }: any) {
  if (!events || events.length === 0) return null;

  const getStageLabel = (e: any) => e.to_stage || e.stage || "unknown";
  const getTimestamp = (e: any) => e.changed_at || e.timestamp || "";

  const getColor = (stage: string) => {
    const s = stage.toLowerCase();

    if (s.includes("settlement") || s.includes("closed") || s.includes("signed")) {
      return "bg-green-200";
    }
    if (s.includes("review") || s.includes("pending") || s.includes("signature")) {
      return "bg-yellow-200";
    }
    if (s.includes("issue") || s.includes("hold")) {
      return "bg-red-200";
    }
    return "bg-gray-200";
  };

  return (
    <div className="border p-4 rounded">
      <h2 className="font-semibold mb-3">Deal Timeline</h2>

      <div className="space-y-3">
        {events.map((e: any, i: number) => {
          const prev = events[i - 1];
          const stage = getStageLabel(e);
          const ts = getTimestamp(e);

          let duration = "";
          if (prev) {
            const prevTs = getTimestamp(prev);
            if (prevTs && ts) {
              const d1 = new Date(prevTs);
              const d2 = new Date(ts);
              const diff = Math.round(
                (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)
              );
              duration = `${diff}d`;
            }
          }

          return (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getColor(stage)}`} />

              <div className="flex-1">
                <div className="font-medium">{stage}</div>
                <div className="text-xs text-gray-500">{ts}</div>
              </div>

              {duration && <div className="text-xs text-gray-400">+{duration}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}