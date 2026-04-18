import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, GitCompareArrows, CheckCircle2 } from "lucide-react";
import CrossDocViz from "@/components/CrossDocViz";
import type { RuleIssues } from "@/types/deal";

export default function DocumentCards({ ruleIssues }: { ruleIssues: RuleIssues }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Missing Docs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs flex items-center gap-1.5 uppercase tracking-wide text-slate-400 font-semibold">
            <FileQuestion className="size-3.5" />
            Missing Docs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ruleIssues?.missing_documents?.length ? (
            <ul className="space-y-0.5">
              {ruleIssues.missing_documents.map((d, i) => (
                <li key={i} className="text-sm text-slate-600 flex gap-1.5">
                  <span className="text-red-400 shrink-0">-</span>{d}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-green-500" />
              All present
            </span>
          )}
        </CardContent>
      </Card>

      {/* Field Mismatches */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs flex items-center gap-1.5 uppercase tracking-wide text-slate-400 font-semibold">
            <GitCompareArrows className="size-3.5" />
            Field Mismatches
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ruleIssues?.field_mismatches?.length ? (
            <div className="space-y-1.5">
              {ruleIssues.field_mismatches.map((m, i) => (
                <div key={i} className="text-xs bg-slate-50 rounded p-2">
                  <div className="font-medium text-slate-700">{m.type}</div>
                  <div className="text-slate-500">{m.document_id}</div>
                  <div className="text-slate-600">
                    <b>{m.expected}</b> → <b>{m.actual}</b>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-green-500" />
              Consistent
            </span>
          )}
        </CardContent>
      </Card>

      {/* Cross-Doc */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
            Cross-Doc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CrossDocViz data={ruleIssues?.cross_doc_mismatch} />
        </CardContent>
      </Card>
    </div>
  );
}
