import { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, Boxes, Search } from "lucide-react";

type AssetRecord = {
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
  assignedUser: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    department: string | null;
    jobTitle: string | null;
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
  if (status === "AVAILABLE") {
    return "bg-green-50 text-green-700 ring-green-200";
  }

  if (status === "ASSIGNED") {
    return "bg-blue-50 text-blue-700 ring-blue-200";
  }

  if (status === "IN_REPAIR") {
    return "bg-orange-50 text-orange-700 ring-orange-200";
  }

  if (status === "RETIRED") {
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

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

export function AssetsPage() {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAssets() {
      try {
        const response = await axios.get<ApiResponse<AssetRecord[]>>(
          `${API_BASE_URL}/assets`
        );

        setAssets(response.data.data);
      } catch {
        setErrorMessage(
          "Could not load assets. Make sure the backend server is running on port 5000."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadAssets();
  }, []);

  const filteredAssets = assets.filter((asset) => {
    const searchableText = [
      asset.assetTag,
      asset.name,
      asset.type,
      asset.status,
      asset.condition,
      asset.location ?? "",
      asset.serialNumber ?? "",
      asset.assignedUser?.fullName ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Assets
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">
          IT Asset Inventory
        </h2>
        <p className="mt-2 text-slate-500">
          View tracked laptops, printers, monitors, and other IT equipment.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-950">
              <Boxes size={20} />
              Asset Register
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {filteredAssets.length} asset
              {filteredAssets.length === 1 ? "" : "s"} shown
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
              placeholder="Search assets..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
            />
          </div>
        </div>

        {isLoading && (
          <div className="mt-6 rounded-xl bg-slate-50 p-5 text-slate-600">
            Loading assets...
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
                  <th className="py-3 pr-4 font-semibold">Asset Tag</th>
                  <th className="py-3 pr-4 font-semibold">Name</th>
                  <th className="py-3 pr-4 font-semibold">Type</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Condition</th>
                  <th className="py-3 pr-4 font-semibold">Location</th>
                  <th className="py-3 pr-4 font-semibold">Assigned User</th>
                  <th className="py-3 pr-4 font-semibold">Warranty Expiry</th>
                </tr>
              </thead>

              <tbody>
                {filteredAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="border-b border-slate-100 text-slate-700"
                  >
                    <td className="py-4 pr-4 font-semibold text-slate-950">
                      {asset.assetTag}
                    </td>
                    <td className="min-w-52 py-4 pr-4">{asset.name}</td>
                    <td className="py-4 pr-4">{formatLabel(asset.type)}</td>
                    <td className="py-4 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusClass(
                          asset.status
                        )}`}
                      >
                        {formatLabel(asset.status)}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getConditionClass(
                          asset.condition
                        )}`}
                      >
                        {formatLabel(asset.condition)}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      {asset.location ?? "Not recorded"}
                    </td>
                    <td className="py-4 pr-4">
                      {asset.assignedUser?.fullName ?? "Unassigned"}
                    </td>
                    <td className="py-4 pr-4">
                      {formatDate(asset.warrantyExpiryDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAssets.length === 0 && (
              <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">
                No assets match your search.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}