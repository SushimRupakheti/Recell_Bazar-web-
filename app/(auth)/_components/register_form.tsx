"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "../schema";
import { useRouter } from "next/navigation"; // Next.js router
import { useState } from "react";

export default function RegisterForm() {
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
    console.log(data);
    
    // Simulate registration API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Show success message
    setSuccessMessage("Registration successful! Redirecting to login...");

    // Redirect to login page after 2 seconds
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <>
      <h1>Register</h1>
      <p>Enter your details below for registration</p>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <input {...register("fullName")} placeholder="Full Name" />
        {errors.fullName && <span>{errors.fullName.message}</span>}

        <input {...register("email")} placeholder="Email" />
        {errors.email && <span>{errors.email.message}</span>}

        <input {...register("address")} placeholder="Address" />
        {errors.address && <span>{errors.address.message}</span>}

        <input {...register("contact")} placeholder="Contact No." />
        {errors.contact && <span>{errors.contact.message}</span>}

        <input
          type="password"
          {...register("password")}
          placeholder="Password"
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
