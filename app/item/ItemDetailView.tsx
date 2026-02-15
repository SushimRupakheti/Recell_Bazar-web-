"use client";

import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function normalizePhoto(src: any) {
  if (!src) return "/placeholder-item.png";
  const s = String(src).trim();

  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return `${BASE_URL}${s}`;
  return s;
}

type Item = any;

export default function ItemDetailView({ item }: { item: Item }) {
  const photos = useMemo(() => {
    const raw: string[] =
      item?.photos && item.photos.length ? item.photos : ["/placeholder-item.png"];
    return raw.map((p) => normalizePhoto(p));
  }, [item]);

  const [selected, setSelected] = useState(0);

  const isLocalUrl = (u: string) =>
    u.includes("localhost") || u.includes("127.0.0.1");

  const formatNPR = (v: any) => {
    try {
      const n = Number(v) || 0;
      return n.toLocaleString("en-NP", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return String(v);
    }
  };

  const safeSelected = Math.min(selected, Math.max(0, photos.length - 1));

  // ✅ measure main photo card height so details can match it
  const mainCardRef = useRef<HTMLDivElement | null>(null);
  const [mainCardH, setMainCardH] = useState<number>(0);

  const statuses = useMemo(() => {
    return {
      display: item?.displayOriginal ? "Perfect" : "Replaced",
      camera: item?.cameraCondition ? "Excellent" : "Refurbished",
      charger: item?.chargerAvailable ? "Original" : "Not Included",
      unlock: item?.factoryUnlock ? "Factory Unlocked" : "Locked",
    };
  }, [item]);

  const rating = useMemo(() => {
    const f = Number(item?.finalPrice) || 0;
    const b = Number(item?.basePrice) || 0;
    if (!b) return 0;
    const r = (f / b) * 5;
    const rounded = Math.round(r * 10) / 10; // one decimal
    return Math.max(0, Math.min(5, rounded));
  }, [item]);

  const ratingStars = useMemo(() => {
    const count = Math.round(rating);
    const full = Array.from({ length: count }, () => "★").join(" ");
    const empty = Array.from({ length: 5 - count }, () => "☆").join(" ");
    return (full + (empty ? " " + empty : "")).trim();
  }, [rating]);

  const router = useRouter();

  useEffect(() => {
    if (!mainCardRef.current) return;

    const el = mainCardRef.current;

    const update = () => {
      const h = el.getBoundingClientRect().height;
      setMainCardH(Math.round(h));
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-2">
      <Navbar />
      {/* <nav className="mb-2 text-sm py-1 text-gray-500">
        Home / Category / <span className="text-gray-900">{item?.phoneModel || "Product Name"}</span>
      </nav> */}
     

      <div
        className="grid grid-cols-1 py-5 gap-10 lg:gap-16 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-stretch"
        style={
          mainCardH
            ? ({ ["--mainCardH" as any]: `${mainCardH}px` } as any)
            : undefined
        }
      >
        {/* ================= LEFT: GALLERY ================= */}
        <div className="lg:col-span-1">
          <div className="grid gap-6 md:grid-cols-[96px_minmax(0,1fr)] md:items-stretch">
            {/* Thumbnails */}
            <div className="order-2 md:order-1">
              <div className="flex gap-3 md:flex-col md:gap-4 overflow-x-auto md:overflow-visible pb-1">
                {photos.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className={[
                      "relative aspect-square w-20 md:w-24 shrink-0 overflow-hidden rounded-xl border bg-white",
                      "transition-all duration-200",
                      i === safeSelected
                        ? "border-teal-700 ring-2 ring-teal-700"
                        : "border-gray-200 hover:border-gray-400",
                    ].join(" ")}
                    aria-label={`Select photo ${i + 1}`}
                  >
                    <Image
                      src={p}
                      alt={`thumb-${i}`}
                      fill
                      className="object-cover"
                      unoptimized={isLocalUrl(p)}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Main Image (keep your photo size) */}
            <div className="order-1 md:order-2">
              <div
                ref={mainCardRef}
                className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="relative w-full h-80 sm:h-44 md:h-120 flex items-center justify-center">
                  <div className="relative w-4/5 md:w-3/4 max-w-[28rem] aspect-square">
                    <Image
                      src={photos[safeSelected]}
                      alt={item?.phoneModel || "Item"}
                      fill
                      className="object-cover rounded-2xl"
                      unoptimized={isLocalUrl(photos[safeSelected])}
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

       {/* ================= RIGHT: DETAILS ================= */}
<aside className="lg:h-[var(--mainCardH)]">
  <div className="flex h-120 flex-col rounded-3xl border border-gray-200 bg-white p-5 shadow-sm overflow-hidden">

    {/* Title + Price */}
    <div>
      <h2 className="text-lg font-semibold tracking-tight">
        {item?.phoneModel || "Product Name"}
      </h2>

      <p className="mt-2 text-lg font-bold text-gray-900">
        NPR {formatNPR(item?.finalPrice ?? item?.basePrice ?? 0)}
      </p>
    </div>

    {/* Rating Card */}
    <div className="mt-4 rounded-xl border border-gray-200 p-4 text-center">
      <p className="text-xs text-gray-500">Average Rating</p>
      <div className="mt-1 text-2xl font-bold">{rating.toFixed(1)}</div>
      <div className="text-yellow-500 text-sm mt-1">{ratingStars}</div>
    </div>

    {/* Device Condition Header */}
    <p className="mt-5 text-sm font-semibold text-gray-700">
      Device Condition
    </p>

    {/* Condition Grid */}
    <div className="mt-3 grid grid-cols-2 gap-3">

      {/* Screen */}
      <div className="flex items-center gap-3 rounded-2xl p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
          <Image
            src="/icons/icon8.png"
            alt="screen"
            width={30}
            height={30}
          />
        </div>

        <div>
          <p className="text-xs text-gray-500">Screen</p>
          <p className="text-sm font-semibold">
            {item?.deviceCondition || "Perfect"}
          </p>
        </div>
      </div>

      {/* Battery */}
      <div className="flex items-center gap-3 rounded-2xl p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
          <Image
            src="/icons/icon9.png"
            alt="battery"
            width={30}
            height={30}
          />
        </div>

        <div>
          <p className="text-xs text-gray-500">Battery</p>
          <p className="text-sm font-semibold">
            {item?.batteryHealth ?? "--"}%
          </p>
        </div>
      </div>

      {/* Camera */}
      <div className="flex items-center gap-3 rounded-2xl p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
          <Image
            src="/icons/icon10.png"
            alt="camera"
            width={30}
            height={30}
          />
        </div>

        <div>
          <p className="text-xs text-gray-500">Camera</p>
          <p className="text-sm font-semibold">
            {item?.cameraCondition ? "Excellent" : "Check"}
          </p>
        </div>
      </div>

      {/* Charger */}
      <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
          <Image
            src="/icons/icon11.png"
            alt="charger"
            width={30}
            height={30}
          />
        </div>

        <div>
          <p className="text-xs text-gray-500">Charger</p>
          <p className="text-sm font-semibold">
            {item?.chargerAvailable ? "Original" : "Not Included"}
          </p>
        </div>
      </div>

    </div>

    {/* Buttons */}
    <div className="mt-auto pt-5 flex gap-3">
      <button
        onClick={() => router.push(`/booking/${item?._id ?? item?.id ?? ""}`)}
        className="flex-1 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 transition"
      >
        Book Now
      </button>

      <button className="flex-1 rounded-xl border border-teal-700 px-4 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-50 transition">
        Add to Cart
      </button>
    </div>

  </div>
</aside>

      </div>

      {/* ================= DESCRIPTION (FULL WIDTH) ================= */}
      <section className="mt-10 border-t pt-7">
        <h3 className="text-xl font-semibold text-gray-900">Description</h3>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          {item?.description || "No description provided."}
        </p>
      </section>
    </div>
  );
}

