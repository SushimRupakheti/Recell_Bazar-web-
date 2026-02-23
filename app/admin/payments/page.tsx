import AdminLayout from "../users/AdminLayout";
import Link from "next/link";
import { fetchAdminPaymentsServer } from "@/lib/actions/payment-action";

export default async function PaymentsPage({ searchParams }: { searchParams?: any }) {
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

  const res = await fetchAdminPaymentsServer({ page, limit });
  const anyRes: any = res;

  let payments: any[] = [];
  if (res?.success) {
    const d = res.data;
    if (Array.isArray(d)) payments = d;
    else if (Array.isArray(d?.data)) payments = d.data;
    else if (Array.isArray(anyRes.payments)) payments = anyRes.payments;
    else if (Array.isArray(anyRes.data)) payments = anyRes.data;
  } else if (Array.isArray(res)) {
    payments = res;
  }

  const meta = (res && (res.meta || anyRes.meta)) || { total: payments.length, totalPages: 1, currentPage: page, perPage: limit };
  const currentPage = meta.currentPage ?? page;
  const perPage = meta.perPage || limit;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil((meta.total || payments.length) / perPage));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const prevHref = `/admin/payments?page=${Math.max(1, currentPage - 1)}&limit=${perPage}`;
  const nextHref = `/admin/payments?page=${Math.min(totalPages, currentPage + 1)}&limit=${perPage}`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Payments</h1>
        </div>

        {/* Payments Activity Chart */}
