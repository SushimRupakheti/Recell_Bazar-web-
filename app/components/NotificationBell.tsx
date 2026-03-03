"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle, XCircle, DollarSign, Megaphone, Trash2, X } from "lucide-react";
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
  { icon: React.ReactNode; color: string; bg: string }
> = {
  APPROVED: {
    icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  REJECTED: {
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    color: "text-red-700",
    bg: "bg-red-50",
  },
  SOLD: {
    icon: <DollarSign className="h-5 w-5 text-blue-600" />,
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  ADMIN_CUSTOM: {
    icon: <Megaphone className="h-5 w-5 text-amber-500" />,
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
};

/* ── Component ────────────────────────────────────── */

const POLL_INTERVAL = 30_000; // 30 seconds
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

function photoUrl(raw?: string): string {
  if (!raw) return "";
  return raw.startsWith("http") ? raw : `${API_BASE}${raw}`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ── Fetch ────────────────────────── */
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await handleGetNotifications();
      if (res.success && Array.isArray((res as any).data)) {
        setNotifications((res as any).data as AppNotification[]);
      }
    } catch {
      // silently ignore polling errors
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Refetch on window focus
  useEffect(() => {
    const onFocus = () => fetchNotifications();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* ── Actions ──────────────────────── */
  const markRead = async (id: string) => {
    // optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    await handleMarkNotificationRead(id);
  };

  const remove = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    await handleDeleteNotification(id);
  };

  /* ── Render ───────────────────────── */
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-teal-600 text-white text-[11px] flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-95 max-h-120 bg-white rounded-xl border border-gray-200 shadow-xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-teal-700 hover:underline"
            >
              View all
            </Link>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => {
                const cfg = typeConfig[n.type] || typeConfig.ADMIN_CUSTOM;
                return (
                  <div
                    key={n._id}
                    className={`flex gap-3 px-4 py-3 cursor-pointer transition hover:bg-gray-50 ${
                      !n.isRead ? "bg-teal-50/40" : ""
                    }`}
                    onClick={() => {
                      if (!n.isRead) markRead(n._id);
                    }}
                  >
                    {/* Item thumbnail or type icon */}
                    {n.item && n.item.photos?.[0] ? (
                      <img
                        src={photoUrl(n.item.photos[0])}
                        alt={n.item.phoneModel}
                        className="h-10 w-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}
                      >
                        {cfg.icon}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {n.title}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            remove(n._id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition shrink-0"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-medium ${cfg.color}`}>
                          {n.type.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {timeAgo(n.createdAt)}
                        </span>
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-teal-500 ml-auto" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
