"use server";

import { getAuthToken } from "../cookie";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

/* ── helpers ─────────────────────────────────────── */

function authHeaders(token: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/* ── User actions ────────────────────────────────── */

export const handleGetNotifications = async () => {
  try {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not logged in" };

    const resp = await fetch(`${BACKEND}/api/notifications`, {
      method: "GET",
      headers: authHeaders(token),
    });
    const data = await resp.json();
    if (!resp.ok) return { success: false, message: data?.message || "Failed to fetch notifications" };
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to fetch notifications" };
  }
};

export const handleMarkNotificationRead = async (id: string) => {
  try {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not logged in" };

    const resp = await fetch(`${BACKEND}/api/notifications/${id}/read`, {
      method: "PUT",
      headers: authHeaders(token),
    });
    const data = await resp.json();
    if (!resp.ok) return { success: false, message: data?.message || "Failed to mark as read" };
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to mark as read" };
  }
};

export const handleDeleteNotification = async (id: string) => {
  try {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not logged in" };

    const resp = await fetch(`${BACKEND}/api/notifications/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
    const data = await resp.json();
    if (!resp.ok) return { success: false, message: data?.message || "Failed to delete notification" };
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to delete notification" };
  }
};

/* ── Admin action ────────────────────────────────── */

export const handleSendAdminNotification = async (payload: {
  title: string;
  message: string;
}) => {
  try {
    const token = await getAuthToken();
    if (!token) return { success: false, message: "Not logged in" };

    const resp = await fetch(`${BACKEND}/api/admin/notifications`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok) return { success: false, message: data?.message || "Failed to send notification" };
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to send notification" };
  }
};
