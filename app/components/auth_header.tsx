import Image from "next/image";
import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="w-full border-b border-gray-200 px-10 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Logo + Brand */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png" // update path if needed
            alt="ReCell Bazar Logo"
            width={32}
            height={32}
          />
          <span className="text-lg font-semibold text-gray-900">
            ReCell Bazar
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="primary-btn"
          >
            log In
          </Link>

          <Link
            href="/register"
            className="secondary-btn"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
