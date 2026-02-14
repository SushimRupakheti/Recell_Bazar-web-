"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "../users/AdminLayout";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

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

    useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
        try {
        // fetch first page with a reasonable limit; if backend paginates, we'll fetch remaining pages
        const pageLimit = 100;
        const res = await fetch(`/api/admin/users?page=1&limit=${pageLimit}`, { credentials: "include" });
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

        // total from meta if present, otherwise length of returned array
        const total = typeof meta.total === "number" ? meta.total : usersArray.length;

        // If backend supports roleCounts in meta, use it directly
        if (meta.roleCounts && typeof meta.roleCounts === "object") {
          const admins = Number(meta.roleCounts.admin) || 0;
          const usersCnt = Number(meta.roleCounts.user) || 0;
          setUsers(usersArray);
          setTotalUsers(total);
          setAdminCount(admins);
          setUserCount(usersCnt);
        } else if (meta.totalPages && meta.totalPages > 1) {
          // Backend paginates and doesn't provide roleCounts: fetch remaining pages and aggregate
          const totalPages = meta.totalPages;
          const fetches: Promise<Response>[] = [];
          for (let p = 2; p <= totalPages; p++) {
            fetches.push(fetch(`/api/admin/users?page=${p}&limit=${pageLimit}`, { credentials: "include" }));
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
          // Single page or unknown pagination; compute from returned array
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
    fetchUsers();
  }, []);

  // `totalUsers`, `adminCount`, `userCount` are set from server meta when available
  // and fall back to computed values from the returned array.



  return (
    <AdminLayout>
      <div className="p-8 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded shadow">
        <h1 className="text-4xl font-bold mb-4 text-blue-600">Admin Dashboard</h1>
        {loading ? (
          <div className="text-center py-10 text-lg text-blue-500">Loading stats...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <div className="flex items-center gap-6">
            <div className="bg-blue-500 text-white rounded-lg p-6 shadow-lg flex-1">
              <h2 className="text-xl font-semibold mb-2">Total Users</h2>
              <p className="text-3xl font-bold">{totalUsers ?? users.length}</p>
            </div>
            <div className="bg-purple-500 text-white rounded-lg p-6 shadow-lg flex-1">
              <h2 className="text-xl font-semibold mb-2">Active Admins</h2>
              <p className="text-3xl font-bold">{adminCount ?? users.filter(u => (u.role||"").toLowerCase() === "admin").length}</p>
            </div>
            <div className="bg-pink-500 text-white rounded-lg p-6 shadow-lg flex-1">
              <h2 className="text-xl font-semibold mb-2">Active Users</h2>
              <p className="text-3xl font-bold">{userCount ?? users.filter(u => (u.role||"").toLowerCase() === "user").length}</p>
            </div>
          </div>
        )}
        <p className="mt-8 text-lg text-gray-700">Welcome to the admin dashboard! Here you can manage users and view statistics.</p>
      </div>
    </AdminLayout>
  );
}
