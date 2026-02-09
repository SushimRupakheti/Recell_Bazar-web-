"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchMyProfile, updateMyProfile } from "@/lib/actions/user-action";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

          <div>
            <span className="text-gray-600">Welcome! </span>
            <span className="text-teal-700 font-medium">
              {form.firstName || "User"} {form.lastName}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white shadow-sm border border-gray-100 rounded-md max-w-3xl mx-auto">
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
