export default function CrossDocViz({ data }: any) {
  if (!data) return <p>No mismatch</p>;

  return (
    <div className="space-y-2">
      <div>
        Majority: <b>{data.majority_value}</b>
      </div>

      <div className="flex gap-3 flex-wrap">
        {data.groups.map((g: any, i: number) => (
          <div
            key={i}
            className={`p-3 rounded border ${
              g.value === data.majority_value
                ? "bg-green-100"
                : "bg-red-100"
            }`}
          >
            <div className="font-bold">{g.value}</div>
            <div className="text-xs">
              {g.document_ids.length} docs
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}