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

type CreatedAsset = {
  id: string;
  assetTag: string;
  name: string;
  type: string;
  status: string;
  condition: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

const API_BASE_URL = "http://localhost:5000/api";

export function CreateAssetPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [assetTag, setAssetTag] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("LAPTOP");
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState("AVAILABLE");
  const [condition, setCondition] = useState("GOOD");
  const [location, setLocation] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
        setIsLoadingUsers(false);
      }
    }

    loadUsers();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await axios.post<ApiResponse<CreatedAsset>>(
        `${API_BASE_URL}/assets`,
        {
          assetTag,
          name,
          type,
          serialNumber: serialNumber || undefined,
          status,
          condition,
          location: location || undefined,
          purchaseDate: purchaseDate || undefined,
          warrantyExpiryDate: warrantyExpiryDate || undefined,
          notes: notes || undefined,
          assignedUserId: assignedUserId || undefined,
        }
      );

      setSuccessMessage(
        `Asset ${response.data.data.assetTag} created successfully.`
      );

      setAssetTag("");
      setName("");
      setType("LAPTOP");
      setSerialNumber("");
      setStatus("AVAILABLE");
      setCondition("GOOD");
      setLocation("");
      setPurchaseDate("");
      setWarrantyExpiryDate("");
      setNotes("");
      setAssignedUserId("");
    } catch {
      setErrorMessage(
        "Could not create asset. Check that the asset tag and serial number are unique."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Create Asset
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">
          New IT Asset
        </h2>
        <p className="mt-2 text-slate-500">
          Add a laptop, monitor, printer, network device, or other IT asset to
          the HelpDeskPro inventory.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <PlusCircle size={22} className="text-blue-600" />
          <h3 className="text-lg font-bold text-slate-950">Asset Details</h3>
        </div>

        {isLoadingUsers && (
          <div className="rounded-xl bg-slate-50 p-5 text-slate-600">
            Loading users...
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

        {!isLoadingUsers && (
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Asset Tag
                </label>
                <input
                  value={assetTag}
                  onChange={(event) => setAssetTag(event.target.value)}
                  required
                  minLength={2}
                  maxLength={50}
                  placeholder="Example: HDP-LAP-004"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Asset Name
                </label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  minLength={2}
                  maxLength={150}
                  placeholder="Example: Lenovo ThinkPad T14"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                >
                  <option value="LAPTOP">Laptop</option>
                  <option value="DESKTOP">Desktop</option>
                  <option value="MONITOR">Monitor</option>
                  <option value="PHONE">Phone</option>
                  <option value="TABLET">Tablet</option>
                  <option value="PRINTER">Printer</option>
                  <option value="ROUTER">Router</option>
                  <option value="SWITCH">Switch</option>
                  <option value="ACCESS_POINT">Access Point</option>
                  <option value="SERVER">Server</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_REPAIR">In Repair</option>
                  <option value="RETIRED">Retired</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(event) => setCondition(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                >
                  <option value="NEW">New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                  <option value="DAMAGED">Damaged</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Assigned User
                </label>
                <select
                  value={assignedUserId}
                  onChange={(event) => setAssignedUserId(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} — {user.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Serial Number
                </label>
                <input
                  value={serialNumber}
                  onChange={(event) => setSerialNumber(event.target.value)}
                  maxLength={100}
                  placeholder="Example: SN-HDP-0004"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Location
                </label>
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  maxLength={150}
                  placeholder="Example: Sydney Office - Level 1"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(event) => setPurchaseDate(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Warranty Expiry Date
                </label>
                <input
                  type="date"
                  value={warrantyExpiryDate}
                  onChange={(event) => setWarrantyExpiryDate(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Add useful asset notes, assignment details, warranty notes, or repair history."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-blue-500 transition focus:border-blue-500 focus:bg-white focus:ring-2"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isSubmitting ? "Creating..." : "Create Asset"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}