import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Boxes,
  CalendarDays,
  Laptop,
  MapPin,
  Ticket,
  User,
} from "lucide-react";

type UserSummary = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department: string | null;
  jobTitle: string | null;
};

type RelatedTicket = {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
};

type AssetDetail = {
  id: string;
  assetTag: string;
  name: string;
  type: string;
  serialNumber: string | null;
  status: string;
  condition: string;
  location: string | null;
  purchaseDate: string | null;
  warrantyExpiryDate: string | null;
  notes: string | null;
  assignedUser: UserSummary | null;
  tickets: RelatedTicket[];
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

function getStatusClass(status: string) {
  if (status === "AVAILABLE") return "bg-green-50 text-green-700 ring-green-200";
  if (status === "ASSIGNED") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (status === "IN_REPAIR") return "bg-orange-50 text-orange-700 ring-orange-200";
  if (status === "RETIRED") return "bg-slate-100 text-slate-700 ring-slate-200";
  return "bg-red-50 text-red-700 ring-red-200";
}

function getConditionClass(condition: string) {
  if (condition === "NEW" || condition === "GOOD") {
    return "bg-green-50 text-green-700 ring-green-200";
  }

  if (condition === "FAIR") {
    return "bg-yellow-50 text-yellow-700 ring-yellow-200";
  }

  return "bg-red-50 text-red-700 ring-red-200";
}

function getPriorityClass(priority: string) {
  if (priority === "CRITICAL") return "bg-red-50 text-red-700 ring-red-200";
  if (priority === "HIGH") return "bg-orange-50 text-orange-700 ring-orange-200";
  if (priority === "MEDIUM") return "bg-yellow-50 text-yellow-700 ring-yellow-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

export function AssetDetailPage({
  assetId,
  onBack,
}: {
  assetId: string;
  onBack: () => void;
}) {
  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAsset() {
      try {
        const response = await axios.get<ApiResponse<AssetDetail>>(
          `${API_BASE_URL}/assets/${assetId}`
        );

        setAsset(response.data.data);
      } catch {
        setErrorMessage(
          "Could not load asset details. Make sure the backend server is running on port 5000."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadAsset();
  }, [assetId]);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        Loading asset details...
      </div>
    );
  }

  if (errorMessage || !asset) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {errorMessage || "Asset not found."}
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
        Back to Assets
      </button>

      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              {asset.assetTag}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              {asset.name}
            </h2>
            <p className="mt-2 text-slate-500">
              {formatLabel(asset.type)} asset tracked in HelpDeskPro.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusClass(
                asset.status
              )}`}
            >
              {formatLabel(asset.status)}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getConditionClass(
                asset.condition
              )}`}
            >
              {formatLabel(asset.condition)}
            </span>
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Boxes size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-950">
                Asset Information
              </h3>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Asset Tag</p>
                <p className="mt-1 font-bold text-slate-950">{asset.assetTag}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Serial Number
                </p>
                <p className="mt-1 font-bold text-slate-950">
                  {asset.serialNumber ?? "Not recorded"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Type</p>
                <p className="mt-1 font-bold text-slate-950">
                  {formatLabel(asset.type)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Location</p>
                <p className="mt-1 font-bold text-slate-950">
                  {asset.location ?? "Not recorded"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Ticket size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-950">
                Related Tickets
              </h3>
            </div>

            <div className="mt-5 space-y-3">
              {asset.tickets.length === 0 && (
                <div className="rounded-xl bg-slate-50 p-5 text-slate-500">
                  No tickets are currently linked to this asset.
                </div>
              )}

              {asset.tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center"
                >
                  <div>
                    <p className="font-bold text-slate-950">
                      {ticket.ticketNumber}
                    </p>
                    <p className="mt-1 text-slate-600">{ticket.title}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getPriorityClass(
                        ticket.priority
                      )}`}
                    >
                      {formatLabel(ticket.priority)}
                    </span>
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                      {formatLabel(ticket.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">Notes</h3>
            <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
              {asset.notes ?? "No notes recorded for this asset."}
            </p>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-950">
                Assigned User
              </h3>
            </div>

            {asset.assignedUser ? (
              <div className="mt-5">
                <p className="font-bold text-slate-950">
                  {asset.assignedUser.fullName}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {asset.assignedUser.email}
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  {asset.assignedUser.department ?? "No department recorded"}
                </p>
                <p className="text-sm text-slate-600">
                  {asset.assignedUser.jobTitle ?? "No job title recorded"}
                </p>
              </div>
            ) : (
              <p className="mt-5 text-slate-500">This asset is unassigned.</p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <CalendarDays size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-950">
                Lifecycle Dates
              </h3>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Purchased</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(asset.purchaseDate)}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Warranty expiry</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(asset.warrantyExpiryDate)}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Created</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(asset.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-950">Location</h3>
            </div>

            <p className="mt-5 font-semibold text-slate-800">
              {asset.location ?? "Not recorded"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Laptop size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-950">Device State</h3>
            </div>

            <div className="mt-5 space-y-3">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusClass(
                  asset.status
                )}`}
              >
                {formatLabel(asset.status)}
              </span>

              <span
                className={`ml-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${getConditionClass(
                  asset.condition
                )}`}
              >
                {formatLabel(asset.condition)}
              </span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}