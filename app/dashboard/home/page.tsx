import Image from "next/image";

export default function DashboardHomePage() {
  return (
    <>
      {/* HERO */}
      <section className="w-full bg-teal-700 relative overflow-hidden">
        {/* soft shapes */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-white/20" />
          <div className="absolute left-52 -top-24 h-96 w-96 rounded-full bg-white/10" />
          <div className="absolute right-10 top-24 h-80 w-80 rounded-full bg-white/10" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="text-white">
              <p className="text-white/80 text-sm mb-3">
                Explore the greatest phone marketplace
              </p>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                ReCell <br /> Bazar
              </h1>

              <p className="mt-4 text-white/85 max-w-md leading-relaxed">
                “Your trusted second hand marketplace”
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button className="rounded-xl bg-white text-teal-800 px-5 py-2.5 text-sm font-semibold hover:bg-white/90">
                  Buy Now!
                </button>
                <button className="rounded-xl border border-white/40 text-white px-5 py-2.5 text-sm font-semibold hover:bg-white/10">
                  See More
                </button>
              </div>

              {/* dots */}
              <div className="mt-10 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" />
                <span className="h-2 w-2 rounded-full bg-white/50" />
                <span className="h-2 w-2 rounded-full bg-white/50" />
                <span className="h-2 w-2 rounded-full bg-white/50" />
                <span className="h-2 w-2 rounded-full bg-white/50" />
              </div>
            </div>

            {/* Hero Images */}
            <div className="flex justify-center md:justify-end">
              <div className="w-full max-w-md rounded-3xl bg-white/10 border border-white/20 p-5 sm:p-6">
                <div className="relative h-[260px] sm:h-[320px] rounded-2xl bg-white/10 border border-white/15 overflow-hidden">
                  {/* You can replace these filenames */}
                  <Image
                    src="/home_phone.png"
                    alt="Hero phone 1"
                    fill
                    className="object-contain p-6"
                    priority
                  />
                  <div className="absolute right-4 bottom-4 hidden sm:block h-28 w-28 rounded-2xl bg-white/10 border border-white/15 overflow-hidden">
                    <Image
                      src="/hero-phone-2.png"
                      alt="Hero phone 2"
                      fill
                      className="object-contain p-3"
                    />
                  </div>
                </div>

                <p className="mt-4 text-white/75 text-sm leading-relaxed">
                  Add your slider here later. For now, these are placeholder images you can rename.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES (with icon images) */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: "TRUSTED BY MANY", desc: "Trusted by people across the country", icon: "/icon1.png" },
              { title: "24/7 CUSTOMER SERVICE", desc: "Friendly 24/7 customer support", icon: "/icon2.png" },
              { title: "MONEY BACK GUARANTEE", desc: "Cashback within 10 days of return", icon: "/icon3.png" },
            ].map((x) => (
              <div
                key={x.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm hover:shadow transition"
              >
                <div className="mx-auto h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center overflow-hidden">
                  <Image
                    src={x.icon}
                    alt={x.title}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900 text-sm tracking-wide">
                  {x.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{x.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                Featured Products
              </h2>
              <p className="mt-2 text-gray-600">
                Replace these dummy images and names with your real products.
              </p>
            </div>

            <button className="hidden sm:inline-flex rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50">
              View All
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: "Product 1", price: "NPR 00,000", img: "/product-1.png" },
              { name: "Product 2", price: "NPR 00,000", img: "/product-2.png" },
              { name: "Product 3", price: "NPR 00,000", img: "/product-3.png" },
              { name: "Product 4", price: "NPR 00,000", img: "/product-4.png" },
              { name: "Product 5", price: "NPR 00,000", img: "/product-5.png" },
              { name: "Product 6", price: "NPR 00,000", img: "/product-6.png" },
              { name: "Product 7", price: "NPR 00,000", img: "/product-7.png" },
              { name: "Product 8", price: "NPR 00,000", img: "/product-8.png" },
            ].map((p) => (
              <div
                key={p.name}
                className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow transition overflow-hidden"
              >
                <div className="relative h-32 sm:h-40 bg-gray-50">
                  <Image src={p.img} alt={p.name} fill className="object-contain p-4" />
                </div>
                <div className="p-4">
                  <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                  <p className="text-gray-600 text-sm mt-1">{p.price}</p>
                  <button className="mt-3 w-full rounded-xl bg-teal-600 text-white py-2 text-sm font-semibold hover:bg-teal-700">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-8 sm:hidden w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50">
            View All
          </button>
        </div>
      </section>

      {/* REFURBISHED SECTION (with icon image placeholders) */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left image placeholder */}
            <div className="relative rounded-3xl border border-gray-100 bg-gray-50 h-[260px] sm:h-[320px] overflow-hidden">
              <Image
                src="/refurbished-1.png"
                alt="Refurbished"
                fill
                className="object-cover"
              />
            </div>

            {/* Right content */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                Refurbished With Care
              </h2>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Every device is tested, cleaned, and verified to meet quality standards.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Refurbished", desc: "Full replacement on all items", icon: "/icon1.png" },
                  { title: "Warranty", desc: "Warranty up to 2 years", icon: "/icon2.png" },
                  { title: "Eco-friendly", desc: "Eco friendly packaging", icon: "/icon3.png" },
                  { title: "Cross check", desc: "Fully cross checked and examined", icon: "/icon4.png" },
                ].map((p) => (
                  <div
                    key={p.title}
                    className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center overflow-hidden">
                        <Image
                          src={p.icon}
                          alt={p.title}
                          width={22}
                          height={22}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{p.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{p.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-7 inline-flex rounded-xl bg-teal-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-teal-700">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
