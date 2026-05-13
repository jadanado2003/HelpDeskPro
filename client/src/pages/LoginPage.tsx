import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { AlertCircle, Laptop, LogIn } from "lucide-react";

type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department: string | null;
  jobTitle: string | null;
  isActive: boolean;
};

type LoginResponse = {
  token: string;
  user: AuthUser;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

const API_BASE_URL = "http://localhost:5000/api";

export function LoginPage({
  onLogin,
}: {
  onLogin: (token: string, user: AuthUser) => void;
}) {
  const [email, setEmail] = useState("alex.morgan@helpdeskpro.local");
  const [password, setPassword] = useState("Password123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await axios.post<ApiResponse<LoginResponse>>(
        `${API_BASE_URL}/auth/login`,
        {
          email,
          password,
        }
      );

      onLogin(response.data.data.token, response.data.data.user);
    } catch {
      setErrorMessage("Login failed. Check the email and password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white">
            <Laptop size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">HelpDeskPro</h1>
            <p className="text-sm text-slate-500">IT Service Desk System</p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Sign in
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Welcome back
          </h2>
          <p className="mt-2 text-slate-500">
            Use the demo admin login to access the HelpDeskPro dashboard.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            <LogIn size={18} />
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Demo login</p>
          <p className="mt-1">alex.morgan@helpdeskpro.local</p>
          <p>Password123</p>
        </div>
      </div>
    </div>
  );
}