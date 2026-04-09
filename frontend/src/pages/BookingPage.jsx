import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function BookingPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";

  const [room, setRoom] = useState(null);
  const [form, setForm] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phoneNumber: "",
  });
  const [step, setStep] = useState("form"); // form | payment | processing
  const [error, setError] = useState("");
  const [reservationId, setReservationId] = useState(null);

  useEffect(() => {
    fetch(`/api/rooms/${roomId}`)
      .then((res) => res.json())
      .then(setRoom)
      .catch(() => setError("Failed to load room details."));
  }, [roomId]);

  const nights =
    checkIn && checkOut
      ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
      : 0;

  const totalAmount = room ? Math.round(nights * room.pricePerNight * 100) / 100 : 0;

  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    setError("");
    setStep("processing");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          roomId: Number(roomId),
          checkInDate: checkIn,
          checkOutDate: checkOut,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create reservation.");
      }

      const data = await res.json();
      setReservationId(data.reservationId);
      setStep("payment");
    } catch (err) {
      setError(err.message);
      setStep("form");
    }
  };

  const handlePayment = async () => {
    setError("");
    setStep("processing");

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId,
          method: "Credit Card",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Payment failed.");
      }

      const data = await res.json();
      navigate("/confirmation", {
        state: {
          reservation: data.reservation,
          payment: data.payment,
        },
      });
    } catch (err) {
      setError(err.message);
      setStep("payment");
    }
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "user") {
    const redirectUrl = `/book/${roomId}?checkIn=${checkIn}&checkOut=${checkOut}`;
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Log in to book this room</h2>
        <p className="text-sm text-gray-500 mb-6">
          You need a guest account to make reservations and manage your bookings.
        </p>
        <Link
          to={`/account/login?redirect=${encodeURIComponent(redirectUrl)}`}
          className="inline-block px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
        >
          Log In to Continue
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ===== LEFT COLUMN: Room Info ===== */}
        <div className="lg:col-span-3 space-y-6">
          {room.imageUrl && (
            <img
              src={room.imageUrl}
              alt={`Room ${room.roomNumber}`}
              className="w-full h-64 object-cover rounded-lg"
            />
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Room {room.roomNumber}</h2>
                {room.city && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {room.city}
                  </div>
                )}
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded">
                AVAILABLE
              </span>
            </div>

            {room.description && (
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{room.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              <Feature icon="users" label="Capacity" value={`Up to ${room.capacity} guest${room.capacity !== 1 ? "s" : ""}`} />
              <Feature icon="bed" label="Room Type" value={room.capacity >= 4 ? "Suite" : room.capacity >= 3 ? "Family" : room.capacity >= 2 ? "Double" : "Single"} />
              <Feature icon="wifi" label="WiFi" value="Free high-speed" />
              <Feature icon="clock" label="Service" value="24/7 reception" />
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN: Booking Flow ===== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price breakdown */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Price Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Check-in</span>
                <span className="font-medium text-gray-900">{checkIn}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Check-out</span>
                <span className="font-medium text-gray-900">{checkOut}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Duration</span>
                <span className="font-medium text-gray-900">{nights} night{nights !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>${room.pricePerNight.toFixed(2)} &times; {nights} night{nights !== 1 ? "s" : ""}</span>
                <span className="font-medium text-gray-900">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          {step === "form" && (
            <form onSubmit={handleSubmitReservation} className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Guest Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                    placeholder="John Doe"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="john@example.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    required
                    placeholder="+48 123 456 789"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-5 w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Continue to Payment
              </button>
            </form>
          )}

          {step === "payment" && (
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Payment
              </h3>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-8 h-5 text-blue-700" viewBox="0 0 48 30" fill="currentColor">
                    <rect width="48" height="30" rx="4" fill="#1a1f71" />
                    <text x="8" y="20" fontSize="12" fill="white" fontWeight="bold">VISA</text>
                  </svg>
                  <span className="text-xs text-gray-400">Demo Payment</span>
                </div>
                <div className="text-sm text-gray-500 font-mono tracking-wider">
                  &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-4 text-center">
                Reservation is <span className="font-medium text-yellow-600">PENDING</span>. Click below to simulate payment.
              </p>

              <button
                onClick={handlePayment}
                className="w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pay ${totalAmount.toFixed(2)}
              </button>
            </div>
          )}

          {step === "processing" && (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-500">Processing your booking...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, label, value }) {
  const icons = {
    users: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    bed: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    wifi: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
      </svg>
    ),
    clock: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
        {icons[icon]}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-medium text-gray-700">{value}</p>
      </div>
    </div>
  );
}
