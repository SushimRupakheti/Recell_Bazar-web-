"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function StatusSelect({ id, status }: { id: string; status?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string>((status || "").toString().toLowerCase());

  const handleChange = async (newStatus: string) => {
    if (!confirm(`Change status to ${newStatus.toUpperCase()}?`)) return;
    try {
      setBusy(true);
      const res = await fetch(`/api/admin/items/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        let msg = "Failed to update status";
        try {
          const data = await res.json();
          msg = data?.message || JSON.stringify(data) || msg;
        } catch {}
        throw new Error(msg);
      }
      // reflect selection in UI (will be short-lived if page refreshes)
      setSelected(newStatus);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Status update failed");
    } finally {
      setBusy(false);
    }
  };

  const colorMap: Record<string, string> = {
    approved: "bg-emerald-600 text-white",
    rejected: "bg-red-600 text-white",
    pending: "bg-yellow-500 text-black",
    available: "bg-gray-700 text-gray-100",
    sold: "bg-red-800 text-white",
  };

  const appliedClass = selected ? (colorMap[selected] ?? "bg-gray-800 text-gray-100") : "bg-gray-800 text-gray-100";

  return (
    <div>
      <label className="sr-only" htmlFor={`status-select-${id}`}>Change status</label>
      <select
        id={`status-select-${id}`}
        value={selected}
        onChange={(e) => {
          const val = e.target.value;
          if (!val) return;
          handleChange(val);
        }}
        disabled={busy}
        className={`text-sm rounded-md px-2 py-0.5 border w-28 ${appliedClass} border-gray-700 ${busy ? 'opacity-60' : 'hover:border-gray-600'}`}
      >
        <option value="">Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="available">Available</option>
        <option value="sold">Sold</option>
      </select>
    </div>
  );
}
