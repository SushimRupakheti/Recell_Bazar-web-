"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";

// Dummy user data fetch (replace with real data fetching logic)
const getUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const user = localStorage.getItem("user_data");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export default function UserProfilePage() {
  const user = getUser();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    image: user?.image || "",
  });
  const [preview, setPreview] = useState<string | null>(form.image || null);
  const [loading, setLoading] = useState(false);
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
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    if (form.image && form.image instanceof File) {
      formData.append("image", form.image);
    }
    try {
      // Replace user.id with real user id
      const id = user?.id || "me";
      const res = await fetch(`/api/auth/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Update failed");
      alert("Profile updated!");
    } catch (err) {
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <p className="text-center">No user data found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center">
          {preview ? (
            <Image
              src={preview}
              alt="Profile Preview"
              width={80}
              height={80}
              className="rounded-full object-cover"
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
            Change Image
          </button>
        </div>
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
