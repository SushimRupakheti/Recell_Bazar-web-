import axios from "./axios";
import { API } from "./endpoints";

export type UserProfile = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  address?: string;
  role?: string;
};

export const getUserById = async (id: string) => {
  try {
    const res = await axios.get(API.USERS.BY_ID(id));
    return res.data; // expects { success, data, message }
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || err.message || "Failed to fetch user"
    );
  }
};

export const updateUserById = async (id: string, payload: Partial<UserProfile>) => {
  try {
    const res = await axios.put(API.USERS.UPDATE(id), payload);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || err.message || "Failed to update user"
    );
  }
};

export const logoutUserApi = async () => {
  try {
    const res = await axios.post("/api/users/logout");
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || err.message || "Logout failed"
    );
  }
};

// Admin logout (calls backend admin logout endpoint)
export const logoutAdminApi = async () => {
  try {
    const res = await axios.post("/api/admin/users/logout");
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || err.message || "Admin logout failed"
    );
  }
};

// Admin-specific helpers
export const getAdminUsers = async () => {
  try {
    const res = await axios.get(`/api/admin/users`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Failed to fetch admin users");
  }
};

export const deleteAdminUser = async (id: string) => {
  try {
    const res = await axios.delete(`/api/admin/users/${id}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Failed to delete admin user");
  }
};

