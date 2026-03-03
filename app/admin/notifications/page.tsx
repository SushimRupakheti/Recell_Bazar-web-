"use client";

import React, { useState } from "react";
import AdminLayout from "../users/AdminLayout";
import { handleSendAdminNotification } from "@/lib/actions/notification-action";
import { Send } from "lucide-react";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    setResult(null);

    try {
      const res = await handleSendAdminNotification({ title: title.trim(), message: message.trim() });
      if (res.success) {
        const count = (res as any).data?.count ?? 0;
        setResult({
          type: "success",
          text: `Notification sent to ${count} user${count !== 1 ? "s" : ""}`,
        });
        setTitle("");
        setMessage("");
      } else {
        setResult({ type: "error", text: (res as any).message || "Failed to send" });
      }
    } catch (err: any) {
      setResult({ type: "error", text: err.message || "Something went wrong" });
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold text-white mb-1">
          Send Notification
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Broadcast a notification to all users on the platform.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label
              htmlFor="notif-title"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Title
            </label>
            <input
              id="notif-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. System Update"
              maxLength={120}
              required
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="notif-message"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Message
            </label>
            <textarea
              id="notif-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your notification message…"
              rows={4}
              maxLength={500}
              required
              className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* Result toast */}
          {result && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                result.type === "success"
                  ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700"
                  : "bg-red-900/40 text-red-300 border border-red-700"
              }`}
            >
              {result.text}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={sending || !title.trim() || !message.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-medium text-white transition"
          >
            <Send className="h-4 w-4" />
            {sending ? "Sending…" : "Send to all users"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
