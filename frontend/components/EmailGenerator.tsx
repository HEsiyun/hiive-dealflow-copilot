import { useState } from "react";

export default function EmailGenerator({ data }: any) {
  const [email, setEmail] = useState("");

  const generate = async () => {
    const res = await fetch("http://localhost:8000/generate-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deal_id: data.deal_id }),
    });

    const json = await res.json();
    setEmail(json.email);
  };

  return (
    <div className="border p-4 rounded">
      <h2 className="font-semibold mb-2">Follow-up Email</h2>

      <button
        onClick={generate}
        className="bg-black text-white px-3 py-2 rounded mb-3"
      >
        Generate Email
      </button>

      {email && (
        <textarea
          className="w-full border p-2 rounded"
          rows={6}
          value={email}
          readOnly
        />
      )}
    </div>
  );
}