import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Laptop,
  MessageSquare,
  Save,
  Send,
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
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadTicket() {
      try {
        const response = await axios.get<ApiResponse<TicketDetail>>(
          `${API_BASE_URL}/tickets/${ticketId}`
        );

        setTicket(response.data.data);
        setSelectedStatus(response.data.data.status);
        setSelectedPriority(response.data.data.priority);
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

  async function handleUpdateTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ticket) return;

    setErrorMessage("");
    setSuccessMessage("");
    setIsUpdatingTicket(true);

    const actorId = ticket.technician?.id ?? ticket.requester.id;

    try {
      const response = await axios.patch<ApiResponse<TicketDetail>>(
        `${API_BASE_URL}/tickets/${ticket.id}`,
        {
          status: selectedStatus,
          priority: selectedPriority,
          actorId,
        }
      );

      setTicket(response.data.data);
      setSelectedStatus(response.data.data.status);
      setSelectedPriority(response.data.data.priority);
      setSuccessMessage("Ticket updated successfully.");
    } catch {
      setErrorMessage("Could not update ticket. Please try again.");
    } finally {
      setIsUpdatingTicket(false);
    }
  }

  async function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ticket || newComment.trim().length === 0) return;

    setErrorMessage("");
    setSuccessMessage("");
    setIsAddingComment(true);

    const authorId = ticket.technician?.id ?? ticket.requester.id;

    try {
      await axios.post<ApiResponse<TicketComment>>(
        `${API_BASE_URL}/tickets/${ticket.id}/comments`,
        {
          body: newComment,
          isInternal: isInternalNote,
          authorId,
        }
      );

      const refreshedTicket = await axios.get<ApiResponse<TicketDetail>>(
        `${API_BASE_URL}/tickets/${ticket.id}`
      );

      setTicket(refreshedTicket.data.data);
      setNewComment("");
      setIsInternalNote(true);
      setSuccessMessage(
        isInternalNote
          ? "Internal note added successfully."
          : "Comment added successfully."
      );
    } catch {
      setErrorMessage("Could not add comment. Please try again.");
    } finally {
      setIsAddingComment(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        Loading ticket details...
      </div>
    );
  }

  if (errorMessage && !ticket) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {errorMessage}
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Ticket not found.
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

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-700">
          {successMessage}
        </div>
      )}

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
              <Save size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-950">
                Update Ticket
              </h3>
            </div>

            <form
              onSubmit={handleUpdateTicket}
              className="mt-5 grid gap-5 md:grid-cols-3"
            >
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Priority
                </label>
                <select
                  value={selectedPriority}
                  onChange={(event) => setSelectedPriority(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isUpdatingTicket}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isUpdatingTicket ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-950">
                Add Comment or Internal Note
              </h3>
            </div>

            <form onSubmit={handleAddComment} className="mt-5 space-y-4">
              <textarea
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                required
                minLength={1}
                maxLength={3000}
                rows={4}
                placeholder="Add troubleshooting notes, resolution details, or requester updates..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
              />

              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(event) => setIsInternalNote(event.target.checked)}
                    className="h-4 w-4"
                  />
                  Mark as internal note
                </label>

                <button
                  type="submit"
                  disabled={isAddingComment}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <Send size={17} />
                  {isAddingComment ? "Adding..." : "Add Note"}
                </button>
              </div>
            </form>
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