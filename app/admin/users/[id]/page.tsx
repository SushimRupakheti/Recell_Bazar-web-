"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "../AdminLayout";

type User = {
  _id: string;
  firstName?: string;
  lastName?: string;
  firstname?: string;
  lastname?: string;
  email: string;
  role: string;
  profileImage?: string | null;
  profile_image?: string | null;
  profileImageUrl?: string | null;
  contactNo?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
};

const BACKEND =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5050";

function normalizeImageUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return null;
  const v = String(pathOrUrl).trim();
  if (!v || v === "null" || v === "undefined") return null;

  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("/uploads")) return `${BACKEND}${v}`;

  return v;
}

function getName(u: User) {
  const fn = (u.firstName ?? u.firstname ?? "").trim();
  const ln = (u.lastName ?? u.lastname ?? "").trim();
  return `${fn} ${ln}`.trim() || "Unknown User";
}

function getInitials(u: User) {
  const fn = (u.firstName ?? u.firstname ?? "").trim();
  const ln = (u.lastName ?? u.lastname ?? "").trim();
  const a = (fn[0] || "").toUpperCase();
  const b = (ln[0] || "").toUpperCase();
  return (a + b) || "U";
}

function RolePill({ role }: { role?: string }) {
  const r = (role || "").toLowerCase();
  const isAdmin = r === "admin";

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-semibold ${
        isAdmin
          ? "bg-green-900/40 text-green-400"
          : "bg-blue-900/40 text-blue-400"
      }`}
    >
      {role ? role.toUpperCase() : "—"}
    </span>
  );
}

function InfoCard({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 text-sm text-gray-200 break-words">{value ?? "—"}</div>
    </div>
  );
}

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  // avatar load state (prevents browser broken-image icon)
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imgSrc = useMemo(() => {
    const raw =
      user?.profileImage || user?.profile_image || user?.profileImageUrl || null;
    return normalizeImageUrl(raw);
  }, [user]);

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [imgSrc]);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      setBackendError(null);

      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          let msg = "Failed to fetch user";
          try {
            const errData = await res.json();
            msg = errData?.message || msg;
            setBackendError(JSON.stringify(errData, null, 2));
          } catch {
            const t = await res.text().catch(() => "");
            if (t) setBackendError(t);
          }
          throw new Error(msg);
        }

        const data = await res.json();
        setUser(data?.data || null);
      } catch (err: any) {
        setError(err?.message || "Error fetching user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const fullName = user ? getName(user) : "";
  const initials = user ? getInitials(user) : "";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Heading */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">
              <Link href="/admin/users" className="hover:text-gray-200">
                Users
              </Link>{" "}
              <span className="mx-2 text-gray-600">/</span>
              <span className="text-gray-300">Detail</span>
            </p>
            <h1 className="mt-1 text-3xl font-bold text-white">User Detail</h1>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/users"
              className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800/60"
            >
              Back
            </Link>

            {user?._id && (
              <>
                <Link
                  href={`/admin/users/${user._id}/edit`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Edit
                </Link>

                <button
                  disabled={deleting}
                  onClick={async () => {
                    if (
                      !confirm(
                        "Are you sure you want to delete this user? This action cannot be undone."
                      )
                    )
                      return;

                    try {
                      setDeleting(true);

                      const res = await fetch(`/api/admin/users/${user._id}`, {
                        method: "DELETE",
                        credentials: "include",
                      });

                      if (!res.ok) {
                        let msg = "Failed to delete user";
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

                      router.push("/admin/users");
                    } catch (err: any) {
                      alert(err?.message || "Delete failed");
                    } finally {
                      setDeleting(false);
                    }
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-lg border border-gray-800 bg-gray-900">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading user...</div>
          ) : error ? (
            <div className="p-6">
              <div className="rounded-lg border border-red-900/40 bg-red-900/20 p-4 text-red-200">
                {error}
              </div>

              {backendError && (
                <pre className="mt-4 max-h-72 overflow-auto rounded-lg border border-gray-800 bg-gray-950 p-4 text-xs text-gray-200">
                  {backendError}
                </pre>
              )}
            </div>
          ) : user ? (
            <div className="p-6 space-y-6">
              {/* Top section */}
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-950 border border-gray-800">
                    {imgSrc && !imgError ? (
                      <>
                        {!imgLoaded && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-800" />
                          </div>
                        )}
                        <img
                          src={imgSrc}
                          alt="Profile"
                          className={`h-full w-full object-cover ${
                            imgLoaded ? "block" : "hidden"
                          }`}
                          onLoad={() => setImgLoaded(true)}
                          onError={() => setImgError(true)}
                        />
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-300">
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-xl font-semibold text-gray-100">
                      {fullName}
                    </div>
                    <div className="mt-1 break-all text-sm text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <RolePill role={user.role} />
                </div>
              </div>

              {/* ID Bar */}
              <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  User ID
                </div>
                <div className="mt-2 break-all font-mono text-xs text-gray-200">
                  {user._id}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoCard label="Contact Number" value={user.contactNo || "—"} />
                <InfoCard label="Address" value={user.address || "—"} />
                <InfoCard
                  label="Created"
                  value={
                    user.createdAt
                      ? new Date(user.createdAt).toLocaleString()
                      : "—"
                  }
                />
                <InfoCard
                  label="Updated"
                  value={
                    user.updatedAt
                      ? new Date(user.updatedAt).toLocaleString()
                      : "—"
                  }
                />
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">User not found.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
