import React from "react";
import ItemsPageClient from "./ItemsPageClient";
import Container from "@/app/components/Container";
import { getAllItems } from "@/lib/api/items";

// Server component
export default async function Page() {
  let items: any[] = [];
  try {
    const res = await getAllItems();
    // backend proxy may return { success, data } or array directly
    if (!res) items = [];
    else if (Array.isArray(res)) items = res;
    else if (res.data && Array.isArray(res.data)) items = res.data;
    else if (res.items && Array.isArray(res.items)) items = res.items;
    else if (res.rows && Array.isArray(res.rows)) items = res.rows;
    else if (res.success && res.data && Array.isArray(res.data.items)) items = res.data.items;
  } catch (err) {
    // swallow, show empty state
    // eslint-disable-next-line no-console
    console.error("Failed to fetch items for dashboard items page:", err);
    items = [];
  }

  return (
    <main className="w-full bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <ItemsPageClient items={items} />
      </div>
    </main>
  );
}
