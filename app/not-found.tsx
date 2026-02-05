// app/not-found.tsx
"use client";

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-5xl md:text-7xl font-extrabold text-teal-700 mb-4">
        404 Not Found !
      </h1>

      <p className="text-gray-500 text-center text-lg md:text-l mb-6 max-w-md">
        Your visited page could not be found. Return to the home page.
      </p>

      <Link
        href="/dashboard"
        className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-md font-medium transition"
      >
        Back to Home Page
      </Link>
    </div>
  );
}
