import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  AVAILABLE: "bg-green-100 text-green-800",
  BOOKED: "bg-red-100 text-red-800",
  MAINTENANCE: "bg-yellow-100 text-yellow-800",
};

const RESERVATION_STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-600",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role;

  const tabs = [
    { id: "occupancy", label: "Occupancy", roles: ["manager", "receptionist", "marketing"] },
    { id: "reports",   label: "Reports",   roles: ["manager"] },
    { id: "trends",    label: "Trends",    roles: ["manager", "marketing"] },
  ].filter((t) => t.roles.includes(role));

  const [activeTab, setActiveTab] = useState(tabs[0]?.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Staff Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">
        Logged in as <span className="font-medium text-gray-700">{user?.name}</span>{" "}
        <span className="text-xs text-gray-400">({role})</span>
      </p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors cursor-pointer ${
              activeTab === t.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "occupancy" && <OccupancyTab />}
      {activeTab === "reports"   && <ReportsTab />}
      {activeTab === "trends"    && <TrendsTab />}
    </div>
  );
}

/* ─── Occupancy Tab ─────────────────────────────────────────────────────── */
function OccupancyTab() {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [roomsRes, reservationsRes] = await Promise.all([
        fetch("/api/rooms"),
        fetch("/api/reservations"),
      ]);
      setRooms(await roomsRes.json());
      setReservations(await reservationsRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRooms((prev) => prev.map((r) => (r.roomId === updated.roomId ? updated : r)));
      }
    } catch {}
  };

  const total       = rooms.length;
  const booked      = rooms.filter((r) => r.status === "BOOKED").length;
  const available   = rooms.filter((r) => r.status === "AVAILABLE").length;
  const maintenance = rooms.filter((r) => r.status === "MAINTENANCE").length;

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Rooms" value={total} />
        <StatCard label="Available"   value={available}   color="text-green-700" />
        <StatCard label="Booked"      value={booked}      color="text-red-700" />
        <StatCard label="Maintenance" value={maintenance} color="text-yellow-700" />
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Rooms</h2>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Room", "City", "Capacity", "Price/Night", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rooms.map((room) => (
              <tr key={room.roomId}>
                <td className="px-4 py-3 font-medium text-gray-900">{room.roomNumber}</td>
                <td className="px-4 py-3 text-gray-600">{room.city}</td>
                <td className="px-4 py-3 text-gray-600">{room.capacity}</td>
                <td className="px-4 py-3 text-gray-600">${room.pricePerNight.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLORS[room.status]}`}>
                    {room.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={room.status}
                    onChange={(e) => handleStatusChange(room.roomId, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="BOOKED">BOOKED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Reservations</h2>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["ID", "Guest", "Room", "Check-in", "Check-out", "Total", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reservations.map((r) => (
              <tr key={r.reservationId}>
                <td className="px-4 py-3 font-medium text-gray-900">#{r.reservationId}</td>
                <td className="px-4 py-3 text-gray-600">{r.fullName}</td>
                <td className="px-4 py-3 text-gray-600">{r.roomNumber}</td>
                <td className="px-4 py-3 text-gray-600">{r.checkInDate}</td>
                <td className="px-4 py-3 text-gray-600">{r.checkOutDate}</td>
                <td className="px-4 py-3 text-gray-600">${r.totalAmount.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${RESERVATION_STATUS_COLORS[r.status]}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">No reservations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Reports Tab (FR-7) ────────────────────────────────────────────────── */
function ReportsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading reports...</p>;
  if (!data)   return <p className="text-sm text-red-500">Failed to load report data.</p>;

  const statusMap = Object.fromEntries(data.byStatus.map((s) => [s.status, s.count]));

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Revenue"   value={`$${data.totalRevenue.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="text-green-700" />
        <StatCard label="Confirmed"       value={statusMap.CONFIRMED  || 0} color="text-blue-700" />
        <StatCard label="Pending"         value={statusMap.PENDING    || 0} color="text-yellow-700" />
        <StatCard label="Cancelled"       value={statusMap.CANCELLED  || 0} color="text-gray-500" />
      </div>

      {/* Monthly revenue */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Monthly Revenue</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Month</th>
                <th className="px-4 py-3 font-medium text-gray-600">Payments</th>
                <th className="px-4 py-3 font-medium text-gray-600">Revenue</th>
                <th className="px-4 py-3 font-medium text-gray-600">Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.monthlyRevenue.map((row) => {
                const max = Math.max(...data.monthlyRevenue.map((r) => r.revenue));
                const pct = max > 0 ? (row.revenue / max) * 100 : 0;
                return (
                  <tr key={row.month}>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.month}</td>
                    <td className="px-4 py-3 text-gray-600">{row.payments}</td>
                    <td className="px-4 py-3 text-gray-600">${row.revenue.toFixed(2)}</td>
                    <td className="px-4 py-3 w-48">
                      <div className="h-2 rounded bg-blue-100">
                        <div className="h-2 rounded bg-blue-500" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Revenue by city */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Revenue by City</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">City</th>
                <th className="px-4 py-3 font-medium text-gray-600">Bookings</th>
                <th className="px-4 py-3 font-medium text-gray-600">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.byCity.map((row) => (
                <tr key={row.city}>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.city}</td>
                  <td className="px-4 py-3 text-gray-600">{row.bookings}</td>
                  <td className="px-4 py-3 text-gray-600">${row.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ─── Trends Tab (FR-8) ─────────────────────────────────────────────────── */
function TrendsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading trends...</p>;
  if (!data)   return <p className="text-sm text-red-500">Failed to load trend data.</p>;

  const totalBookings = data.monthlyBookings.reduce((s, r) => s + r.bookings, 0);

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Total Bookings"   value={totalBookings} color="text-blue-700" />
        <StatCard label="Avg Stay (nights)" value={data.avgNights} color="text-indigo-700" />
        <StatCard label="Top City"         value={data.popularCities[0]?.city || "—"} color="text-purple-700" />
      </div>

      {/* Monthly bookings trend */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Booking Trend by Month</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Month</th>
                <th className="px-4 py-3 font-medium text-gray-600">Bookings</th>
                <th className="px-4 py-3 font-medium text-gray-600">Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.monthlyBookings.map((row) => {
                const max = Math.max(...data.monthlyBookings.map((r) => r.bookings));
                const pct = max > 0 ? (row.bookings / max) * 100 : 0;
                return (
                  <tr key={row.month}>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.month}</td>
                    <td className="px-4 py-3 text-gray-600">{row.bookings}</td>
                    <td className="px-4 py-3 w-48">
                      <div className="h-2 rounded bg-purple-100">
                        <div className="h-2 rounded bg-purple-500" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Popular cities */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Popular Cities</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">City</th>
                <th className="px-4 py-3 font-medium text-gray-600">Bookings</th>
                <th className="px-4 py-3 font-medium text-gray-600">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.popularCities.map((row) => (
                <tr key={row.city}>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.city}</td>
                  <td className="px-4 py-3 text-gray-600">{row.bookings}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {totalBookings > 0 ? Math.round((row.bookings / totalBookings) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payment methods */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Payment Methods</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Method</th>
                <th className="px-4 py-3 font-medium text-gray-600">Count</th>
                <th className="px-4 py-3 font-medium text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.byMethod.map((row) => (
                <tr key={row.method}>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.method}</td>
                  <td className="px-4 py-3 text-gray-600">{row.count}</td>
                  <td className="px-4 py-3 text-gray-600">${row.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ─── Shared ─────────────────────────────────────────────────────────────── */
function StatCard({ label, value, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
      <p className={`text-2xl font-bold ${color || "text-gray-900"}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
