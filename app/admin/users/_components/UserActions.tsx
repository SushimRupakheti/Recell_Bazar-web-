"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserActions({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        let msg = "Failed to delete user";
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

      // Refresh the list by navigating back to /admin/users
      router.push("/admin/users");
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex justify-end gap-4">
      <a
        href={`/admin/users/${id}`}
        className="px-5 py-3 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white transition"
      >
        View
      </a>

      <a
        href={`/admin/users/${id}/edit`}
        className="px-5 py-3 rounded-lg bg-blue-900/40 text-blue-400 hover:bg-blue-900/60 transition"
      >
        Edit
      </a>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="px-5 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
