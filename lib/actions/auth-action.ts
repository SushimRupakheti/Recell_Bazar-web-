// server side processing of auth actions
"use server";
import { cookies } from "next/headers";
import { login, register, resetPassword,requestPasswordReset, getUserById, updateUserById } from "../api/auth";
// import { Cookie } from "next/font/google";
import { setAuthToken, setUserData } from "../cookie";
import { getAuthToken } from "../cookie";
import { jwtDecode} from "jwt-decode";


export type AuthUser = {
  id: string;
  email: string;
  role: "admin" | "user";
};

export const handleRegister = async (formData: any) => {
    try{
        // how to get data from component
        const result = await register(formData);
        // how to send back to component
        if(result.success){
            return {
                success: true,
                message: "Registration successful",
                data: result.data 
            };
        }
        return {
            success: false, message: result.message || "Registration failed"
        }
    }catch(err: Error | any){
        return { success: false, message: err.message || "Registration failed"};
    }
}

// export const handleLogin = async (formData: any) => {
//     try{
//         // how to get data from component
//         const result = await login(formData);
//         // how to send back to component
//         if(result.success){
//             await setAuthToken(result.token);
//             await setUserData(result.data);
//             return {
//                 success: true,
//                 message: "Login successful",
//                 data: result.data 
//             };
//         }
//         return {
//             success: false, message: result.message || "Login failed"
//         }
//     }catch(err: Error | any){
//         return { success: false, message: err.message || "Login failed"};
//     }
// }

export const handleLogin = async (formData: any) => {
  try {
    const result = await login(formData);

    if (result.success) {
      // Save token + user data
      await setAuthToken(result.token);
      await setUserData(result.data);

      // Get cookies API
      const cookieStore = await cookies();

      // Store normalized role for middleware
      const normalizedRole = result.data.role.toLowerCase();
      cookieStore.set("role", normalizedRole, { path: "/" });

      return {
        success: true,
        message: "Login successful",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Login failed",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Login failed",
    };
  }
};

export const handleLogout = async () => {
  const cookieStore = await cookies();

  cookieStore.set("auth_token", "", { maxAge: 0 });
  cookieStore.set("user_data", "", { maxAge: 0 });
  cookieStore.set("role", "", { maxAge: 0 });
};


type JwtPayload = {
  id: string;
  email: string;
  role: "admin" | "user";
};
export const getAuthUser = async (): Promise<AuthUser | null> => {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    const decoded = jwtDecode<JwtPayload>(token);

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
};

export const handleRequestPasswordReset = async (email: string) => {
    try {
        const response = await requestPasswordReset(email);
        if (response.success) {
            return {
                success: true,
                message: 'Password reset email sent successfully'
            }
        }
        return { success: false, message: response.message || 'Request password reset failed' }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Request password reset action failed' }
    }
};

export const handleResetPassword = async (token: string, newPassword: string) => {
    try {
        const response = await resetPassword(token, newPassword);
        if (response.success) {
            return {
                success: true,
                message: 'Password has been reset successfully'
            }
        }
        return { success: false, message: response.message || 'Reset password failed' }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Reset password action failed' }
    }
};

