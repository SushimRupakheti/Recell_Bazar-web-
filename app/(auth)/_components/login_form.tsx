"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "../schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { handleLogin } from "@/lib/actions/auth-action"; // <-- backend API function

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

const onSubmit = async (data: LoginFormData) => {
  setError("");
  setSuccessMessage("");

  try {
    const result = await handleLogin(data);

    if (!result.success) {
      throw new Error(result.message || "Login failed");
    }

    // ✅ Normalize role
    const role = result.data?.role?.toLowerCase();

    console.log("Login result data:", result.data);
    console.log("Normalized role:", role);

    // ✅ Save cookies for middleware
    document.cookie = `token=${result.data.token}; path=/`;
    document.cookie = `role=${role}; path=/`;

    setSuccessMessage("Login successful! Redirecting...");

    setTimeout(() => {
      try {
        if (role === "admin") {
          console.log("Redirecting to admin dashboard");
          router.push("/admin/dashboard");
        } else {
          console.log("Redirecting to user dashboard");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Redirect error:", error);
      }
    }, 1000);

  } catch (err: any) {
    setError(err.message || "Login failed");
  }
};


  return (
    <>
      <h1>Login</h1>
      <p>Enter your details below</p>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {successMessage && <p className="text-green-600 mb-2">{successMessage}</p>}

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input
            type="email"
            placeholder="Email"
            {...register("email")}
            className="border p-2 rounded w-full mb-2"
          />
          {errors.email && (
            <span className="text-red-500">{errors.email.message}</span>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            {...register("password")}
            className="border p-2 rounded w-full mb-2"
          />
          {errors.password && (
            <span className="text-red-500">{errors.password.message}</span>
          )}
        </div>

        <button
          type="submit"
          className="primary-btn bg-green-500 text-white py-2 px-4 rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </>
  );
}
