export default function AuditPanel({ audit }: any) {
  if (!audit) return null;

  return (
    <div className="border p-4 rounded bg-white">

      <h2 className="font-semibold mb-3">Audit Trail</h2>

      {/* WHY THIS SCORE */}
      <div className="mb-4">
        <h3 className="font-medium">Why this score</h3>
        <p className="text-sm text-gray-700 whitespace-pre-line">
          {audit.why_this_score}
        </p>
      </div>

      {/* KEY RISKS */}
      <div className="mb-4">
        <h3 className="font-medium">Key Risks</h3>
        <ul className="list-disc pl-5 text-sm">
          {audit.key_risks?.map((r: string, i: number) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      {/* EVIDENCE */}
      <div className="mb-4">
        <h3 className="font-medium">Evidence</h3>

        {audit.evidence?.map((e: any, i: number) => (
          <div key={i} className="p-2 border rounded mb-2 text-sm">

            {e.type === "field_mismatch" && (
              <>
                <div className="font-medium">Field Mismatch</div>
                <div className="text-gray-600">
                  {e.document_id}: {e.detail}
                </div>
              </>
            )}

            {e.type === "cross_doc_mismatch" && (
              <>
                <div className="font-medium text-red-600">
                  Cross Document Conflict
                </div>
                <div className="text-gray-600">
                  Value: {e.value}
                </div>
                <div className="text-gray-500 text-xs">
                  Docs: {e.documents.join(", ")}
                </div>
              </>
            )}

          </div>
        ))}
      </div>

      {/* DECISION TRACE */}
      <div>
        <h3 className="font-medium">Decision Trace</h3>

        <div className="space-y-1 text-sm text-gray-700">
          {audit.decision_trace?.map((d: string, i: number) => (
            <div key={i}>• {d}</div>
          ))}
        </div>
      </div>

    </div>
  );
}