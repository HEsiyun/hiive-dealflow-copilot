"use client";

import { useMemo, useState } from "react";
import { Search, ChevronRight, ChevronDown, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/layout/Sidebar";
import DealListItem from "./DealListItem";
import type { DealSummary } from "@/types/deal";

const STAGE_ORDER = ["new", "screening", "review", "signature", "settlement", "closed", "hold"];

function stageGroupSortKey(stage: string) {
  const s = stage.toLowerCase();
  for (let i = 0; i < STAGE_ORDER.length; i++) {
    if (s.includes(STAGE_ORDER[i])) return i;
  }
  return STAGE_ORDER.length;
}

export default function DealSidebar({
  deals,
  dealsLoading,
  selectedDeal,
  forceFallback,
  onSelectDeal,
  onToggleFallback,
  onClose,
}: {
  deals: DealSummary[];
  dealsLoading: boolean;
  selectedDeal: string;
  forceFallback: boolean;
  onSelectDeal: (dealId: string) => void;
  onToggleFallback: (checked: boolean) => void;
  onClose?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string> | null>(() => {
    const stages = new Set(deals.map((d) => d.current_stage || "Unknown"));
    return stages;
  });

  const filteredDeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter(
      (deal) =>
        deal.deal_id?.toLowerCase().includes(q) ||
        deal.company_name?.toLowerCase().includes(q) ||
        deal.current_stage?.toLowerCase().includes(q) ||
        deal.priority?.toLowerCase().includes(q)
    );
  }, [deals, search]);

  const groupedDeals = useMemo(() => {
    const map: Record<string, DealSummary[]> = {};
    filteredDeals.forEach((deal) => {
      const key = deal.current_stage || "Unknown";
      if (!map[key]) map[key] = [];
      map[key].push(deal);
    });
    return Object.entries(map).sort(
      ([a], [b]) => stageGroupSortKey(a) - stageGroupSortKey(b)
    );
  }, [filteredDeals]);

  // Sync collapsed groups when deals load
  useMemo(() => {
    if (deals.length > 0 && collapsedGroups === null) {
      setCollapsedGroups(new Set(deals.map((d) => d.current_stage || "Unknown")));
    }
  }, [deals, collapsedGroups]);

  const toggleGroup = (stage: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev || []);
      if (next.has(stage)) next.delete(stage);
      else next.add(stage);
      return next;
    });
  };

  return (
    <Sidebar>
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-widest text-slate-800 uppercase">
            Deal Pipeline
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              title="Collapse sidebar"
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <ChevronLeft className="size-3.5" />
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Select a deal to run readiness analysis
        </p>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals..."
            className="pl-8 h-7 text-xs"
          />
        </div>
      </div>

      {/* Fallback toggle */}
      <div className="px-4 py-2 border-b border-slate-200">
        <label className="flex gap-2 items-center text-xs text-slate-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={forceFallback}
            onChange={(e) => onToggleFallback(e.target.checked)}
            className="accent-slate-700"
          />
          Fallback Mode
        </label>
      </div>

      {/* Grouped deal list */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {dealsLoading && (
          <div className="px-4 py-3 text-xs text-slate-400">Loading deals...</div>
        )}
        {!dealsLoading && filteredDeals.length === 0 && (
          <div className="px-4 py-3 text-xs text-slate-400">No deals found.</div>
        )}

        {groupedDeals.map(([stage, stageDeals]) => {
          const isCollapsed = collapsedGroups?.has(stage) ?? true;
          return (
            <div key={stage} className="mb-0.5">
              <button
                onClick={() => toggleGroup(stage)}
                className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-slate-50 transition text-left"
              >
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {stage}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 tabular-nums">{stageDeals.length}</span>
                  {isCollapsed ? (
                    <ChevronRight className="size-3.5 text-slate-300" />
                  ) : (
                    <ChevronDown className="size-3.5 text-slate-300" />
                  )}
                </span>
              </button>

              {!isCollapsed && (
                <div className="px-2 space-y-0.5 pb-1">
                  {stageDeals.map((deal) => (
                    <DealListItem
                      key={deal.deal_id}
                      deal={deal}
                      isSelected={selectedDeal === deal.deal_id}
                      onSelect={() => onSelectDeal(deal.deal_id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Sidebar>
  );
}
