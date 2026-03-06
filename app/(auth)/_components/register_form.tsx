"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "../schema";
import { useRouter } from "next/navigation"; // Next.js router
import { useState } from "react";
import { handleRegister } from "@/lib/actions/auth-action";
import { Eye, EyeOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";



export default function RegisterForm() {
    const [ error, setError ] = useState("");
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const toFriendlyRegisterMessage = (message: string) => {
    const m = (message || "").toLowerCase();
    if (m.includes("already exists") && m.includes("email")) return "Email already exists";
    if (m.includes("duplicate") && m.includes("email")) return "Email already exists";
    if (m.includes("e11000") && m.includes("email")) return "Email already exists";
    return message || "Registration failed";
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

const onSubmit = async (data: RegisterFormData) => {
  setError("");
  setSuccessMessage("");

  try {
    const result = await handleRegister(data);
    if (!result.success) throw new Error(result.message || "Registration failed");

    const msg = result.message || "Registration successful! Redirecting to login...";
    setSuccessMessage(msg);
    toast.success(msg);
    setTimeout(() => router.push("/login"), 2000);
  } catch (err: any) {
    const friendly = toFriendlyRegisterMessage(err?.message || "Registration failed");
    setError(friendly);
    toast.error(friendly);
  }
};



  return (
    <>
      <h1>Register</h1>

      {error && <div className="text-red-500 mb-2">{error}</div>}
      {successMessage && <div className="text-green-600 mb-2">{successMessage}</div>}


      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex w-full items-start gap-2">
          <div className="flex-1">
            <input
              {...register("firstName")}
              placeholder="First Name"
              className="w-full"
            />
            {errors.firstName && <span>{errors.firstName.message}</span>}
          </div>
          <div className="flex-1">
            <input
              {...register("lastName")}
              placeholder="Last Name"
              className="w-full"
            />
            {errors.lastName && <span>{errors.lastName.message}</span>}
          </div>
        </div>

        <input {...register("email")} placeholder="Email" className="w-full" />
        {errors.email && <span>{errors.email.message}</span>}

        <input {...register("address")} placeholder="Address" className="w-full" />
        {errors.address && <span>{errors.address.message}</span>}

        <input {...register("contactNo")} placeholder="Contact No." className="w-full" />
        {errors.contactNo && <span>{errors.contactNo.message}</span>}

        <div className="relative" style={{ marginBottom: "15px" }}>
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="Password"
            className="w-full"
            style={{ paddingRight: "2.75rem", marginBottom: 0 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <span>{errors.password.message}</span>}

        <button type="submit" className="primary-btn" disabled={isSubmitting}>
          {isSubmitting ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}



