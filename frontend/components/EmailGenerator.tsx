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
        <div className="border p-4 rounded bg-white">
            <div className="text-sm text-gray-500 mb-2">Subject</div>

            <div className="font-medium mb-4">
                {email?.split("\n")[0]}
            </div>

            <div className="whitespace-pre-line text-sm">
                {email}
            </div>
        </div>
      )}
    </div>
  );
}