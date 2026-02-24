"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getItemById, updateItem } from "@/lib/api/items";

type Props = { id: string };

export default function ItemEditClient({ id }: Props) {
  // defensive: if id is missing or the literal string 'undefined', show error
  if (!id || id === "undefined") {
    return (
      <div className="py-8">
        <div className="text-red-600 font-medium">Invalid item id.</div>
        <div className="mt-2 text-sm text-gray-600">Cannot edit this item because the id is missing.</div>
      </div>
    );
  }
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phoneModel, setPhoneModel] = useState("");
  const [finalPrice, setFinalPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getItemById(id);
        // getItemById may return { success, item } or the item directly
        let item: any = res;
        if (res && res.item) item = res.item;
        if (res && res.data && res.data.item) item = res.data.item;

        if (!mounted) return;
        setPhoneModel(item.phoneModel || item.model || "");
        setFinalPrice(item.finalPrice ?? item.final_price ?? item.price ?? "");
        setDescription(item.description ?? "");
      } catch (err: any) {
        setError(err?.message || "Failed to load item");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        phoneModel: phoneModel || undefined,
        finalPrice: finalPrice === "" ? undefined : Number(finalPrice),
        description: description || undefined,
      };
      await updateItem(id, payload);
      router.push("/dashboard/sell");
    } catch (err: any) {
      setError(err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="py-8">Loading item...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-xl font-semibold mb-4">Edit item</h2>
      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      <div className="grid gap-4">
        <label className="block">
          <div className="text-sm text-gray-600">Model</div>
          <input value={phoneModel} onChange={(e) => setPhoneModel(e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2" />
        </label>

        <label className="block">
          <div className="text-sm text-gray-600">Price (NPR)</div>
          <input
            type="number"
            value={finalPrice === "" ? "" : String(finalPrice)}
            onChange={(e) => setFinalPrice(e.target.value === "" ? "" : Number(e.target.value))}
            className="mt-2 w-full rounded-md border px-3 py-2"
          />
        </label>

        <label className="block">
          <div className="text-sm text-gray-600">Description</div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2 h-28" />
        </label>

        <div className="flex items-center gap-3">
          <button disabled={saving} onClick={handleSave} className="bg-teal-600 text-white px-4 py-2 rounded-md disabled:opacity-60">
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-md border">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
