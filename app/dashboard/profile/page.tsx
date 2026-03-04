"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchMyProfile, updateMyProfile } from "@/lib/actions/user-action";
import { handleLogout } from "@/lib/actions/auth-action";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// NOTE: use a client-side wrapper to call the server logout API

const BACKEND =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5050";

function normalizeImageUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return null;
  const v = String(pathOrUrl).trim();
  if (!v || v === "null" || v === "undefined") return null;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("/")) return `${BACKEND}${v}`;
  return v;
}

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  contactNo: string;

  currentPassword: string;
  password: string;
  confirmPassword: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    contactNo: "",

    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  // Load profile data (logged-in user)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchMyProfile();
        if (!res?.success) {
          setError(res?.message || "Failed to load profile");
          return;
        }

        const u = res.data;

        const rawImg = u.profileImage || u.profile_image || u.profileImageUrl || null;
        setProfileImage(normalizeImageUrl(rawImg));
        setImgError(false);

        setForm({
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email || "",
          address: u.address || "",
          contactNo: u.contactNo || "",

          currentPassword: "",
          password: "",
          confirmPassword: "",
        });
      } catch (e: any) {
        setError(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const inputBase =
    "w-full rounded-sm bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none border border-transparent focus:border-teal-600 focus:bg-white transition";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("profileImage", file);

      const res = await fetch("/api/users/upload-profile-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        let msg = "Upload failed";
        try {
          const errData = await res.json();
          msg = errData?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      // Re-fetch profile to get the updated image URL
      const profileRes = await fetchMyProfile();
      if (profileRes?.success) {
        const u = profileRes.data;
        const rawImg = u.profileImage || u.profile_image || u.profileImageUrl || null;
        setProfileImage(normalizeImageUrl(rawImg));
        setImgError(false);
      }

      toast.success("Profile picture updated!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image");
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      e.target.value = "";
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Frontend password validation
      if (form.password || form.confirmPassword || form.currentPassword) {
        if (form.password !== form.confirmPassword) {
          setError("Password and confirm password do not match");
          return;
        }
        if (!form.currentPassword) {
          setError("Current password is required to change password");
          return;
        }
      }

      const payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
        contactNo: form.contactNo,
      };

      if (form.password) {
        payload.currentPassword = form.currentPassword;
        payload.password = form.password;
      }

      const res = await updateMyProfile(payload);

      if (!res?.success) {
        setError(res?.message || "Update failed");
        return;
      }

      toast.success("Profile updated successfully!");

      setForm((p) => ({
        ...p,
        currentPassword: "",
        password: "",
        confirmPassword: "",
      }));

      setIsEditing(false);
    } catch (e: any) {
      setError(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hover:text-gray-700">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">My Account</span>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-gray-600">Welcome! </span>
              <span className="text-teal-700 font-medium">
                {form.firstName || "User"} {form.lastName}
              </span>
            </div>

            <button
              onClick={async () => {
                try {
                  await handleLogout();
                  router.replace('/login');
                } catch (err: any) {
                  toast.error(err?.message || 'Logout failed');
                }
              }}
              className="border border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-white text-xs font-medium px-4 py-2 rounded-sm transition"
            >
              Logout
            </button>
          </div>


        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-6 max-w-5xl mx-auto">

          {/* Left: Profile Image Section */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-md p-6 flex flex-col items-center">
            <div className="relative h-44 w-44 rounded-full bg-gray-100 ring-4 ring-teal-600/15 overflow-hidden">
              {profileImage && !imgError ? (
                <Image
                  src={profileImage}
                  alt="Profile picture"
                  fill
                  className="object-cover"
                  sizes="176px"
                  onError={() => setImgError(true)}
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-teal-700 text-white text-5xl font-bold">
                  {(form.firstName?.[0] || "").toUpperCase()}
                  {(form.lastName?.[0] || "").toUpperCase()}
                </div>
              )}
            </div>

            <p className="mt-4 text-base font-semibold text-gray-900 text-center">
              {form.firstName} {form.lastName}
            </p>
            <p className="text-sm text-gray-500 text-center">{form.email}</p>

            {/* Upload Button */}
            <label
              className={`mt-5 inline-flex items-center gap-2 cursor-pointer rounded-sm border border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-white text-xs font-medium px-5 py-2.5 transition ${
                uploading ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              {uploading ? "Uploading..." : "Change Photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>

            <p className="mt-2 text-[11px] text-gray-400 text-center">JPG, PNG or WebP. Max 5MB.</p>
          </div>

          {/* Right: Profile Form */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-md">
          <div className="px-10 py-8">
            <h2 className="text-teal-700 font-semibold text-lg mb-6">
              Profile
            </h2>

            {error && (
              <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, firstName: e.target.value }))
                  }
                  disabled={!isEditing}
                  className={inputBase + (!isEditing ? " cursor-not-allowed" : "")}
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lastName: e.target.value }))
                  }
                  disabled={!isEditing}
                  className={inputBase + (!isEditing ? " cursor-not-allowed" : "")}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  value={form.email}
                  disabled
                  className={inputBase + " cursor-not-allowed"}
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                  disabled={!isEditing}
                  className={inputBase + (!isEditing ? " cursor-not-allowed" : "")}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  value={form.contactNo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, contactNo: e.target.value }))
                  }
                  disabled={!isEditing}
                  className={inputBase + (!isEditing ? " cursor-not-allowed" : "")}
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="mt-10 border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Change Password
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={form.currentPassword}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, currentPassword: e.target.value }))
                    }
                    disabled={!isEditing}
                    className={inputBase}
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    disabled={!isEditing}
                    className={inputBase}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, confirmPassword: e.target.value }))
                    }
                    disabled={!isEditing}
                    className={inputBase}
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex justify-end">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-10 py-3 rounded-sm transition"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-8 py-3 rounded-sm transition disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSave}
                    disabled={saving}
                    className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-10 py-3 rounded-sm transition disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
