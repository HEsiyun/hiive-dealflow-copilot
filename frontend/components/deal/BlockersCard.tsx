import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function BlockersCard({ blockers }: { blockers: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Blockers</CardTitle>
      </CardHeader>
      <CardContent>
        {blockers?.length ? (
          <ul className="space-y-0.5">
            {blockers.map((b, i) => (
              <li key={i} className="text-sm text-slate-600 flex gap-1.5">
                <span className="text-orange-400 shrink-0">-</span>{b}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-green-500" />
            No blockers
          </span>
        )}
      </CardContent>
    </Card>
  );
}
