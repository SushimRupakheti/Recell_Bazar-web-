"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ShoppingCart, User, Search } from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/sell", label: "Sell" },
  { href: "/dashboard/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();

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
            <div className="hidden sm:flex items-center w-[320px] md:w-[360px] lg:w-[420px] bg-gray-100 rounded-full px-4 py-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="What are you looking for?"
                className="bg-transparent outline-none w-full ml-2 text-sm text-gray-700 placeholder:text-gray-500"
              />
            </div>

            {/* Wishlist */}
            <button
              type="button"
              className="relative h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center">
                4
              </span>
            </button>

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
