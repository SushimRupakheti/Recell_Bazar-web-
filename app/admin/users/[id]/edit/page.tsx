"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { useParams } from "next/navigation";

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
  firstname: string;
  lastname: string;
  role: string;
}

export default function UserEditPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", role: "user" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getCookie("auth_token") || getCookie("token");
        const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
          mode: "cors"
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data.data || null);
        setForm({
          firstname: data.data?.firstname || "",
          lastname: data.data?.lastname || "",
          email: data.data?.email || "",
          role: data.data?.role || "user"
        });

      } catch (err: any) {
        setError(err.message || "Error fetching user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const token = getCookie("auth_token") || getCookie("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        mode: "cors",
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to update user");
      alert("User updated successfully");
    } catch (err: any) {
      setError(err.message || "Error updating user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded shadow">
        <h1 className="text-3xl font-bold mb-6 text-pink-600">Edit User</h1>
        {loading ? (
          <div className="text-center py-10 text-lg text-pink-500">Loading user...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : user ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 border-l-8 border-pink-400 max-w-md mx-auto space-y-4">
            <div>
              <label className="block mb-1 font-semibold text-purple-700">First Name</label>
              <input
                type="text"
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-purple-700">Last Name</label>
              <input
                type="text"
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-purple-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded text-gray-900 placeholder:text-gray-400 bg-white"
                required
                autoComplete="off"
                style={{ opacity: 1 }}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-purple-700">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded text-gray-900 bg-white"
                style={{ opacity: 1 }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        ) : (
          <div className="text-center py-10 text-gray-500">User not found.</div>
        )}
      </div>
    </AdminLayout>
  );
}
