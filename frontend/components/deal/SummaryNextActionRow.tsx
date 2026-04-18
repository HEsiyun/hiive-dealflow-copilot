import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowRight } from "lucide-react";
import type { DealAnalysis } from "@/types/deal";

export default function SummaryNextActionRow({ data }: { data: DealAnalysis }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="size-3.5 text-slate-400" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 leading-relaxed">{data.llm_summary}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowRight className="size-3.5 text-slate-400" />
            Next Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">{data.next_action}</p>
        </CardContent>
      </Card>
    </div>
  );
}
