"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

type EmailMode = "internal" | "client";

export default function EmailGenerator({ data }: any) {
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
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-800">Email Draft</h2>
        <button
          onClick={generate}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-medium px-3 py-1.5 rounded-md transition"
        >
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-slate-100 rounded-md p-0.5 mb-3">
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
            <div className="flex items-center gap-2">
              <span className={`text-xs uppercase tracking-wide ${
                mode === "internal" ? "text-blue-400" : "text-slate-400"
              }`}>
                {mode === "internal" ? "Internal" : "External"} — Subject
              </span>
            </div>
            <div className="text-sm font-medium text-slate-800 mt-0.5">{subject}</div>
          </div>
          <div className="px-3 py-3 text-sm text-slate-600 leading-relaxed prose prose-sm prose-slate max-w-none">
            <ReactMarkdown>{body}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
