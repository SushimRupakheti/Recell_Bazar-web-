import React, { ReactNode } from "react";
import Link from "next/link";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gray-950 text-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col px-6 py-8">
        <h2 className="text-xl font-semibold tracking-wide text-white mb-10">
          Admin Panel
        </h2>

        <nav className="flex flex-col gap-2">
          <Link
            href="/admin/dashboard"
            className="px-4 py-3 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/users"
            className="px-4 py-3 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            Users
          </Link>

          <Link
            href="/admin/items"
            className="px-4 py-3 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            Items
          </Link>
        </nav>

        {/* Optional footer area */}
        <div className="mt-auto pt-6 border-t border-gray-800 text-sm text-gray-500">
          © {new Date().getFullYear()} Admin
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-950 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
