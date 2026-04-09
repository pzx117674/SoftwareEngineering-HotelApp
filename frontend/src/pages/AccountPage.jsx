import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default function AccountPage() {
  const { user, token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchReservations = async () => {
    try {
      const res = await fetch("/api/reservations/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setReservations(await res.json());
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (reservationId) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;

    setCancellingId(reservationId);
    try {
      const res = await fetch(`/api/reservations/${reservationId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) =>
            r.reservationId === reservationId ? { ...r, status: "CANCELLED" } : r
          )
        );
      }
    } catch {
      // silently handle
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Account</h1>
        <p className="text-sm text-gray-500">
          Welcome back, <span className="font-medium text-gray-700">{user?.name}</span>{" "}
          <span className="text-gray-400">({user?.email})</span>
        </p>
      </div>

      {/* Reservations */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">My Reservations</h2>
        <Link
          to="/search"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Book a Room &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No reservations yet</h3>
          <p className="text-sm text-gray-500 mb-4">Start by searching for available rooms.</p>
          <Link
            to="/search"
            className="inline-block px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
          >
            Search Rooms
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => (
            <div
              key={r.reservationId}
              className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${
                r.status === "CANCELLED" ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Room image */}
                {r.imageUrl && (
                  <img
                    src={r.imageUrl}
                    alt={`Room ${r.roomNumber}`}
                    className="w-full sm:w-48 h-36 object-cover shrink-0"
                  />
                )}

                {/* Details */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">Room {r.roomNumber}</h3>
                      {r.city && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {r.city}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded ${STATUS_COLORS[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mt-3">
                    <div>
                      <p className="text-xs text-gray-400">Check-in</p>
                      <p className="font-medium text-gray-700">{r.checkInDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Check-out</p>
                      <p className="font-medium text-gray-700">{r.checkOutDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-medium text-gray-700">${r.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Reservation</p>
                      <p className="font-medium text-gray-700">#{r.reservationId}</p>
                    </div>
                  </div>

                  {(r.status === "CONFIRMED" || r.status === "PENDING") && (
                    <button
                      onClick={() => handleCancel(r.reservationId)}
                      disabled={cancellingId === r.reservationId}
                      className="mt-4 px-4 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                    >
                      {cancellingId === r.reservationId ? "Cancelling..." : "Cancel Reservation"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
