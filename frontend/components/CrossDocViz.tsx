import { CheckCircle2 } from "lucide-react";
import type { CrossDocMismatch } from "@/types/deal";

export default function CrossDocViz({ data }: { data: CrossDocMismatch | null | undefined }) {
  if (!data) return (
    <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
      <CheckCircle2 className="size-3.5 text-green-500" />
      Consistent
    </span>
  );

  return (
    <div className="flex gap-2.5 flex-wrap">
      {data.groups.map((g, i) => {
        const isMajority = g.value === data.majority_value;
        return (
          <div
            key={i}
            className={`px-3 py-2 rounded-lg border ${
              isMajority
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  isMajority ? "text-green-600" : "text-red-600"
                }`}
              >
                {isMajority ? "Majority" : "Outlier"}
              </span>
              <span
                className={`text-sm font-bold ${
                  isMajority ? "text-green-800" : "text-red-800"
                }`}
              >
                {g.value}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {g.document_ids.length} doc{g.document_ids.length !== 1 ? "s" : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}
