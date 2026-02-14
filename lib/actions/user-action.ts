"use server";
import { getAuthUser } from "./auth-action";
import { getUserById, updateUserById } from "../api/users";
import { clearAuthCookies } from "../cookie";
import { logoutUserApi } from "../api/users";
import axios from "@/lib/api/axios";
import { getAuthToken } from "../cookie";


export const fetchMyProfile = async () => {
  const authUser = await getAuthUser();
  if (!authUser?.id) return { success: false, message: "Not logged in" };

  const res = await getUserById(authUser.id);
  return res; // { success, data }
};

export const updateMyProfile = async (payload: {
  firstName?: string;
  lastName?: string;
  address?: string;
  // add more if your backend accepts
}) => {
  const authUser = await getAuthUser();
  if (!authUser?.id) return { success: false, message: "Not logged in" };

  const res = await updateUserById(authUser.id, payload);
  return res;
};


export const logoutUser = async () => {
  try {
    // Call backend logout
    await logoutUserApi();

    // Clear frontend cookies
    await clearAuthCookies();

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Logout failed",
    };
  }
};

// Server-side admin helpers
export const fetchAdminUsersServer = async (opts?: { page?: number; limit?: number }) => {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const params = new URLSearchParams();
    if (opts?.page) params.append("page", String(opts.page));
    if (opts?.limit) params.append("limit", String(opts.limit));

    const url = `/api/admin/users${params.toString() ? `?${params.toString()}` : ""}`;

    const res = await axios.get(url, { headers });
    return res.data; // expects { success, data, meta }
  } catch (err: any) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to fetch admin users" };
  }
};

export const deleteAdminUserServer = async (id: string) => {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await axios.delete(`/api/admin/users/${id}`, { headers });
    return res.data;
  } catch (err: any) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to delete admin user" };
  }
};


