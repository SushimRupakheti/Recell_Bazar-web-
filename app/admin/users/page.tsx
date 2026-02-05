"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleView = (id: string) => {
    window.location.href = `/admin/users/${id}`;
  };

  const handleEdit = (id: string) => {
    window.location.href = `/admin/users/${id}/edit`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const token = getCookie("auth_token") || getCookie("token");

    try {
      const res = await fetch(`http://localhost:5050/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) throw new Error("Failed to delete user");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err: any) {
      alert(err.message || "Error deleting user");
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getCookie("auth_token") || getCookie("token");
        const res = await fetch("http://localhost:5050/api/admin/users/", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Heading */}
        <h1 className="text-3xl font-bold text-white">Users</h1>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-800 bg-gray-900">
          {loading ? (
            <div className="py-12 text-center text-gray-400">
              Loading users…
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-400">{error}</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-800 text-gray-300 uppercase tracking-wide text-xs">
                  <th className="px-8 py-6 text-left">Name</th>
                  <th className="px-8 py-6 text-left">Email</th>
                  <th className="px-8 py-6 text-left">Role</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-800/60 transition-colors duration-150 min-h-[88px]"
                    >
                      {/* Name */}
                      <td className="px-8 py-8 text-lg font-medium text-gray-100 leading-relaxed">
                        {user.firstname} {user.lastname}
                      </td>

                      {/* Email */}
                      <td className="px-8 py-8 text-base text-gray-400">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="px-8 py-8">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            user.role.toLowerCase() === "admin"
                              ? "bg-green-900/40 text-green-400"
                              : "bg-blue-900/40 text-blue-400"
                          }`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-8">
                        <div className="flex justify-end gap-4">
                          <button
                            onClick={() => handleView(user._id)}
                            className="px-5 py-3 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white transition"
                          >
                            View
                          </button>

                          <button
                            onClick={() => handleEdit(user._id)}
                            className="px-5 py-3 rounded-lg bg-blue-900/40 text-blue-400 hover:bg-blue-900/60 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(user._id)}
                            className="px-5 py-3 rounded-lg bg-red-900/40 text-red-400 hover:bg-red-900/60 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
