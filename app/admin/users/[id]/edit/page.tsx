"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "../../AdminLayout";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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
  const router = useRouter();

  const id =
    typeof (params as any)?.id === "string"
      ? (params as any).id
      : Array.isArray((params as any)?.id)
      ? (params as any).id[0]
      : "";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    role: "user",
    address: "",
    contactNo: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        const u = data?.data || null;

        setUser(u);

        setForm({
          firstname: u?.firstName || u?.firstname || "",
          lastname: u?.lastName || u?.lastname || "",
          email: u?.email || "",
          role: u?.role || "user",
          address: u?.address || "",
          contactNo: u?.contactNo || "",
        });
      } catch (err: any) {
        setError(err.message || "Error fetching user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

        // keep legacy keys (safe)
        firstname: form.firstname,
        lastname: form.lastname,
      };

      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "Failed to update user";
        try {
          const errData = await res.json();
          msg = errData?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      // go back to user detail page after save (more professional than alert)
      router.push(`/admin/users/${id}`);
    } catch (err: any) {
      setError(err.message || "Error updating user");
    } finally {
      setSaving(false);
    }
  };

  const roleLower = (form.role || "").toLowerCase();

  return (
    <AdminLayout>
      {/* Match the same dark theme style */}
      <div className="space-y-6">
        {/* Heading + Breadcrumb */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">
              <Link href="/admin/users" className="hover:text-gray-200">
                Users
              </Link>{" "}
              <span className="mx-2 text-gray-600">/</span>
              <span className="text-gray-300">Edit</span>
            </p>
            <h1 className="mt-1 text-3xl font-bold text-white">Edit User</h1>
          </div>

          <div className="flex gap-2">
            <Link
              href={user?._id ? `/admin/users/${user._id}` : "/admin/users"}
              className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800/60"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit as any}
              disabled={saving || loading || !user}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading user...</div>
          ) : error ? (
            <div className="rounded-lg border border-red-900/40 bg-red-900/20 p-4 text-red-200">
              {error}
            </div>
          ) : user ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Top Row: Name + Role badge */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-lg font-medium text-gray-100">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="mt-1 text-sm text-gray-400 break-all">
                    {user.email}
                  </div>
                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    roleLower === "admin"
                      ? "bg-green-900/40 text-green-400"
                      : "bg-blue-900/40 text-blue-400"
                  }`}
                >
                  {form.role.toUpperCase()}
                </span>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    value={form.firstname}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    value={form.lastname}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contactNo"
                    value={form.contactNo}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-3 border-t border-gray-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-gray-500">
                  Editing user:{" "}
                  <span className="font-mono text-gray-300">{user._id}</span>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="py-12 text-center text-gray-500">User not found.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
