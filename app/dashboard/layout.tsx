import AdvertisementBar from "../components/AdvertisementBar";
import Navbar from "../components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
