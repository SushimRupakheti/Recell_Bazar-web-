import MyItemsGrid from "@/app/components/sell/myItemGrid";
import Link from "next/link";

export default function Page() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-semibold">Sell</h1>

        <Link
          href="/dashboard/sell/add"
          className="bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          Add +
        </Link>
      </div>

      {/* Items Grid */}
      <MyItemsGrid />

      {/* Footer Button */}
      <div className="mt-10">
        <Link
          href="/"
          className="border px-6 py-2 rounded-md hover:bg-gray-100 transition"
        >
          Return To Home
        </Link>
      </div>

    </div>
  );
}
