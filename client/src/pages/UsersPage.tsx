import { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, Search, Users } from "lucide-react";

type UserRecord = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department: string | null;
  jobTitle: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

const API_BASE_URL = "http://localhost:5000/api";

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getRoleClass(role: string) {
  if (role === "ADMIN") return "bg-red-50 text-red-700 ring-red-200";
  if (role === "TECHNICIAN") return "bg-blue-50 text-blue-700 ring-blue-200";
  return "bg-green-50 text-green-700 ring-green-200";
}

function getStatusClass(isActive: boolean) {
  return isActive
    ? "bg-green-50 text-green-700 ring-green-200"
    : "bg-slate-100 text-slate-700 ring-slate-200";
}

export function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await axios.get<ApiResponse<UserRecord[]>>(
          `${API_BASE_URL}/users`
        );

        setUsers(response.data.data);
      } catch {
        setErrorMessage(
          "Could not load users. Make sure the backend server is running on port 5000."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchableText = [
      user.fullName,
      user.email,
      user.role,
      user.department ?? "",
      user.jobTitle ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Users
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">
          User Directory
        </h2>
        <p className="mt-2 text-slate-500">
          View demo admins, technicians, and requesters in HelpDeskPro.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-950">
              <Users size={20} />
              Users
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {filteredUsers.length} user
              {filteredUsers.length === 1 ? "" : "s"} shown
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search users..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
            />
          </div>
        </div>

        {isLoading && (
          <div className="mt-6 rounded-xl bg-slate-50 p-5 text-slate-600">
            Loading users...
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <AlertCircle size={20} />
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Name</th>
                  <th className="py-3 pr-4 font-semibold">Email</th>
                  <th className="py-3 pr-4 font-semibold">Role</th>
                  <th className="py-3 pr-4 font-semibold">Department</th>
                  <th className="py-3 pr-4 font-semibold">Job Title</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 text-slate-700"
                  >
                    <td className="py-4 pr-4 font-semibold text-slate-950">
                      {user.fullName}
                    </td>
                    <td className="py-4 pr-4">{user.email}</td>
                    <td className="py-4 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getRoleClass(
                          user.role
                        )}`}
                      >
                        {formatLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      {user.department ?? "Not recorded"}
                    </td>
                    <td className="py-4 pr-4">
                      {user.jobTitle ?? "Not recorded"}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusClass(
                          user.isActive
                        )}`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">
                No users match your search.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}