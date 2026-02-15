"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { phoneModels } from "@/lib/api/items";

const brands = Object.keys(phoneModels);

export default function DashboardSellAddPage() {
  const router = useRouter();
  const [brand, setBrand] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);

  const models = brand ? phoneModels[brand] || [] : [];

  const handleBrandClick = (b: string) => {
    setBrand(b);
    setModel(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-6">
        <p className="text-sm text-gray-500">Sell / SellStart / <span className="text-gray-700">Phone Details</span></p>
        <h1 className="text-3xl font-semibold text-teal-600 mt-4">Choose the brand of your phone</h1>
        <p className="text-gray-600 mt-2">Get an estimated value of your device through our follow up questions and diagnostics</p>
      </div>

      <div className="grid grid-cols-7 gap-6 items-center my-8">
        {brands.map((b) => (
          <div key={b} className="flex justify-center">
            <button
              onClick={() => handleBrandClick(b)}
              className={`p-2 rounded-lg border ${brand === b ? "border-teal-600" : "border-transparent"} hover:shadow`}
            >
              <img src={`/${b.toLowerCase()}.png`} alt={b} className="h-12 object-contain" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <label className="block text-gray-600 mb-2">Select Your Phone's Model</label>
        <div className="relative">
          <select
            value={model ?? ""}
            onChange={(e) => setModel(e.target.value || null)}
            className="w-full border rounded-lg p-4 shadow-sm"
          >
            <option value="">{brand ? "Select model" : "Select a brand first"}</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-4">
        <Link href="/dashboard/sell" className="px-6 py-3 border rounded-md text-teal-700">Cancel</Link>
        <button
          onClick={() => router.push(`/dashboard/sell/add/details?brand=${encodeURIComponent(brand || "")} &model=${encodeURIComponent(model || "")}`)}
          className="ml-auto bg-teal-700 text-white px-8 py-3 rounded-md"
          disabled={!brand || !model}
        >
          Next
        </button>
      </div>
    </div>
  );
}
