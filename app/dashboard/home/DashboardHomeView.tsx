"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import HomeCard from "@/app/components/homeCard";

type Props = {
  items: any[];
  anyRes?: any;
};

function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div className="flex items-start gap-4">
        {/* thicker teal bar like screenshot */}
        <span className="mt-1 h-8 w-3 rounded bg-teal-700" />

        <div>
          <span className="h-7 w-2 rounded bg-teal-700" />
          <div>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900 leading-tight">{title}</h2>
          </div>
        </div>
      </div>

      {action ? <div className="pb-1">{action}</div> : null}
    </div>
  );
}

function PillButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        // rectangular pills like screenshot (NOT rounded-full)
        "shrink-0 rounded-md border px-6 py-2.5 text-sm font-medium transition",
        "whitespace-nowrap",
        "focus:outline-none focus:ring-2 focus:ring-teal-600/30",
        active
          ? "border-teal-700 bg-teal-700 text-white shadow-sm"
          : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function DashboardHomeView({ items: initialItems = [], anyRes }: Props) {
  const [showOnlyProducts, setShowOnlyProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const trendingRef = useRef<HTMLDivElement | null>(null);

  const items = initialItems || [];

  const getCategory = (it: any) => {
    const candidates = [
      it?.brand,
      it?.make,
      it?.manufacturer,
      it?.brandName,
      it?.model,
      it?.category,
      it?.type,
    ];
    for (const c of candidates) {
      if (c) return String(c);
    }
    if (it?.phoneModel) return String(it.phoneModel).split(" ")[0];
    return null;
  };

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map(getCategory).filter(Boolean))) as string[];
    return unique.sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return items;
    return items.filter((it: any) => getCategory(it) === selectedCategory);
  }, [items, selectedCategory]);

  // DB ordering:
  const trendingItems = items.slice(0, 8);
  const newItems = items.slice(0, 4);

  const Container = ({ children }: { children: React.ReactNode }) => (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
  );

  const EmptyState = () => (
    <div className="col-span-full rounded-2xl border border-dashed bg-white p-10 text-center text-gray-500">
      <div className="font-medium">No products found</div>
      {anyRes?.success === false && (
        <div className="mt-2 text-xs text-red-500">{anyRes.message || "Fetch failed"}</div>
      )}
    </div>
  );

  const CategoryBar = () => (
    <div className="mt-6">
      {/* WRAP pills like screenshot (no horizontal scroll) */}
      <div className="flex flex-wrap gap-4">
        {/* If you don't want "All" like the screenshot, remove this button */}
        <PillButton active={!selectedCategory} onClick={() => setSelectedCategory(null)}>
          All
        </PillButton>

        {categories.map((c) => (
          <PillButton key={c} active={selectedCategory === c} onClick={() => setSelectedCategory(c)}>
            {c}
          </PillButton>
        ))}
      </div>
    </div>
  );

  /* =========================
     PRODUCTS-ONLY VIEW (See All)
  ========================= */
  if (showOnlyProducts) {
    // Minimal items-only view: show only the items grid with no headers or controls
    return (
      <main className="min-h-screen bg-gray-50">
        <Container>
          <div className="py-6">
            {items && items.length ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
                {items.map((item: any) => (
                  <div
                    key={item._id ?? item.id ?? item.phoneModel}
                    className="motion-safe:animate-fade-up"
                  >
                    <HomeCard item={item} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </Container>
      </main>
    );
  }

  /* =========================
     HOME UI
  ========================= */
  return (
    <main className="w-full bg-gray-50">
      {/* HERO with banner background */}
      <section className="relative overflow-hidden">
        <Image
          src="/banner.png"
          alt="ReCell Bazar background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/70 via-teal-800/45 to-emerald-700/35" />

        <Container>
          <div className="relative grid grid-cols-1 items-center gap-10 py-12 md:grid-cols-2 md:gap-12 md:py-16">
            <div className="text-white">
              <p className="mb-3 text-sm text-white/80">Explore the greatest phone marketplace</p>

              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                ReCell <br /> Bazar
              </h1>

              <p className="mt-4 max-w-md leading-relaxed text-white/85">
                “Your trusted second hand marketplace”
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-teal-900 shadow-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/40 motion-safe:animate-fade-up"
                  onClick={() =>
                    trendingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                >
                  Buy Now!
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-white/40 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 motion-safe:animate-fade-up"
                  onClick={() =>
                    trendingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                >
                  See More
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-xs text-white/85">
                <span className="rounded-full bg-white/10 px-3 py-1.5">Verified sellers</span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">Refurbished options</span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">Warranty available</span>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative w-full max-w-md">
                <div className="relative aspect-[4/3] w-full rounded-3xl bg-white/10 p-4 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/15 backdrop-blur">
                  <div className="relative h-full w-full">
                    <Image
                      src="/home_phone.png"
                      alt="Hero phone"
                      fill
                      className="object-contain drop-shadow-[0_24px_24px_rgba(0,0,0,0.25)]"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative pb-8">
            <div className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/60" />
              <span className="h-2 w-2 rounded-full bg-white/60" />
              <span className="h-2 w-2 rounded-full bg-white" />
              <span className="h-2 w-2 rounded-full bg-white/60" />
              <span className="h-2 w-2 rounded-full bg-white/60" />
            </div>
          </div>
        </Container>
      </section>

      {/* TRUST BADGES */}
      <section className="bg-white">
        <Container>
          <div className="py-16">
            <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
              {[
                {
                  img: "/icons/icon1.png",
                  title: "TRUSTED BY MANY",
                  desc: "Trusted by numbers of people across the country",
                },
                {
                  img: "/icons/icon2.png",
                  title: "24/7 CUSTOMER SERVICE",
                  desc: "Friendly 24/7 customer support",
                },
                {
                  img: "/icons/icon3.png",
                  title: "MONEY BACK GUARANTEE",
                  desc: "Cashback within 10 days of return",
                },
              ].map((b) => (
                <div
                  key={b.title}
                  className="rounded-2xl bg-white p-8 shadow-sm card-hover-transition motion-safe:animate-fade-up transform hover:-translate-y-1 hover:scale-105"
                >
                  <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-2xl bg-teal-700/10 ring-4 ring-teal-700/10">
                    <Image src={b.img} alt={b.title} width={44} height={44} className="object-contain" />
                  </div>
                  <p className="text-base font-semibold text-gray-900">{b.title}</p>
                  <p className="mt-2 text-sm text-gray-500">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* REFURBISHED WITH CARE */}
      <section className="bg-white">
        <Container>
          <div className="py-12">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
              <div className="relative overflow-hidden rounded-3xl bg-gray-100 shadow-sm">
                <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
                  <Image src="/Refurbished.png" alt="Refurbished" fill className="object-cover" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Refurbished With Care</h3>
                <p className="mt-2 max-w-xl text-sm text-gray-500">
                  Carefully tested devices, transparent condition, and packaging that’s easy on the planet.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    { title: "Refurbished", desc: "Full equipment on all items", icon: "/icons/icon4.png" },
                    { title: "Warranty", desc: "Warranty up to 2 years", icon: "/icons/icon5.png" },
                    { title: "Eco-friendly", desc: "We use eco friendly packaging", icon: "/icons/icon6.png" },
                    { title: "Cross check", desc: "Fully cross checked and examined", icon: "/icons/icon7.png" },
                  ].map((f) => (
                    <div
                      key={f.title}
                      className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-700/10">
                          <Image src={f.icon} alt={f.title} width={18} height={18} className="object-contain" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                          <p className="text-xs text-gray-500">{f.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CATEGORIES */}
      <section className="bg-gray-50">
        <Container>
          {/* add separators like screenshot */}
          <div className="py-10 border-y border-gray-200">
            <SectionHeader eyebrow="Categories" title="Browse By Category" />
            <CategoryBar />
          </div>
        </Container>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="bg-gray-50" ref={trendingRef}>
        <Container>
          <div className="py-12 border-b border-gray-200">
            <SectionHeader
              eyebrow="Trending"
              title="Trending Products"
              action={
                <Link
                  href="/dashboard/items"
                  className="rounded-md border border-teal-200 bg-white px-8 py-3 text-sm font-semibold text-teal-800 shadow-sm hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                >
                  See All
                </Link>
              }
            />

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              {trendingItems.length ? (
                trendingItems.map((item: any) => (
                  <div
                    key={item._id ?? item.id ?? item.phoneModel}
                    className="motion-safe:animate-fade-up transform transition duration-200 ease-out hover:-translate-y-2 hover:scale-105"
                  >
                    <HomeCard item={item} />
                  </div>
                ))
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* NEW ITEMS */}
      <section className="bg-gray-50">
        <Container>
          <div className="py-12">
            <SectionHeader
              eyebrow="Recommended"
              title="New items"
              action={
                <Link
                  href="/dashboard/items"
                  className="rounded-md border border-teal-200 bg-white px-8 py-3 text-sm font-semibold text-teal-800 shadow-sm hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                >
                  See All
                </Link>
              }
            />

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              {(newItems.length ? newItems : trendingItems).length ? (
                (newItems.length ? newItems : trendingItems).map((item: any) => (
                  <div
                    key={item._id ?? item.id ?? item.phoneModel}
                    className="motion-safe:animate-fade-up transform transition duration-200 ease-out hover:-translate-y-2 hover:scale-105"
                  >
                    <HomeCard item={item} />
                  </div>
                ))
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* OUR SHOPS */}
      <section className="bg-gray-50">
        <Container>
          <div className="pb-16">
            <SectionHeader eyebrow="Featured" title="Our Shops" />

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative overflow-hidden rounded-3xl bg-black shadow-sm md:col-span-1 md:row-span-2">
                <div className="relative h-72 md:h-full md:min-h-[26rem]">
                  <Image src="/shop1.jpg" alt="Shop 1" fill className="object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p className="text-lg font-semibold">NewRoad, Kathmandu</p>
                    <p className="mt-2 text-xs text-white/80">
                      Grand Opening on March 5, Warm Welcome to All..
                    </p>
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-2 text-xs font-semibold underline underline-offset-4 hover:text-white/90"
                    >
                      View Location
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl bg-black shadow-sm md:col-span-2">
                <div className="relative h-44 sm:h-48">
                  <Image src="/shop2.jpg" alt="Shop 2" fill className="object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-black/10" />
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white">
                    <p className="text-lg font-semibold">Gundu, Bhaktapur</p>
                    <p className="mt-2 max-w-md text-xs text-white/80">Opening Hrs: 7AM-10PM</p>
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-2 text-xs font-semibold underline underline-offset-4 hover:text-white/90"
                    >
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
                {[
                  { title: "Gongabu, Buspark", desc: "Opening Hrs: 7AM-10PM", img: "/shop3.jpg" },
                  { title: "Imadol, Lalitpur", desc: "Opening Hrs: 7AM-10PM", img: "/shop4.jpg" },
                ].map((s) => (
                  <div key={s.title} className="relative overflow-hidden rounded-3xl bg-black shadow-sm">
                    <div className="relative h-44">
                      <Image src={s.img} alt={s.title} fill className="object-cover opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
                      <div className="absolute bottom-5 left-5 right-5 text-white">
                        <p className="text-base font-semibold">{s.title}</p>
                        <p className="mt-1 text-xs text-white/80">{s.desc}</p>
                        <button
                          type="button"
                          className="mt-2 inline-flex items-center gap-2 text-xs font-semibold underline underline-offset-4 hover:text-white/90"
                        >
                          Shop Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}