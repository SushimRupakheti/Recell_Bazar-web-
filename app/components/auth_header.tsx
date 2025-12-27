"use client";

import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      {/* This container fixes the spacing */}
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 py-3">

        {/* LEFT — Logo + Title */}
        <div className="flex items-center gap-3">
          <img 
            src="/Layer_1.png" 
            alt="ReCell Bazar Logo"
            className="w-12 h-12 object-contain"
          />
          <span className="text-3xl font-semibold text-[#020b23]">ReCell Bazar</span>
        </div>

        {/* RIGHT — Navigation Buttons */}
        <div className="flex items-center gap-8">
          <Link
            href="/login"
            className="primary-btn flex no-underline items-center justify-center h-10 px-8 "
          >
            Log In
          </Link>

          <Link
            href="/register"
            className="secondary-btn flex no-underline items-center justify-center h-10 px-8 border"
          >
            SignUp
          </Link>
        </div>

      </div>
    </header>
  );
}
