import { useState, useEffect } from "react";

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
    } catch {
      // Silently handle; data just won't load
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRooms((prev) =>
          prev.map((r) => (r.roomId === updated.roomId ? updated : r))
        );
      }
    } catch {
      // Silently handle
    }
  };

  // Occupancy stats
  const total = rooms.length;
  const booked = rooms.filter((r) => r.status === "BOOKED").length;
  const available = rooms.filter((r) => r.status === "AVAILABLE").length;
  const maintenance = rooms.filter((r) => r.status === "MAINTENANCE").length;

  if (loading) {
    return <p className="text-sm text-gray-500">Loading dashboard...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Staff Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">
        Monitor hotel occupancy and manage room availability.
      </p>

      {/* Occupancy stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Rooms" value={total} />
        <StatCard label="Available" value={available} color="text-green-700" />
        <StatCard label="Booked" value={booked} color="text-red-700" />
        <StatCard label="Maintenance" value={maintenance} color="text-yellow-700" />
      </div>

      {/* Rooms table */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Rooms</h2>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Room</th>
              <th className="px-4 py-3 font-medium text-gray-600">City</th>
              <th className="px-4 py-3 font-medium text-gray-600">Capacity</th>
              <th className="px-4 py-3 font-medium text-gray-600">Price/Night</th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
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
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLORS[room.status]}`}
                  >
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

      {/* Reservations table */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Reservations</h2>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">ID</th>
              <th className="px-4 py-3 font-medium text-gray-600">Guest</th>
              <th className="px-4 py-3 font-medium text-gray-600">Room</th>
              <th className="px-4 py-3 font-medium text-gray-600">Check-in</th>
              <th className="px-4 py-3 font-medium text-gray-600">Check-out</th>
              <th className="px-4 py-3 font-medium text-gray-600">Total</th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
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
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${RESERVATION_STATUS_COLORS[r.status]}`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  No reservations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
      <p className={`text-2xl font-bold ${color || "text-gray-900"}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
