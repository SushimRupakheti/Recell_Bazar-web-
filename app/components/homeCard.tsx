"use client";

import Image from "next/image";
import { Star } from "lucide-react";

type HomeCardProps = {
  item: any;
};

function calcRating(basePrice: any, finalPrice: any) {
  const base = Number(basePrice);
  const finalP = Number(finalPrice);

  if (!Number.isFinite(base) || base <= 0) return 0;

  let rating = (finalP / base) * 5;
  if (!Number.isFinite(rating)) rating = 0;

  rating = Math.max(0, Math.min(5, rating));
  return Number(rating.toFixed(1));
}

function formatNPR(value: any) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return new Intl.NumberFormat("en-NP", { maximumFractionDigits: 0 }).format(n);
}

export default function HomeCard({ item }: HomeCardProps) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const rawPhoto = item.photos?.[0];
  const imageUrl = rawPhoto
    ? String(rawPhoto).startsWith("http")
      ? rawPhoto
      : `${BASE_URL}${rawPhoto}`
    : "/placeholder.png";

  const isLocalImage =
    typeof imageUrl === "string" &&
    (imageUrl.includes("localhost") || imageUrl.includes("127.0.0.1"));

  const finalPrice = item.finalPrice ?? item.final_price ?? item.price;
  const basePrice = item.basePrice ?? item.base_price;
  const rating = calcRating(basePrice, finalPrice);

  const base = Number(basePrice);
  const finalP = Number(finalPrice);
  const hasDiscount =
    Number.isFinite(base) &&
    base > 0 &&
    Number.isFinite(finalP) &&
    finalP > 0 &&
    finalP < base;

  const discountPct = hasDiscount ? Math.round(((base - finalP) / base) * 100) : 0;

  const storage =
    item.storage ??
    item.storageGb ??
    item.storageGB ??
    item.capacity ??
    item.ramStorage ??
    null;

  const subtitleParts = [item.deviceCondition ?? item.category ?? null, storage ? `${storage} GB` : null].filter(Boolean);
  const subtitle = subtitleParts.join(" • ");

  const year = item.year ?? "-";

  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-2.5 shadow-[0_1px_0_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
        <Image
          src={imageUrl}
          alt={item.phoneModel || "Item"}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          unoptimized={isLocalImage}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {hasDiscount && (
          <div className="absolute left-2 top-2 rounded-full bg-teal-600 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
            -{discountPct}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-2.5">
        <p className="truncate text-[12.5px] font-semibold text-gray-900">
          {item.phoneModel || "Unknown Model"}
        </p>

        {/* Subtitle */}
        {subtitle ? (
          <p className="mt-0.5 truncate text-[10.5px] text-gray-500">{subtitle}</p>
        ) : (
                <div className="mt-0.5 h-3" />
              )}

        {/* Price (slightly bigger) */}
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-[14px] font-extrabold text-gray-900">
            NPR {formatNPR(finalPrice)}
          </p>

          {hasDiscount && (
            <p className="text-[10.5px] text-gray-400 line-through">
              NPR {formatNPR(basePrice)}
            </p>
          )}
        </div>

        {/* Bottom row: rating left, year bottom-right */}
        <div className="mt-2 flex items-center justify-between text-[10.5px] text-gray-500">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-teal-600 fill-teal-600" />
            <span className="font-medium text-gray-700">{rating}</span>
          </div>

          <span className="font-medium text-gray-600">{year}</span>
        </div>
      </div>
    </div>
  );
}
