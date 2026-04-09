import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import RoomCard from "../components/RoomCard";
import GuestPicker from "../components/GuestPicker";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [guestState, setGuestState] = useState({
    adults: parseInt(searchParams.get("adults")) || 2,
    children: parseInt(searchParams.get("children")) || 0,
    rooms: parseInt(searchParams.get("rooms")) || 1,
  });
  const [cities, setCities] = useState([]);
  const [roomResults, setRoomResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const autoSearched = useRef(false);

  // Fetch available cities on mount
  useEffect(() => {
    fetch("/api/rooms/cities")
      .then((res) => res.json())
      .then(setCities)
      .catch(() => {});
  }, []);

  const totalGuests = guestState.adults + guestState.children;

  const doSearch = async (ci, co, ct, g) => {
    setError("");
    setLoading(true);
    try {
      const params = new URLSearchParams({ checkIn: ci, checkOut: co });
      if (ct) params.set("city", ct);
      if (g) params.set("guests", g);
      const res = await fetch(`/api/rooms/available?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to search rooms.");
      }
      const data = await res.json();
      setRoomResults(data);
      setSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if URL params present
  useEffect(() => {
    if (!autoSearched.current && checkIn && checkOut && checkIn < checkOut) {
      autoSearched.current = true;
      const g = searchParams.get("guests") || (guestState.adults + guestState.children);
      doSearch(checkIn, checkOut, city, g);
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    doSearch(checkIn, checkOut, city, totalGuests > 0 ? totalGuests : "");
  };

  const today = new Date().toISOString().split("T")[0];

  // Build search summary text
  const buildSummary = () => {
    const parts = [];
    if (city) parts.push(city);
    if (checkIn && checkOut) {
      const from = new Date(checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const to = new Date(checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      parts.push(`${from} – ${to}`);
    }
    const gParts = [];
    gParts.push(`${guestState.adults} adult${guestState.adults !== 1 ? "s" : ""}`);
    if (guestState.children > 0) gParts.push(`${guestState.children} child${guestState.children !== 1 ? "ren" : ""}`);
    parts.push(gParts.join(", "));
    return parts.join(" · ");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Find a Room</h1>
      <p className="text-sm text-gray-500 mb-6">
        Search for available rooms by city, dates, and number of guests.
      </p>

      {/* Search form */}
      <form onSubmit={handleSearch} className="bg-white border border-gray-200 rounded-lg p-5 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => setCheckIn(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => setCheckOut(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
            <GuestPicker
              adults={guestState.adults}
              children={guestState.children}
              rooms={guestState.rooms}
              onChange={setGuestState}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3 mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && !error && (
        <>
          {/* Results summary bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 border border-gray-200 rounded-lg px-5 py-3 mb-6">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{buildSummary()}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1 sm:mt-0">
              {roomResults.length === 0
                ? "No rooms found"
                : `${roomResults.length} room${roomResults.length > 1 ? "s" : ""} available`}
            </p>
          </div>

          {roomResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No rooms available</h3>
              <p className="text-sm text-gray-500">Try adjusting your dates, city, or number of guests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {roomResults.map((room) => (
                <RoomCard key={room.roomId} room={room} checkIn={checkIn} checkOut={checkOut} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
