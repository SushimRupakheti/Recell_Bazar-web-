"use server";
import axios from "@/lib/api/axios";
import { getAuthToken } from "../cookie";

export const fetchAdminPaymentsServer = async (opts?: { page?: number; limit?: number }) => {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const params = new URLSearchParams();
    if (opts?.page) params.append("page", String(opts.page));
    if (opts?.limit) params.append("limit", String(opts.limit));

    const url = `/api/admin/payments${params.toString() ? `?${params.toString()}` : ""}`;

    const res = await axios.get(url, { headers });
    return res.data; // expects { success, data, meta }
  } catch (err: any) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to fetch admin payments" };
  }
};
