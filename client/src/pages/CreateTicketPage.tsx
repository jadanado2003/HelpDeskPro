import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle2, PlusCircle } from "lucide-react";

type UserRecord = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department: string | null;
  jobTitle: string | null;
  isActive: boolean;
};

type AssetRecord = {
  id: string;
  assetTag: string;
  name: string;
  type: string;
  status: string;
};

type CreatedTicket = {
  id: string;
  ticketNumber: string;
  title: string;
  priority: string;
  status: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

const API_BASE_URL = "http://localhost:5000/api";

export function CreateTicketPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("HARDWARE");
  const [priority, setPriority] = useState("MEDIUM");
  const [requesterId, setRequesterId] = useState("");
  const [technicianId, setTechnicianId] = useState("");
  const [assetId, setAssetId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadFormOptions() {
      try {
        const [usersResponse, assetsResponse] = await Promise.all([
          axios.get<ApiResponse<UserRecord[]>>(`${API_BASE_URL}/users`),
          axios.get<ApiResponse<AssetRecord[]>>(`${API_BASE_URL}/assets`),
        ]);

        setUsers(usersResponse.data.data);
        setAssets(assetsResponse.data.data);

        const defaultRequester = usersResponse.data.data.find(
          (user) => user.role === "REQUESTER"
        );

        const defaultTechnician = usersResponse.data.data.find(
          (user) => user.role === "TECHNICIAN"
        );

        if (defaultRequester) {
          setRequesterId(defaultRequester.id);
        }

        if (defaultTechnician) {
          setTechnicianId(defaultTechnician.id);
        }
      } catch {
        setErrorMessage(
          "Could not load users and assets. Make sure the backend server is running on port 5000."
        );
      } finally {
        setIsLoadingOptions(false);
      }
    }

    loadFormOptions();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await axios.post<ApiResponse<CreatedTicket>>(
        `${API_BASE_URL}/tickets`,
        {
          title,
          description,
          category,
          priority,
          requesterId,
          technicianId: technicianId || undefined,
          assetId: assetId || undefined,
          dueAt: dueAt || undefined,
        }
      );

      setSuccessMessage(
        `Ticket ${response.data.data.ticketNumber} created successfully.`
      );

      setTitle("");
      setDescription("");
      setCategory("HARDWARE");
      setPriority("MEDIUM");
      setAssetId("");
      setDueAt("");
    } catch {
      setErrorMessage(
        "Could not create ticket. Check that all required fields are completed correctly."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Create Ticket
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">
          New Support Ticket
        </h2>
        <p className="mt-2 text-slate-500">
          Create a new IT support request and link it to a requester,
          technician, and asset.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <PlusCircle size={22} className="text-blue-600" />
          <h3 className="text-lg font-bold text-slate-950">Ticket Details</h3>
        </div>

        {isLoadingOptions && (
          <div className="rounded-xl bg-slate-50 p-5 text-slate-600">
            Loading form options...
          </div>
        )}

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

        {!isLoadingOptions && (
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Title
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                minLength={3}
                maxLength={150}
                placeholder="Example: Laptop cannot connect to Wi-Fi"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                minLength={5}
                maxLength={5000}
                rows={5}
                placeholder="Describe the issue, affected user, device, and any troubleshooting already attempted."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                >
                  <option value="HARDWARE">Hardware</option>
                  <option value="SOFTWARE">Software</option>
                  <option value="NETWORK">Network</option>
                  <option value="ACCOUNT_ACCESS">Account Access</option>
                  <option value="SECURITY">Security</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Requester
                </label>
                <select
                  value={requesterId}
                  onChange={(event) => setRequesterId(event.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                >
                  <option value="" disabled>
                    Select requester
                  </option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} — {user.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Technician
                </label>
                <select
                  value={technicianId}
                  onChange={(event) => setTechnicianId(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                >
                  <option value="">Unassigned</option>
                  {users
                    .filter((user) => user.role === "TECHNICIAN")
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Linked Asset
                </label>
                <select
                  value={assetId}
                  onChange={(event) => setAssetId(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                >
                  <option value="">No asset linked</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.assetTag} — {asset.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueAt}
                  onChange={(event) => setDueAt(event.target.value)}
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
                {isSubmitting ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}