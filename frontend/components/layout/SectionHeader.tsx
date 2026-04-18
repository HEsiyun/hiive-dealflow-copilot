import type { LucideIcon } from "lucide-react";

export default function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <Icon className="size-4 text-slate-400" />
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 border-t border-slate-200" />
    </div>
  );
}
