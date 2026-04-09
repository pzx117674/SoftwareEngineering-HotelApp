import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  AVAILABLE: "bg-green-100 text-green-800",
  BOOKED: "bg-red-100 text-red-800",
  MAINTENANCE: "bg-yellow-100 text-yellow-800",
};

export default function RoomCard({ room, checkIn, checkOut }) {
  const navigate = useNavigate();

  const handleBook = () => {
    const params = new URLSearchParams({ checkIn, checkOut });
    navigate(`/book/${room.roomId}?${params.toString()}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
      {/* Room image */}
      {room.imageUrl && (
        <img
          src={room.imageUrl}
          alt={`Room ${room.roomNumber}`}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Room {room.roomNumber}</h3>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLORS[room.status] || "bg-gray-100 text-gray-600"}`}
          >
            {room.status}
          </span>
        </div>

        {room.city && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {room.city}
          </div>
        )}

        {room.description && (
          <p className="text-xs text-gray-400 mb-3 line-clamp-2">{room.description}</p>
        )}

        <div className="text-sm text-gray-500 space-y-1">
          <p>Capacity: {room.capacity} {room.capacity === 1 ? "guest" : "guests"}</p>
          <p className="text-base font-medium text-gray-900">${room.pricePerNight.toFixed(2)} / night</p>
        </div>

        {room.status === "AVAILABLE" && checkIn && checkOut && (
          <button
            onClick={handleBook}
            className="mt-4 w-full py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 cursor-pointer"
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  );
}
