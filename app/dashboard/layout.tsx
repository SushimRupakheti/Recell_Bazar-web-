export const dynamic = 'force-dynamic';

import AdvertisementBar from "../components/AdvertisementBar";
import Navbar from "../components/Navbar";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/cookie";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAuthToken();
  if (!token) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky header stays the same */}
      <header className="sticky top-0 z-50 bg-white">
        <AdvertisementBar />
        <Navbar />
      </header>

      {/* Only this part changes on route change */}
      <main>{children}</main>
    </div>
  );
}
