"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import KpiCards from "@/components/dashboard/KpiCards";
import PipelineTable, { type PipelineStage } from "@/components/dashboard/PipelineTable";
import ActionQueue, { type ActionItem } from "@/components/dashboard/ActionQueue";
import type { OverviewData } from "@/types/deal";

export default function DashboardPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [queue, setQueue] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [ovRes, plRes, aqRes] = await Promise.all([
          fetch("http://localhost:8000/dashboard/overview"),
          fetch("http://localhost:8000/dashboard/pipeline"),
          fetch("http://localhost:8000/dashboard/action-queue"),
        ]);
        const [ov, pl, aq] = await Promise.all([
          ovRes.json(),
          plRes.json(),
          aqRes.json(),
        ]);
        setOverview(ov);
        setPipeline(pl.stages);
        setQueue(aq);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-400 text-sm">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="border border-red-200 bg-red-50 px-6 py-4 rounded-lg text-sm text-red-700">
          <b>Error:</b> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-0.5">Hiive Copilot</p>
            <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href="/deals">
              <ArrowLeft className="size-3.5" />
              Deal Analysis
            </a>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">
        {overview && (
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Overview</h2>
            <KpiCards data={overview} />
          </section>
        )}

        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Pipeline Health</h2>
          <PipelineTable stages={pipeline} />
        </section>

        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Action Queue</h2>
          <ActionQueue data={queue} onDealClick={(dealId) => router.push(`/deals?deal=${dealId}`)} />
        </section>
      </div>
    </div>
  );
}
