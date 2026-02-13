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
