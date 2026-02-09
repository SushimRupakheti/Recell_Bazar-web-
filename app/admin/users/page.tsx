import AdminLayout from "./AdminLayout";
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
        <h1 className="text-3xl font-bold text-white">Users</h1>

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
                      <div className="flex justify-end gap-4">
                        <a
                          href={`/admin/users/${user._id}`}
                          className="px-5 py-3 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white transition"
                        >
                          View
                        </a>

                        <a
                          href={`/admin/users/${user._id}/edit`}
                          className="px-5 py-3 rounded-lg bg-blue-900/40 text-blue-400 hover:bg-blue-900/60 transition"
                        >
                          Edit
                        </a>
                      </div>
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
