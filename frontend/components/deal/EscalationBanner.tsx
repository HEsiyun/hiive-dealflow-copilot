import { AlertTriangle } from "lucide-react";
import type { Escalation } from "@/types/deal";

export default function EscalationBanner({ escalation }: { escalation: Escalation }) {
  if (!escalation?.needed) return null;

  return (
    <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-lg p-4 flex items-start gap-3">
      <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
      <div>
        <h2 className="text-sm font-semibold text-red-700 mb-1">Escalation Required</h2>
        <div className="text-sm text-red-600 flex gap-4 flex-wrap">
          <p><span className="font-medium">Owner:</span> {escalation.owner}</p>
          <p><span className="font-medium">Reason:</span> {escalation.reason}</p>
        </div>
      </div>
    </div>
  );
}
