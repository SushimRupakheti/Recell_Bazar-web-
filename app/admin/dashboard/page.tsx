"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../users/AdminLayout";
import Link from "next/link";

interface User {
  _id: string;
  email: string;
  role: string;
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [adminCount, setAdminCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);

  const [itemsPreview, setItemsPreview] = useState<any[]>([]);
  const [itemsRaw, setItemsRaw] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [itemsCount, setItemsCount] = useState<number | null>(null);

  const [chartDays, setChartDays] = useState<number>(14);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const pageLimit = 100;
        const res = await fetch(`/api/admin/users?page=1&limit=${pageLimit}`, {
          credentials: "include",
        });

        if (!res.ok) {
          let msg = "Failed to fetch users";
          try {
            const errData = await res.json();
            msg = errData.message || msg;
          } catch {}
          throw new Error(msg);
        }

        const data = await res.json();
        const usersArray: User[] = Array.isArray(data) ? data : data?.data || [];
        const meta = data?.meta || {};

        const total = typeof meta.total === "number" ? meta.total : usersArray.length;

        if (meta.roleCounts && typeof meta.roleCounts === "object") {
          const admins = Number(meta.roleCounts.admin) || 0;
          const usersCnt = Number(meta.roleCounts.user) || 0;

          setUsers(usersArray);
          setTotalUsers(total);
          setAdminCount(admins);
          setUserCount(usersCnt);
        } else if (meta.totalPages && meta.totalPages > 1) {
          const totalPages = meta.totalPages;
          const fetches: Promise<Response>[] = [];

          for (let p = 2; p <= totalPages; p++) {
            fetches.push(
              fetch(`/api/admin/users?page=${p}&limit=${pageLimit}`, {
                credentials: "include",
              })
            );
          }

          const pagesRes = await Promise.all(fetches);
          const pagesData = await Promise.all(pagesRes.map((r) => r.json().catch(() => null)));

          const allUsers = pagesData.reduce<User[]>((acc, d) => {
            if (!d) return acc;
            const arr: User[] = Array.isArray(d) ? d : d?.data || [];
            return acc.concat(arr);
          }, usersArray.slice());

          const admins = allUsers.filter((u) => (u.role || "").toLowerCase() === "admin").length;
          const usersCnt = allUsers.filter((u) => (u.role || "").toLowerCase() === "user").length;

          setUsers(allUsers);
          setTotalUsers(total);
          setAdminCount(admins);
          setUserCount(usersCnt);
        } else {
          const admins = usersArray.filter((u) => (u.role || "").toLowerCase() === "admin").length;
          const usersCnt = usersArray.filter((u) => (u.role || "").toLowerCase() === "user").length;

          setUsers(usersArray);
          setTotalUsers(total);
          setAdminCount(admins);
          setUserCount(usersCnt);
        }
      } catch (err: any) {
        setError(err.message || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    const fetchItems = async () => {
      setItemsLoading(true);
      setItemsError(null);

      try {
        const limit = 500;
        const res = await fetch(`/api/items?page=1&limit=${limit}`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch items");

        const data = await res.json();
        const arr: any[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : data?.items || [];

        const total = typeof data?.meta?.total === "number" ? data.meta.total : arr.length;

        setItemsCount(total);
        setItemsRaw(arr);
        setItemsPreview(arr.slice(0, 6));
      } catch (err: any) {
        setItemsError(err?.message || "Error fetching items");
      } finally {
        setItemsLoading(false);
      }
    };

    fetchUsers();
    fetchItems();
  }, []);

  const stats = useMemo(() => {
    const total = totalUsers ?? users.length;
    const admins =
      adminCount ?? users.filter((u) => (u.role || "").toLowerCase() === "admin").length;
    const regular =
      userCount ?? users.filter((u) => (u.role || "").toLowerCase() === "user").length;

    return { total, admins, regular };
  }, [totalUsers, adminCount, userCount, users]);

  const chart = useMemo(() => {
    const days = chartDays;
    const counts: number[] = new Array(days).fill(0);
    const today = new Date();
    const dateKey = (d: Date) => d.toISOString().slice(0, 10);

    const keys: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const dt = new Date(today);
      dt.setDate(today.getDate() - i);
      keys.push(dateKey(dt));
    }

    for (const it of itemsRaw) {
      const created = it?.createdAt || it?.created_at || it?.created;
      if (!created) continue;
      const d = new Date(created);
      if (isNaN(d.getTime())) continue;

      const key = dateKey(d);
      const idx = keys.indexOf(key);
      if (idx >= 0) counts[idx]++;
    }

    const max = Math.max(...counts, 1);

    const oldest = new Date();
    oldest.setDate(oldest.getDate() - (days - 1));

    return {
      counts,
      max,
      labelLeft: oldest.toISOString().slice(5, 10),
      labelRight: new Date().toISOString().slice(5, 10),
      days,
    };
  }, [itemsRaw, chartDays]);

  const formatItemTitle = (it: any) => {
    return (
      it?.title ||
      it?.name ||
      it?.model ||
      it?.productName ||
      it?.phoneModel ||
      it?._id?.slice?.(0, 8) ||
      "Untitled"
    );
  };

  const formatItemSub = (it: any) => {
    const cat = it?.category || it?.brand || it?.make || it?.type;
    const price = it?.price || it?.finalPrice || it?.amount;
    const created = it?.createdAt || it?.created_at || it?.created;

    const bits = [
      cat ? String(cat) : null,
      price ? `Rs ${String(price)}` : null,
      created ? new Date(created).toLocaleDateString() : null,
    ].filter(Boolean);

    return bits.length ? bits.join(" • ") : "—";
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">
                Overview of users, admins and marketplace activity.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/users"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
              >
                Manage Users
              </Link>
              <Link
                href="/items"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
              >
                View Items
              </Link>
            </div>
          </div>

          {/* Top status */}
          {(loading || itemsLoading) && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-slate-300" />
                <p className="text-sm text-slate-600">Loading dashboard data…</p>
              </div>
            </div>
          )}

          {(error || itemsError) && (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-medium text-rose-800">Something went wrong</p>
              <p className="mt-1 text-sm text-rose-700">{error || itemsError}</p>
              <p className="mt-2 text-xs text-rose-700/80">
                Tip: confirm you’re logged in as admin and your API routes return JSON correctly.
              </p>
            </div>
          )}

          {/* Stat Cards */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  Users
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-semibold text-slate-900">
                  {loading ? "—" : stats.total}
                </p>
                <p className="text-xs text-slate-500">All roles</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">Admins</p>
                <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                  Admin
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-semibold text-slate-900">
                  {loading ? "—" : stats.admins}
                </p>
                <p className="text-xs text-slate-500">Active admins</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">Regular Users</p>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                  User
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-semibold text-slate-900">
                  {loading ? "—" : stats.regular}
                </p>
                <p className="text-xs text-slate-500">Non-admin</p>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Items Chart */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Items Activity</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Total items:{" "}
                    <span className="font-medium text-slate-900">
                      {itemsLoading ? "—" : itemsCount ?? itemsRaw.length}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Range</label>
                  <select
                    value={chartDays}
                    onChange={(e) => setChartDays(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={14}>Last 14 days</option>
                    <option value={30}>Last 30 days</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                {itemsLoading ? (
                  <div className="h-36 animate-pulse rounded-lg bg-slate-100" />
                ) : itemsError ? (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {itemsError}
                  </div>
                ) : chart.counts.length ? (
                  <div className="w-full">
                    <div className="h-36 w-full rounded-lg bg-slate-50 p-3">
                      <svg viewBox="0 0 320 110" preserveAspectRatio="none" className="h-full w-full">
                        {/* grid */}
                        {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => (
                          <line
                            key={idx}
                            x1={28}
                            x2={312}
                            y1={10 + (1 - t) * 80}
                            y2={10 + (1 - t) * 80}
                            stroke="#e2e8f0"
                            strokeWidth={1}
                          />
                        ))}

                        {/* bars */}
                        {(() => {
                          const max = chart.max;
                          const n = chart.counts.length;
                          const innerW = 284; // 28..312
                          const gap = Math.max(4, Math.floor(innerW / (n * 6)));
                          const barW = Math.max(6, Math.floor((innerW - gap * (n + 1)) / n));

                          return chart.counts.map((c, i) => {
                            const x = 28 + gap + i * (barW + gap);
                            const h = Math.round((c / max) * 80);
                            const y = 92 - h;

                            return (
                              <g key={i}>
                                <rect
                                  x={x}
                                  y={y}
                                  width={barW}
                                  height={h}
                                  rx={4}
                                  fill="#2563eb"
                                  opacity={0.9}
                                />
                              </g>
                            );
                          });
                        })()}

                        {/* y labels */}
                        <text x={2} y={98} fontSize={10} fill="#64748b">
                          0
                        </text>
                        <text x={2} y={16} fontSize={10} fill="#64748b">
                          {chart.max}
                        </text>
                      </svg>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <div>{chart.labelLeft}</div>
                      <div>Last {chart.days} days</div>
                      <div>{chart.labelRight}</div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    No data available.
                  </div>
                )}
              </div>
            </div>

            {/* Recent Items */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Recent Items</h2>
                <Link href="/items" className="text-sm font-medium text-slate-900 hover:underline">
                  View all
                </Link>
              </div>

              <div className="mt-4">
                {itemsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                    ))}
                  </div>
                ) : itemsError ? (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {itemsError}
                  </div>
                ) : itemsPreview.length ? (
                  <ul className="space-y-3">
                    {itemsPreview.map((it, idx) => (
                      <li
                        key={it?._id || idx}
                        className="rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {formatItemTitle(it)}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-600">
                              {formatItemSub(it)}
                            </p>
                          </div>

                          {/* optional per-item link if you have item detail route */}
                          {it?._id ? (
                            <Link
                              href={`/items/${it._id}`}
                              className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Open
                            </Link>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    No items found.
                  </div>
                )}
              </div>

              {/* Small helpful footer */}
              <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                Tip: If your graph is always flat, ensure items include <span className="font-medium">createdAt</span>.
              </div>
            </div>
          </div>

          {/* Bottom note */}
          <div className="mt-6 text-xs text-slate-500">
            Dashboard data updates when this page loads. Add refresh or polling later if you want live updates.
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