<div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
  {(() => {
    const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

    const resolveDays = (raw: any) => {
      const v = Array.isArray(raw) ? raw[0] : raw;
      const n = parseInt(String(v ?? "14"), 10);
      return [7, 14, 30].includes(n) ? n : 14;
    };

    // Read range from URL (?range=7|14|30), default 14
    const rangeDays = resolveDays(resolvedSearchParams?.range);

    const today = new Date();
    const dateKey = (d: Date) => d.toISOString().slice(0, 10);

    const keys: string[] = [];
    for (let i = rangeDays - 1; i >= 0; i--) {
      const dt = new Date(today);
      dt.setDate(today.getDate() - i);
      keys.push(dateKey(dt));
    }

    const counts = new Array(keys.length).fill(0);
    for (const p of payments) {
      const created = p?.createdAt || p?.date || p?.created;
      if (!created) continue;
      const d = new Date(created);
      if (isNaN(d.getTime())) continue;
      const key = dateKey(d);
      const idx = keys.indexOf(key);
      if (idx >= 0) counts[idx]++;
    }

    const maxVal = Math.max(...counts, 1);
    const minVal = 0;
    const midVal = Math.ceil(maxVal / 2);

    // SVG sizing
    const W = 680;
    const H = 160;
    const padL = 44;
    const padR = 14;
    const padT = 14;
    const padB = 28;

    const innerW = W - padL - padR;
    const innerH = H - padT - padB;

    const xAt = (i: number) => padL + (keys.length === 1 ? innerW / 2 : (i * innerW) / (keys.length - 1));
    const yAt = (v: number) => padT + innerH - (v / maxVal) * innerH;

    // Build a smooth path (simple quadratic smoothing)
    const pts = counts.map((v, i) => ({ x: xAt(i), y: yAt(v), v }));
    const smoothPath = (() => {
      if (pts.length === 0) return "";
      if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const cur = pts[i];
        const cx = (prev.x + cur.x) / 2;
        d += ` Q ${prev.x} ${prev.y} ${cx} ${(prev.y + cur.y) / 2}`;
        d += ` T ${cur.x} ${cur.y}`;
      }
      return d;
    })();

    const areaPath = (() => {
      if (!smoothPath) return "";
      const last = pts[pts.length - 1];
      const first = pts[0];
      const baseY = padT + innerH;
      return `${smoothPath} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
    })();

    const gridLines = 4; // horizontal grid segments
    const yTicks = Array.from({ length: gridLines + 1 }, (_, i) => i / gridLines); // 0..1

    const rangeHref = (d: number) =>
      `/admin/payments?page=${currentPage}&limit=${perPage}&range=${d}`;

    const startLabel = keys[0]?.slice(5);
    const endLabel = keys[keys.length - 1]?.slice(5);

    return (
      <>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Payments Activity</h2>
            <p className="mt-1 text-sm text-gray-400">
              Payments per day (last {rangeDays} days)
            </p>
          </div>

          {/* Range: use Links so it works in a Server Component */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Range</span>
            <div className="flex overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
              {[7, 14, 30].map((d) => {
                const active = d === rangeDays;
                return (
                  <Link
                    key={d}
                    href={rangeHref(d)}
                    className={[
                      "px-3 py-1 text-sm transition-colors",
                      active
                        ? "bg-gray-800 text-gray-100"
                        : "text-gray-300 hover:bg-gray-800/60",
                    ].join(" ")}
                  >
                    {d}d
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4">
          {payments.length === 0 ? (
            <div className="py-6 text-center text-gray-500">No payment data.</div>
          ) : (
            <div className="rounded-lg border border-gray-800 bg-gray-950/30 p-3">
              <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full">
                <defs>
                  <linearGradient id="payArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid */}
                {yTicks.map((t, idx) => {
                  const y = padT + (1 - t) * innerH;
                  return (
                    <g key={idx}>
                      <line
                        x1={padL}
                        x2={W - padR}
                        y1={y}
                        y2={y}
                        stroke="#374151"
                        strokeOpacity={0.65}
                        strokeWidth={1}
                      />
                    </g>
                  );
                })}

                {/* Y axis labels */}
                <text x={10} y={yAt(maxVal) + 4} fontSize="10" fill="#9CA3AF">
                  {maxVal}
                </text>
                <text x={10} y={yAt(midVal) + 4} fontSize="10" fill="#9CA3AF">
                  {midVal}
                </text>
                <text x={10} y={yAt(minVal) + 4} fontSize="10" fill="#9CA3AF">
                  {minVal}
                </text>

                {/* Area fill */}
                {areaPath && (
                  <path d={areaPath} fill="url(#payArea)" stroke="none" />
                )}

                {/* Line */}
                {smoothPath && (
                  <path
                    d={smoothPath}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                )}

                {/* Dots (only show on non-zero days for tidiness) */}
                {pts.map((p, i) => {
                  if (p.v === 0) return null;
                  return (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r={4} fill="#0B1220" />
                      <circle cx={p.x} cy={p.y} r={2.5} fill="#06b6d4" />
                    </g>
                  );
                })}

                {/* X axis baseline */}
                <line
                  x1={padL}
                  x2={W - padR}
                  y1={padT + innerH}
                  y2={padT + innerH}
                  stroke="#374151"
                  strokeOpacity={0.9}
                  strokeWidth={1}
                />

                {/* X labels (start / mid / end) */}
                <text x={padL} y={H - 10} fontSize="10" fill="#9CA3AF">
                  {startLabel}
                </text>
                <text
                  x={padL + innerW / 2}
                  y={H - 10}
                  fontSize="10"
                  fill="#9CA3AF"
                  textAnchor="middle"
                >
                  {rangeDays} days
                </text>
                <text
                  x={W - padR}
                  y={H - 10}
                  fontSize="10"
                  fill="#9CA3AF"
                  textAnchor="end"
                >
                  {endLabel}
                </text>
              </svg>

              {/* small footer stats */}
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                  <div className="text-xs text-gray-400">Total payments</div>
                  <div className="mt-1 text-lg font-semibold text-gray-100">
                    {counts.reduce((a, b) => a + b, 0)}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                  <div className="text-xs text-gray-400">Peak day</div>
                  <div className="mt-1 text-lg font-semibold text-gray-100">
                    {maxVal}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                  <div className="text-xs text-gray-400">Avg / day</div>
                  <div className="mt-1 text-lg font-semibold text-gray-100">
                    {(counts.reduce((a, b) => a + b, 0) / clamp(rangeDays, 1, 365)).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  })()}
</div>

        <div className="overflow-x-auto rounded-lg border border-gray-800 bg-gray-900">
          {payments.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No payments found.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-800 text-gray-300 uppercase tracking-wide text-xs">
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Item</th>
                  <th className="px-6 py-4 text-left">Buyer</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800">
                {payments.map((p: any) => (
                  <tr key={p._id || p.id || JSON.stringify(p)} className="hover:bg-gray-800/60 transition-colors duration-150">
                    <td className="px-6 py-6 text-gray-300">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : (p.date ? String(p.date) : "—")}
                    </td>

                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                          {(() => {
                            const item = p.item || p.product || p.paidItem;
                            const photo = item?.photos?.[0] || item?.photo || item?.image;
                            if (!photo) return (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                            );

                            const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050").replace(/\/$/, "");
                            const src = typeof photo === "string" ? (photo.startsWith("http") ? photo : `${base}/${photo.replace(/^\//, "")}`) : String(photo);

                            return (
                              <img src={src} alt={item?.phoneModel || item?.title || "item"} className="w-full h-full object-cover" />
                            );
                          })()}
                        </div>
                        <div>
                          <div className="text-lg font-medium text-gray-100">{(p.item && (p.item.phoneModel || p.item.title)) || p.productName || p.description || 'Untitled'}</div>
                          <div className="text-sm text-gray-400">{p.paymentMethod || p.gateway || p.method || ''}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6 text-gray-300">{p.buyerName || p.customerName || p.email || '—'}</td>

                    <td className="px-6 py-6 text-gray-100">{p.amount ? `Rs ${p.amount}` : p.total ? `Rs ${p.total}` : '—'}</td>

                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${String(p.status || p.paymentStatus || 'completed') === 'failed' ? 'bg-red-900/30 text-red-300' : 'bg-green-900/30 text-green-300'}`}>
                        {String(p.status || p.paymentStatus || 'completed').toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(() => {
                          const itemId = p.item?._id || p.item?.id || p.productId || p.paidItemId;
                          if (itemId) return (
                            <Link href={`/item/${itemId}`} className="inline-flex items-center px-3 py-2 rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700" target="_blank">View Item</Link>
                          );

                          return <span className="px-3 py-2 rounded-md bg-gray-800 text-gray-400">—</span>;
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

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

      </div>
    </AdminLayout>
  );
}
