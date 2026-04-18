"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type EmailMode = "internal" | "client";

export default function EmailGenerator({ data }: { data: { deal_id: string } }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<EmailMode>("internal");

  const generate = async () => {
    setLoading(true);
    setEmail("");
    try {
      const res = await fetch("http://localhost:8000/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_id: data.deal_id, mode }),
      });
      const json = await res.json();
      setEmail(json.email);
    } finally {
      setLoading(false);
    }
  };

  const subject = email ? email.split("\n")[0] : "";
  const body = email ? email.split("\n").slice(1).join("\n").trim() : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Email Draft</CardTitle>
        <CardAction>
          <Button size="sm" onClick={generate} disabled={loading}>
            <Sparkles className="size-3.5" />
            {loading ? "Generating..." : "Generate"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Mode toggle */}
        <div className="flex gap-1 bg-slate-100 rounded-md p-0.5">
          <button
            onClick={() => setMode("internal")}
            className={`flex-1 text-xs font-medium py-1.5 rounded transition ${
              mode === "internal"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Internal Summary
          </button>
          <button
            onClick={() => setMode("client")}
            className={`flex-1 text-xs font-medium py-1.5 rounded transition ${
              mode === "client"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Client Follow-up
          </button>
        </div>

        {email && (
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <div className={`px-3 py-2 border-b border-slate-200 ${
              mode === "internal" ? "bg-blue-50" : "bg-slate-50"
            }`}>
              <span className={`text-xs uppercase tracking-wide ${
                mode === "internal" ? "text-blue-400" : "text-slate-400"
              }`}>
                {mode === "internal" ? "Internal" : "External"} — Subject
              </span>
              <div className="text-sm font-medium text-slate-800 mt-0.5">{subject}</div>
            </div>
            <div className="px-3 py-3 text-sm text-slate-600 leading-relaxed prose prose-sm prose-slate max-w-none">
              <ReactMarkdown>{body}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
