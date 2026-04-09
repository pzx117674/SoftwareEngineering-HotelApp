import { useLocation, Link } from "react-router-dom";

export default function ConfirmationPage() {
  const { state } = useLocation();

  if (!state || !state.reservation) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No Reservation Data</h1>
        <p className="text-sm text-gray-500 mb-6">
          It looks like you navigated here directly. Please start a new booking.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
        >
          Search Rooms
        </Link>
      </div>
    );
  }

  const { reservation, payment } = state;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success banner */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Booking Confirmed!</h1>
        <p className="text-sm text-gray-500">
          Your reservation <span className="font-medium text-gray-700">#{reservation.reservationId}</span> has been confirmed.
        </p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {/* Reservation details */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Reservation
          </h3>
          <div className="space-y-3 text-sm">
            <Detail label="Room" value={reservation.roomNumber} />
            <Detail label="Guest" value={reservation.fullName} />
            <Detail label="Email" value={reservation.email} />
            <Detail label="Check-in" value={reservation.checkInDate} />
            <Detail label="Check-out" value={reservation.checkOutDate} />
            <Detail label="Status" value={reservation.status} highlight="green" />
          </div>
        </div>

        {/* Payment details */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Payment
          </h3>
          <div className="space-y-3 text-sm">
            <Detail label="Amount" value={`$${payment.amount.toFixed(2)}`} />
            <Detail label="Method" value={payment.method} />
            <Detail label="Status" value="Paid" highlight="green" />
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="text-center">
        <Link
          to="/"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function Detail({ label, value, highlight }) {
  const valueClass =
    highlight === "green"
      ? "font-medium text-green-700"
      : "font-medium text-gray-900";

  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
