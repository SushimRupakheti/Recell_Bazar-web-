"use client";

import React, { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdminApi } from "@/lib/api/users";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/users?page=1&limit=1', { credentials: 'include', cache: 'no-store' });
        if (!mounted) return;
        if (!res.ok) {
          router.replace('/login');
        }
      } catch (e) {
        if (!mounted) return;
        router.replace('/login');
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  const linkClass = (href: string) => {
    const base = "px-4 py-3 rounded-md transition";
    const inactive = "text-gray-300 hover:bg-gray-800 hover:text-white";
    const active = "bg-gray-800 text-white";
    return `${base} ${pathname.startsWith(href) ? active : inactive}`;
  };

  return (
    <div className="min-h-screen flex bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col px-6 py-8">
        <h2 className="text-xl font-semibold tracking-wide text-white mb-10">
          Admin Panel
        </h2>

        <nav className="flex flex-col gap-2">
          <Link href="/admin/dashboard" className={linkClass("/admin/dashboard")} aria-current={pathname.startsWith("/admin/dashboard") ? "page" : undefined}>
            Dashboard
          </Link>

          <Link href="/admin/users" className={linkClass("/admin/users")} aria-current={pathname.startsWith("/admin/users") ? "page" : undefined}>
            Users
          </Link>

          <Link href="/admin/items" className={linkClass("/admin/items")} aria-current={pathname.startsWith("/admin/items") ? "page" : undefined}>
            Items
          </Link>

          <Link href="/admin/payments" className={linkClass("/admin/payments")} aria-current={pathname.startsWith("/admin/payments") ? "page" : undefined}>
            Payments
          </Link>
        </nav>

        <div className="mt-4">
          <button
            onClick={async () => {
              if (loggingOut) return;
              setLoggingOut(true);
                try {
                  // use shared api helper (axios with baseURL) to call backend
                  await logoutAdminApi();

                  // client-side fallback cleanup
                  try { localStorage.removeItem("auth_token"); localStorage.removeItem("user_data"); localStorage.removeItem("token"); localStorage.removeItem("role"); } catch(e) {}
                  try { const expire = new Date(0).toUTCString(); document.cookie = `auth_token=; Expires=${expire}; Path=/`; document.cookie = `user_data=; Expires=${expire}; Path=/`; document.cookie = `token=; Expires=${expire}; Path=/`; document.cookie = `role=; Expires=${expire}; Path=/`; } catch(e) {}

                  router.replace("/login");
                  try { window.location.replace('/login'); } catch(e) {}
                } catch (err) {
                  try { localStorage.clear(); } catch(e) {}
                  try { router.replace('/login'); } catch(e) {}
                } finally {
                  setLoggingOut(false);
                }
            }}
            className="w-full px-4 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            {loggingOut ? "Signing out…" : "Logout"}
          </button>
        </div>

        {/* Optional footer area */}
        <div className="mt-auto pt-6 border-t border-gray-800 text-sm text-gray-500">
          © {new Date().getFullYear()} Admin
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-950 p-8">
        <div className="max-w-7xl mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
