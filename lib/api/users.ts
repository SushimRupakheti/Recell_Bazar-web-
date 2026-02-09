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
