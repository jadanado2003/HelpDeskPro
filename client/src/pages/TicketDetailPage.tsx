import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Laptop,
  MessageSquare,
  User,
} from "lucide-react";

type UserSummary = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department?: string | null;
  jobTitle?: string | null;
};

type AssetSummary = {
  id: string;
  assetTag: string;
  name: string;
  type: string;
  serialNumber: string | null;
  status: string;
  condition: string;
  location: string | null;
};

type TicketComment = {
  id: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author: UserSummary;
};

type TicketActivity = {
  id: string;
  type: string;
  message: string;
  previousStatus: string | null;
  newStatus: string | null;
  previousPriority: string | null;
  newPriority: string | null;
  createdAt: string;
  actor: UserSummary | null;
};

type TicketDetail = {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  dueAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  requester: UserSummary;
  technician: UserSummary | null;
  asset: AssetSummary | null;
  comments: TicketComment[];
  activities: TicketActivity[];
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

function formatDate(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getPriorityClass(priority: string) {
  if (priority === "CRITICAL") return "bg-red-50 text-red-700 ring-red-200";
  if (priority === "HIGH") return "bg-orange-50 text-orange-700 ring-orange-200";
  if (priority === "MEDIUM") return "bg-yellow-50 text-yellow-700 ring-yellow-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function getStatusClass(status: string) {
  if (status === "OPEN") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "IN_PROGRESS") return "bg-purple-50 text-purple-700 ring-purple-200";
  if (status === "RESOLVED") return "bg-green-50 text-green-700 ring-green-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

export function TicketDetailPage({
  ticketId,
  onBack,
}: {
  ticketId: string;
  onBack: () => void;
}) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTicket() {
      try {
        const response = await axios.get<ApiResponse<TicketDetail>>(
          `${API_BASE_URL}/tickets/${ticketId}`
        );

        setTicket(response.data.data);
      } catch {
        setErrorMessage(
          "Could not load ticket details. Make sure the backend server is running on port 5000."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadTicket();
  }, [ticketId]);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        Loading ticket details...
      </div>
    );
  }

  if (errorMessage || !ticket) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {errorMessage || "Ticket not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <ArrowLeft size={18} />
        Back to Tickets
      </button>

      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              {ticket.ticketNumber}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              {ticket.title}
            </h2>
            <p className="mt-2 text-slate-500">
              Created {formatDateTime(ticket.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getPriorityClass(
                ticket.priority
              )}`}
            >
              {formatLabel(ticket.priority)}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusClass(
                ticket.status
              )}`}
            >
              {formatLabel(ticket.status)}
            </span>
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">Description</h3>
            <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
              {ticket.description}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-950">
                Comments and Internal Notes
              </h3>
            </div>

            <div className="mt-5 space-y-4">
              {ticket.comments.length === 0 && (
                <div className="rounded-xl bg-slate-50 p-5 text-slate-500">
                  No comments have been added yet.
                </div>
              )}

              {ticket.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col justify-between gap-2 md:flex-row">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {comment.author.fullName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatDateTime(comment.createdAt)}
                      </p>
                    </div>

                    {comment.isInternal && (
                      <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                        Internal note
                      </span>
                    )}
                  </div>

                  <p className="mt-3 leading-7 text-slate-600">{comment.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock3 size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-950">
                Activity History
              </h3>
            </div>

            <div className="mt-5 space-y-3">
              {ticket.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <p className="font-medium text-slate-950">
                    {formatLabel(activity.type)}
                  </p>
                  <p className="mt-1 text-slate-600">{activity.message}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {activity.actor?.fullName ?? "System"} ·{" "}
                    {formatDateTime(activity.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-950">People</h3>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Requester</p>
                <p className="mt-1 font-bold text-slate-950">
                  {ticket.requester.fullName}
                </p>
                <p className="text-sm text-slate-500">{ticket.requester.email}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">Technician</p>
                <p className="mt-1 font-bold text-slate-950">
                  {ticket.technician?.fullName ?? "Unassigned"}
                </p>
                {ticket.technician && (
                  <p className="text-sm text-slate-500">
                    {ticket.technician.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Laptop size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-950">Linked Asset</h3>
            </div>

            {ticket.asset ? (
              <div className="mt-5 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Asset</p>
                  <p className="mt-1 font-bold text-slate-950">
                    {ticket.asset.assetTag}
                  </p>
                  <p className="text-sm text-slate-600">{ticket.asset.name}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-500">Type</p>
                  <p className="text-slate-700">{formatLabel(ticket.asset.type)}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-500">Location</p>
                  <p className="text-slate-700">
                    {ticket.asset.location ?? "Not recorded"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-slate-500">No asset linked.</p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-950">SLA Dates</h3>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Due date</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(ticket.dueAt)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Resolved</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(ticket.resolvedAt)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Closed</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(ticket.closedAt)}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}