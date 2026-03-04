import BookingForm from "../BookingForm";
import { getItemById } from "@/lib/api/items";
import { getUserData } from "@/lib/cookie";

type Props = {
  params: { id: string };
};

export default async function Page({ params }: Props) {
  // `params` may be a Promise in some Next versions — unwrap if necessary
  let resolvedParams: any = params as any;
  if (resolvedParams && typeof resolvedParams.then === "function") {
    resolvedParams = await resolvedParams;
  }
  const { id } = resolvedParams;
  let item: any = null;

  try {
    const res = await getItemById(id);
    // API might return { success: true, item: { ... } }
    item = res?.item ?? res;
  } catch (err) {
    // ignore; item stays null
  }

  // fetch current user server-side from cookies (if set by login flow)
  const user = await getUserData();

  // Guard: if item is already sold on the server, show a message instead of the booking form
  const isSold = item?.isSold === true || String(item?.status || "").toLowerCase() === "sold";

  // Guard: prevent booking own item
  const itemSellerId = item?.sellerId?._id ?? item?.sellerId ?? "";
  const currentUserId = user?._id ?? user?.id ?? "";
  const isOwnItem = itemSellerId && currentUserId && String(itemSellerId) === String(currentUserId);

  if (isOwnItem) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="mx-auto max-w-sm rounded-xl bg-amber-50 border border-amber-200 p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">This Is Your Listing</h2>
          <p className="mt-2 text-sm text-gray-600">
            You cannot purchase your own item.
          </p>
          <a href="/dashboard" className="mt-6 inline-block rounded-md bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 transition">
            Browse Other Items
          </a>
        </div>
      </div>
    );
  }

  if (isSold) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="mx-auto max-w-sm rounded-xl bg-red-50 border border-red-200 p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Item Already Sold</h2>
          <p className="mt-2 text-sm text-gray-600">
            {item?.phoneModel ?? "This item"} has already been sold and is no longer available for purchase.
          </p>
          {item?.soldAt && (
            <p className="mt-1 text-xs text-gray-500">
              Sold on {new Date(item.soldAt).toLocaleDateString()}
            </p>
          )}
          <a href="/dashboard" className="mt-6 inline-block rounded-md bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 transition">
            Browse Other Items
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="mb-4 text-sm text-gray-500">Home / Category / <span className="text-gray-900">{item?.phoneModel ?? 'Product'}</span> / Booking Confirmation</nav>

      <h1 className="mb-6 text-3xl font-semibold">Booking Confirmation</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <BookingForm item={item} user={user} />
        </div>

        <aside className="rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Summary</p>
          <h3 className="mt-2 text-lg font-semibold">{item?.phoneModel}</h3>
          <p className="mt-1 text-sm text-gray-700">Price: NPR {Number((item?.finalPrice ?? item?.basePrice) || 0).toLocaleString()}</p>
          <div className="mt-4">
            <p className="text-xs text-gray-500">Seller</p>
            <p className="mt-1 text-sm">{item?.sellerId?.firstName} {item?.sellerId?.lastName}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
