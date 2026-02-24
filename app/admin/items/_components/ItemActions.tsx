"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ItemActions({ id, status }: { id: string; status?: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
    try {
      setDeleting(true);
      // call admin proxy which forwards to backend admin delete endpoint
      const res = await fetch(`/api/admin/items/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        let msg = "Failed to delete item";
        try {
          const data = await res.json();
          msg = data?.message || JSON.stringify(data) || msg;
        } catch {
          try {
            msg = await res.text();
          } catch {}
        }
        throw new Error(msg);
      }

      // refresh the page
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleChangeStatus = async (newStatus: string) => {
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
    <div className="flex justify-end gap-2">
      <Link
        href={`/item/${id}`}
        className="inline-flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md"
      >
        View
      </Link>
      {/* kept actions here only: View and Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md"
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
