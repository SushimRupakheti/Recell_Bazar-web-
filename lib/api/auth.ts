// API Layer
// Call api from backent

import axios from "./axios"; // IMPORTANT: "./axios" not "axios"
import { API } from "./endpoints";

export const register = async (registerData: any) => {
    try{
        const response = await axios.post(
            API.AUTH.REGISTER, // API path '/api/auth/register'
            registerData // body data
        );
        return response.data; // what the backend-controller returns
    }catch(err: Error | any){
        // 4xx or 5xx counts as exception
        throw new Error(
            err.response?.data?.message // meessage from backend
            || err.message  // general error message
            || "Registration failed" // fallback message
        );
    }
}
export const login = async (loginData: any) => {
    try{
        const response = await axios.post(
            API.AUTH.LOGIN, // API path '/api/auth/register'
            loginData // body data
        );
        return response.data; // what the backend-controller returns
    }catch(err: Error | any){
        // 4xx or 5xx counts as exception
        throw new Error(
            err.response?.data?.message // meessage from backend
            || err.message  // general error message
            || "Login failed" // fallback message
        );
    }
}
export const requestPasswordReset = async (email: string) => {
    try {
        const response = await axios.post(API.AUTH.REQUEST_PASSWORD_RESET, { email });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Request password reset failed');
    }
};

export const resetPassword = async (token: string, newPassword: string) => {
    try {
        const response = await axios.post(API.AUTH.RESET_PASSWORD(token), { newPassword: newPassword });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Reset password failed');
    }
};


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

