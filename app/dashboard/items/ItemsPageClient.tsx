"use client";

import React, { useMemo, useState } from "react";
import HomeCard from "@/app/components/homeCard";

type Props = { items: any[] };

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
  for (const c of candidates) if (c) return String(c);
  if (it?.phoneModel) return String(it.phoneModel).split(" ")[0];
  return null;
};

export default function ItemsPageClient({ items }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map(getCategory).filter(Boolean))) as string[];
    return unique.sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    if (!selectedCategory) return items;
    return items.filter((it) => getCategory(it) === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">All items</h1>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 rounded-md border px-6 py-2.5 text-sm font-medium transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-600/30 ${
              !selectedCategory
                ? "border-teal-700 bg-teal-700 text-white shadow-sm"
                : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400"
            }`}
          >
            All
          </button>

          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCategory(c)}
              className={`shrink-0 rounded-md border px-6 py-2.5 text-sm font-medium transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-600/30 ${
                selectedCategory === c
                  ? "border-teal-700 bg-teal-700 text-white shadow-sm"
                  : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
        {filtered.map((item: any) => (
          <div key={item._id ?? item.id ?? item.phoneModel} className="motion-safe:animate-fade-up">
            <HomeCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
