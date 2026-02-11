"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "../AdminLayout";
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
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  profileImage?: string | null;
  contactNo?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      setBackendError(null);
      try {
        const res = await fetch(`/api/admin/users/${id}`, { credentials: "include" });
        if (!res.ok) {
          let msg = "Failed to fetch user";
          try {
            const errData = await res.json();
            msg = errData.message || msg;
            setBackendError(JSON.stringify(errData, null, 2));
          } catch {}
          throw new Error(msg);
        }
        const data = await res.json();
        // Normalize profileImage key if backend returns profileImage or profile_image
        const u = data.data || null;
        if (u) {
          u.profileImage = u.profileImage || u.profile_image || u.profileImageUrl || null;
        }
        setUser(u);
      } catch (err: any) {
        setError(err.message || "Error fetching user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  return (
    <AdminLayout>
      <div className="p-8 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded shadow min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-6 text-blue-600">User Detail</h1>
        {loading ? (
          <div className="text-center py-10 text-lg text-blue-500">Loading user...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            {error}
            {backendError && (
              <pre className="mt-4 text-xs text-gray-500 bg-gray-100 p-2 rounded overflow-x-auto">{backendError}</pre>
            )}
          </div>
        ) : user ? (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-3xl mx-auto">
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shadow">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-xl font-semibold">
                      {((user.firstname || "").charAt(0) || "") + ((user.lastname || "").charAt(0) || "")}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <a href={`/admin/users/${user._id}/edit`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Edit</a>
                  <a href="/admin/users" className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Back</a>
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">{user.firstname} {user.lastname}</h2>
                  <p className="text-sm text-gray-500 mt-1">User ID: <span className="font-mono text-gray-700 ml-2">{user._id}</span></p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-sm text-gray-800">{user.email}</div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Role</div>
                    <div className={`text-sm font-semibold ${user.role && user.role.toLowerCase() === 'admin' ? 'text-green-700' : 'text-gray-800'}`}>{(user.role || '').toUpperCase()}</div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Contact</div>
                    <div className="text-sm text-gray-800">{user.contactNo || '—'}</div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Address</div>
                    <div className="text-sm text-gray-800">{user.address || '—'}</div>
                  </div>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                  <div>Created: {user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</div>
                  <div>Updated: {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '—'}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">User not found.</div>
        )}
      </div>
    </AdminLayout>
  );
}
