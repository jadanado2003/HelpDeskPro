import { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, Search, Ticket } from "lucide-react";

type TicketRecord = {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
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

function getPriorityClass(priority: string) {
  if (priority === "CRITICAL") {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  if (priority === "HIGH") {
    return "bg-orange-50 text-orange-700 ring-orange-200";
  }

  if (priority === "MEDIUM") {
    return "bg-yellow-50 text-yellow-700 ring-yellow-200";
  }

  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function getStatusClass(status: string) {
  if (status === "OPEN") {
    return "bg-blue-50 text-blue-700 ring-blue-200";
  }

  if (status === "IN_PROGRESS") {
    return "bg-purple-50 text-purple-700 ring-purple-200";
  }

  if (status === "RESOLVED") {
    return "bg-green-50 text-green-700 ring-green-200";
  }

  return "bg-slate-50 text-slate-700 ring-slate-200";
}

export function TicketsPage() {
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTickets() {
      try {
        const response = await axios.get<ApiResponse<TicketRecord[]>>(
          `${API_BASE_URL}/tickets`
        );

        setTickets(response.data.data);
      } catch {
        setErrorMessage(
          "Could not load tickets. Make sure the backend server is running on port 5000."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadTickets();
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const searchableText = [
      ticket.ticketNumber,
      ticket.title,
      ticket.category,
      ticket.priority,
      ticket.status,
      ticket.requester.fullName,
      ticket.technician?.fullName ?? "",
      ticket.asset?.name ?? "",
      ticket.asset?.assetTag ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Tickets
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">
          Support Tickets
        </h2>
        <p className="mt-2 text-slate-500">
          View and search IT support tickets from the HelpDeskPro backend.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-950">
              <Ticket size={20} />
              Ticket Queue
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {filteredTickets.length} ticket
              {filteredTickets.length === 1 ? "" : "s"} shown
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
              placeholder="Search tickets..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
            />
          </div>
        </div>

        {isLoading && (
          <div className="mt-6 rounded-xl bg-slate-50 p-5 text-slate-600">
            Loading tickets...
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
                  <th className="py-3 pr-4 font-semibold">Ticket</th>
                  <th className="py-3 pr-4 font-semibold">Title</th>
                  <th className="py-3 pr-4 font-semibold">Category</th>
                  <th className="py-3 pr-4 font-semibold">Priority</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Requester</th>
                  <th className="py-3 pr-4 font-semibold">Technician</th>
                  <th className="py-3 pr-4 font-semibold">Asset</th>
                </tr>
              </thead>

              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-slate-100 text-slate-700"
                  >
                    <td className="py-4 pr-4 font-semibold text-slate-950">
                      {ticket.ticketNumber}
                    </td>
                    <td className="min-w-72 py-4 pr-4">{ticket.title}</td>
                    <td className="py-4 pr-4">{formatLabel(ticket.category)}</td>
                    <td className="py-4 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getPriorityClass(
                          ticket.priority
                        )}`}
                      >
                        {formatLabel(ticket.priority)}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusClass(
                          ticket.status
                        )}`}
                      >
                        {formatLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="py-4 pr-4">{ticket.requester.fullName}</td>
                    <td className="py-4 pr-4">
                      {ticket.technician?.fullName ?? "Unassigned"}
                    </td>
                    <td className="py-4 pr-4">
                      {ticket.asset
                        ? `${ticket.asset.assetTag} - ${ticket.asset.name}`
                        : "No asset linked"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTickets.length === 0 && (
              <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">
                No tickets match your search.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}