"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Heart, ShoppingCart, User, Search } from "lucide-react";
import NotificationBell from "./NotificationBell";

const LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/sell", label: "Sell" },
  { href: "/dashboard/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  // Sync input from URL when landing on items page with ?search=
  useEffect(() => {
    const q = searchParams?.get("search") || "";
    setQuery(q);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/dashboard/items?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/dashboard/items");
    }
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname?.startsWith(href);

  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-6">
          {/* Left: Logo + Brand */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-teal-50 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="ReCell Bazar Logo"
                width={28}
                height={28}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-semibold text-gray-900">ReCell Bazar</span>
          </Link>

          {/* Middle: Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    active
                      ? "text-teal-700"
                      : "text-gray-600 hover:text-teal-700 transition"
                  }
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search + Icons */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center w-[320px] md:w-90 lg:w-105 bg-gray-100 rounded-full px-4 py-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by phone model or brand..."
                className="bg-transparent outline-none w-full ml-2 text-sm text-gray-700 placeholder:text-gray-500"
              />
            </form>

            {/* Notifications */}
            <NotificationBell />



            {/* Cart */}
            <Link
              href="/dashboard/cart"
              className="h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5 text-gray-700" />
            </Link>

            {/* Profile */}
            <Link
              href="/dashboard/profile"
              className="h-10 w-10 rounded-full bg-teal-700 hover:bg-teal-800 flex items-center justify-center transition"
              aria-label="Profile"
            >
              <User className="h-5 w-5 text-white" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
