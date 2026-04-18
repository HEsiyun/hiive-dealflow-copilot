import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import type { RuleIssues } from "@/types/deal";

type Tile = {
  label: string;
  pass: boolean;
  detail?: string;
};

function CheckTile({ label, pass, detail }: Tile) {
  return (
    <div
      className={`rounded-lg px-3 py-2 flex flex-col gap-0.5 ${
        pass ? "bg-slate-50" : "bg-red-50"
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-medium text-slate-600 leading-tight">{label}</span>
        {pass ? (
          <CheckCircle2 className="size-3.5 text-green-500 shrink-0" />
        ) : (
          <XCircle className="size-3.5 text-red-500 shrink-0" />
        )}
      </div>
      {!pass && detail && (
        <span className="text-[10px] text-red-500 leading-tight">{detail}</span>
      )}
    </div>
  );
}

export default function ComplianceCard({ ruleIssues }: { ruleIssues: RuleIssues }) {
  const entityMismatch = ruleIssues?.field_mismatches?.find(
    (m) => m.type === "seller_name_mismatch"
  );

  const tiles: Tile[] = [
    {
      label: "SLA",
      pass: !ruleIssues?.sla_breach,
      detail: ruleIssues?.sla_detail
        ? `${ruleIssues.sla_detail.elapsed_hours}h / ${ruleIssues.sla_detail.sla_hours}h`
        : undefined,
    },
    {
      label: "KYC — Buyer",
      pass: !ruleIssues?.kyc_issues?.includes("buyer_kyc_incomplete"),
      detail: "KYC incomplete",
    },
    {
      label: "KYC — Seller",
      pass: !ruleIssues?.kyc_issues?.includes("seller_kyc_incomplete"),
      detail: "KYC incomplete",
    },
    {
      label: "Accreditation — Buyer",
      pass: !ruleIssues?.accreditation_issues?.includes("buyer_not_accredited"),
      detail: "Not accredited",
    },
    {
      label: "Accreditation — Seller",
      pass: !ruleIssues?.accreditation_issues?.includes("seller_not_accredited"),
      detail: "Not accredited",
    },
    {
      label: "Entity Name",
      pass: !entityMismatch,
      detail: entityMismatch
        ? `"${entityMismatch.actual}" ≠ "${entityMismatch.expected}"`
        : undefined,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Quick Checks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {tiles.map((t) => (
            <CheckTile key={t.label} {...t} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
