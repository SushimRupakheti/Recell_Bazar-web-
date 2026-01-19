"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "../schema";
import { useRouter } from "next/navigation"; // Next.js router
import { useState } from "react";
import { handleRegister } from "@/lib/actions/auth-action";



export default function RegisterForm() {
    const [ error, setError ] = useState("");
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

const onSubmit = async (data: RegisterFormData) => {

  try {
    const result = await handleRegister(data);
    if (!result.success) throw new Error(result.message);
    setSuccessMessage("Registration successful! Redirecting to login...");
    setTimeout(() => router.push("/login"), 2000);
  } catch (err: any) {
    setSuccessMessage(""); // clear previous success
    setError(err.message || "Registration failed"); // ← now works correctly
  }
};



  return (
    <>
      <h1>Register</h1>
      <p>Enter your details below for registration</p>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-start">
          <div className="mr-2">
            <input
              {...register("firstName")}
              placeholder="First Name"
              style={{ width: "10rem", display: "block" }}
            />
            {errors.firstName && <span>{errors.firstName.message}</span>}
          </div>
          <div>
            <input
              {...register("lastName")}
              placeholder="Last Name"
              style={{ width: "10rem", display: "block" }}
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

        <input
          type="password"
          {...register("password")}
          placeholder="Password"
          className="w-full"
        />
        {errors.password && <span>{errors.password.message}</span>}

        <button type="submit" className="primary-btn" disabled={isSubmitting}>
          {isSubmitting ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      {successMessage && (
        <p className="text-green-600 mt-4">{successMessage}</p>
      )}
    </>
  );
}



