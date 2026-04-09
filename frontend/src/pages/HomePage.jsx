import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import GuestPicker from "../components/GuestPicker";

export default function HomePage() {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [city, setCity] = useState("");
  const [guestState, setGuestState] = useState({ adults: 2, children: 0, rooms: 1 });
  const [cities, setCities] = useState([]);
  const [featuredRooms, setFeaturedRooms] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch("/api/rooms/featured")
      .then((res) => res.json())
      .then(setFeaturedRooms)
      .catch(() => {});
    fetch("/api/rooms/cities")
      .then((res) => res.json())
      .then(setCities)
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const totalGuests = guestState.adults + guestState.children;
    const params = new URLSearchParams({ checkIn, checkOut });
    if (city) params.set("city", city);
    if (totalGuests > 0) params.set("guests", totalGuests);
    params.set("adults", guestState.adults);
    params.set("children", guestState.children);
    params.set("rooms", guestState.rooms);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section className="bg-blue-950 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Your Perfect Stay Awaits
          </h1>
          <p className="text-blue-200 text-lg mb-10 max-w-2xl mx-auto">
            Discover comfort and elegance at the best rates. Book your room in seconds.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-lg p-4 sm:p-3 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center max-w-3xl mx-auto"
          >
            <div className="flex-1 sm:px-3">
              <label className="block text-xs font-medium text-gray-500 mb-1 text-left">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-sm text-gray-900 focus:outline-none bg-transparent"
              >
                <option value="">All cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <div className="flex-1 sm:px-3">
              <label className="block text-xs font-medium text-gray-500 mb-1 text-left">Check-in</label>
              <input
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => setCheckIn(e.target.value)}
                required
                className="w-full text-sm text-gray-900 focus:outline-none"
              />
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <div className="flex-1 sm:px-3">
              <label className="block text-xs font-medium text-gray-500 mb-1 text-left">Check-out</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => setCheckOut(e.target.value)}
                required
                className="w-full text-sm text-gray-900 focus:outline-none"
              />
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <div className="flex-1 sm:px-3">
              <label className="block text-xs font-medium text-gray-500 mb-1 text-left">Guests</label>
              <GuestPicker
                adults={guestState.adults}
                children={guestState.children}
                rooms={guestState.rooms}
                onChange={setGuestState}
                variant="hero"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-md text-sm font-medium hover:bg-blue-700 cursor-pointer sm:ml-2"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="bg-white border-b border-gray-200 py-8 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <Stat icon={<UsersIcon />} value="200+" label="Happy Guests" />
          <Stat icon={<BedIcon />} value="10" label="Premium Rooms" />
          <Stat icon={<StarIcon />} value="4.8" label="Guest Rating" />
          <Stat icon={<ClockIcon />} value="24/7" label="Service" />
        </div>
      </section>

      {/* ===== FEATURED ROOMS ===== */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Rooms</h2>
            <p className="text-sm text-gray-500">Handpicked selections for your ideal stay</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredRooms.map((room) => (
              <div key={room.roomId} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {room.imageUrl ? (
                  <img
                    src={room.imageUrl}
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="h-48 bg-blue-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{room.roomNumber}</div>
                      <div className="text-xs text-blue-400 mt-1">ROOM</div>
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-semibold text-gray-900">Room {room.roomNumber}</h3>
                    {room.city && (
                      <span className="text-xs text-gray-400">{room.city}</span>
                    )}
                  </div>
                  {room.description && (
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{room.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    <span>Up to {room.capacity} {room.capacity === 1 ? "guest" : "guests"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-gray-900">
                      ${room.pricePerNight.toFixed(2)}
                      <span className="text-sm font-normal text-gray-400"> / night</span>
                    </p>
                    <Link
                      to={`/search?city=${encodeURIComponent(room.city || "")}`}
                      className="text-sm text-blue-600 font-medium hover:text-blue-700"
                    >
                      View &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AMENITIES ===== */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotel Amenities</h2>
            <p className="text-sm text-gray-500">Everything you need for a comfortable stay</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AmenityCard
              icon={<WifiIcon />}
              title="Free WiFi"
              description="High-speed wireless internet throughout the hotel"
            />
            <AmenityCard
              icon={<ServiceIcon />}
              title="Room Service"
              description="24-hour in-room dining with a curated menu"
            />
            <AmenityCard
              icon={<FitnessIcon />}
              title="Fitness Center"
              description="Fully equipped gym open around the clock"
            />
            <AmenityCard
              icon={<RestaurantIcon />}
              title="Restaurant"
              description="On-site dining with local and international cuisine"
            />
            <AmenityCard
              icon={<ParkingIcon />}
              title="Parking"
              description="Secure on-site parking for all registered guests"
            />
            <AmenityCard
              icon={<ConciergeIcon />}
              title="Concierge"
              description="Personalized assistance for tours, transfers, and more"
            />
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">What Our Guests Say</h2>
            <p className="text-sm text-gray-500">Real reviews from real travelers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <TestimonialCard
              quote="Absolutely wonderful experience. The room was spotless and the staff went above and beyond to make our stay special."
              author="Emily R."
              rating={5}
            />
            <TestimonialCard
              quote="Great location, beautiful rooms, and an incredible breakfast buffet. Will definitely be coming back next year!"
              author="James T."
              rating={5}
            />
            <TestimonialCard
              quote="The booking process was seamless and the check-in was instant. Very impressed with how modern and efficient everything is."
              author="Sarah K."
              rating={4}
            />
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="bg-blue-950 py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Book Your Stay?</h2>
          <p className="text-blue-200 text-sm mb-6">
            Browse available rooms and secure the best rate today.
          </p>
          <Link
            to="/search"
            className="inline-block bg-white text-blue-950 px-8 py-3 rounded-md text-sm font-semibold hover:bg-blue-50"
          >
            Search Rooms
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ===== SMALL COMPONENTS ===== */

function Stat({ icon, value, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-blue-600 mb-1">{icon}</div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function AmenityCard({ icon, title, description }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 flex gap-4 items-start">
      <div className="text-blue-600 mt-0.5">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, author, rating }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-yellow-500 text-sm mb-3">
        {"★".repeat(rating)}
        {"☆".repeat(5 - rating)}
      </div>
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">&ldquo;{quote}&rdquo;</p>
      <p className="text-sm font-semibold text-gray-900">{author}</p>
    </div>
  );
}

/* ===== SVG ICONS ===== */

function UsersIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
    </svg>
  );
}

function ServiceIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function FitnessIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function RestaurantIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265z" />
    </svg>
  );
}

function ParkingIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75M3.375 14.25h.008v.008h-.008v-.008zm0 0H7.5m-4.125 0L2.625 10.5A1.125 1.125 0 013.629 9.17l2.871.955M7.5 14.25v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V14.25m-4.5 0h4.5m0 0v-3.375m0 3.375h5.25m-5.25-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125" />
    </svg>
  );
}

function ConciergeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  );
}
