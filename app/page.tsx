"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="bg-gradient-to-br from-[#0a7d8c] via-[#0b8a9a] to-[#086b78]">
      {/* HERO: exactly 1 screen */}
      <section className="h-screen w-full flex items-center overflow-hidden">
        <div className="max-w-6xl mx-auto w-full px-6 grid lg:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div className="text-white">
            <p className="text-white/80 text-sm tracking-wide uppercase">
              Your trusted second-hand marketplace
            </p>

            <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight">
              ReCell Bazar
            </h1>

            <p className="mt-4 text-white/80 text-base sm:text-lg max-w-xl">
              Buy and sell phones easily with verified listings, secure deals,
              and fast support—built for a smooth experience.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="bg-white text-[#0a7d8c] font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition"
              >
                Get Started
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="border border-white/40 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition"
              >
                Explore
              </button>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-3 text-sm text-white/80">
              <span>✅ Trusted listings</span>
              <span>⚡ Fast support</span>
              <span>🔒 Secure deals</span>
            </div>
          </div>

          {/* Right */}
          <div className="relative h-[360px] sm:h-[420px] lg:h-[520px] flex items-center justify-center">
            <Image
              src="/laptop2.png"
              alt="Laptop Background"
              width={900}
              height={450}
              className="absolute inset-0 m-auto opacity-20 scale-110 blur-[1px]"
            />
            <Image
              src="/laptop1.png"
              alt="Laptop Mockup"
              width={720}
              height={460}
              className="relative z-10 drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>
    </main>
  );
}
