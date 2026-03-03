"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle,
  XCircle,
  DollarSign,
  Megaphone,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import {
  handleGetNotifications,
  handleMarkNotificationRead,
  handleDeleteNotification,
} from "@/lib/actions/notification-action";
import type { AppNotification, NotificationType } from "@/lib/api/notifications";

/* ── Helpers ──────────────────────────────────────── */

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const typeConfig: Record<
  NotificationType,
  { icon: React.ReactNode; label: string; color: string; bg: string; border: string }
> = {
  APPROVED: {
    icon: <CheckCircle className="h-6 w-6 text-emerald-600" />,
    label: "Approved",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  REJECTED: {
    icon: <XCircle className="h-6 w-6 text-red-500" />,
    label: "Rejected",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  SOLD: {
    icon: <DollarSign className="h-6 w-6 text-blue-600" />,
    label: "Sold",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  ADMIN_CUSTOM: {
    icon: <Megaphone className="h-6 w-6 text-amber-500" />,
    label: "Announcement",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

function photoUrl(raw?: string): string {
  if (!raw) return "";
  return raw.startsWith("http") ? raw : `${API_BASE}${raw}`;
}

/* ── Page Component ───────────────────────────────── */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await handleGetNotifications();
      if (res.success && Array.isArray((res as any).data)) {
        setNotifications((res as any).data as AppNotification[]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Refetch on focus
  useEffect(() => {
    const onFocus = () => fetchNotifications();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    await handleMarkNotificationRead(id);
  };

  const remove = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    await handleDeleteNotification(id);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link + heading */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="h-9 w-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
        >
          <ArrowLeft className="h-4 w-4 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-500">{unreadCount} unread</p>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400">Loading…</div>
      ) : notifications.length === 0 ? (
        <div className="py-20 text-center">
          <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No notifications yet</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => {
            const cfg = typeConfig[n.type] || typeConfig.ADMIN_CUSTOM;
            return (
              <li
                key={n._id}
                className={`relative flex gap-4 rounded-xl border p-4 transition cursor-pointer ${
                  n.isRead
                    ? "bg-white border-gray-200"
                    : `${cfg.bg} ${cfg.border}`
                } hover:shadow-sm`}
                onClick={() => {
                  if (!n.isRead) markRead(n._id);
                }}
              >
                {/* Icon / Thumbnail */}
                {n.item && n.item.photos?.[0] ? (
                  <img
                    src={photoUrl(n.item.photos[0])}
                    alt={n.item.phoneModel}
                    className="h-14 w-14 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div
                    className={`h-14 w-14 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}
                  >
                    {cfg.icon}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {n.title}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                    {n.message}
                  </p>

                  {n.item && (
                    <p className="text-xs text-gray-400 mt-1">
                      {n.item.phoneModel} &middot; ₹{n.item.finalPrice}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>

                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-teal-500" />
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(n._id);
                  }}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
