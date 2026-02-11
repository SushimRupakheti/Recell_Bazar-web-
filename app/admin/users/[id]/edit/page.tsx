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
  firstName: string;
  lastName: string;
  role: string;
  address?: string;
  contactNo?: string;
}

export default function UserEditPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", role: "user", address: "", contactNo: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/users/${id}`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data.data || null);
        setForm({
          firstname: data.data?.firstName || data.data?.firstname || "",
          lastname: data.data?.lastName || data.data?.lastname || "",
          email: data.data?.email || "",
          role: data.data?.role || "user",
          address: data.data?.address || "",
          contactNo: data.data?.contactNo || "",
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
      const payload = {
        firstName: form.firstname,
        lastName: form.lastname,
        email: form.email,
        role: form.role,
        address: form.address,
        contactNo: form.contactNo,
        // include legacy keys just in case backend expects them
        firstname: form.firstname,
        lastname: form.lastname,
      };

      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = "Failed to update user";
        try {
          const errData = await res.json();
          msg = errData.message || msg;
        } catch {}
        throw new Error(msg);
      }
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
                className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded text-gray-900"
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
                className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded text-gray-900"
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
                className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded text-gray-900 placeholder:text-gray-400"
                required
                autoComplete="off"
                style={{ opacity: 1 }}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-purple-700">Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded text-gray-900"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-purple-700">Contact Number</label>
              <input
                type="text"
                name="contactNo"
                value={form.contactNo}
                onChange={handleChange}
                className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded text-gray-900"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-purple-700">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded text-gray-900"
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
