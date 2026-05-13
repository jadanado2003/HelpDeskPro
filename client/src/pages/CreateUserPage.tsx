import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle2, UserPlus } from "lucide-react";

type CreatedUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department: string | null;
  jobTitle: string | null;
  isActive: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

const API_BASE_URL = "http://localhost:5000/api";

export function CreateUserPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Password123");
  const [role, setRole] = useState("REQUESTER");
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await axios.post<ApiResponse<CreatedUser>>(
        `${API_BASE_URL}/users`,
        {
          fullName,
          email,
          password,
          role,
          department: department || undefined,
          jobTitle: jobTitle || undefined,
        }
      );

      setSuccessMessage(
        `${response.data.data.fullName} was created successfully as ${response.data.data.role}.`
      );

      setFullName("");
      setEmail("");
      setPassword("Password123");
      setRole("REQUESTER");
      setDepartment("");
      setJobTitle("");
    } catch {
      setErrorMessage(
        "Could not create user. Check that the email is unique and the password is at least 8 characters."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Create User
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">
          New HelpDeskPro User
        </h2>
        <p className="mt-2 text-slate-500">
          Add admins, technicians, and requesters for the HelpDeskPro demo system.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <UserPlus size={22} className="text-blue-600" />
          <h3 className="text-lg font-bold text-slate-950">User Details</h3>
        </div>

        {errorMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <AlertCircle size={20} />
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-5 text-green-700">
            <CheckCircle2 size={20} />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                minLength={2}
                maxLength={100}
                placeholder="Example: Jordan Lee"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="Example: jordan.lee@helpdeskpro.local"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                type="text"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                maxLength={128}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Role
              </label>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
              >
                <option value="ADMIN">Admin</option>
                <option value="TECHNICIAN">Technician</option>
                <option value="REQUESTER">Requester</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Department
              </label>
              <input
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                maxLength={100}
                placeholder="Example: HR"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Job Title
              </label>
              <input
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                maxLength={100}
                placeholder="Example: HR Coordinator"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}