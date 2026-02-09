"use server";
import { getAuthUser } from "./auth-action";
import { getUserById, updateUserById } from "../api/users";

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
