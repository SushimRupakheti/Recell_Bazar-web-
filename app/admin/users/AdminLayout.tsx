import React, { ReactNode } from "react";
import Link from "next/link";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
      <aside className="w-64 bg-gradient-to-b from-teal-700 via-grey-700 to-green-700 text-white border-r flex flex-col p-6 shadow-xl">
        <h2 className="text-2xl font-extrabold mb-10 tracking-wide text-white drop-shadow">Admin Panel</h2>
        <nav className="flex flex-col gap-4">
          <Link href="/admin/dashboard" className="px-4 py-2 rounded-lg bg-white-600 hover:bg-blue-800 transition-colors font-semibold">Dashboard</Link>
          <Link href="/admin/users" className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-purple-800 transition-colors font-semibold">Users</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
