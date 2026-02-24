"use client";

import { useEffect, useState } from "react";
import ItemCard from "./ItemCard";
import Image from "next/image";
import { getItemsBySeller } from "@/lib/api/items";
import { getAuthUser } from "@/lib/actions/auth-action";

export default function MyItemsGrid() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const user = await getAuthUser();
        if (!user?.id) return;

        const res = await getItemsBySeller(user.id);

        if (res.success) {
          setItems(res.items || []); 
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  if (loading) {
    return <p className="text-center py-10">Loading items...</p>;
  }

  if (!items.length) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-xs">
          <Image src="/no-item.png" alt="No items" width={420} height={280} className="mx-auto object-contain" />
        </div>
        <p className="mt-6 text-lg font-medium text-gray-700">No items posted yet</p>
        <p className="mt-2 text-sm text-gray-500">You haven't listed any items for sale.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard
          key={item._id}
          item={item}
          onDelete={async (id: string) => {
            try {
              const confirmed = true; // handled inside ItemCard confirm
              const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
              if (!res.ok) throw new Error("Delete failed");
              // remove from list locally
              setItems((prev) => prev.filter((it) => (it._id ?? it.id) !== id));
            } catch (err) {
              console.error(err);
              alert("Failed to delete item");
            }
          }}
        />
      ))}
    </div>
  );
}
