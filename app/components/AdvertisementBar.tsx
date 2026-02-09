export default function AdvertisementBar() {
  return (
    <div className="w-full bg-teal-100 text-teal-900">
      <div className="mx-auto max-w-7xl px-2 sm:px-2 lg:px-8">
        <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
          <p className="truncate">
            New year sale on Samsung OFF -30% ·{" "}
            <span className="font-semibold underline underline-offset-2 cursor-pointer">
              Shop Now
            </span>
          </p>

          <button className="hidden sm:inline-flex items-center gap-2 text-teal-900/80 hover:text-teal-900">
            English <span className="text-[10px]">▼</span>
          </button>
        </div>
      </div>
    </div>
  );
}
