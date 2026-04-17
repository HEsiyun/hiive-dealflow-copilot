export default function Timeline({ events }: any) {
  if (!events) return null;

  return (
    <div className="border p-4 rounded">
      <h2 className="font-semibold mb-2">Deal Timeline</h2>

      <div className="space-y-2">
        {events.map((e: any, i: number) => (
          <div key={i} className="text-sm">
            <b>{e.stage}</b> — {e.timestamp}
          </div>
        ))}
      </div>
    </div>
  );
}