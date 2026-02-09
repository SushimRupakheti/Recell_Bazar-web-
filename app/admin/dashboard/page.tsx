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

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getCookie("auth_token") || getCookie("token");
        const res = await fetch("http://localhost:5050/api/admin/users", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `${token}` : "",
          },
          mode: "cors"
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.data || []);
      } catch (err: any) {
        setError(err.message || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role.toLowerCase() === "admin").length;
  const userCount = users.filter(u => u.role.toLowerCase() === "user").length;



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
              <p className="text-3xl font-bold">{totalUsers}</p>
            </div>
            <div className="bg-purple-500 text-white rounded-lg p-6 shadow-lg flex-1">
              <h2 className="text-xl font-semibold mb-2">Active Admins</h2>
              <p className="text-3xl font-bold">{adminCount}</p>
            </div>
            <div className="bg-pink-500 text-white rounded-lg p-6 shadow-lg flex-1">
              <h2 className="text-xl font-semibold mb-2">Active Users</h2>
              <p className="text-3xl font-bold">{userCount}</p>
            </div>
          </div>
        )}
        <p className="mt-8 text-lg text-gray-700">Welcome to the admin dashboard! Here you can manage users and view statistics.</p>
      </div>
    </AdminLayout>
  );
}
