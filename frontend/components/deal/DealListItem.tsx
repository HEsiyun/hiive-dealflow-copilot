import { Badge } from "@/components/ui/badge";
import type { DealSummary } from "@/types/deal";

const PRIORITY_CLASSES: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function DealListItem({
  deal,
  isSelected,
  onSelect,
}: {
  deal: DealSummary;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`rounded-md px-3 py-2 cursor-pointer transition ${
        isSelected
          ? "bg-slate-900 text-white"
          : "hover:bg-slate-50 border border-transparent hover:border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xs font-mono ${isSelected ? "text-slate-400" : "text-slate-400"}`}
        >
          {deal.deal_id}
        </span>
        {deal.priority && (
          <Badge
            className={`text-[10px] h-4 border ${
              isSelected
                ? "bg-white/15 text-white border-white/20"
                : PRIORITY_CLASSES[deal.priority.toLowerCase()] || "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {deal.priority}
          </Badge>
        )}
      </div>
      <div className={`text-sm font-medium mt-0.5 ${isSelected ? "text-white" : "text-slate-800"}`}>
        {deal.company_name}
      </div>
      {deal.status && (
        <div className={`text-xs mt-0.5 ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
          {deal.status}
        </div>
      )}
    </div>
  );
}
