"use client";

import { useState } from "react";

export default function Home() {
  const [dealId, setDealId] = useState("D-1005");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [forceFallback, setForceFallback] = useState(false);

  const analyze = async () => {
    setLoading(true);

    const res = await fetch(
      `http://localhost:8000/deals/${dealId}/analyze?force_fallback=${forceFallback}`,
      { method: "POST" }
    );

    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Hiive Deal Copilot</h1>

      {/* Input */}
      <div className="flex gap-2 mb-6">
        <input
          value={dealId}
          onChange={(e) => setDealId(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={analyze}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Analyze
        </button>
      </div>

      {/* Toggle */}
      <div className="mb-6">
        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={forceFallback}
            onChange={(e) => setForceFallback(e.target.checked)}
          />
          Force Fallback Mode
        </label>
      </div>

      {/* Result */}
      {loading && <p>Loading...</p>}

      {data && (
        <div className="space-y-4">

          <div className="border p-4 rounded">
            <h2 className="font-semibold">Risk Summary</h2>
            <p>Score: {data.risk_score}</p>
            <p>Level: {data.risk_level}</p>
          </div>

          <div className="border p-4 rounded">
            <h2 className="font-semibold">Summary</h2>
            <p>{data.llm_summary}</p>
          </div>

          <div className="border p-4 rounded">
            <h2 className="font-semibold">Blockers</h2>
            <ul>
              {data.blockers.map((b: string, i: number) => (
                <li key={i}>• {b}</li>
              ))}
            </ul>
          </div>

          <div className="border p-4 rounded">
            <h2 className="font-semibold">Next Action</h2>
            <p>{data.next_action}</p>
          </div>

          <div className="border p-4 rounded">
            <h2 className="font-semibold">Source</h2>
            <p>{data.source}</p>
          </div>

        </div>
      )}
    </div>
  );
}