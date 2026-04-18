import { MousePointerClick } from "lucide-react";

export default function DealEmptyState({ loading }: { loading: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400">
      {loading ? (
        <p className="text-sm">Analyzing deal...</p>
      ) : (
        <>
          <MousePointerClick className="size-8 mb-3 text-slate-300" />
          <p className="text-sm">Select a deal to begin analysis</p>
        </>
      )}
    </div>
  );
}
