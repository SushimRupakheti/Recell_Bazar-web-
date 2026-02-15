import { handleGetItemById } from "@/lib/actions/item-action";
import ItemDetailView from "@/app/item/ItemDetailView";

type Props = { params: { id: string } };

export default async function Page({ params }: Props) {
  // Next may pass `params` as a Promise in some runtime versions.
  // Safely unwrap it so `id` is never read from an unresolved promise.
  const resolvedParams = (params as any)?.then ? await params : params;
  const id = resolvedParams?.id;
  const res = await handleGetItemById(id);

  // normalize to item (handle several response shapes)
  const findItem = (r: any) => {
    if (!r) return null;
    // common direct item
    if (r._id || r.id) return r;
    // nested item fields
    if (r.item && (r.item._id || r.item.id)) return r.item;
    if (r.data && (r.data._id || r.data.id)) return r.data;
    if (r.data && r.data.item && (r.data.item._id || r.data.item.id)) return r.data.item;
    // some wrappers may nest twice
    if (r.data && r.data.data && (r.data.data._id || r.data.data.id)) return r.data.data;
    if (r.data && r.data.data && r.data.data.item) return r.data.data.item;
    // fallback: if response contains only one object with expected keys
    if (r.item) return r.item;
    if (r.data) return r.data;
    return null;
  };

  const item = findItem(res) || findItem(res?.data) || null;

  if (!item) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-gray-500">
        <h2 className="text-xl font-semibold text-gray-800">Item not found</h2>
        <p className="mt-3">We couldn't find this item. It may have been removed or the id is invalid.</p>
        <div className="mt-4 text-sm text-gray-700">
          <div>
            <strong>Requested id:</strong> <span className="ml-1">{String(id)}</span>
          </div>
        </div>
        <details className="mt-4 text-left text-xs text-gray-600">
          <summary className="cursor-pointer text-sm text-gray-700">Debug response (click to expand)</summary>
          <pre className="mt-2 max-h-48 overflow-auto text-xs">{JSON.stringify(res, null, 2)}</pre>
        </details>
      </div>
    );
  }

  return <ItemDetailView item={item} />;
}
