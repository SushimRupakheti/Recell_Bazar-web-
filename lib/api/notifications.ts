// API Layer — Notifications

import axios from "./axios";
import { API } from "./endpoints";

/* ── Types ─────────────────────────────────────────── */

export type NotificationType = "APPROVED" | "REJECTED" | "SOLD" | "ADMIN_CUSTOM";

export interface NotificationItem {
  _id: string;
  phoneModel: string;
  category: string;
  photos: string[];
  finalPrice: string;
  status: string;
}

export interface AppNotification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: NotificationType;
  item: NotificationItem | null;
  isRead: boolean;
  createdAt: string;
}

/* ── User endpoints ────────────────────────────────── */

/** Fetch all notifications for the logged-in user */
export const getNotifications = async (): Promise<{
  success: boolean;
  data: AppNotification[];
}> => {
  try {
    const res = await axios.get(API.NOTIFICATIONS.LIST);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || err.message || "Failed to fetch notifications"
    );
  }
};

/** Mark a single notification as read */
export const markNotificationRead = async (
  id: string
): Promise<{ success: boolean; data: AppNotification; message: string }> => {
  try {
    const res = await axios.put(API.NOTIFICATIONS.MARK_READ(id));
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || err.message || "Failed to mark notification as read"
    );
  }
};

/** Delete a notification */
export const deleteNotification = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await axios.delete(API.NOTIFICATIONS.DELETE(id));
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || err.message || "Failed to delete notification"
    );
  }
};

/* ── Admin endpoint ────────────────────────────────── */

/** Broadcast a custom notification to all users (admin only) */
export const sendAdminNotification = async (payload: {
  title: string;
  message: string;
}): Promise<{ success: boolean; data: { count: number }; message: string }> => {
  try {
    const res = await axios.post(API.ADMIN.NOTIFICATIONS.SEND, payload);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || err.message || "Failed to send notification"
    );
  }
};
