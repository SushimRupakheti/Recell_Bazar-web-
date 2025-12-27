"use client";

import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      {/* This container fixes the spacing */}
      <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 py-3">

        {/* LEFT — Logo + Title */}
        <div className="flex items-center gap-3">
          <img 
            src="/Layer_1.png" 
            alt="ReCell Bazar Logo"
            className="w-12 h-12 object-contain"
          />
          <span className="text-2xl font-semibold text-[#020b23]">ReCell Bazar</span>
        </div>

        {/* RIGHT — Navigation Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2 border border-[#0a7d8c] text-[#0a7d8c] rounded-md font-medium hover:bg-[#0a7d8c] hover:text-white transition"
          >
            Log In
          </Link>

          <Link
            href="/signup"
            className="px-5 py-2 bg-[#0a7d8c] text-white rounded-md font-medium hover:opacity-90 transition"
          >
            Sign Up
          </Link>
        </div>

      </div>
    </header>
  );
}
