import AdminLayout from "../users/AdminLayout";
import Link from "next/link";
import { handleGetAllItems } from "@/lib/actions/item-action";
import ItemActions from "./_components/ItemActions";

export default async function ItemsPage({ searchParams }: { searchParams?: any }) {
  const resolvedSearchParams = typeof searchParams === "object" && searchParams !== null && typeof searchParams.then === "function"
    ? await searchParams
    : searchParams || {};

  const pageRaw = Array.isArray(resolvedSearchParams?.page) ? resolvedSearchParams.page[0] : resolvedSearchParams?.page;
  const limitRaw = Array.isArray(resolvedSearchParams?.limit) ? resolvedSearchParams.limit[0] : resolvedSearchParams?.limit;

  let parsedPage = parseInt(pageRaw ?? "1", 10);
  if (Number.isNaN(parsedPage) || parsedPage < 1) parsedPage = 1;

  let parsedLimit = parseInt(limitRaw ?? "10", 10);
  if (Number.isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = 10;

  const page = parsedPage;
  const limit = parsedLimit;

  const res = await handleGetAllItems({ page, limit });
  const anyRes: any = res;

  // normalize different possible response shapes
  let items: any[] = [];
  if (res?.success) {
    const d = res.data;
    if (Array.isArray(d)) items = d;
    else if (Array.isArray(d?.data)) items = d.data;
    else if (Array.isArray(d?.items)) items = d.items;
    else if (Array.isArray(anyRes.items)) items = anyRes.items;
    else if (Array.isArray(anyRes.data?.items)) items = anyRes.data.items;
    else if (Array.isArray(anyRes.data)) items = anyRes.data;
  } else if (Array.isArray(res)) {
    items = res;
  }

  const meta = (res && (res.meta || anyRes.meta)) || { total: items.length, totalPages: 1, currentPage: page, perPage: limit };
  const currentPage = meta.currentPage ?? page;
  const perPage = meta.perPage || limit;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil((meta.total || items.length) / perPage));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const prevHref = `/admin/items?page=${Math.max(1, currentPage - 1)}&limit=${perPage}`;
  const nextHref = `/admin/items?page=${Math.min(totalPages, currentPage + 1)}&limit=${perPage}`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Items</h1>
          <Link
            href="/dashboard/sell/add"
            className="inline-flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm font-medium"
            aria-label="Create item"
          >
            Add Item
          </Link>
        </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <Link
                href={prevHref}
                aria-disabled={!hasPrev}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700 ${!hasPrev ? "opacity-50 pointer-events-none" : ""}`}
              >
                Prev
              </Link>

              <div className="text-sm text-gray-400">Page {currentPage} of {totalPages}</div>

              <Link
                href={nextHref}
                aria-disabled={!hasNext}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700 ${!hasNext ? "opacity-50 pointer-events-none" : ""}`}
              >
                Next
              </Link>
            </div>
          )}

        <div className="overflow-x-auto rounded-lg border border-gray-800 bg-gray-900">
          {items.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No items found.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-800 text-gray-300 uppercase tracking-wide text-xs">
                  <th className="px-6 py-4 text-left">Item</th>
                  <th className="px-6 py-4 text-left">Seller</th>
                  <th className="px-6 py-4 text-left">Price</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800">
                {items.map((it: any) => (
                  <tr key={it._id} className="hover:bg-gray-800/60 transition-colors duration-150">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                          {(() => {
                            const photo = it.photos?.[0];
                            if (!photo) return (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                            );

                            const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050").replace(/\/$/, "");
                            const src = typeof photo === "string"
                              ? (photo.startsWith("http") ? photo : `${base}/${photo.replace(/^\//, "")}`)
                              : String(photo);

                            return (
                              // keep simple <img> so it renders on server; ensure src is absolute
                              <img src={src} alt={it.phoneModel || it.category || "item"} className="w-full h-full object-cover" />
                            );
                          })()}
                        </div>
                        <div>
                          <div className="text-lg font-medium text-gray-100">{it.phoneModel || it.category || "Untitled"}</div>
                          <div className="text-sm text-gray-400">{it.description ? (String(it.description).slice(0, 80) + (String(it.description).length > 80 ? '…' : '')) : ''}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6 text-gray-300">
                      {
                        (() => {
                          const s = it.sellerName ?? it.seller ?? it.sellerId;
                          if (!s) return "—";
                          if (typeof s === "string") return s;
                          if (typeof s === "object") {
                            const first = s.firstName || s.first || "";
                            const last = s.lastName || s.last || "";
                            const combined = `${first} ${last}`.trim();
                            if (combined) return combined;
                            if (s.profileImage) return s.profileImage;
                            if (s._id) return s._id;
                          }
                          return String(s);
                        })()
                      }
                    </td>

                    <td className="px-6 py-6 text-gray-100">{it.finalPrice ? `Rs ${it.finalPrice}` : it.price ? `Rs ${it.price}` : "—"}</td>

                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${it.status === 'sold' ? 'bg-red-900/30 text-red-300' : 'bg-green-900/30 text-green-300'}`}>
                        {String(it.status || 'available').toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-6">
                      <ItemActions id={it._id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
