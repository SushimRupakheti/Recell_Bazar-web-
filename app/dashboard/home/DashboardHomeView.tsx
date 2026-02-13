"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import HomeCard from "@/app/components/homeCard";

type Props = {
  items: any[];
  anyRes?: any;
};

export default function DashboardHomeView({
  items: initialItems = [],
  anyRes,
}: Props) {
  const [showOnlyProducts, setShowOnlyProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  const categories = useMemo(
    () => Array.from(new Set(items.map(getCategory).filter(Boolean))) as string[],
    [items]
  );

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return items;
    return items.filter((it: any) => getCategory(it) === selectedCategory);
  }, [items, selectedCategory]);

  // sections (Trending + New items) use same card design (HomeCard)
  const trendingItems = filteredItems.slice(0, 8);
  const newItems = filteredItems.slice(8, 16);

  /* =========================
     PRODUCTS-ONLY VIEW (See All)
  ========================= */
  if (showOnlyProducts) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Products</h2>
          <button
            onClick={() => setShowOnlyProducts(false)}
            className="rounded-xl border px-4 py-2 text-sm"
          >
            Back
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="h-7 w-2 rounded bg-teal-700" />
            <div>
              <p className="text-xs font-semibold text-teal-700">Categories</p>
              <h3 className="text-lg font-semibold text-gray-900">Browse By Category</h3>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-md border px-3 py-1 text-sm ${
                !selectedCategory ? "bg-teal-700 text-white" : "bg-white text-gray-700"
              }`}
            >
              All
            </button>

            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`rounded-md border px-3 py-1 text-sm ${
                  selectedCategory === c ? "bg-teal-700 text-white" : "bg-white text-gray-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {filteredItems && filteredItems.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item: any) => (
              <HomeCard key={item._id ?? item.id ?? item.phoneModel} item={item} />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500">
            <div>No products found</div>
            {anyRes?.success === false && (
              <div className="mt-2 text-xs text-red-500">
                {anyRes.message || "Fetch failed"}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  /* =========================
     HOME UI (Like screenshot)
  ========================= */
  return (
    <main className="w-full">
      {/* HERO */}
      <section className="relative overflow-hidden bg-teal-700">
        {/* soft waves */}
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/20" />
          <div className="absolute left-52 -top-24 h-96 w-96 rounded-full bg-white/10" />
          <div className="absolute right-10 top-24 h-80 w-80 rounded-full bg-white/10" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 md:py-16">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
            {/* Left text */}
            <div className="text-white">
              <p className="mb-3 text-sm text-white/80">
                Explore the greatest phone marketplace
              </p>

              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                ReCell <br /> Bazar
              </h1>

              <p className="mt-4 max-w-md leading-relaxed text-white/85">
                “Your trusted second hand marketplace”
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-teal-800 hover:bg-white/90">
                  Buy Now!
                </button>
                <button className="rounded-xl border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
                  See More
                </button>
              </div>
            </div>

            {/* Right phones (dummy images) */}
            <div className="flex justify-center md:justify-end">
              <div className="relative h-60 w-full max-w-md sm:h-80">
                {/* main phone */}
                <div className="absolute inset-0">
                  <div className="relative h-full w-full">
                    <Image
                      src="/home_phone.png" // dummy
                      alt="Hero phone"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* slider dots (static) */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white/60" />
            <span className="h-2 w-2 rounded-full bg-white/60" />
            <span className="h-2 w-2 rounded-full bg-white" />
            <span className="h-2 w-2 rounded-full bg-white/60" />
            <span className="h-2 w-2 rounded-full bg-white/60" />
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="bg-white mt-8">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
            {[
              {
                img: "/icon1.png", // dummy
                title: "TRUSTED BY MANY",
                desc: "Trusted by numbers of people across the country",
              },
              {
                img: "/icon2.png", // dummy
                title: "24/7 CUSTOMER SERVICE",
                desc: "Friendly 24/7 customer support",
              },
              {
                img: "/icon3.png", // dummy
                title: "MONEY BACK GUARANTEE",
                desc: "Cashback within 10 days of return",
              },
            ].map((b) => (
              <div key={b.title} className="flex flex-col items-center">
                <div className="relative mb-3 h-20 w-20 rounded-full bg-teal-700/10 ring-4 ring-teal-700/10">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                          src={b.img}
                          alt={b.title}
                          width={36}
                          height={36}
                          className="object-contain"
                        />
                      </div>
                    </div>
                <p className="text-sm font-semibold text-gray-900">{b.title}</p>
                <p className="mt-1 max-w-xs text-xs text-gray-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REFURBISHED WITH CARE */}
      <section className="bg-white mt-8">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
            {/* left image */}
            <div className="relative h-56 overflow-hidden rounded-2xl bg-gray-100 sm:h-72">
              <Image
                src="/Refurbished.png" // dummy
                alt="Refurbished"
                fill
                className="object-cover"
              />
            </div>

            {/* right content */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">Refurbished With Care</h3>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Refurbished",
                    desc: "Full equipment on all items",
                    icon: "/icon4.png", // dummy
                  },
                  {
                    title: "Warranty",
                    desc: "Warranty up to 2 years",
                    icon: "/icon5.png", // dummy
                  },
                  {
                    title: "Eco-friendly",
                    desc: "We use eco friendly packaging",
                    icon: "/icon6.png", // dummy
                  },
                  {
                    title: "Cross check",
                    desc: "Fully cross checked and examined",
                    icon: "/icon7.png", // dummy
                  },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className="relative mt-0.5 h-10 w-10 shrink-0 rounded-full bg-teal-700/10">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                          src={f.icon}
                          alt={f.title}
                          width={18}
                          height={18}
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                      <p className="text-xs text-gray-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="h-7 w-2 rounded bg-teal-700" />
            <div>
              <p className="text-xs font-semibold text-teal-700">Categories</p>
              <h2 className="text-2xl font-semibold text-gray-900">Browse By Category</h2>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-md border px-3 py-1 text-sm ${
                !selectedCategory ? "bg-teal-700 text-white" : "bg-white text-gray-700"
              }`}
            >
              All
            </button>

            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`rounded-md border px-3 py-1 text-sm ${
                  selectedCategory === c ? "bg-teal-700 text-white" : "bg-white text-gray-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="h-7 w-2 rounded bg-teal-700" />
              <div>
                <p className="text-xs font-semibold text-teal-700">Trending</p>
                <h2 className="text-2xl font-semibold text-gray-900">Trending Products</h2>
              </div>
            </div>

            <button
              onClick={() => setShowOnlyProducts(true)}
              className="rounded-md border border-teal-200 bg-white px-4 py-2 text-xs font-semibold text-teal-800 hover:bg-gray-50"
            >
              See All
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
            {trendingItems.length ? (
              trendingItems.map((item: any) => (
                <HomeCard key={item._id ?? item.id ?? item.phoneModel} item={item} />
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-gray-500">
                <div>No products found</div>
                {anyRes?.success === false && (
                  <div className="mt-2 text-xs text-red-500">
                    {anyRes.message || "Fetch failed"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* NEW ITEMS */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="h-7 w-2 rounded bg-teal-700" />
              <div>
                <p className="text-xs font-semibold text-teal-700">Recommended</p>
                <h2 className="text-2xl font-semibold text-gray-900">New items</h2>
              </div>
            </div>

            <button
              onClick={() => setShowOnlyProducts(true)}
              className="rounded-md border border-teal-200 bg-white px-4 py-2 text-xs font-semibold text-teal-800 hover:bg-gray-50"
            >
              See All
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
            {(newItems.length ? newItems : trendingItems).length ? (
              (newItems.length ? newItems : trendingItems).map((item: any) => (
                <HomeCard key={item._id ?? item.id ?? item.phoneModel} item={item} />
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-gray-500">
                <div>No products found</div>
                {anyRes?.success === false && (
                  <div className="mt-2 text-xs text-red-500">
                    {anyRes.message || "Fetch failed"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* OUR SHOPS */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="h-7 w-2 rounded bg-teal-700" />
            <div>
              <p className="text-xs font-semibold text-teal-700">Featured</p>
              <h2 className="text-2xl font-semibold text-gray-900">Our Shops</h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Left big */}
            <div className="relative overflow-hidden rounded-2xl bg-black md:col-span-1 md:row-span-2 h-72 md:h-full">
              <Image
                src="/shop1.jpg" // dummy
                alt="Shop 1"
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-lg font-semibold">NewRoad, Kathmandu</p>
                <p className="mt-2 text-xs text-white/80">
                  Grand Opening on March 5, Warm Welcome to All..
                </p>
                <button className="mt-3 text-xs font-semibold underline underline-offset-4">
                  View Location
                </button>
              </div>
            </div>

            {/* Right column: top wide */}
            <div className="relative overflow-hidden rounded-2xl bg-black md:col-span-2 h-40">
              <Image
                src="/shop2.jpg" // dummy
                alt="Shop 2"
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-black/10" />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white">
                <p className="text-lg font-semibold">Gundu, Bhaktapur</p>
                <p className="mt-2 max-w-md text-xs text-white/80">
                  Opening Hrs: 7AM-10PM
                </p>
                <button className="mt-3 text-xs font-semibold underline underline-offset-4">
                  Shop Now
                </button>
              </div>
            </div>

            {/* Right column: bottom 2 cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
              {[
                {
                  title: "Gongabu, Buspark",
                  desc: "Opening Hrs: 7AM-10PM",
                  img: "/shop3.jpg", // dummy
                },
                {
                  title: "Imadol, Lalitpur",
                  desc: "Opening Hrs: 7AM-10PM",
                  img: "/shop4.jpg", // dummy
                },
              ].map((s) => (
                <div key={s.title} className="relative h-40 overflow-hidden rounded-2xl bg-black">
                  <Image src={s.img} alt={s.title} fill className="object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p className="text-base font-semibold">{s.title}</p>
                    <p className="mt-1 text-xs text-white/80">{s.desc}</p>
                    <button className="mt-2 text-xs font-semibold underline underline-offset-4">
                      Shop Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
