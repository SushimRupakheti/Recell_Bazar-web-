"use client";

import { useEffect, useState } from "react";
import ItemCard from "./ItemCard";
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
    return <p className="text-center py-10">No items posted yet</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard key={item._id} item={item} />
      ))}
    </div>
  );
}
