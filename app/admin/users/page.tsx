import AdminLayout from "./AdminLayout";
import UserActions from "./_components/UserActions";
import Link from "next/link";
import { fetchAdminUsersServer } from "@/lib/actions/user-action";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export default async function UsersPage() {
  const resp = await fetchAdminUsersServer();
  const users: User[] = Array.isArray(resp) ? resp : resp?.data || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Heading */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <Link
            href="/admin/users/create"
            className="inline-flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm font-medium"
            aria-label="Create user"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-800 bg-gray-900">
          {users.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No users found.</div>
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
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-800/60 transition-colors duration-150 min-h-[88px]"
                  >
                    <td className="px-8 py-8 text-lg font-medium text-gray-100 leading-relaxed">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-8 py-8 text-base text-gray-400">{user.email}</td>
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
                    <td className="px-8 py-8">
                      <UserActions id={user._id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
