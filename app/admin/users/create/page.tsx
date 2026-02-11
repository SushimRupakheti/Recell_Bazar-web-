"use client";
import React, { useRef, useState } from "react";
import AdminLayout from "../AdminLayout";

export default function CreateUserPage() {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    image: null as File | null,
    address: "",
    contactNo: "",
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setForm((prev) => ({ ...prev, image: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData();
    // include both legacy and camelCase keys
    formData.append("firstname", form.firstname);
    formData.append("lastname", form.lastname);
    formData.append("firstName", form.firstname);
    formData.append("lastName", form.lastname);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("address", (form as any).address || "");
    formData.append("contactNo", (form as any).contactNo || "");
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      const res = await fetch(`/api/admin/users`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        let msg = "Failed to create user";
        try {
          const data = await res.json();
          msg = data?.message || JSON.stringify(data) || msg;
        } catch {
          try {
            msg = await res.text();
          } catch {}
        }
        throw new Error(msg);
      }

      // success
      alert("User created successfully!");
      setForm({ firstname: "", lastname: "", email: "", password: "", image: null, address: "", contactNo: "" });
      setPreview(null);
    } catch (err: any) {
      setError(err.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Create User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
              {error}
            </div>
          )}
          {/* Image Upload */}
          <div className="flex flex-col items-center">
            {preview ? (
              <img
                src={preview}
                alt="Profile Preview"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                <span>No Image</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              name="image"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
            />
            <button
              type="button"
              className="mt-2 px-3 py-1 text-sm border rounded"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Image
            </button>
          </div>

          {/* First Name */}
          <div>
            <label className="block mb-1 font-medium">First Name</label>
            <input
              type="text"
              name="firstname"
              value={form.firstname}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded text-gray-900"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block mb-1 font-medium">Last Name</label>
            <input
              type="text"
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded text-gray-900"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded text-gray-900"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <input
              type="text"
              name="address"
              value={(form as any).address || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded text-gray-900"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Contact Number</label>
            <input
              type="text"
              name="contactNo"
              value={(form as any).contactNo || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded text-gray-900"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
