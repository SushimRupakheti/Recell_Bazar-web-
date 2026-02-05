"use client";

import { z } from "zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset } from "@/lib/api/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export const RequestPasswordResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type RequestPasswordResetDTO = z.infer<typeof RequestPasswordResetSchema>;

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestPasswordResetDTO>({
    resolver: zodResolver(RequestPasswordResetSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: RequestPasswordResetDTO) => {
    try {
      const response = await requestPasswordReset(data.email);
      if (response.success) toast.success(response.message || "Reset link sent!");
      else toast.error(response.message || "Failed to send reset link.");
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-1px)] bg-gradient-to-b from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex items-center justify-center">
      {/* Container (responsive width) */}
      <div className="w-full max-w-md sm:max-w-lg">
        {/* Card */}
        <div className="rounded-2xl sm:rounded-3xl bg-white border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.10)] p-6 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="text-center">
            <p className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold tracking-wide text-teal-700">
              ACCOUNT RECOVERY
            </p>

            <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 leading-tight">
              Reset your password
            </h1>

            <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
              Enter your email and we’ll send you a secure reset link.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 sm:mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Email address
              </label>

              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
                className={[
                  "w-full rounded-xl px-4 py-3 sm:py-3.5 bg-gray-50 border text-gray-900 placeholder:text-gray-400",
                  "focus:outline-none focus:ring-4 transition",
                  errors.email
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-teal-500 focus:ring-teal-100",
                ].join(" ")}
              />

              {errors.email && (
                <p className="text-red-600 text-sm mt-2">{errors.email.message}</p>
              )}

              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                If you don’t see the email, check your spam/junk folder.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={[
                "w-full rounded-xl py-3 sm:py-3.5 font-medium text-white",
                "bg-teal-600 hover:bg-teal-700 shadow-sm hover:shadow transition",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-teal-600",
              ].join(" ")}
            >
              {isSubmitting ? "Sending…" : "Send reset link"}
            </button>

            {/* Responsive footer row */}
            <div className="pt-1">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-600">
                <span>Remembered your password?</span>
                <Link href="/login" className="text-teal-700 font-semibold hover:underline">
                  Log in
                </Link>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-600">
                <span>Don’t have an account?</span>
                <Link href="/register" className="text-gray-900 font-semibold hover:underline">
                  Create one
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <p className="text-xs sm:text-sm text-gray-500 text-center leading-relaxed">
                For security, the reset link may expire. If it does, request a new one.
              </p>
            </div>
          </form>
        </div>

        {/* Small bottom hint (responsive spacing) */}
        <p className="mt-6 text-center text-xs sm:text-sm text-gray-500">
          Need help? Make sure you entered the correct email.
        </p>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
