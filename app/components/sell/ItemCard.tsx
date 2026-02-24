"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

type ItemCardProps = {
  item: any;
  onDelete?: (id: string) => Promise<void> | void;
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

export default function ItemCard({ item, onDelete }: ItemCardProps) {
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

  const rawId = item._id ?? item.id ?? null;
  const id = rawId && String(rawId) !== "undefined" && String(rawId) !== "null" ? String(rawId) : null;

  const card = (
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
        {/* status badge */}
        {(() => {
          const s = (item.status || "").toString().toLowerCase();
          const map: Record<string, string> = {
            approved: "bg-emerald-600 text-white",
            rejected: "bg-red-600 text-white",
            pending: "bg-yellow-400 text-black",
            sold: "bg-red-800 text-white",
            available: "bg-gray-700 text-gray-100",
          };
          const cls = map[s] ?? "bg-gray-700 text-gray-100";
          if (!s) return null;
          return (
            <div className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold ${cls} shadow-sm`}>{String(s).toUpperCase()}</div>
          );
        })()}
      </div>

      {/* Content */}
      <div className="mt-2.5">
        <p className="truncate text-[12.5px] font-semibold text-gray-900">{item.phoneModel || "Unknown Model"}</p>

        {subtitle ? (
          <p className="mt-0.5 truncate text-[10.5px] text-gray-500">{subtitle}</p>
        ) : (
          <div className="mt-0.5 h-3" />
        )}

        <div className="mt-2">
          <p className="text-[14px] font-extrabold text-gray-900">NPR {formatNPR(finalPrice)}</p>
        </div>

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

  if (!id) return card;
  const href = `/item/${id}`;

  // Menu and delete handling
  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!id) return;
    const ok = confirm("Are you sure you want to delete this item?");
    if (!ok) return;
    try {
      if (onDelete) {
        await onDelete(id);
      } else {
        // fallback: call internal API route
        const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert("Failed to delete item");
    }
  };

  // Render wrapper with menu button
  return (
    <div className="relative">
      <div className="absolute right-2 top-2 z-10">
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              const menu = document.getElementById(`menu-${id}`);
              if (menu) menu.classList.toggle("hidden");
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/90 ring-1 ring-gray-200 shadow-sm hover:bg-gray-50"
            aria-label="More"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>

          {id ? (
            <div id={`menu-${id}`} className="hidden absolute right-0 mt-2 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <a href={`/dashboard/sell/edit/${id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Edit</a>
              <button
                type="button"
                onClick={handleDeleteClick}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
              >
                Delete
              </button>
            </div>
          </div>
          ) : null}
        </div>
      </div>

      <Link href={href} className="block">
        {card}
      </Link>
    </div>
  );
}
