"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function StatusSelect({ id, status }: { id: string; status?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

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
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Status update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="sr-only" htmlFor={`status-select-${id}`}>Change status</label>
      <select
        id={`status-select-${id}`}
        onChange={(e) => {
          const val = e.target.value;
          if (!val) return;
          handleChange(val);
        }}
        disabled={busy}
        className="text-sm rounded-md px-2 py-1 border bg-white"
        defaultValue={status ?? ""}
      >
        <option value="">{status ? String(status).toUpperCase() : 'Status'}</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="available">Available</option>
        <option value="sold">Sold</option>
      </select>
    </div>
  );
}
