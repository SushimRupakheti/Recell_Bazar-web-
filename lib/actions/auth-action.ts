// server side processing of auth actions
"use server";
import { cookies } from "next/headers";
import { login, register } from "../api/auth";
import { Cookie } from "next/font/google";
import { setAuthToken, setUserData } from "../cookie";

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

export const handleLogin = async (formData: any) => {
    try{
        // how to get data from component
        const result = await login(formData);
        // how to send back to component
        if(result.success){
            await setAuthToken(result.token);
            await setUserData(result.data);
            return {
                success: true,
                message: "Login successful",
                data: result.data 
            };
        }
        return {
            success: false, message: result.message || "Login failed"
        }
    }catch(err: Error | any){
        return { success: false, message: err.message || "Login failed"};
    }
}