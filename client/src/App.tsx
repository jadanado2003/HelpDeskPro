import { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock3,
  Laptop,
  LayoutDashboard,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import "./index.css";
import { TicketsPage } from "./pages/TicketsPage";

type DashboardStats = {
  summary: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    criticalTickets: number;
    totalAssets: number;
    availableAssets: number;
    assignedAssets: number;
    assetsInRepair: number;
    retiredAssets: number;
  };
  charts: {
    ticketsByStatus: Array<{ status: string; count: number }>;
    ticketsByPriority: Array<{ priority: string; count: number }>;
    ticketsByCategory: Array<{ category: string; count: number }>;
    assetsByStatus: Array<{ status: string; count: number }>;
  };
  recentTickets: Array<{
    id: string;
    ticketNumber: string;
    title: string;
    status: string;
    priority: string;
    category: string;
    createdAt: string;
    updatedAt: string;
    requester: {
      id: string;
      fullName: string;
      email: string;
      role: string;
    };
    technician: {
      id: string;
      fullName: string;
      email: string;
      role: string;
    } | null;
    asset: {
      id: string;
      assetTag: string;
      name: string;
      type: string;
      status: string;
    } | null;
  }>;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type ActivePage = "dashboard" | "tickets";

const API_BASE_URL = "http://localhost:5000/api";

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        const response = await axios.get<ApiResponse<DashboardStats>>(
          `${API_BASE_URL}/dashboard/stats`
        );

        setStats(response.data.data);
      } catch {
        setErrorMessage(
          "Could not load dashboard data. Make sure the backend server is running on port 5000."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-slate-950 px-5 py-6 text-white lg:block">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-500 p-3">
              <Laptop size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">HelpDeskPro</h1>
              <p className="text-sm text-slate-400">IT Service Desk System</p>
            </div>
          </div>

          <nav className="mt-10 space-y-2">
            <button
              type="button"
              onClick={() => setActivePage("dashboard")}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium ${
                activePage === "dashboard"
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => setActivePage("tickets")}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium ${
                activePage === "tickets"
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Ticket size={18} />
              Tickets
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <Boxes size={18} />
              Assets
            </button>
          </nav>

          <div className="mt-10 rounded-2xl bg-white/10 p-4">
            <p className="text-sm font-semibold">Portfolio demo</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Full-stack IT ticketing and asset management system using React,
              TypeScript, Express, Prisma, and PostgreSQL.
            </p>
          </div>
        </aside>

        <main className="flex-1 px-5 py-6 lg:px-8">
          {activePage === "tickets" && <TicketsPage />}

          {activePage === "dashboard" && (
            <>
              <header className="mb-8 flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm lg:flex-row lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Dashboard
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-950">
                    HelpDeskPro Overview
                  </h2>
                  <p className="mt-2 text-slate-500">
                    Live dashboard data from your Express API and Supabase
                    PostgreSQL database.
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  API connected
                </div>
              </header>

              {isLoading && (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  Loading dashboard data...
                </div>
              )}

              {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                  {errorMessage}
                </div>
              )}

              {stats && (
                <>
                  <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                      title="Total Tickets"
                      value={stats.summary.totalTickets}
                      description="All support requests"
                      icon={Ticket}
                    />
                    <StatCard
                      title="In Progress"
                      value={stats.summary.inProgressTickets}
                      description="Currently being worked on"
                      icon={Clock3}
                    />
                    <StatCard
                      title="Critical Tickets"
                      value={stats.summary.criticalTickets}
                      description="Highest priority issues"
                      icon={AlertTriangle}
                    />
                    <StatCard
                      title="Total Assets"
                      value={stats.summary.totalAssets}
                      description="Tracked IT equipment"
                      icon={Laptop}
                    />
                  </section>

                  <section className="mt-6 grid gap-6 xl:grid-cols-3">
                    <div className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-slate-950">
                            Recent Tickets
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Latest support requests from the API.
                          </p>
                        </div>
                        <Activity className="text-slate-400" size={22} />
                      </div>

                      <div className="mt-5 overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                              <th className="py-3 pr-4 font-semibold">
                                Ticket
                              </th>
                              <th className="py-3 pr-4 font-semibold">
                                Title
                              </th>
                              <th className="py-3 pr-4 font-semibold">
                                Priority
                              </th>
                              <th className="py-3 pr-4 font-semibold">
                                Status
                              </th>
                              <th className="py-3 pr-4 font-semibold">
                                Requester
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.recentTickets.map((ticket) => (
                              <tr
                                key={ticket.id}
                                className="border-b border-slate-100 text-slate-700"
                              >
                                <td className="py-3 pr-4 font-medium text-slate-950">
                                  {ticket.ticketNumber}
                                </td>
                                <td className="py-3 pr-4">{ticket.title}</td>
                                <td className="py-3 pr-4">
                                  {formatLabel(ticket.priority)}
                                </td>
                                <td className="py-3 pr-4">
                                  {formatLabel(ticket.status)}
                                </td>
                                <td className="py-3 pr-4">
                                  {ticket.requester.fullName}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-slate-950">
                            Ticket Status
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Current ticket distribution.
                          </p>
                        </div>
                        <CheckCircle2 className="text-slate-400" size={22} />
                      </div>

                      <div className="mt-5 space-y-4">
                        {stats.charts.ticketsByStatus.map((item) => (
                          <div
                            key={item.status}
                            className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                          >
                            <span className="text-sm font-medium text-slate-700">
                              {formatLabel(item.status)}
                            </span>
                            <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-bold text-white">
                              {item.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;