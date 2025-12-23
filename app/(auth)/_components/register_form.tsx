"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema,RegisterFormData } from "../schema";

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    console.log(data);
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

        <button
          type="submit"
          className="primary-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </>
  );
}
