"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema,LoginFormData } from "../schema";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log(data);
  };

  return (
    <>
      <h1>Login</h1>
      <p>Enter your details below</p>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input
            type="email"
            placeholder="Email"
            {...register("email")}
          />
          {errors.email && (
            <span className="error-text">{errors.email.message}</span>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            {...register("password")}
          />
          {errors.password && (
            <span className="error-text">{errors.password.message}</span>
          )}
        </div>

        <button
          type="submit"
          className="primary-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </>
  );
}
